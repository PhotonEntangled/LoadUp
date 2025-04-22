"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Truck, AlertCircle } from 'lucide-react';
// TODO: Import StabilizedVehicleTrackingProvider – functionality to be implemented later.
// TODO: Import VehicleServiceType from VehicleServiceFactory – functionality to be implemented later.
// TODO: Import SimulatedVehicleMap – functionality to be implemented later.
// TODO: Import TrackingControls – functionality to be implemented later.
// TODO: Import useUnifiedVehicleStore – functionality to be implemented later.
// TODO: Import StabilizedVehicleTrackingProvider – functionality to be implemented later.
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Define the vehicle type enum
enum VehicleType {
  TRUCK = "truck",
  VAN = "van",
  CAR = "car"
}

// Define a unified vehicle interface
interface AppVehicle {
  id: string;
  name: string;
  type: string;
  status: string;
  licenseNumber: string;
  currentOrderId?: string;
  driverId?: string;
  capacity?: number;
  notes?: string;
}

// Vehicle Status Summary component
const VehicleStatusSummary = () => {
  // Commented out usage due to removed import
  // const vehiclesRecord = useUnifiedVehicleStore((state: any) => state.vehicles);
  // const vehicles: AppVehicle[] = Object.values(vehiclesRecord);
  const vehicles: AppVehicle[] = []; // Dummy data
  
  const activeCount = vehicles.filter(v => v.status === 'moving').length;
  const idleCount = vehicles.filter(v => v.status === 'idle').length;
  const loadingCount = vehicles.filter(v => (v.status === 'loading' || v.status === 'unloading')).length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
  
  return (
    <div className="grid grid-cols-4 bg-gray-50 p-2 border-b">
      <div className="flex items-center justify-center p-2">
        <div className="flex items-center">
          <div className="p-1 rounded-full bg-blue-100 mr-2">
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-sm font-medium">{activeCount}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-2">
        <div className="flex items-center">
          <div className="p-1 rounded-full bg-amber-100 mr-2">
            <Truck className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Idle</p>
            <p className="text-sm font-medium">{idleCount}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-2">
        <div className="flex items-center">
          <div className="p-1 rounded-full bg-green-100 mr-2">
            <Truck className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Loading/Unloading</p>
            <p className="text-sm font-medium">{loadingCount}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-2">
        <div className="flex items-center">
          <div className="p-1 rounded-full bg-red-100 mr-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Maintenance</p>
            <p className="text-sm font-medium">{maintenanceCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// REMOVED: const VehicleTrackingMap = dynamic(() => import('src/components/map/VehicleTrackingMap'), { ssr: false });
// TODO: Dynamically import VehicleTrackingMap – functionality to be implemented later.

export default function MapPage() {
  const [serviceType, setServiceType] = useState<any>(
    process.env.NEXT_PUBLIC_USE_MOCK_VEHICLES === 'true'
      ? 'MOCK'
      : 'FIREBASE'
  );
  const [mapError, setMapError] = useState<Error | null>(null);
  
  // Toggle between Firebase and Mock services
  const toggleServiceType = () => {
    setServiceType((current: any) =>
      current === 'FIREBASE'
        ? 'MOCK'
        : 'FIREBASE'
    );
  };

  const handleMapError = (error: Error) => {
    console.error('Map error:', error);
    setMapError(error);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Tracking</h1>
        
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            onClick={toggleServiceType}
          >
            Switch to {serviceType === 'FIREBASE' ? 'Mock' : 'Firebase'} Data
          </button>
          
          {/* Export data button */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            onClick={() => {
              // Commented out usage due to removed import
              // const vehiclesRecord = useUnifiedVehicleStore.getState().vehicles;
              // const vehicles: AppVehicle[] = Object.values(vehiclesRecord);
              const vehicles: AppVehicle[] = []; // Dummy data
              
              // Create CSV content
              const headers = ['ID', 'Type', 'Status', 'Last Updated'];
              const rows = vehicles.map(vehicle => [
                vehicle.id,
                vehicle.type,
                vehicle.status,
                new Date().toLocaleString() // Use current date for now
              ]);
              
              // Combine headers and rows
              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');
              
              // Create and download the file
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `vehicle_locations_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {/* <VehicleTrackingProvider> */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3">Tracking Controls</h2>
              {/* <TrackingControls 
                serviceType={serviceType}
                className="mt-2" 
              /> */}
            </Card>
            
            {/* Additional panels can go here */}
          </div>

        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Map View</h2>
            </div>
            
              {/* Vehicle status counts */}
              {/* <VehicleStatusSummary /> */}
            
            <div className="relative" style={{ height: '70vh', background: '#eee' }}> {/* Added basic placeholder style */}
              {/* Map error state - kept for potential future use */}
              {mapError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-600 mb-2">Map Error</h3>
                      <p className="text-gray-600">{mapError.message}</p>
                  <button 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() => setMapError(null)}
                  >
                        Retry
                  </button>
                    </div>
                  </div>
                )}
                
                {/* Map Component - Commented out */}
                {/* <SimulatedVehicleMap
                  height="70vh"
                  width="100%"
                  onMapReady={(map: mapboxgl.Map) => { 
                    console.log('Map ready', map);
                    if (map) {
                      map.on('error', (e: any) => {
                        console.error('Map error:', e);
                        const errorMessage = e.error?.message || 'Unknown map error';
                        setMapError(new Error(errorMessage));
                      });
                    }
                  }}
                  enableControls={true}
                  enableSearch={true}
                  mapStyle="streets-v12"
                /> */}
                 <div style={{ padding: '20px' }}>Map functionality deferred.</div> {/* Placeholder text */}
            </div>
          </Card>
          </div>
        </div>
      {/* </VehicleTrackingProvider> */}
    </div>
  );
} 