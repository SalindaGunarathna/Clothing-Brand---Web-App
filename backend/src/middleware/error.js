class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const logger = require('../config/logger');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let details = err.details;

  if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    if (fields.includes('email')) {
      message = 'Email already registered';
    } else if (fields.length > 0) {
      message = `Duplicate value for ${fields.join(', ')}`;
    } else {
      message = 'Duplicate key error';
    }
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
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

  const errorLog = {
    status,
    message,
    path: req.originalUrl,
    method: req.method
  };

  if (process.env.LOG_LEVEL === 'debug' && err?.stack) {
    errorLog.stack = err.stack;
  }

  res.locals.errorMessage = message;
  res.locals.errorStatus = status;

  const level = status >= 500 ? 'error' : 'warn';
  const levelLabel = level.toUpperCase();
  logger[level](errorLog, `${levelLabel} Request error`);

  res.status(status).json(response);
};

module.exports = { ApiError, notFound, errorHandler };
