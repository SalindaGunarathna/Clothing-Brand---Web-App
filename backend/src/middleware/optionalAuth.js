const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./error');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader) {
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = optionalAuth;
