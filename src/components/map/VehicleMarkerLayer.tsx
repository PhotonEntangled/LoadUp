import React, { useCallback, useMemo, CSSProperties, useEffect } from 'react';
import { Marker } from 'react-map-gl';
import { Vehicle } from '../../types/vehicle';

// Custom Popup component to avoid type issues
const Popup = ({ children, ...props }: any) => {
  // We need to import this dynamically to avoid the type issues with react-map-gl
  const { Popup: MapGLPopup } = require('react-map-gl');
  return <MapGLPopup {...props}>{children}</MapGLPopup>;
};

// Interface for VehicleMarkerLayer component
interface VehicleMarkerLayerProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  rotateToMatchBearing?: boolean;
}

// VehicleMarkerLayer component renders markers for vehicles
const VehicleMarkerLayer: React.FC<VehicleMarkerLayerProps> = React.memo(({
  vehicles,
  selectedVehicleId = null,
  onVehicleClick,
  onVehicleHover,
  rotateToMatchBearing = false,
}) => {
  // Enhanced debug logging for component render
  useEffect(() => {
    console.log(`[VehicleMarkerLayer] Component (re)rendered with ${vehicles.length} vehicles`);
    if (vehicles.length > 0) {
      console.log(`[VehicleMarkerLayer] First vehicle sample:`, JSON.stringify(vehicles[0], null, 2));
    }
  }, [vehicles]);
  
  // Filter out vehicles with invalid locations
  const validVehicles = useMemo(() => {
    const filtered = vehicles.filter(v => 
      v && v.id && 
      typeof v.location?.latitude === 'number' && 
      typeof v.location?.longitude === 'number' && 
      !isNaN(v.location.latitude) && 
      !isNaN(v.location.longitude)
    );
    
    // Log filtering results
    console.log(`[VehicleMarkerLayer] Filtered ${vehicles.length} vehicles -> ${filtered.length} valid vehicles`);
    if (vehicles.length > 0 && filtered.length === 0) {
      console.warn(`[VehicleMarkerLayer] All vehicles were filtered out. First vehicle:`, 
        JSON.stringify(vehicles[0], null, 2));
    }
    
    return filtered;
  }, [vehicles]);
  
  // Log rendering of markers
  console.log(`[VehicleMarkerLayer] Rendering ${validVehicles.length} vehicle markers`);
  
  // Create a lookup for selected vehicle
  const isVehicleSelected = useCallback((vehicleId: string) => {
    return vehicleId === selectedVehicleId;
  }, [selectedVehicleId]);
  
  // Handlers with stable identities
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    console.log(`[VehicleMarkerLayer] Vehicle clicked: ${vehicle.id}`);
    onVehicleClick?.(vehicle);
  }, [onVehicleClick]);
  
  const handleVehicleHover = useCallback((isHovered: boolean, vehicle: Vehicle) => {
    if (isHovered) {
      console.log(`[VehicleMarkerLayer] Vehicle hover started: ${vehicle.id}`);
    }
    onVehicleHover?.(isHovered ? vehicle : null);
  }, [onVehicleHover]);
  
  // Render markers
  return (
    <>
      {validVehicles.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'rgba(255,0,0,0.2)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          No valid vehicles to display
        </div>
      )}
      
      {validVehicles.map(vehicle => (
        <VehicleMarker
          key={vehicle.id}
          vehicle={vehicle}
          isSelected={isVehicleSelected(vehicle.id)}
          onClick={() => handleVehicleClick(vehicle)}
          onHover={(isHovered) => handleVehicleHover(isHovered, vehicle)}
          rotateToMatchBearing={rotateToMatchBearing}
        />
      ))}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if vehicle array length changes, selected vehicle changes,
  // or if a specific vehicle changed position

  // 1. Quick check if references are identical
  if (prevProps === nextProps) return true;
  
  // 2. Check if functions changed (we don't care about this since they're event handlers)
  // Just handle them in component useCallbacks
  
  // 3. Check if selectedVehicleId changed
  if (prevProps.selectedVehicleId !== nextProps.selectedVehicleId) return false;
  
  // 4. Check if rotateToMatchBearing changed
  if (prevProps.rotateToMatchBearing !== nextProps.rotateToMatchBearing) return false;
  
  // 5. Check if number of vehicles changed
  if (prevProps.vehicles.length !== nextProps.vehicles.length) return false;
  
  // 6. Check if any vehicles changed position (more expensive check)
  // Only do this if we have relatively few vehicles (<100)
  if (prevProps.vehicles.length < 100) {
    // Create map of previous vehicles by ID
    const prevVehicleMap = new Map(
      prevProps.vehicles.map(v => [v.id, v])
    );
    
    // Check if any vehicle changed position
    for (const vehicle of nextProps.vehicles) {
      const prevVehicle = prevVehicleMap.get(vehicle.id);
      
      // If vehicle is new or has changed position
      if (!prevVehicle || 
          prevVehicle.location.latitude !== vehicle.location.latitude || 
          prevVehicle.location.longitude !== vehicle.location.longitude ||
          prevVehicle.heading !== vehicle.heading) {
        return false;
      }
    }
  } else {
    // For large vehicle sets, we'll check for any properties that might indicate updates
    // Look for timestamp-like properties that might be available
    const hasChanged = prevProps.vehicles.some((prevVehicle, index) => {
      const nextVehicle = nextProps.vehicles[index];
      
      // If IDs don't match, the list order changed
      if (prevVehicle.id !== nextVehicle.id) return true;
      
      // Check location changes
      if (prevVehicle.location.latitude !== nextVehicle.location.latitude ||
          prevVehicle.location.longitude !== nextVehicle.location.longitude) {
        return true;
      }
      
      // Check other properties that might indicate changes
      return prevVehicle.heading !== nextVehicle.heading ||
             prevVehicle.status !== nextVehicle.status;
    });
    
    if (hasChanged) return false;
  }
  
  // No changes detected, prevent re-render
  return true;
});

