/**
 * Production Structured Logger Utility
 * Provides ISO timestamped, contextual logging for QuickShow API and booking events.
 */

const formatLog = (level, context, message, meta = {}) => {
  const timestamp = new Date().toISOString()
  const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] [${level}] [${context}] ${message}${metaString}`
}

export const logger = {
  info: (context, message, meta) => {
    console.log(formatLog('INFO', context, message, meta))
  },
  warn: (context, message, meta) => {
    console.warn(formatLog('WARN', context, message, meta))
  },
  error: (context, message, errorObj = {}) => {
    const meta = {
      errorMessage: errorObj?.message || errorObj,
      stack: errorObj?.stack || undefined
    }
    console.error(formatLog('ERROR', context, message, meta))
  }
}

export default logger
