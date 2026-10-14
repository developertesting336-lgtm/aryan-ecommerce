export const errorHandler = (err, req, res, next) => {
  console.error(err); // Full error with stack trace

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};