const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/error');
const logger = require('../config/logger');
const withTransaction = require('../utils/transaction');
const { getGuestId } = require('../utils/guest');
const { mergeGuestCartIntoUser } = require('../services/cart.service');

// Short-lived access token used for API authorization.
const signAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({ sub: userId }, secret, { expiresIn });
};

// Long-lived refresh token used to rotate access tokens.
const signRefreshToken = (userId, jti) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId, jti, type: 'refresh' }, secret, {
    expiresIn
  });
};

const hashToken = (value) =>
  crypto.createHash('sha256').update(value).digest('hex');

const parseDurationToMs = (value, fallbackMs) => {
  if (!value) return fallbackMs;
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  return amount * multipliers[unit];
};

const withSession = (query, session) =>
  session ? query.session(session) : query;

const createRefreshToken = async (userId, req, session) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = signRefreshToken(userId, jti);
  const tokenHash = hashToken(token);
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const doc = {
    user: userId,
    tokenHash,
    jti,
    expiresAt,
    createdByIp: req.ip,
    userAgent: req.get('user-agent')
  };

  if (session) {
    await RefreshToken.create([doc], { session });
  } else {
    await RefreshToken.create(doc);
  }

  return { token, tokenHash };
};

const buildAuthResponse = (user, accessToken, refreshToken) => ({
  token: accessToken,
  refreshToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

// Register a new user and issue tokens atomically.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const { user, accessToken, refreshToken } = await withTransaction(
    async (session) => {
      // Transaction keeps user creation and refresh token issuance consistent.
      const existingUser = await withSession(
        User.findOne({ email: normalizedEmail }),
        session
      );
      if (existingUser) {
        throw new ApiError(409, 'Email already registered');
      }

      const newUser = new User({ name, email: normalizedEmail, password });
      if (session) {
        await newUser.save({ session });
      } else {
        await newUser.save();
      }

      const newAccessToken = signAccessToken(newUser.id);
      const { token: newRefreshToken } = await createRefreshToken(
        newUser.id,
        req,
        session
      );

      return {
        user: newUser,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    }
  );

  logger.info({ userId: user.id }, 'INFO User registered');

  const guestId = getGuestId(req);
  if (guestId) {
    try {
      await mergeGuestCartIntoUser({ userId: user.id, guestId });
    } catch (err) {
      logger.warn({ userId: user.id, err }, 'WARN Cart merge failed');
    }
  }

  res.status(201).json(buildAuthResponse(user, accessToken, refreshToken));
});

const login = asyncHandler(async (req, res) => {
  // Validate credentials and issue new tokens.
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password'
  );
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = signAccessToken(user.id);
  const { token: refreshToken } = await createRefreshToken(user.id, req);

  logger.info({ userId: user.id }, 'INFO User logged in');

  const guestId = getGuestId(req);
  if (guestId) {
    try {
      await mergeGuestCartIntoUser({ userId: user.id, guestId });
    } catch (err) {
      logger.warn({ userId: user.id, err }, 'WARN Cart merge failed');
    }
  }

  res.json(buildAuthResponse(user, accessToken, refreshToken));
});

// Return the authenticated user's profile.
const me = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Rotate refresh token and issue a new access token.
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token required');
  }

  let payload;
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
    payload = jwt.verify(refreshToken, secret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const result = await withTransaction(async (session) => {
    // Transaction ensures we never issue a new token without revoking the old.
    const storedToken = await withSession(
      RefreshToken.findOne({ tokenHash }),
      session
    );

    if (!storedToken) {
      // If the token is missing, revoke any active tokens for safety.
      await withSession(
        RefreshToken.updateMany(
          { user: payload.sub, revokedAt: null },
          { revokedAt: new Date(), revokedByIp: req.ip }
        ),
        session
      );
      return { error: new ApiError(401, 'Invalid refresh token') };
    }

    if (storedToken.revokedAt) {
      await withSession(
        RefreshToken.updateMany(
          { user: storedToken.user, revokedAt: null },
          { revokedAt: new Date(), revokedByIp: req.ip }
        ),
        session
      );
      return { error: new ApiError(401, 'Refresh token revoked') };
    }

    if (storedToken.expiresAt <= new Date()) {
      return { error: new ApiError(401, 'Refresh token expired') };
    }

    const user = await withSession(User.findById(payload.sub), session);
    if (!user) {
      return { error: new ApiError(401, 'User not found') };
    }

    const accessToken = signAccessToken(user.id);
    const { token: newRefreshToken, tokenHash: newRefreshTokenHash } =
      await createRefreshToken(user.id, req, session);

    storedToken.revokedAt = new Date();
    storedToken.revokedByIp = req.ip;
    storedToken.replacedByTokenHash = newRefreshTokenHash;
    if (session) {
      await storedToken.save({ session });
    } else {
      await storedToken.save();
    }

    return { user, accessToken, newRefreshToken };
  });

  if (result?.error) {
    throw result.error;
  }

  logger.info({ userId: result.user.id }, 'INFO Refresh token rotated');

  res.json(buildAuthResponse(result.user, result.accessToken, result.newRefreshToken));
});

// Revoke a refresh token to end the session.
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token required');
  }

  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
    jwt.verify(refreshToken, secret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });
  if (!storedToken || storedToken.revokedAt) {
    return res.json({ message: 'Logged out' });
  }

  storedToken.revokedAt = new Date();
  storedToken.revokedByIp = req.ip;
  await storedToken.save();

  logger.info({ userId: storedToken.user }, 'INFO User logged out');

  res.json({ message: 'Logged out' });
});

// Generate a password reset token (email delivery handled elsewhere).
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiresInMs = parseDurationToMs(
      process.env.RESET_PASSWORD_EXPIRES_IN,
      60 * 60 * 1000
    );

    user.resetPasswordTokenHash = resetTokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + expiresInMs);
    await user.save();

    logger.info({ userId: user.id }, 'INFO Password reset requested');

    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        message: 'Password reset token generated',
        resetToken
      });
    }
  }

  res.json({
    message: 'If the email exists, a reset token has been issued'
  });
});

// Reset password and revoke active refresh tokens atomically.
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const resetTokenHash = hashToken(token);

  const result = await withTransaction(async (session) => {
    // Transaction keeps password update and token revocation consistent.
    const user = await withSession(
      User.findOne({
        resetPasswordTokenHash: resetTokenHash,
        resetPasswordExpiresAt: { $gt: new Date() }
      }).select('+resetPasswordTokenHash +resetPasswordExpiresAt'),
      session
    );

    if (!user) {
      return { error: new ApiError(400, 'Invalid or expired reset token') };
    }

    user.password = newPassword;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    if (session) {
      await user.save({ session });
    } else {
      await user.save();
    }

    await withSession(
      RefreshToken.updateMany(
        { user: user.id, revokedAt: null },
        { revokedAt: new Date(), revokedByIp: req.ip }
      ),
      session
    );

    return { user };
  });

  if (result?.error) {
    throw result.error;
  }

  logger.info({ userId: result.user.id }, 'INFO Password reset completed');

  res.json({ message: 'Password has been reset' });
});

module.exports = { register, login, me, refresh, logout, forgotPassword, resetPassword };
