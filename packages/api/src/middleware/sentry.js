// @ts-ignore - Type definitions for Sentry may not be complete
import * as Sentry from '@sentry/node';
// @ts-ignore - Type definitions for Sentry profiling may not be complete
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

/**
 * Initialize Sentry for the API
 */
export const initSentry = (app) => {
  // Initialize Sentry SDK
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // @ts-ignore - Sentry types may be outdated
      new Sentry.Integrations.Http({ tracing: true }),
      // @ts-ignore - Sentry types may be outdated
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Enable debug in development
    debug: process.env.NODE_ENV !== 'production',
  });

  // The request handler must be the first middleware on the app
  // @ts-ignore - Sentry types may be outdated
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  // @ts-ignore - Sentry types may be outdated
  app.use(Sentry.Handlers.tracingHandler());
};

/**
 * Sentry error handler middleware
 * This must be added after all controllers but before any other error middleware
 */
export const sentryErrorHandler = (app) => {
  // @ts-ignore - Sentry types may be outdated
  app.use(Sentry.Handlers.errorHandler());
};

/**
 * Custom error handler that captures errors with Sentry
 * and returns a standardized error response
 */
export const errorHandler = (err, req, res, next) => {
  // Capture the error with Sentry
  Sentry.captureException(err);

  // Log the error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Return a standardized error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
  });
}; 