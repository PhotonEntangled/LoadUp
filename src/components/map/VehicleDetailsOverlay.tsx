import React, { memo } from 'react';
import type { Vehicle } from '../../store/map/useVehicleStore';
import type { LocationData } from '../../store/map/useLocationStore';
import { useLocationStore } from '../../store/map/useLocationStore';

interface VehicleDetailsOverlayProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const VehicleDetailsOverlay: React.FC<VehicleDetailsOverlayProps> = ({ 
  vehicle,
  onClose
}) => {
  // Get location data from the store
  const locations = useLocationStore(state => state.vehicleLocations);
  const location = vehicle ? locations[vehicle.id] : null;
  
  if (!vehicle) {
    return null;
  }
  
  // Status badges with colors
  const StatusBadge: React.FC<{ status: Vehicle['status'] }> = ({ status }) => {
    const statusColors = {
      active: 'bg-blue-500',
      idle: 'bg-green-500',
      enroute: 'bg-amber-500',
      loading: 'bg-purple-500',
      unloading: 'bg-indigo-500',
      offline: 'bg-gray-500',
      all: 'bg-gray-500'
    };
    
    const statusText = {
      active: 'Active',
      idle: 'Idle',
      enroute: 'En Route',
      loading: 'Loading',
      unloading: 'Unloading',
      offline: 'Offline',
      all: 'All'
    };
    
    return (
      <span className={`${statusColors[status]} text-white px-2 py-1 rounded text-xs font-medium`}>
        {statusText[status]}
      </span>
    );
  };
  
  // Vehicle type badges
  const TypeBadge: React.FC<{ type: Vehicle['type'] }> = ({ type }) => {
    const typeColors = {
      truck: 'bg-gray-700',
      van: 'bg-gray-600',
      car: 'bg-gray-500',
      all: 'bg-gray-400'
    };
    
    const typeText = {
      truck: 'Truck',
      van: 'Van',
      car: 'Car',
      all: 'All'
    };
    
    return (
      <span className={`${typeColors[type]} text-white px-2 py-1 rounded text-xs font-medium ml-2`}>
        {typeText[type]}
      </span>
    );
  };
  
  // Format the current speed
  const formatSpeed = (speed: number | undefined) => {
    return speed ? `${Math.round(speed)} km/h` : 'N/A';
  };
  
  return (
    <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg p-4 z-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{vehicle.name}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      
      <div className="flex items-center mb-4">
        <StatusBadge status={vehicle.status} />
        <TypeBadge type={vehicle.type} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p className="text-sm text-gray-500">Plate</p>
          <p className="font-medium">{vehicle.plateNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Speed</p>
          <p className="font-medium">{location ? formatSpeed(location.speed) : 'Unknown'}</p>
        </div>
      </div>
      
      {vehicle.currentShipmentId && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Shipment</p>
          <p className="font-medium truncate">{vehicle.currentShipmentId}</p>
        </div>
      )}
      
      {location && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium text-sm">
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {vehicle.fuelLevel !== undefined && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Fuel Level</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${vehicle.fuelLevel}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">{vehicle.fuelLevel}%</p>
        </div>
      )}
    </div>
  );
};

export default memo(VehicleDetailsOverlay, (prevProps, nextProps) => {
  // If both are null, no need to re-render
  if (!prevProps.vehicle && !nextProps.vehicle) {
    return true;
  }
  
  // If one is null and the other isn't, we need to re-render
  if (!prevProps.vehicle || !nextProps.vehicle) {
    return false;
  }
  
  // If the vehicle ID changed, we need to re-render
  if (prevProps.vehicle.id !== nextProps.vehicle.id) {
    return false;
  }
  
  // Check for changes in key properties
  return (
    prevProps.vehicle.status === nextProps.vehicle.status &&
    prevProps.vehicle.currentShipmentId === nextProps.vehicle.currentShipmentId
  );
}); 