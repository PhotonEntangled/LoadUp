# 🗺️ Map Component Refactoring Checklist

## 🌟 Goal
Refactor all map-related components to use a container-presenter pattern to prevent infinite render loops and improve performance.

## 📋 Refactoring Status

### ✅ Completed
- [x] Created `MapManager.ts` singleton for lifecycle management
- [x] Created `VehicleTrackingMap.tsx` as main container component
- [x] Created `MapMarkerLayer.tsx` for stable marker rendering
- [x] Created `MapRouteLayer.tsx` for stable route rendering
- [x] Created `stableSelectorStore.ts` for preventing render loops
- [x] Created `stableVehicleStore.ts` for stable vehicle selectors
- [x] Renamed `TrackingPageV2.tsx` to `VehicleTrackingPage.tsx` for better naming convention
- [x] Created `VehicleSimulationProvider.tsx` for managing simulation lifecycle
- [x] Created `ShipmentVehicleSimulator.ts` for converting shipments to vehicles
- [x] Run cleanup script to safely archive deprecated files
- [x] Update imports in files that referenced removed components
- [x] Fixed TypeScript errors in `ShipmentVehicleSimulator.ts`
- [x] Added routing for VehicleTrackingPage in Next.js

### 🔄 In Progress
- [ ] Refactor `SimulationPanel.tsx` to use stable selectors

### 🧹 Cleanup
- [x] Run `node scripts/windows-cleanup.cjs` to safely remove deprecated files
- [x] Update imports in all files that reference removed components

## 🧪 Testing Checklist
- [ ] Verify vehicles appear on map correctly
- [ ] Verify vehicle markers update position without re-rendering entire map
- [ ] Verify routes render correctly
- [ ] Verify map controls work properly
- [ ] Verify simulation controls work correctly
- [ ] Verify filter functionality works
- [ ] Verify vehicle selection works
- [ ] Check console for render loop warnings
- [ ] Performance test with 50+ vehicles

## 🔄 Next Steps
1. Run `npm run dev` to test the application
2. Navigate to http://localhost:3000/ and click on "New Vehicle Tracking Page"
3. Monitor for any render loop issues
4. Refactor SimulationPanel.tsx if needed
5. Update documentation to reflect new architecture

## 📊 Component Dependency Diagram
```
VehicleTrackingMap
├── MapboxMap (base map)
├── MapMarkerLayer (stable marker rendering)
├── MapRouteLayer (stable route rendering)
└── MapControls (filters, zoom, etc.)

VehicleSimulationProvider
├── ShipmentVehicleSimulator
└── useUnifiedVehicleStore
```

## 💡 Implementation Notes
- All components should use the stable selectors from `stableSelectorStore.ts`
- Map data flow should follow the container-presenter pattern
- Components should never directly mutate map instance
- All map lifecycle events should be managed by `MapManager` 

# Map Refactoring Status and Checklist

## Current Status (March 26, 2025)

We've cleaned up the map implementation to clarify our dual-implementation approach:

1. **Tracking Page Map (`SimulatedVehicleMap.tsx`)**:
   - Full-featured implementation with comprehensive tracking capabilities
   - Used by `StabilizedVehicleTrackingProvider` for vehicle simulation/tracking
   - Located at `src/components/map/SimulatedVehicleMap.tsx`

2. **Admin Dashboard Map (`VehicleTrackingMap.tsx`)**:
   - Simplified implementation for "quick view" functionality
   - Used directly in the admin dashboard map page
   - Located at `src/components/map/VehicleTrackingMap.tsx`

## Fixed Issues

- Fixed reference error in `FleetOverviewMapWrapper.tsx` by correctly referencing `FleetOverviewMapV2`
- Updated `apps/admin-dashboard/app/dashboard/map/page.tsx` to use `FleetOverviewMapV2` with correct props
- Created missing `useMapViewStore.ts` which was referenced in `SimulatedVehicleMap.tsx`
- Fixed infinite render loop in `SimulatedVehicleMap.tsx` by adding safeguards around store access

## Remaining Issues

- Type mismatch in `SimulatedVehicleMap.tsx` needs to be resolved (some parameters marked as 'any')
- Need to improve error handling around store initialization
- Align type definitions between both map implementations

## Next Steps

1. **Consolidate Shared Utilities**:
   - Move marker creation, popup creation, and other shared logic to centralized utilities
   - Use the same token retrieval method in both implementations
   - Maintain consistent error handling patterns

2. **Improve Type Safety**:
   - Define proper TypeScript interfaces for all parameters
   - Remove any 'any' type references
   - Use common type definitions between both implementations

3. **Improve Documentation**:
   - Add more comprehensive JSDoc comments to both implementations
   - Document the purpose and use cases for each component
   - Create a map component usage guide

4. **Testing**:
   - Add unit tests for both map implementations
   - Test edge cases like token failure, container issues, etc.

## Usage Guidelines

- Use `FleetOverviewMapV2` for the tracking page where full simulation support is needed
- Use `VehicleTrackingMap` for the admin dashboard and other quick-view scenarios
- Keep the separation clear and don't mix components unnecessarily

## Known Limitations

- `FleetOverviewMapV2` currently requires additional store setup to work correctly
- Error handling could be improved to give more specific messages
- Type safety still needs work in some areas 