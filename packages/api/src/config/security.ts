import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import csrf from 'csurf';
import * as Sentry from '@sentry/node';
import { logger } from '@loadup/shared/logger';

export const configureSecurityMiddleware = (app: express.Application) => {
  // Initialize Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
  }

  // Set security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });

  // Apply rate limiting to API routes
  app.use('/api', limiter as unknown as express.RequestHandler);

  // Prevent HTTP Parameter Pollution
  app.use(hpp() as unknown as express.RequestHandler);

  // CSRF protection
  const csrfProtection = csrf({ cookie: true });
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/public')) {
      next();
    } else {
      csrfProtection(req as unknown as any, res as unknown as any, next);
    }
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
      logger.error('Invalid CSRF token', { path: req.path });
      return res.status(403).json({
        error: 'Invalid CSRF token'
      });
    }
    next(err);
  });

  // Error handling
  app.use(Sentry.Handlers.errorHandler());
};

export const securityConstants = {
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  JWT_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
};

export const validatePassword = (password: string): boolean => {
  return securityConstants.PASSWORD_REGEX.test(password);
};

export const sanitizeOutput = (data: any): any => {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.refreshToken;
  delete sanitized.resetToken;
  return sanitized;
}; 