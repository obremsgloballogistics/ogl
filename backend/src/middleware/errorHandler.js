function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Server Error' : err.message;
  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { errorHandler };