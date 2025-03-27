import { NextApiRequest, NextApiResponse } from 'next';
import { getMapboxPublicToken, getMapboxSecretToken } from '../../utils/mapbox-token';

type ResponseData = {
  token?: string;
  error?: string;
};

// This API route returns the Mapbox token from the server environment
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the appropriate token based on the request type
  // We generally use the public token, but can make the secret token available if needed
  const { tokenType } = req.query;
  const useSecretToken = tokenType === 'secret';
  
  // Get the appropriate token
  const mapboxToken = useSecretToken ? 
    getMapboxSecretToken() : 
    getMapboxPublicToken();

  // Return the token
  res.status(200).json({ token: mapboxToken });
}