// Memoized vehicle marker component
const VehicleMarker = React.memo(({
  vehicle,
  isSelected,
  onClick,
  onHover,
  rotateToMatchBearing,
}: {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
  rotateToMatchBearing: boolean;
}) => {
  // Debug rendering of specific marker
  useEffect(() => {
    console.log(`[VehicleMarker] Rendering marker for vehicle ${vehicle.id} at [${vehicle.location.longitude}, ${vehicle.location.latitude}]`);
  }, [vehicle.id, vehicle.location.latitude, vehicle.location.longitude]);
  
  // Determine marker type and status
  const markerType = useMemo(() => {
    // Check if the vehicle is simulated
    if ('isSimulated' in vehicle && vehicle.isSimulated) {
      return 'simulated-vehicle';
    }
    return 'vehicle';
  }, [vehicle]);
  
  // Determine marker status
  const markerStatus = vehicle.status || 'pending';
  
  // Extract any custom visual properties if they exist
  const visuals = 'visuals' in vehicle ? (vehicle as any).visuals || {} : {};
  
  // Create style options
  const color = visuals.color || '#00BFFF'; // Default to bright blue
  const size = visuals.size || 40; // Larger default size
  const emoji = visuals.emoji || '🚚'; // Default truck emoji
  const rotation = rotateToMatchBearing ? (vehicle.heading || 0) : 0;
  
  // Handle popup close
  const handleClose = useCallback(() => {
    console.log(`[VehicleMarker] Closing popup for vehicle ${vehicle.id}`);
  }, [vehicle.id]);
  
  // Safely get destination from vehicle
  const destination = 'destination' in vehicle ? String((vehicle as any).destination || '') : '';
  
  // Memoize the marker style object to prevent re-renders
  const markerStyle = useMemo((): CSSProperties => ({
    // --- BEGIN AGGRESSIVE STYLE INJECTION ---
    // Keep existing styles but override/add for debugging
    backgroundColor: 'magenta', // Highly visible background
    width: `${size || 50}px`,    // Ensure size
    height: `${size || 50}px`,   // Ensure size
    borderRadius: '50%',
    display: 'flex',           // Ensure display is correct
    justifyContent: 'center',
    alignItems: 'center',
    border: isSelected ? '3px solid lime' : '2px solid lime', // Visible border always
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    fontSize: visuals.fontSize || 16,
    transform: 'scale(1.1)', // Keep it scaled up
    transition: 'all 0.3s ease',
    zIndex: 9999,            // Force high z-index
    position: 'relative',    // Ensure positioning context
    boxSizing: 'border-box',
    opacity: 1,              // Force opacity
    outline: '3px solid cyan', // Change outline color for confirmation
    pointerEvents: 'auto',   // Ensure interaction
    overflow: 'visible',       // Prevent clipping
    // --- END AGGRESSIVE STYLE INJECTION ---
  }), [size, isSelected, visuals.fontSize]); // Reduced dependencies for debugging if needed
  
  // Return the marker component
  return (
    <Marker
      longitude={vehicle.location.longitude}
      latitude={vehicle.location.latitude}
      rotation={rotation}
      anchor="center"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div
        style={markerStyle}
        data-vehicle-id={vehicle.id}
        data-marker-type={markerType}
        data-status={markerStatus}
      >
        {emoji}
      </div>
      
      {isSelected && (
        <Popup
          longitude={vehicle.location.longitude}
          latitude={vehicle.location.latitude}
          anchor="top"
          closeButton={true}
          closeOnClick={false}
          onClose={handleClose}
          offset={20}
        >
          <div style={{ padding: '10px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{vehicle.id}</h3>
            <p style={{ margin: '0 0 5px 0' }}><strong>Type:</strong> {vehicle.type || 'Unknown'}</p>
            <p style={{ margin: '0 0 5px 0' }}><strong>Status:</strong> {markerStatus}</p>
            {vehicle.speed !== undefined && (
              <p style={{ margin: '0 0 5px 0' }}><strong>Speed:</strong> {vehicle.speed} mph</p>
            )}
            {destination && (
              <p style={{ margin: '0' }}><strong>Destination:</strong> {destination}</p>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  );
}, (prevProps, nextProps) => {
  // Only re-render if crucial properties change
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.rotateToMatchBearing === nextProps.rotateToMatchBearing &&
    prevProps.vehicle.location.latitude === nextProps.vehicle.location.latitude &&
    prevProps.vehicle.location.longitude === nextProps.vehicle.location.longitude &&
    prevProps.vehicle.heading === nextProps.vehicle.heading &&
    prevProps.vehicle.status === nextProps.vehicle.status
  );
});

VehicleMarker.displayName = 'VehicleMarker';
VehicleMarkerLayer.displayName = 'VehicleMarkerLayer';

export default VehicleMarkerLayer; 