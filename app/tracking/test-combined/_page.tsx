"use client";

import React, { useState, useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import the StabilizedVehicleTrackingProvider
import { StabilizedVehicleTrackingProvider } from '../../../../../src/components/StabilizedVehicleTrackingProvider';
// import VehicleList from '@/src/components/VehicleList'; // This might also be wrong/obsolete - leaving for now as it wasn't causing the duplicate error
// REMOVED erroneous static import below:
// import VehicleTrackingMap from '@/src/components/map/VehicleTrackingMap';

// Dynamically import components with no SSR to avoid hydration issues
const DynamicVehicleList = dynamic(
  () => import('../../../../../src/components/VehicleList').then(mod => ({ default: mod.VehicleList })),
  { ssr: false }
);

const VehicleTrackingMap = dynamic(
  () => import('../../../../../src/components/map/VehicleTrackingMap'),
  { ssr: false }
);

// Create a memoized header component to prevent re-renders
const Header = memo(() => (
  <header className="bg-gray-800 text-white p-4 shadow-md">
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Combined Test (Map + List)</h1>
      <p className="text-gray-300 mt-1">
        Testing map and vehicle list components together
      </p>
      
      <div className="mt-2 p-2 bg-blue-800 text-blue-100 rounded">
        <p>
          <strong>INFO:</strong> This page tests both components together. Also see:{' '}
          <Link href="/tracking/test-new-map" className="text-white font-bold underline">
            map test
          </Link>{' '}
          and{' '}
          <Link href="/tracking/test-vehicle-list" className="text-white font-bold underline">
            list test
          </Link>
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

// Memoized VehicleList component wrapper
const VehicleListSection = memo(({ 
  onVehicleSelect 
}: { 
  onVehicleSelect: (vehicle: any) => void 
}) => {
  console.log('[VehicleListSection] Rendering');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
      <DynamicVehicleList 
        className="w-full" 
        onVehicleSelect={onVehicleSelect}
      />
    </div>
  );
});

VehicleListSection.displayName = 'VehicleListSection';

// Memoized Map component wrapper
const MapSection = memo(({ 
  selectedVehicleId, 
  onVehicleClick 
}: { 
  selectedVehicleId: string | null,
  onVehicleClick: (vehicle: any) => void
}) => {
  console.log('[MapSection] Rendering');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-xl font-semibold mb-4">Map</h2>
      <div className="h-[600px] w-full">
        <VehicleTrackingMap 
          mapId="combined-test-map"
          height="100%"
          width="100%"
          showFilters={false}
          onVehicleClick={onVehicleClick}
        />
      </div>
    </div>
  );
});

MapSection.displayName = 'MapSection';

/**
 * TestCombinedPage - Test both map and vehicle list together
 * 
 * This page combines both components but with proper isolation to prevent render loops
 */
export default function TestCombinedPage() {
  console.log('[TestCombinedPage] Rendering combined test page');
  
  // Basic state
  const [error, setError] = useState<Error | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  // Memoized handlers
  const handleError = useCallback((err: Error) => {
    console.error('Error:', err);
    setError(err);
  }, []);

  const handleVehicleSelect = useCallback((vehicle: any) => {
    console.log('Vehicle selected:', vehicle);
    setSelectedVehicle(vehicle);
  }, []);

  const toggleComponents = useCallback(() => {
    setShowComponents(prev => !prev);
  }, []);
  
  // Memoize the selected vehicle ID to prevent unnecessary re-renders
  const selectedVehicleId = useMemo(() => 
    selectedVehicle ? selectedVehicle.id : null, 
    [selectedVehicle]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">Combined Test Environment</h2>
          <p className="mb-4">
            This page tests both the map and vehicle list components together using proper component isolation.
          </p>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800 mb-2">Implementation Details</h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Memoized component wrappers to prevent re-renders</li>
              <li>Dynamic imports with no SSR</li>
              <li>Components only mount when explicitly requested</li>
              <li>Enhanced MapManager with debounce protection</li>
              <li>Fixed VehicleList with proper props</li>
            </ul>
          </div>
          
          <ErrorDisplay error={error} />
          
          <div className="mt-8 flex justify-end">
            <button 
              className={`px-4 py-2 ${showComponents ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
              onClick={toggleComponents}
            >
              {showComponents ? 'Hide Components' : 'Show Components'}
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
                {selectedVehicle.location && (
                  <p><strong>Location:</strong> {selectedVehicle.location.latitude.toFixed(5)}, {selectedVehicle.location.longitude.toFixed(5)}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Only render components when showComponents is true */}
        {showComponents && (
          <StabilizedVehicleTrackingProvider>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Vehicle List - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <VehicleListSection onVehicleSelect={handleVehicleSelect} />
              </div>
              
              {/* Map - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                <MapSection 
                  selectedVehicleId={selectedVehicleId} 
                  onVehicleClick={handleVehicleSelect} 
                />
              </div>
            </div>
          </StabilizedVehicleTrackingProvider>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 