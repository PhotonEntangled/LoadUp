import React, { memo } from 'react';
import { Vehicle } from '../types/vehicle';
import { VehicleItem } from './VehicleItem';

interface VehicleListPresenterProps {
  vehicles: Vehicle[];
  vehicleCount: number;
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicle: Vehicle) => void;
  className?: string;
}

/**
 * Pure presentational component that renders vehicles
 * Completely isolated from store interactions
 * Uses React.memo to prevent unnecessary re-renders
 */
export const VehicleListPresenter = memo(({
  vehicles,
  vehicleCount,
  selectedVehicleId,
  onVehicleSelect,
  className,
}: VehicleListPresenterProps) => {
  return (
    <div className={`vehicle-list ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Vehicles ({vehicleCount})</h2>
      </div>
      
      {vehicleCount === 0 ? (
        <div className="p-4 bg-gray-100 rounded text-center">
          <p className="text-gray-500">No vehicles available</p>
          <p className="text-sm text-gray-400 mt-1">
            Connect to a tracking service or add vehicles to see them here
          </p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-auto max-h-[600px]">
          {vehicles.map(vehicle => (
            <VehicleItem
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={vehicle.id === selectedVehicleId}
              onSelect={onVehicleSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

// Add display name for React DevTools
VehicleListPresenter.displayName = 'VehicleListPresenter';
