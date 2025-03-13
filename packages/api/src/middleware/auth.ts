import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { FEATURES } from '../config/features.js';
import env from '../config/env.js';

// Initialize Clerk if secret key is available
// Use type assertion for the entire expression to fix TypeScript error
const clerk = env.clerkSecretKey 
  ? (new Clerk({ apiKey: env.clerkSecretKey }) as any) 
  : null;

// Define custom request type with auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        isAdmin: boolean;
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
        isAdmin: true
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
    
    // Verify token with Clerk if available
    if (clerk) {
      try {
        const session = await clerk.sessions.verifyToken(token);
        req.auth = {
          userId: session.subject,
          sessionId: session.sid,
          isAdmin: false // Simplified - we'll enhance this post-deployment
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
      // Fallback for development without Clerk
      if (env.isDevelopment) {
        // Simple token validation for development
        if (token === 'dev-token') {
          req.auth = {
            userId: 'dev-user',
            sessionId: 'dev-session',
            isAdmin: true
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

// Simplified admin check - to be enhanced post-deployment
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
  
  // For beta, we'll use a simplified admin check
  // This will be enhanced post-deployment with proper role checks
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