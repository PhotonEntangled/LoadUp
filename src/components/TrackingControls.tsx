import React, { useCallback, useMemo } from 'react';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';
import { useVehicleService, VehicleServiceType, isMockService } from '../services/VehicleServiceFactory';
import { RealVehicle, VehicleStatus } from '../types/vehicle';

interface TrackingControlsProps {
  className?: string;
  serviceType?: VehicleServiceType;
}

/**
 * Component displaying tracking controls and status information
 */
export const TrackingControls: React.FC<TrackingControlsProps> = ({ 
  className,
  serviceType = VehicleServiceType.MOCK // Default to mock service in safe mode
}) => {
  // Get display options from store using a single selector
  const displayOptions = useUnifiedVehicleStore(state => ({
    showSimulated: state.showSimulated,
    showReal: state.showReal,
    isConnected: state.isConnected,
    lastServerSync: state.lastServerSync
  }));

  // Get vehicle counts using a memoized selector
  const vehicleCounts = useMemo(() => {
    const vehicles = useUnifiedVehicleStore.getState().getFilteredVehicles();
    return {
      total: vehicles.length,
      simulated: vehicles.filter(v => v.isSimulated).length,
      real: vehicles.filter(v => !v.isSimulated).length
    };
  }, []);

  // Format last sync time
  const lastSyncText = displayOptions.lastServerSync 
    ? new Date(displayOptions.lastServerSync).toLocaleTimeString()
    : 'Never';

  // Get store actions
  const store = useMemo(() => ({
    getFilteredVehicles: useUnifiedVehicleStore.getState().getFilteredVehicles,
    addVehicle: useUnifiedVehicleStore.getState().addVehicle,
    removeVehicle: useUnifiedVehicleStore.getState().removeVehicle,
  }), []);

  // Cache the mock vehicle data
  const mockVehicle = useMemo<RealVehicle>(() => ({
    id: 'mock-vehicle-1',
    type: 'TRUCK',
    status: 'ACTIVE' as VehicleStatus,
    isSimulated: false,
    location: { latitude: 1.3521, longitude: 103.8198 },
    heading: 0,
    speed: 0,
    lastUpdated: new Date(),
    deviceId: 'mock-device-1'
  }), []);

  // Cache the addVehicle callback
  const handleAddVehicle = useCallback(() => {
    store.addVehicle(mockVehicle);
  }, [store, mockVehicle]);

  // Cache the removeVehicle callback
  const handleRemoveVehicle = useCallback(() => {
    store.removeVehicle(mockVehicle.id);
  }, [store, mockVehicle.id]);

  return (
    <div className={`tracking-controls ${className || ''}`}>
      <div className="tracking-header">
        <h3 className="tracking-title">Vehicle Tracking</h3>
        <div className={`connection-status ${displayOptions.isConnected ? 'connected' : 'disconnected'}`}>
          {displayOptions.isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="tracking-stats">
        <div className="stat">
          <span className="label">Total:</span>
          <span className="value">{vehicleCounts.total}</span>
        </div>
        <div className="stat">
          <span className="label">Simulated:</span>
          <span className="value">{vehicleCounts.simulated}</span>
        </div>
        <div className="stat">
          <span className="label">Real:</span>
          <span className="value">{vehicleCounts.real}</span>
        </div>
        <div className="stat">
          <span className="label">Last Update:</span>
          <span className="value">{lastSyncText}</span>
        </div>
      </div>

      <div className="tracking-toggles">
        <label className="toggle">
          <input
            type="checkbox"
            checked={displayOptions.showSimulated}
            onChange={() => useUnifiedVehicleStore.getState().toggleShowSimulated()}
          />
          <span>Show Simulated</span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={displayOptions.showReal}
            onChange={() => useUnifiedVehicleStore.getState().toggleShowReal()}
          />
          <span>Show Real</span>
        </label>
      </div>

      {/* Mock service controls */}
      <div className="mock-controls mt-4">
        <button 
          className="add-vehicle-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </button>
        <button 
          className="remove-vehicle-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
          onClick={handleRemoveVehicle}
          disabled={vehicleCounts.total === 0}
        >
          Remove Vehicle
        </button>
      </div>

      <div className="safe-mode-info bg-blue-50 border border-blue-200 rounded p-2 mt-4">
        <p className="text-sm text-blue-700">🛡️ Running in Safe Mode</p>
        <p className="text-xs text-blue-600">Using mock data only</p>
      </div>
    </div>
  );
};

// Add display name for React DevTools
TrackingControls.displayName = 'TrackingControls'; 