import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { VehicleTrackingProvider } from '../components/VehicleTrackingProvider';
import { TrackingControls } from '../components/TrackingControls';
import { VehicleList } from '../components/VehicleList';
import { VehicleServiceType } from '../services/VehicleServiceFactory';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';
import SimulationDemo from '../components/SimulationDemo';
import VehicleTrackingMap from '../components/map/VehicleTrackingMap';

/**
 * Status count component that gets vehicles by status
 */
const StatusCounts: React.FC = () => {
  const movingCount = useUnifiedVehicleStore(state => 
    state.getVehiclesByStatus('moving').length
  );
  
  const loadingCount = useUnifiedVehicleStore(state => 
    state.getVehiclesByStatus('loading').length
  );
  
  const unloadingCount = useUnifiedVehicleStore(state => 
    state.getVehiclesByStatus('unloading').length
  );
  
  const idleCount = useUnifiedVehicleStore(state => 
    state.getVehiclesByStatus('idle').length
  );
  
  const maintenanceCount = useUnifiedVehicleStore(state => 
    state.getVehiclesByStatus('maintenance').length
  );
  
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
 * Demo page for vehicle tracking system
 */
const TrackingDemoPage: NextPage = () => {
  // This is just for UI display now, not affecting actual service
  const [serviceTypeDisplay, setServiceTypeDisplay] = useState<VehicleServiceType>(
    process.env.NEXT_PUBLIC_USE_MOCK_VEHICLES === 'true'
      ? VehicleServiceType.MOCK
      : VehicleServiceType.FIREBASE
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);

  // Toggle the displayed service type (for UI only)
  const toggleServiceTypeDisplay = () => {
    setServiceTypeDisplay(current =>
      current === VehicleServiceType.FIREBASE
        ? VehicleServiceType.MOCK
        : VehicleServiceType.FIREBASE
    );
  };

  // Handle map errors
  const handleMapError = (error: Error) => {
    console.error('Map error:', error);
    setMapError(error);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">LoadUp Vehicle Tracking Demo</h1>
          <p className="text-gray-300 mt-1">
            Real-time tracking for simulated and real vehicles
          </p>
        </div>
      </header>

      <VehicleTrackingProvider>
        <div className="container mx-auto flex-grow p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <button
                  onClick={toggleServiceTypeDisplay}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                >
                  Switch to {serviceTypeDisplay === VehicleServiceType.FIREBASE ? 'Mock' : 'Firebase'} Service Display
                </button>
                
                <TrackingControls 
                  serviceType={serviceTypeDisplay} 
                  className="mt-4" 
                />
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <VehicleList />
              </div>

              {/* Simulation Demo Panel */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Shipment Simulation</h2>
                <SimulationDemo />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="bg-white rounded-lg shadow-md h-[600px]">
                {/* Real map component */}
                <VehicleTrackingMap
                  height="600px"
                  width="100%"
                  showFilters={true}
                  onMapLoad={(mapId) => setMapReady(true)}
                  onError={handleMapError}
                  initialCenter={{ latitude: 3.1402, longitude: 101.6869 }} // Kuala Lumpur
                  initialZoom={9}
                />
              </div>
              
              <StatusCounts />
              
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <h2 className="text-lg font-semibold mb-2">About This Demo</h2>
                <p className="text-gray-700">
                  This demo showcases the LoadUp vehicle tracking system using both real (Firebase) 
                  and simulated data sources.
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-700">
                  <li><strong>Firebase:</strong> Uses Firebase Realtime Database for live tracking</li>
                  <li><strong>Mock:</strong> Generates simulated vehicles around KL post offices</li>
                  <li><strong>Shipment Simulation:</strong> Convert parsed shipments into animated vehicles</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  The tracking system is designed to work with both real and simulated vehicles in a unified way,
                  allowing for seamless testing and transition between development and production environments.
                </p>
                <p className="text-blue-500 mt-2">
                  Current display mode: <strong>{serviceTypeDisplay}</strong>
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
};

export default TrackingDemoPage;