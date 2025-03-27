import React, { memo, useCallback } from 'react';
import { Vehicle, VehicleStatus } from '../types/vehicle';

interface VehicleItemProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

/**
 * Get CSS color class based on vehicle status
 */
function getStatusColor(status: VehicleStatus): string {
  switch (status) {
    case 'moving': return 'bg-green-500';
    case 'loading': return 'bg-blue-500';
    case 'unloading': return 'bg-purple-500';
    case 'idle': return 'bg-yellow-500';
    case 'maintenance': return 'bg-red-500';
    case 'pending': return 'bg-gray-400';
    case 'in-progress': return 'bg-indigo-500';
    case 'completed': return 'bg-green-700';
    case 'delayed': return 'bg-orange-500';
    case 'failed': return 'bg-red-700';
    case 'arrived': return 'bg-teal-500';
    case 'departed': return 'bg-blue-700';
    case 'skipped': return 'bg-gray-600';
    case 'delivered': return 'bg-green-600';
    default: return 'bg-gray-500';
  }
}

/**
 * Format a date for display (time only if today, full date otherwise)
 */
function formatDate(date: Date): string {
  if (!date) return '';
  
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString() + ' ' + 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Individual vehicle list item component
 * Uses React.memo to prevent unnecessary re-renders
 */
export const VehicleItem = memo(({ vehicle, isSelected, onSelect }: VehicleItemProps) => {
  // Memoize the click handler to avoid recreating on each render
  const handleClick = useCallback(() => {
    onSelect(vehicle);
  }, [vehicle, onSelect]);
  
  return (
    <li 
      className={`p-3 rounded border ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:bg-gray-50'
      } cursor-pointer transition-colors`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium truncate mr-2">{vehicle.id}</span>
        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(vehicle.status)}`}>
          {vehicle.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mt-1">
        <div className="flex justify-between">
          <div>
            <span className="font-medium">Type:</span> {vehicle.type}
          </div>
          <div>
            {vehicle.isSimulated ? (
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Simulated</span>
            ) : (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Real</span>
            )}
          </div>
        </div>
        
        <div className="mt-1">
          <span className="font-medium">Location:</span> {vehicle.location.latitude.toFixed(5)}, {vehicle.location.longitude.toFixed(5)}
        </div>
        
        <div className="flex justify-between mt-1">
          <div>
            <span className="font-medium">Speed:</span> {vehicle.speed} km/h
          </div>
          <div>
            <span className="font-medium">Heading:</span> {vehicle.heading}°
          </div>
        </div>
        
        {!vehicle.isSimulated && vehicle.signalStrength !== undefined && (
          <div className="mt-1">
            <span className="font-medium">Signal:</span> {Array(vehicle.signalStrength).fill('●').join(' ')}
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-2 text-right">
          Updated: {formatDate(vehicle.lastUpdated)}
        </div>
      </div>
    </li>
  );
});

// Add display name for React DevTools
VehicleItem.displayName = 'VehicleItem'; 