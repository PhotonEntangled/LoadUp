"use client";

import React, { useState } from 'react';
import { VehicleServiceType } from '../../../../src/services/VehicleServiceFactory';
import { VehicleTrackingProvider } from '../../../../src/components/VehicleTrackingProvider';
import { TrackingControls } from '../../../../src/components/TrackingControls';
import { VehicleList } from '../../../../src/components/VehicleList';
import { useUnifiedVehicleStore } from '../../../../src/store/useUnifiedVehicleStore';
import VehicleTrackingMap from '../../../../src/components/map/VehicleTrackingMap';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Force mock mode for debugging
const FORCE_MOCK = true;

/**
 * Status count component that gets vehicles by status
 * Optimized to prevent unnecessary re-renders by using a single selector
 */
const StatusCounts: React.FC = () => {
  // Get all counts in a single selector to prevent multiple re-renders
  const vehicleCounts = useUnifiedVehicleStore(state => {
    // Single state access to minimize re-renders
    const vehicles = Object.values(state.vehicles);
    
    return {
      movingCount: vehicles.filter(v => v.status === 'moving').length,
      loadingCount: vehicles.filter(v => v.status === 'loading').length,
      unloadingCount: vehicles.filter(v => v.status === 'unloading').length,
      idleCount: vehicles.filter(v => v.status === 'idle').length,
      maintenanceCount: vehicles.filter(v => v.status === 'maintenance').length
    };
  });
  
  const { 
    movingCount, 
    loadingCount, 
    unloadingCount, 
    idleCount, 
    maintenanceCount 
  } = vehicleCounts;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700">Moving Vehicles</h3>
        <p className="text-3xl font-bold text-green-500">{movingCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700">Loading/Unloading</h3>
        <p className="text-3xl font-bold text-blue-500">{loadingCount + unloadingCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700">Idle/Maintenance</h3>
        <p className="text-3xl font-bold text-yellow-500">{idleCount + maintenanceCount}</p>
      </div>
    </div>
  );
};

/**
 * ComplexVehicleTrackingPage - DEPRECATED - Advanced tracking page with unified vehicle tracking system
 * 
 * WARNING: This page is deprecated and may contain stability issues.
 * For a more stable implementation with a single test vehicle, 
 * visit the stabilized tracking page at /tracking-stabilized
 */
export default function ComplexVehicleTrackingPage() {
  console.log('[ComplexVehicleTrackingPage] Rendering in safe mode - mock only');
  
  // Force mock service type for debugging
  const [serviceType] = useState<VehicleServiceType>(VehicleServiceType.MOCK);
  const [error, setError] = useState<Error | null>(null);

  // Handle errors that might occur
  const handleError = (err: Error) => {
    console.error('Tracking error:', err);
    setError(err);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">LoadUp Vehicle Tracking (DEPRECATED)</h1>
          <p className="text-gray-300 mt-1">
            This page is deprecated and may be unstable.
          </p>
          
          <div className="mt-2 p-2 bg-red-800 text-red-100 rounded">
            <p>
              <strong>WARNING:</strong> This page is deprecated. Please use our{' '}
              <Link href="/tracking-stabilized" className="text-white font-bold underline">
                stabilized tracking page
              </Link>{' '}
              for a simplified and more stable implementation.
            </p>
          </div>
        </div>
      </header>

      <VehicleTrackingProvider>
        <div className="container mx-auto flex-grow p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded mb-4">
                  ⚠️ Running in safe mode (mock data only)
                </div>
                
                <TrackingControls 
                  serviceType={serviceType} 
                  className="mt-4"
                />
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Vehicle List</h3>
                <VehicleList />
              </div>
              </div>
              
            {/* Main Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="bg-white rounded-lg shadow-md h-[600px] relative">
                {/* Map component */}
                <VehicleTrackingMap 
                  height="600px"
                  width="100%"
                  showFilters={true}
                  onMapLoad={(mapId) => console.log('Map is ready', mapId)}
                  onError={handleError}
                />
                
                {/* Error message overlay */}
                {error && (
                  <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 flex items-center justify-center">
                    <AlertCircle size={16} className="mr-2" />
                    {error.message || 'An error occurred'}
                  </div>
                )}
              </div>
              
              {/* Status overview */}
              <StatusCounts />
              
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <h2 className="text-lg font-semibold mb-2">Debug Mode Active</h2>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                  <h3 className="text-blue-800 font-medium mb-2">Safe Mode Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Running with mock data only</li>
                    <li>Firebase tracking disabled</li>
                    <li>Service switching disabled</li>
                    <li>Real-time updates minimized</li>
                  </ul>
                </div>
                <p className="text-gray-700 mt-2">
                  Currently using <strong>Mock Service</strong> for tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </VehicleTrackingProvider>
      
      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center text-sm">
          <p>© {new Date().getFullYear()} LoadUp Logistics. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
} 