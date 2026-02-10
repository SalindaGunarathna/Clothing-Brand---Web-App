const { ApiError } = require('./error');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authorization required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }

  return next();
};

module.exports = authorize;
