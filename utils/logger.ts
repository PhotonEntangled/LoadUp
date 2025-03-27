/**
 * Simple logging utility for LoadUp application
 */

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Get log level from environment
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  
  switch (envLevel) {
    case 'debug':
      return LogLevel.DEBUG;
    case 'info':
      return LogLevel.INFO;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO; // Default to INFO
  }
};

// Current log level
const currentLogLevel = getLogLevel();

/**
 * Logger class with methods for different log levels
 */
class Logger {
  private prefix: string;
  
  constructor(prefix = 'LoadUp') {
    this.prefix = prefix;
  }
  
  /**
   * Format log message with timestamp and prefix
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.prefix}]: ${message}`;
  }
  
  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }
  
  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }
  
  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }
  
  /**
   * Log error message
   */
  error(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }
}

// Export default logger instance
export const logger = new Logger(); 