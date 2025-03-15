import { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import csrf from 'csurf';
import * as Sentry from '@sentry/node';

export const configureSecurityMiddleware = (app: Express) => {
  // Initialize Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
  }

  // Basic security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // CSRF Protection (for non-API routes)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
    } else {
      csrf({ cookie: true })(req, res, next);
    }
  });

  // Error handling
  app.use(Sentry.Handlers.errorHandler());
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({
        error: 'Invalid CSRF token',
        code: 'CSRF_ERROR'
      });
    } else {
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR'
      });
    }
  });
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