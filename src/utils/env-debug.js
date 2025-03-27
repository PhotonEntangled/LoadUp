/**
 * Environment Variables Debug Utility
 * This utility provides functions to debug environment variables in Next.js
 */

// Next.js only exposes environment variables prefixed with NEXT_PUBLIC_ to the browser
export const getClientEnvVars = () => {
  const envVars = {};
  
  // Only include NEXT_PUBLIC_ variables that are safe to expose
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      envVars[key] = process.env[key];
    }
  });
  
  return envVars;
};

// Token debugging function that safely displays tokens
export const getTokenDebugInfo = (tokenName, token) => {
  if (!token) return `${tokenName}: Not available`;
  
  // Only show first few characters for security
  const maskedToken = token.substring(0, 12) + '...';
  return `${tokenName}: ${maskedToken} (${token.length} chars)`;
};

// Check if a token appears to be valid
export const checkTokenValidity = (token) => {
  if (!token) return { valid: false, reason: 'Token is empty or undefined' };
  
  // Basic checks for Mapbox token format (starts with 'pk.ey')
  if (!token.startsWith('pk.ey')) {
    return { valid: false, reason: 'Token does not start with expected prefix (pk.ey)' };
  }
  
  // Check token length (typical Mapbox tokens are ~100+ chars)
  if (token.length < 80) {
    return { valid: false, reason: 'Token appears too short for a Mapbox token' };
  }
  
  return { valid: true, reason: 'Token appears to be valid' };
};

// Export a debug object that can be used in components
export const envDebug = {
  getClientEnvVars,
  getTokenDebugInfo,
  checkTokenValidity,
  
  // Get comprehensive debug info for the Mapbox token
  getMapboxTokenInfo: () => {
    const secretToken = process.env.MAPBOX_SECRET_TOKEN;
    const publicToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    return {
      secretToken: secretToken ? {
        masked: secretToken.substring(0, 12) + '...',
        length: secretToken.length,
        valid: checkTokenValidity(secretToken).valid,
        validityReason: checkTokenValidity(secretToken).reason
      } : 'Not available',
      
      publicToken: publicToken ? {
        masked: publicToken.substring(0, 12) + '...',
        length: publicToken.length,
        valid: checkTokenValidity(publicToken).valid,
        validityReason: checkTokenValidity(publicToken).reason
      } : 'Not available',
      
      accessToken: accessToken ? {
        masked: accessToken.substring(0, 12) + '...',
        length: accessToken.length,
        valid: checkTokenValidity(accessToken).valid,
        validityReason: checkTokenValidity(accessToken).reason
      } : 'Not available',
      
      clientEnvVars: getClientEnvVars()
    };
  }
}; 