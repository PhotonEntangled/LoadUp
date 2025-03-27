import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map from 'react-map-gl';

const MapboxTest: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Log function that also updates state
  const log = (message: string) => {
    console.log(message);
    setLogMessages(prev => [...prev, message]);
  };

  // Fetch the token from API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        log('Fetching token from API endpoint...');
        const response = await fetch('/api/mapbox-token');
        
        if (!response.ok) {
          const errorData = await response.json();
          log(`❌ Failed to fetch token: ${errorData.error || response.statusText}`);
          throw new Error(errorData.error || 'Failed to fetch Mapbox token');
        }
        
        const data = await response.json();
        log(`✅ Token fetched successfully from API: ${data.token.substring(0, 12)}...`);
        setMapboxToken(data.token);
        
        // Validate the fetched token
        validateToken(data.token);
      } catch (err) {
        log(`❌ Error fetching token: ${err instanceof Error ? err.message : String(err)}`);
        setTokenStatus('invalid');
      }
    };
    
    fetchToken();
  }, []);

  // Validate the token via an API call
  const validateToken = async (token: string) => {
    try {
      log('Validating token via Mapbox API...');
      // Test API call to validate token
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/washington.json?access_token=${token}`
      );
      
      if (response.ok) {
        log('✅ Token is valid! API call was successful.');
        setTokenStatus('valid');
      } else {
        log(`❌ Token validation failed: ${response.status} ${response.statusText}`);
        setTokenStatus('invalid');
      }
    } catch (err) {
      log(`❌ Error validating token: ${err instanceof Error ? err.message : String(err)}`);
      setTokenStatus('invalid');
    }
  };

  // Inspect environment variables 
  useEffect(() => {
    log('Environment variable check:');
    log(`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: ${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? '✅ Defined' : '❌ Missing'}`);
    if (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      log(`Token from env: ${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.substring(0, 12)}...`);
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mapbox Token Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Token Status: 
          <span className={
            tokenStatus === 'loading' ? 'text-gray-500' :
            tokenStatus === 'valid' ? 'text-green-500' : 'text-red-500'
          }>
            {' '}{tokenStatus === 'loading' ? 'Checking...' : tokenStatus === 'valid' ? 'Valid' : 'Invalid'}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Using API-Fetched Token</h2>
          <div className="w-full h-80 border border-gray-300 relative">
            {!mapboxToken ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                Loading token...
              </div>
            ) : (
              <Map
                initialViewState={{
                  longitude: -74.006,
                  latitude: 40.7128,
                  zoom: 9
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={mapboxToken}
                onError={(e: any) => {
                  setError(`Error: ${e.error?.message || 'Unknown error'}`);
                  log(`❌ Map error: ${e.error?.message || 'Unknown error'}`);
                }}
                onLoad={() => log('✅ Map loaded successfully')}
              />
            )}
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
        <div className="bg-gray-100 p-3 rounded max-h-80 overflow-y-auto">
          {logMessages.map((message, index) => (
            <div key={index} className="font-mono text-sm mb-1">
              {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapboxTest; 