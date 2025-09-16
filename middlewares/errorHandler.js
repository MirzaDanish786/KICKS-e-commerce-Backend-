export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message, "\nStack:", err.stack);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle JWT errors specifically
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
