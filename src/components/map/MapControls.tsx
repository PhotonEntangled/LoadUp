import React, { memo, useCallback, useMemo } from 'react';
import { useVehicleStore, VehicleType, VehicleStatus } from '../../store/map/useVehicleStore';
import { useTrackingStore, TrackingMode } from '../../store/map/useTrackingStore';
// Removed: useMapViewStore - use mapManager from utils/maps/MapManager instead '../../store/map/useMapViewStore';

// Define interface for filters
interface Filters {
  searchQuery: string;
  status: VehicleStatus;
  type: VehicleType;
  isAvailableOnly: boolean;
}

// Connection status text helper
const getConnectionStatusText = (isEnabled: boolean) => {
  return isEnabled ? 'Connected' : 'Disconnected';
};

const MapControls: React.FC = () => {
  // Get selectors and actions from vehicle store
  const filters = useVehicleStore(state => state.filters);
  const setFilter = useVehicleStore(state => state.setFilter);
  const resetFilters = useVehicleStore(state => state.resetFilters);
  
  // Select tracking state
  const isTrackingEnabled = useTrackingStore(state => state.isTrackingEnabled);
  const pollingInterval = useTrackingStore(state => state.pollingInterval);
  const setTrackingEnabled = useTrackingStore(state => state.setTrackingEnabled);
  const setPollingInterval = useTrackingStore(state => state.setPollingInterval);
  
  // Get connection status
  const connectionStatus = getConnectionStatusText(isTrackingEnabled);
  
  // LoadUp uses trucks only for its logistics operations
  const vehicleTypeLabel = 'Trucks';
  
  // Vehicle status options
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'idle', label: 'Idle' },
    { value: 'enroute', label: 'En Route' },
    { value: 'loading', label: 'Loading' },
    { value: 'unloading', label: 'Unloading' },
    { value: 'offline', label: 'Offline' }
  ], []);
  
  // Refresh interval options
  const refreshOptions = useMemo(() => [
    { value: 3000, label: '3s' },
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' }
  ], []);
  
  // Memoize handlers to prevent recreating functions on each render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('searchQuery', e.target.value);
  }, [setFilter]);
  
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter('status', e.target.value as VehicleStatus);
  }, [setFilter]);
  
  const handleRefreshChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollingInterval(Number(e.target.value));
  }, [setPollingInterval]);
  
  const handleTrackingToggle = useCallback(() => {
    setTrackingEnabled(!isTrackingEnabled);
  }, [isTrackingEnabled, setTrackingEnabled]);
  
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);
  
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 w-64">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search trucks..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={filters.searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
            {vehicleTypeLabel}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.status}
            onChange={handleStatusChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Live Tracking</span>
          <div className="relative inline-block w-10 align-middle select-none">
            <input
              type="checkbox"
              name="toggle"
              id="tracking-toggle"
              className="sr-only"
              checked={isTrackingEnabled}
              onChange={handleTrackingToggle}
            />
            <label
              htmlFor="tracking-toggle"
              className={`block h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                isTrackingEnabled ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute left-0 top-0 block w-6 h-6 mt-0 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                  isTrackingEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status: {connectionStatus}</span>
          
          <select
            className="text-xs px-2 py-1 border border-gray-300 rounded-md"
            value={pollingInterval}
            onChange={handleRefreshChange}
            disabled={!isTrackingEnabled}
          >
            {refreshOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={handleResetFilters}
        className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

// Use React.memo with custom comparator that always returns true to prevent re-renders
export default memo(MapControls, () => true); 