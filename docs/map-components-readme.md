# 🗺️ LoadUp Map Components Guide

This guide explains how to use the refactored map components that employ the container-presenter pattern to prevent infinite render loops.

## 🌟 Overview

The map component architecture has been refactored to solve the "Maximum update depth exceeded" issue by implementing a stable container-presenter pattern and singleton map manager. This approach:

1. Isolates map initialization and lifecycle from rendering
2. Uses stable selectors to prevent unnecessary renders
3. Separates vehicle data management from UI rendering
4. Provides a clear, consistent API for all map interactions

## 📋 Core Components

### 🧩 Base Components

- **`VehicleTrackingMap`**: Main container component for displaying vehicles on a map
- **`MapMarkerLayer`**: Renders vehicle markers in a stable way
- **`MapRouteLayer`**: Renders vehicle routes in a stable way

### 🔄 Simulation Components

- **`VehicleSimulationProvider`**: Controls simulation lifecycle 
- **`useSimulation`**: Hook for accessing simulation controls

### 📊 State Management

- **`useStableVehicleList`**: Provides stable access to vehicle data
- **`stableSelectorStore`**: Prevents render loops with Zustand store

## 🚀 Quick Start

### Basic Usage

```jsx
import { VehicleTrackingMap } from '../components/map/VehicleTrackingMap';

function MyPage() {
  return (
    <div className="my-container" style={{ height: '600px' }}>
      <VehicleTrackingMap 
        height="100%" 
        showFilters={true}
        onVehicleClick={(vehicle) => console.log('Clicked vehicle:', vehicle)}
      />
    </div>
  );
}
```

### With Simulation

```jsx
import { VehicleTrackingMap } from '../components/map/VehicleTrackingMap';
import VehicleSimulationProvider, { useSimulation } from '../components/map/VehicleSimulationProvider';

// Controls component that uses simulation context
function SimulationControls() {
  const { isRunning, toggleSimulation } = useSimulation();
  
  return (
    <button onClick={toggleSimulation}>
      {isRunning ? 'Stop' : 'Start'} Simulation
    </button>
  );
}

function MyPage() {
  return (
    <VehicleSimulationProvider autoStart={true}>
      <div className="controls">
        <SimulationControls />
      </div>
      
      <div className="map-container" style={{ height: '600px' }}>
        <VehicleTrackingMap height="100%" />
      </div>
    </VehicleSimulationProvider>
  );
}
```

## 📊 Component Props

### 🧩 VehicleTrackingMap

```typescript
interface VehicleTrackingMapProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  mapId?: string;
  initialCenter?: { latitude: number; longitude: number };
  initialZoom?: number;
  showAllRoutes?: boolean;
  showFilters?: boolean;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  onMapLoad?: (mapId: string) => void;
  onError?: (error: Error) => void;
}
```

### 🔄 VehicleSimulationProvider

```typescript
interface VehicleSimulationProviderProps {
  children: React.ReactNode;
  initiallyEnabled?: boolean;
  autoStart?: boolean;
  simulationSpeed?: 'slow' | 'normal' | 'fast';
}
```

## 🧠 How It Works

The key to the refactored architecture is the **MapManager** singleton that manages map initialization and lifecycle:

1. `VehicleTrackingMap` initializes the map and registers it with MapManager
2. `MapMarkerLayer` and `MapRouteLayer` wait for the map to be ready using MapManager
3. Stable selectors prevent unnecessary re-renders when state changes
4. Components only render when their specific dependencies change

## 🚫 Deprecated Components (Do Not Use)

The following components are deprecated and should not be used:

- `src/components/map/BasicMapComponent.tsx`
- `src/components/map/MarkerMapComponent.tsx`
- `src/components/map/RouteMapComponent.tsx`
- `src/components/map/StoreBasedMapComponent.tsx`
- `src/components/map/SimulatedVehicleMap.tsx` (replaced by VehicleTrackingMap)
- `src/store/map/useMapStore.ts`
- `src/store/map/useMapViewStore.ts`

## 🔧 Troubleshooting

### Common Issues

1. **"Maximum update depth exceeded"**  
   This usually indicates you're not using the stable selectors or are directly manipulating map in render.
   
   **Solution**: Use `useStableVehicleList()` instead of direct store access.

2. **Map not showing**  
   Check if you're providing correct height/width to the container.
   
   **Solution**: Ensure the parent container has an explicit height.

3. **Vehicles not appearing**  
   May indicate a simulation issue or store connectivity problem.
   
   **Solution**: Check browser console for errors, ensure SimulationProvider is properly configured.

## 🧪 Integration Testing

To test if your integration is working correctly:

1. Check console for render loop warnings
2. Verify vehicles appear on the map
3. Verify vehicle markers update without re-rendering map
4. Verify routes render correctly
5. Test with multiple vehicles (50+) for performance

## 🚀 Next Steps

- Integrate the ShipmentVehicleSimulator for simulating shipment data
- Implement responsive design for mobile views
- Add performance optimizations for larger vehicle fleets 