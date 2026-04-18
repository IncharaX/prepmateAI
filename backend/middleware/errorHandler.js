/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
const errorHandler = (err, req, res, next) => {
  // Log error with full details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    stack: err.stack,
  };

  console.error('❌ Error:', JSON.stringify(errorLog, null, 2));

  // Default error response
  let status = 500;
  let error = 'Internal Server Error';
  let message = 'An unexpected error occurred';
  let details = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    error = 'Validation Error';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  else if (err.code === 11000) {
    status = 400;
    error = 'Duplicate Entry';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    details = { field };
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    status = 401;
    error = 'Invalid Token';
    message = 'The provided token is invalid';
  }

  else if (err.name === 'TokenExpiredError') {
    status = 401;
    error = 'Token Expired';
    message = 'Your session has expired. Please login again.';
  }

  // Multer upload errors
  else if (err.name === 'MulterError') {
    status = 400;
    error = 'Upload Error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed size (5MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = err.message;
    }
  }

  // Custom errors with status code
  else if (err.statusCode || err.status) {
    status = err.statusCode || err.status;
    message = err.message;
  }

  // Send response
  const response = {
    error,
    message,
  };

  if (details) {
    response.details = details;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.fullError = err;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;

