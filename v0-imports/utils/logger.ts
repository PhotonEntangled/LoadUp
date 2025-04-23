/**
 * Simple logger utility for consistent logging across the application
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production" && process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}
