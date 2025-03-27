/**
 * MapboxToken Utility
 * 
 * A centralized utility for accessing the Mapbox token consistently throughout the application.
 * This prevents issues with different environment variable names and provides a fallback mechanism.
 */

// The standardized token environment variable names
export const MAPBOX_PUBLIC_TOKEN_ENV_VAR = 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
export const MAPBOX_SECRET_TOKEN_ENV_VAR = 'MAPBOX_SECRET_TOKEN';

// The fallback tokens to use in development if no token is specified
// These are real tokens already in the codebase
export const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';
export const FALLBACK_SECRET_TOKEN = 'sk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnZTZpbnEwbm9rMnFzNXdvNmV0cGlxIn0.8C5xLEEEIw3yZAYf5NXrOg';

/**
 * Get the Mapbox public token with an optional fallback
 * @param customFallback Optional custom fallback token
 * @returns Mapbox public token string
 */
export function getMapboxPublicToken(customFallback?: string): string {
  // Check for environment variable using the standard name
  const token = process.env[MAPBOX_PUBLIC_TOKEN_ENV_VAR];
  
  // Also check alternate variables as fallback
  const altToken1 = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const altToken2 = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  
  // Add debugging
  console.log('[mapbox-token] Retrieved tokens:', {
    main: token ? `${token.substring(0, 9)}...` : 'undefined',
    alt1: altToken1 ? `${altToken1.substring(0, 9)}...` : 'undefined',
    alt2: altToken2 ? `${altToken2.substring(0, 9)}...` : 'undefined',
    fallback: FALLBACK_PUBLIC_TOKEN ? `${FALLBACK_PUBLIC_TOKEN.substring(0, 9)}...` : 'undefined'
  });
  
  // Return environment variable if defined, then alternate variables, then custom fallback, then default fallback
  const finalToken = token || altToken1 || altToken2 || customFallback || FALLBACK_PUBLIC_TOKEN;
  
  console.log(`[mapbox-token] Using token: ${finalToken.substring(0, 9)}...`);
  return finalToken;
}

/**
 * Get the Mapbox secret token with an optional fallback
 * @param customFallback Optional custom fallback token
 * @returns Mapbox secret token string
 */
export function getMapboxSecretToken(customFallback?: string): string {
  // Check for environment variable using the standard name
  const token = process.env[MAPBOX_SECRET_TOKEN_ENV_VAR];
  
  // Return environment variable if defined, then custom fallback, then default fallback
  return token || customFallback || FALLBACK_SECRET_TOKEN;
}

/**
 * Get the appropriate Mapbox token (backwards compatibility)
 * @param customFallback Optional custom fallback token
 * @returns Mapbox token string (defaults to public token)
 */
export function getMapboxToken(customFallback?: string): string {
  return getMapboxPublicToken(customFallback);
}

/**
 * Check if a Mapbox token is valid
 * @param token Token to validate
 * @returns Object with validity status and reason
 */
export function validateMapboxToken(token: string): { valid: boolean; reason: string } {
  if (!token) {
    return { valid: false, reason: 'Token is empty or undefined' };
  }
  
  // Basic checks for Mapbox token format
  if (!token.startsWith('pk.ey') && !token.startsWith('sk.ey')) {
    return { valid: false, reason: 'Token does not have the expected prefix (pk.ey or sk.ey)' };
  }
  
  // Check token length (typical Mapbox tokens are ~100+ chars)
  if (token.length < 80) {
    return { valid: false, reason: 'Token appears too short for a Mapbox token' };
  }
  
  return { valid: true, reason: 'Token appears valid' };
}

/**
 * Initialize global Mapbox token
 * Sets the token in mapboxgl global library if available
 * @param mapboxgl The mapboxgl library instance
 * @returns The token that was set
 */
export function initializeMapboxToken(mapboxgl: any): string {
  if (!mapboxgl) {
    console.error('Cannot initialize Mapbox token - mapboxgl not provided');
    return getMapboxPublicToken();
  }
  
  const token = getMapboxPublicToken();
  
  try {
    // Set token in the mapboxgl global
    mapboxgl.accessToken = token;
    console.log('Mapbox token initialized:', token.substring(0, 10) + '...');
  } catch (error) {
    console.error('Error setting Mapbox token:', error);
  }
  
  return token;
}

/**
 * Get debug information about the Mapbox tokens
 * @returns Object with token details (safe for logging)
 */
export function getMapboxTokenDebugInfo(): any {
  const publicToken = getMapboxPublicToken();
  const secretToken = getMapboxSecretToken();
  const publicValidation = validateMapboxToken(publicToken);
  const secretValidation = validateMapboxToken(secretToken);
  
  return {
    publicToken: {
      tokenVariable: MAPBOX_PUBLIC_TOKEN_ENV_VAR,
      isDefined: !!publicToken,
      isValid: publicValidation.valid,
      validationMessage: publicValidation.reason,
      length: publicToken ? publicToken.length : 0,
      prefix: publicToken ? publicToken.substring(0, 10) + '...' : 'N/A',
      usingFallback: publicToken === FALLBACK_PUBLIC_TOKEN
    },
    secretToken: {
      tokenVariable: MAPBOX_SECRET_TOKEN_ENV_VAR,
      isDefined: !!secretToken,
      isValid: secretValidation.valid,
      validationMessage: secretValidation.reason,
      length: secretToken ? secretToken.length : 0,
      prefix: secretToken ? secretToken.substring(0, 10) + '...' : 'N/A',
      usingFallback: secretToken === FALLBACK_SECRET_TOKEN
    }
  };
}

// Default export for consistent imports
export default {
  getMapboxToken,
  getMapboxPublicToken,
  getMapboxSecretToken,
  validateMapboxToken,
  initializeMapboxToken,
  getMapboxTokenDebugInfo,
  MAPBOX_PUBLIC_TOKEN_ENV_VAR,
  MAPBOX_SECRET_TOKEN_ENV_VAR,
  FALLBACK_PUBLIC_TOKEN,
  FALLBACK_SECRET_TOKEN
}; 