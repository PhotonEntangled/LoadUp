"use client";

import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import the StabilizedVehicleTrackingProvider
import { StabilizedVehicleTrackingProvider } from '../../../../../src/components/StabilizedVehicleTrackingProvider';

// Dynamically import the VehicleList component with no SSR to avoid hydration issues
const DynamicVehicleList = dynamic(
  () => import('../../../../../src/components/VehicleList').then(mod => ({ default: mod.VehicleList })),
  { ssr: false }
);

// Create a memoized header component to prevent re-renders
const Header = memo(() => (
  <header className="bg-gray-800 text-white p-4 shadow-md">
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">VehicleList Component Test</h1>
      <p className="text-gray-300 mt-1">
        Testing the VehicleList component in isolation
      </p>
      
      <div className="mt-2 p-2 bg-blue-800 text-blue-100 rounded">
        <p>
          <strong>INFO:</strong> This page tests the VehicleList component. Compare with{' '}
          <Link href="/tracking/test-new-map" className="text-white font-bold underline">
            map test page
          </Link>.
        </p>
      </div>
    </div>
  </header>
));

Header.displayName = 'Header';

// Create a memoized footer component to prevent re-renders
const Footer = memo(() => (
  <footer className="bg-gray-800 text-white p-4 mt-auto">
    <div className="container mx-auto text-center text-sm">
      <p>© {new Date().getFullYear()} LoadUp Logistics. All rights reserved.</p>
    </div>
  </footer>
));

Footer.displayName = 'Footer';

// Error display component
const ErrorDisplay = memo(({ error }: { error: Error | null }) => {
  if (!error) return null;
  
  return (
    <div className="mt-4 p-2 bg-red-500 text-white rounded flex items-center">
      <AlertCircle size={16} className="mr-2" />
      {error.message || 'An error occurred'}
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

/**
 * TestVehicleList - Test page for the VehicleList component
 */
export default function TestVehicleListPage() {
  console.log('[TestVehicleListPage] Rendering test page');
  
  // Basic state for errors and selected vehicles
  const [error, setError] = useState<Error | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showList, setShowList] = useState(false);

  // Memoized handlers to prevent recreation on render
  const handleError = useCallback((err: Error) => {
    console.error('Error:', err);
    setError(err);
  }, []);

  const handleVehicleSelect = useCallback((vehicle: any) => {
    console.log('Vehicle selected:', vehicle);
    setSelectedVehicle(vehicle);
  }, []);

  const toggleList = useCallback(() => {
    setShowList(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">VehicleList Component Test</h2>
          <p className="mb-4">
            This page tests the VehicleList component in isolation to verify the onVehicleSelect prop works correctly.
          </p>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800 mb-2">Implementation Details</h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Memoized components to prevent re-renders</li>
              <li>Dynamic import of VehicleList with no SSR</li>
              <li>Fixed onVehicleSelect prop TypeScript error</li>
              <li>Isolated testing environment</li>
            </ul>
          </div>
          
          <ErrorDisplay error={error} />
          
          <div className="mt-8 flex justify-end">
            <button 
              className={`px-4 py-2 ${showList ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
              onClick={toggleList}
            >
              {showList ? 'Hide Vehicle List' : 'Show Vehicle List'}
            </button>
          </div>
          
          {/* Display selected vehicle info if available */}
          {selectedVehicle && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-800 mb-2">Selected Vehicle</h3>
              <div className="text-blue-700">
                <p><strong>ID:</strong> {selectedVehicle.id}</p>
                <p><strong>Type:</strong> {selectedVehicle.type}</p>
                <p><strong>Status:</strong> {selectedVehicle.status}</p>
              </div>
            </div>
          )}
          
          {/* Only render VehicleList when showList is true */}
          {showList && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h3 className="text-lg font-medium mb-4">StabilizedVehicleTrackingProvider</h3>
                <StabilizedVehicleTrackingProvider>
                  <div className="p-4 bg-white border border-gray-300 rounded">
                    <DynamicVehicleList 
                      className="w-full" 
                      onVehicleSelect={handleVehicleSelect}
                    />
                  </div>
                </StabilizedVehicleTrackingProvider>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 