class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let details = err.details;

  if (err.code === 11000) {
    status = 409;
    message = 'Email already registered';
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  const response = { message };
  if (details) response.details = details;
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = { ApiError, notFound, errorHandler };
