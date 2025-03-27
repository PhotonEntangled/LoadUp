"use client";

import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import the StabilizedVehicleTrackingProvider but don't use it yet
import { StabilizedVehicleTrackingProvider } from '../../../../../src/components/StabilizedVehicleTrackingProvider';

// Dynamically import the map component with no SSR to avoid hydration issues
const VehicleTrackingMap = dynamic(
  () => import('../../../../../src/components/map/VehicleTrackingMap'),
  { ssr: false }
);

// Create a memoized header component to prevent re-renders
const Header = memo(() => (
  <header className="bg-gray-800 text-white p-4 shadow-md">
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Map Architecture Test (Fixed)</h1>
      <p className="text-gray-300 mt-1">
        New implementation to fix render loops
      </p>
      
      <div className="mt-2 p-2 bg-blue-800 text-blue-100 rounded">
        <p>
          <strong>INFO:</strong> This is a minimal test page. Compare with{' '}
          <Link href="/tracking" className="text-white font-bold underline">
            regular tracking page
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

// ErrorDisplay component
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
 * MapContent - Component that will only be rendered when showMap is true
 */
const MapContent = memo(() => {
  console.log('[MapContent] Rendering map content');
  
  return (
    <div className="h-[500px] w-full bg-gray-50 rounded border border-gray-200">
      <VehicleTrackingMap 
        mapId="test-map"
        height="100%"
        width="100%"
        showFilters={false}
      />
    </div>
  );
});

MapContent.displayName = 'MapContent';

/**
 * TestVehicleTrackingPage - Fixed implementation with proper component isolation
 * 
 * This page ensures components are properly memoized and separates the map
 * initialization from the main component tree.
 */
export default function TestVehicleTrackingPage() {
  console.log('[TestVehicleTrackingPage] Rendering fixed test page');
  
  // Basic state for errors and map visibility
  const [error, setError] = useState<Error | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Memoized handlers to prevent recreation on render
  const handleError = useCallback((err: Error) => {
    console.error('Error:', err);
    setError(err);
  }, []);

  const toggleMap = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Fixed Map Test Environment</h2>
          <p className="mb-4">
            This updated page uses proper component memoization to prevent render loops.
          </p>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800 mb-2">Implementation Details</h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Fixed component hierarchy with memo to prevent re-renders</li>
              <li>Dynamic imports with no SSR for map components</li>
              <li>Lazy loading of map components only when requested</li>
              <li>No premature initialization of context providers</li>
            </ul>
          </div>
          
          <ErrorDisplay error={error} />
          
          <div className="mt-8 flex justify-end">
            <button 
              className={`px-4 py-2 ${showMap ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
              onClick={toggleMap}
            >
              {showMap ? 'Remove Map' : 'Add Map'}
            </button>
          </div>
          
          {/* Only render map content when showMap is true */}
          {showMap && (
            <div className="mt-4">
              {/* We're not using the problematic provider initially */}
              <MapContent />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 