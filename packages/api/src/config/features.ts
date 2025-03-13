import { Request, Response, NextFunction } from 'express';

// Feature flag configuration
export const FEATURES = {
  // Core features - enabled by default
  SHIPMENT_MANAGEMENT: true,
  DRIVER_TRACKING: true,
  AUTHENTICATION: process.env.ENABLE_AUTHENTICATION !== 'false',
  
  // Beta features - can be toggled
  REAL_TIME_UPDATES: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
  ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  ROUTE_OPTIMIZATION: process.env.ENABLE_ROUTE_OPTIMIZATION === 'true',
  
  // Disabled features - to be enabled post-deployment
  ROLE_BASED_ACCESS: process.env.ENABLE_ROLE_BASED_ACCESS === 'true',
  ADVANCED_REPORTING: process.env.ENABLE_ADVANCED_REPORTING === 'true'
};

// Feature flag middleware
export const withFeature = (featureKey: keyof typeof FEATURES) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!FEATURES[featureKey]) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: 'Feature not available'
        }
      });
    }
    next();
  }; 