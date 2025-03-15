import { Request, Response, NextFunction } from 'express';
import { decode, verify } from 'jsonwebtoken';
import { FEATURES } from '../config/features.js';
import env from '../config/env.js';

// Define custom request type with auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        isAdmin: boolean;
        role: string;
      };
    }
  }
}

// Basic auth middleware with feature flag
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip authentication in development if feature flag is disabled
    if (env.isDevelopment && !FEATURES.AUTHENTICATION) {
      req.auth = {
        userId: 'dev-user',
        sessionId: 'dev-session',
        isAdmin: true,
        role: 'admin'
      };
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with NextAuth JWT secret
    if (env.nextAuthSecret) {
      try {
        // Verify the JWT token
        const decoded = verify(token, env.nextAuthSecret) as any;
        
        // Extract user information from the token
        req.auth = {
          userId: decoded.sub || decoded.id,
          sessionId: decoded.jti || 'session',
          isAdmin: decoded.role === 'admin',
          role: decoded.role || 'user'
        };
        
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid token'
          }
        });
      }
    } else {
      // Fallback for development without NextAuth secret
      if (env.isDevelopment) {
        // Simple token validation for development
        if (token === 'dev-token') {
          req.auth = {
            userId: 'dev-user',
            sessionId: 'dev-session',
            isAdmin: true,
            role: 'admin'
          };
          return next();
        }
      }
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_NOT_CONFIGURED',
          message: 'Authentication not properly configured'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized'
      }
    });
  }
  
  // Check if user has admin role
  if (!req.auth.isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Forbidden'
      }
    });
  }
  
  next();
}; 