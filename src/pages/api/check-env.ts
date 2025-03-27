import { NextApiRequest, NextApiResponse } from 'next';

// This is safe because it runs on the server only
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get all environment variables, but mask sensitive ones
  const envVars: Record<string, string> = {};
  
  Object.keys(process.env).forEach(key => {
    // Skip internal Next.js vars
    if (key.startsWith('__NEXT')) return;
    
    const value = process.env[key] || '';
    
    // Mask sensitive tokens but show first/last few chars
    if (
      key.includes('TOKEN') || 
      key.includes('SECRET') || 
      key.includes('KEY') || 
      key.includes('PASSWORD')
    ) {
      if (value.length > 10) {
        envVars[key] = `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
      } else {
        envVars[key] = '[masked]';
      }
    } 
    // Show if it's a NEXT_PUBLIC var so we can verify
    else if (key.startsWith('NEXT_PUBLIC_')) {
      envVars[key] = `${value} (public)`;
    }
    // Show length for other vars
    else {
      envVars[key] = `[${value.length} chars]`;
    }
  });
  
  // Specific check for Mapbox tokens
  const mapboxTokenInfo = {
    MAPBOX_SECRET_TOKEN: process.env.MAPBOX_SECRET_TOKEN ? {
      exists: true,
      length: process.env.MAPBOX_SECRET_TOKEN.length,
      firstChars: process.env.MAPBOX_SECRET_TOKEN.substring(0, 6),
      valid: process.env.MAPBOX_SECRET_TOKEN.startsWith('pk.ey')
    } : { exists: false },
    
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? {
      exists: true,
      length: process.env.NEXT_PUBLIC_MAPBOX_TOKEN.length,
      firstChars: process.env.NEXT_PUBLIC_MAPBOX_TOKEN.substring(0, 6),
      valid: process.env.NEXT_PUBLIC_MAPBOX_TOKEN.startsWith('pk.ey')
    } : { exists: false }
  };
  
  res.status(200).json({ 
    envSummary: envVars,
    mapboxTokenInfo,
    nextPublicVarCount: Object.keys(envVars).filter(k => k.startsWith('NEXT_PUBLIC_')).length,
    serverInfo: {
      nodeEnv: process.env.NODE_ENV,
      nextVersion: process.env.NEXT_VERSION || 'unknown',
      now: new Date().toISOString()
    }
  });
} 