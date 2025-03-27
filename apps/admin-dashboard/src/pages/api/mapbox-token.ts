import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// This is a secure endpoint that provides the Mapbox token safely
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Mapbox secret token
    const secretToken = process.env.MAPBOX_SECRET_TOKEN || '';
    
    if (!secretToken) {
      return res.status(500).json({ 
        error: 'Mapbox token not configured on server',
        info: 'Please set MAPBOX_SECRET_TOKEN in your environment variables'
      });
    }
    
    // Basic validation that it's a Mapbox token
    if (!secretToken.startsWith('sk.ey')) {
      return res.status(500).json({ 
        error: 'Invalid Mapbox token format',
        info: 'Token should be a secret token that starts with sk.ey'
      });
    }

    // For security, we can't directly expose a secret token to the client
    // We need to use a public token for client-side map rendering
    let publicToken;
    
    try {
      // Try to create a temporary token using the Mapbox API
      // Extract username from the token
      const username = extractUsernameFromToken(secretToken);
      
      if (username) {
        // Attempt to generate a temporary token with the Mapbox API
        const response = await axios.post(
          `https://api.mapbox.com/tokens/v2/${username}`,
          {
            scopes: ['styles:read', 'styles:tiles', 'fonts:read', 'datasets:read'],
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hour expiry
            note: 'LoadUp Temporary Token'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              access_token: secretToken
            }
          }
        );
        
        if (response.data && response.data.token) {
          publicToken = response.data.token;
        }
      }
    } catch (tokenError) {
      console.error('Error generating temporary token:', tokenError);
      // Fall back to the hardcoded token if the API fails
    }
    
    // Use the environment variable if available, otherwise fall back to the hardcoded token
    if (!publicToken) {
      publicToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';
    }
    
    // For security, add cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Return the public token
    return res.status(200).json({ 
      token: publicToken,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
      tokenType: 'mapbox',
      source: 'server-api'
    });
  } catch (error) {
    console.error('Error retrieving Mapbox token:', error);
    return res.status(500).json({ error: 'Failed to retrieve Mapbox token' });
  }
}

// Helper function to extract username from a Mapbox token
function extractUsernameFromToken(token: string): string | null {
  try {
    // The token format is sk.eyJ1IjoiZXNyYXJ1c3RpbiI.... etc
    // Extract the base64 part (after sk.ey)
    const base64Part = token.substring(5);
    
    // Extract the username from token JSON
    const firstDotIndex = base64Part.indexOf('.');
    if (firstDotIndex === -1) return null;
    
    const payloadBase64 = base64Part.substring(0, firstDotIndex);
    
    // Decode base64
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString();
    let tokenData;
    
    try {
      tokenData = JSON.parse(decodedPayload);
      return tokenData.u || null;
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error('Error extracting username:', error);
    return null;
  }
}