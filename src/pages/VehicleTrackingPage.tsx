import React, { useState } from 'react';
import { VehicleTrackingMap } from '../components/map/VehicleTrackingMap';
import { useStableVehicleList } from '../store/stableVehicleStore';
import { Vehicle, VehicleStatus } from '../types/vehicle';
import VehicleSimulationProvider, { useSimulation } from '../components/map/VehicleSimulationProvider';

/**
 * SimulationControls - Simulation control panel component
 */
const SimulationControls: React.FC = () => {
  const { 
    isRunning, 
    speed, 
    vehicleStatus,
    toggleSimulation, 
    updateSpeed, 
    updateVehicleStatus,
    resetSimulation
  } = useSimulation();
  
  const statusOptions: VehicleStatus[] = [
    'moving', 'loading', 'unloading', 'idle', 
    'maintenance', 'pending', 'completed'
  ];
  
  return (
    <div className="bg-white p-3 rounded shadow-sm flex items-center gap-3 flex-wrap">
      <button 
        onClick={toggleSimulation}
        className={`px-3 py-1 rounded text-sm font-medium ${
          isRunning 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isRunning ? 'Stop' : 'Start'} Simulation
      </button>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Speed:</span>
        <select 
          value={speed}
          onChange={(e) => updateSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
          className="p-1 text-sm border rounded"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <select 
          value={vehicleStatus}
          onChange={(e) => updateVehicleStatus(e.target.value as VehicleStatus)}
          className="p-1 text-sm border rounded"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={resetSimulation}
        className="px-3 py-1 rounded text-sm font-medium bg-gray-200 hover:bg-gray-300"
      >
        Reset
      </button>
    </div>
  );
};

/**
 * VehicleDetails - Vehicle information sidebar
 */
const VehicleDetails: React.FC<{ vehicle: Vehicle | null }> = ({ vehicle }) => {
  if (!vehicle) return null;
  
  return (
    <div className="w-96 bg-white p-4 border-l border-gray-200 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
      <div className="space-y-2">
        <div>
          <span className="font-medium">ID:</span> {vehicle.id}
        </div>
        <div>
          <span className="font-medium">Type:</span> {vehicle.type}
        </div>
        <div>
          <span className="font-medium">Status:</span> {vehicle.status}
        </div>
        {vehicle.location && (
          <div>
            <span className="font-medium">Location:</span>{' '}
            {vehicle.location.latitude.toFixed(4)},{' '}
            {vehicle.location.longitude.toFixed(4)}
          </div>
        )}
        
        {/* Additional vehicle properties */}
        {Object.entries(vehicle).map(([key, value]) => {
          // Skip properties we've already displayed
          if (['id', 'type', 'status', 'location'].includes(key)) return null;
          
          // Skip functions and complex objects
          if (typeof value === 'function' || typeof value === 'object') return null;
          
          return (
            <div key={key}>
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * VehicleTrackingPage - Stable Map Tracking Page
 * 
 * Uses the container-presenter pattern with VehicleSimulationProvider
 * to prevent render loops and provide simulation controls.
 */
export const VehicleTrackingPage: React.FC = () => {
  // Use stable selectors to prevent render loops
  const { vehicleCount } = useStableVehicleList();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Vehicle action handlers
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  const handleVehicleHover = (vehicle: Vehicle | null) => {
    // Optional hover effects
  };
  
  return (
    <VehicleSimulationProvider autoStart={true}>
      <div className="tracking-page">
        <header className="p-4 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Vehicle Tracking</h1>
          <div className="text-sm mt-1">
            {vehicleCount} vehicles tracked
          </div>
        </header>
        
        <div className="p-4">
          <SimulationControls />
        </div>
        
        <div className="flex h-[calc(100vh-180px)]">
          {/* Main map with proper height */}
          <div className="flex-1">
            <VehicleTrackingMap
              height="100%"
              showAllRoutes={false}
              showFilters={true}
              onVehicleClick={handleVehicleClick}
              onVehicleHover={handleVehicleHover}
            />
          </div>
          
          {/* Vehicle details sidebar */}
          <VehicleDetails vehicle={selectedVehicle} />
        </div>
        
        {/* Footer with stats */}
        <footer className="p-4 bg-gray-100 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Using container-presenter pattern for stable map rendering
          </div>
        </footer>
      </div>
    </VehicleSimulationProvider>
  );
};

export default VehicleTrackingPage; 