const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 400;
    message = "Duplicate value – resource already exists";
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = "Related record not found";
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = "File too large. Maximum size is 5MB";
  }

  // Log error
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;