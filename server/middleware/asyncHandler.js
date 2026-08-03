/**
 * Higher-order function wrapping async Express routes to automatically catch exceptions
 * and pass them to the centralized Express error handling middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
