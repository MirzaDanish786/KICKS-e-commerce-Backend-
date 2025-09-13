export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message, "\nStack:", err.stack);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: "Internal Server Error",
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
