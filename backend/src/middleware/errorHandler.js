export function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err)

  const statusCode = err.statusCode || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.message || 'An unexpected error occurred.'

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  })
}
