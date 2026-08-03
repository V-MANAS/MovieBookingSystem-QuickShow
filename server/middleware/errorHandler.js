import logger from '../utils/logger.js'

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error('EXPRESS_ERROR', `${req.method} ${req.url} - ${statusCode} ${message}`, err)

  res.status(statusCode === 200 ? 500 : statusCode).json({
    success: false,
    message: message
  })
}

export default errorHandler
