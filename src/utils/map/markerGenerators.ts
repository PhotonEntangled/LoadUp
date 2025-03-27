/**
 * Utilities for generating map markers and popups
 */
import { Vehicle, VehicleStatus, VehicleType } from '../../store/map/useVehicleStore';
import { VehicleLocation } from '../../store/map/useLocationStore';
import { Coordinate } from './boundingBox';

// Define MapBounds interface locally instead of importing it to avoid circular dependencies
interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Create a marker element with proper styling based on vehicle type and status
 */
export function createVehicleMarkerElement(
  vehicle: Vehicle,
  location?: VehicleLocation
): HTMLElement {
  // Create main marker container
  const marker = document.createElement('div');
  marker.className = 'vehicle-marker';
  marker.setAttribute('data-vehicle-id', vehicle.id);
  marker.setAttribute('data-vehicle-type', vehicle.type);
  marker.setAttribute('data-vehicle-status', vehicle.status);
  
  // Apply styling based on status
  const color = getVehicleStatusColor(vehicle.status);
  
  // Create icon element
  const icon = document.createElement('div');
  icon.className = 'vehicle-marker-icon';
  icon.innerHTML = getVehicleTypeIcon(vehicle.type);
  icon.style.color = color;
  
  // Create pulse animation element for active vehicles
  if (vehicle.status === 'active' || vehicle.status === 'delivery' || vehicle.status === 'pickup') {
    const pulse = document.createElement('div');
    pulse.className = 'vehicle-marker-pulse';
    pulse.style.borderColor = color;
    marker.appendChild(pulse);
  }
  
  // Create vehicle label
  const label = document.createElement('div');
  label.className = 'vehicle-marker-label';
  label.textContent = vehicle.name;
  label.style.backgroundColor = color;
  
  // Add rotation based on heading if available
  if (location?.heading !== undefined) {
    icon.style.transform = `rotate(${location.heading}deg)`;
  }
  
  // Assemble marker
  marker.appendChild(icon);
  marker.appendChild(label);
  
  return marker;
}

/**
 * Create a popup element with vehicle information
 */
export const createVehiclePopupElement = (
  vehicle: Vehicle,
  location?: VehicleLocation
): HTMLElement => {
  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'vehicle-popup';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'vehicle-popup-header';
  header.style.backgroundColor = getVehicleStatusColor(vehicle.status);
  
  const title = document.createElement('h3');
  title.textContent = vehicle.name;
  header.appendChild(title);
  
  // Create content
  const content = document.createElement('div');
  content.className = 'vehicle-popup-content';
  
  // Add vehicle info
  content.innerHTML = `
    <div class="vehicle-popup-info">
      <p><strong>Status:</strong> ${formatVehicleStatus(vehicle.status)}</p>
      <p><strong>Type:</strong> ${formatVehicleType(vehicle.type)}</p>
      <p><strong>License:</strong> ${vehicle.licenseNumber}</p>
      ${vehicle.driverId ? `<p><strong>Driver ID:</strong> ${vehicle.driverId}</p>` : ''}
      ${vehicle.currentOrderId ? `<p><strong>Current Order:</strong> ${vehicle.currentOrderId}</p>` : ''}
      ${location ? `
        <p><strong>Speed:</strong> ${formatSpeed(location.speed)}</p>
        <p><strong>Updated:</strong> ${formatTimestamp(location.timestamp)}</p>
      ` : ''}
    </div>
  `;
  
  // Assemble popup
  popup.appendChild(header);
  popup.appendChild(content);
  
  return popup;
};

/**
 * Get a color based on vehicle status
 */
export const getVehicleStatusColor = (status: VehicleStatus): string => {
  switch (status) {
    case 'active':
      return '#3B82F6'; // Blue
    case 'delivery':
      return '#10B981'; // Green
    case 'pickup':
      return '#F59E0B'; // Amber
    case 'returning':
      return '#8B5CF6'; // Purple
    case 'maintenance':
      return '#EF4444'; // Red
    case 'inactive':
      return '#6B7280'; // Gray
    case 'offline':
      return '#9CA3AF'; // Light gray
    default:
      return '#3B82F6'; // Default blue
  }
};

/**
 * Get an SVG icon based on vehicle type
 */
export const getVehicleTypeIcon = (type: VehicleType): string => {
  switch (type) {
    case 'truck':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M8 1v2.5h8V1h2v2.5h2V16H4V3.5h2V1h2zm-2 7.5v2h2v-2H6zm4 0v2h4v-2h-4zm6 0v2h2v-2h-2zm-10 4v2h2v-2H6zm4 0v2h4v-2h-4zm6 0v2h2v-2h-2zM2 18v5h2v-2h16v2h2v-5h-4v1.5h-4V18H6v1.5H2z"/>
      </svg>`;
    case 'van':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M3 7c-1.1 0-2 .9-2 2v8h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4h-3V7c0-1.1-.9-2-2-2H3zm1 8h4c0-1.1.9-2 2-2s2 .9 2 2h4c0-1.1.9-2 2-2s2 .9 2 2v1h-1c0-.55-.45-1-1-1s-1 .45-1 1h-6c0-.55-.45-1-1-1s-1 .45-1 1H4v-1zm3-8h10v4h-3l-1 1h-6V7zm-1 7c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
      </svg>`;
    case 'car':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>`;
    case 'bike':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
      </svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zM6 17.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5S6 18.33 6 17.5zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"/>
      </svg>`;
  }
};

/**
 * Format a vehicle status for display
 */
export const formatVehicleStatus = (status: VehicleStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'delivery':
      return 'Delivering';
    case 'pickup':
      return 'Picking Up';
    case 'returning':
      return 'Returning';
    case 'maintenance':
      return 'In Maintenance';
    case 'inactive':
      return 'Inactive';
    case 'offline':
      return 'Offline';
    default:
      return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  }
};

/**
 * Format a vehicle type for display
 */
export const formatVehicleType = (type: VehicleType): string => {
  switch (type) {
    case 'truck':
      return 'Truck';
    case 'van':
      return 'Van';
    case 'car':
      return 'Car';
    case 'bike':
      return 'Bike';
    default:
      return String(type).charAt(0).toUpperCase() + String(type).slice(1);
  }
};

/**
 * Format speed for display
 */
export const formatSpeed = (speedKmh: number): string => {
  return `${Math.round(speedKmh)} km/h`;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Convert vehicle and location to a coordinate
 */
export const vehicleLocationToCoordinate = (
  vehicle: Vehicle,
  vehicleLocations: Record<string, VehicleLocation>
): Coordinate | null => {
  const location = vehicleLocations[vehicle.id];
  if (!location) return null;
  
  return [location.longitude, location.latitude];
};

/**
 * Get coordinates for an array of vehicles
 */
export const getCoordinatesFromVehicles = (
  vehicles: Vehicle[],
  vehicleLocations: Record<string, VehicleLocation>
): Coordinate[] => {
  return vehicles
    .map(vehicle => vehicleLocationToCoordinate(vehicle, vehicleLocations))
    .filter((coord): coord is Coordinate => coord !== null);
}; 