# 📋 LoadUp Project Planning Document (Updated for Simulation & Upload Integration)

## 🚚 Vision
Build a production-ready, simulation-first logistics system that links **document upload** to **vehicle movement** on a map — using only mock data for now. Everything should be modular, testable, and swappable with real data later.

## ✅ Sprint Objective (48h)
> Simulate a parsed shipment slip creating a vehicle that animates from pickup to dropoff on the tracking page map — without needing to manually upload a document.

---

## ❓ Development Philosophy

### 🔁 Should we go through the full document upload flow?
**No — not yet.**
- During simulation phase, we should **bypass the upload UI** for speed.
- Do **not require file uploads or API calls** — use a **single hardcoded mock shipment object**.
- A "Simulate Upload" dev-only trigger is ideal (e.g., button, function, or mock service).

### 🧠 Best Practice:
- Build `SimulationFromShipmentService.ts` to handle:
  - a) Fake/mock data (current)
  - b) Real parsed document rows (later)
- This makes it swappable **without rewriting simulation logic**.

---

## 🧪 Mock Parsed Shipment (To Use Immediately)
```ts
const mockShipment = {
  orderId: "LOA123456",
  poNumber: "HWSH053412",
  shipDate: "2025-01-07",
  originPO: "Kuala Lumpur General Post Office",
  destination: "HOME CREATIVE LAB SDN. BHD., JOHOR",
  destinationState: "JOHOR",
  contact: "MR YAP 60167705522 / SD CHIN TAK 60192017664",
  remarks: "NEED UNLOADING SERVICE, CALL PIC 1 HOUR BEFORE DELIVERY",
  weight: 29000,
  status: "loading",
  vehicleType: "16-wheeler",
  capacity: {
    maxWeight: 36000000,
    currentWeight: 29000
  },
  isSimulated: true,
  route: {
    start: {
      name: "Kuala Lumpur General Post Office",
      latitude: 3.1493,
      longitude: 101.6953
    },
    end: {
      name: "Johor Dropoff Location",
      latitude: 1.4927,
      longitude: 103.7414
    }
  }
};
```

---

## 📂 Key Files Overview

### ✅ Existing Files (Use Now)
- `LogisticsDocumentUploader.tsx` — Upload UI (bypass for now)
- `ShipmentParser.ts` — Excel/OCR → Parsed Shipment schema
- `ShipmentDataDisplay.tsx` — Parses output visually (can borrow types)
- `SimulatedVehicleMap.tsx` — Shows vehicles on Mapbox
- `VehicleMarkerLayer.tsx` — Renders vehicle markers with custom styling
- `MapRouteLayer.tsx` — Renders route lines between points
- `useUnifiedVehicleStore.ts` — Zustand store for all vehicles
- `VehicleServiceFactory.ts` — Chooses real vs. mock
- `SimpleMockVehicleService.ts` — Test simulation source

### 🆕 Needs to Be Created
- `SimulationFromShipmentService.ts` ✅ — Convert shipment → `SimulationVehicle`
- `POCoordinateMap.ts` ✅ — LatLng lookup by PO name
- `MockGeocoder.ts` 🟡 — Address → LatLng if needed
- `MapDirectionsService.ts` ✅ — Service for real-world routing via Mapbox API
- `MapDirectionsLayer.tsx` ✅ — Component for API-based route visualization

---

## 🚦 Updated Roadmap & Milestones

### 🔨 Phase 1: Simulation from Shipment (Now)
- [x] Bypass upload page with mock shipment data
- [x] Parse shipment → vehicle
- [x] Animate 1 vehicle on map with start → end
- [x] Show truck emoji markers on map
- [x] Show shipment info in popup on click

### 🔄 Phase 2: Multi-Vehicle & Trigger System
- [ ] Simulate multiple shipments in a loop
- [ ] Add UI "Simulate Upload" button for each
- [ ] Route lines drawn (READY FOR IMPLEMENTATION)
- [ ] Vehicle filter support (search, status)

### 🚗 Phase 2.5: Mapbox Directions API Integration (CURRENT FOCUS)
- [x] Create MapDirectionsService for Mapbox API handling
- [x] Implement MapDirectionsLayer for visualizing API routes
- [ ] Integrate MapDirectionsLayer with SimulatedVehicleMap
- [ ] Add real-world routing between vehicle origin and destination
- [ ] Implement start/destination markers and tooltips

### 🌐 Phase 3: Mock API & Live Simulation
- [ ] Mock WebSocket push updates
- [ ] Reconnect fallback
- [ ] Hook into `VehicleServiceFactory`

### 🔥 Phase 4: Firebase Swap
- [ ] Swap out mock simulation
- [ ] Test Firebase live data with fallback

---

## 🧠 Modular Simulation Pipeline
```
📤 MockParsedShipment → 🛠 SimulationFromShipmentService → 🚚 SimulationVehicle → 🧠 useUnifiedVehicleStore → 🗺 SimulatedVehicleMap
```

---

## 🗃️ File/Folder Suggestions
```
src/
├── components/map/
│   └── SimulatedVehicleMap.tsx
│   └── VehicleMarkerLayer.tsx
│   └── MapRouteLayer.tsx
│   └── MapDirectionsLayer.tsx
├── services/
│   └── maps/MapDirectionsService.ts
│   └── mock/POCoordinateMap.ts
│   └── shipment/SimulationFromShipmentService.ts
├── types/Shipment.ts
├── store/useUnifiedVehicleStore.ts
```

---

## 🧠 Best Practices Recap
- Use mock input to simulate the system quickly
- Delay real file upload integration until simulation is solid
- Use Cursor prompts that focus on: 1 file → 1 outcome → 1 state update
- Keep shipment transformation logic in one service (reusable later)
- Test with only 1 vehicle before scaling

## 🚚 Current Implementation Status

### ✅ What's Working
- Truck emoji markers are properly displayed on the map
- Markers are animating correctly from origin to destination
- Marker selection and zooming to vehicle positions
- Vehicle data flow through unified store

### 🚧 What Needs Improvement
- Route lines between origin and destination aren't visible yet
- Start/end destination markers need to be implemented
- Real-world routing via Mapbox Directions API needs integration
- Map size should be adjusted to fill container border

## 🗺️ Map Architecture & File Structure (Updated)

### 🔄 Updated Architecture
The map implementation has been refactored to use a more stable and maintainable architecture that prevents render loops and improves performance:

1. **MapManager Singleton**: A central entity that manages map initialization and lifecycle outside of React's render cycle
2. **Component Separation**: Clear separation between map initialization, marker rendering, and vehicle tracking
3. **One-Way Data Flow**: Simplified data flow from vehicle store → map rendering

### 📁 Core Files & Responsibilities

#### 🧩 Core Map Components
- `src/components/map/SimulatedVehicleMap.tsx` — Main map component with React-MapGL integration
- `src/components/map/VehicleMarkerLayer.tsx` — Renders vehicle markers with emojis and styling
- `src/components/map/MapRouteLayer.tsx` — Renders straight-line routes between points
- `src/components/map/MapDirectionsLayer.tsx` — Renders API-based route with real-world roads

#### 🔍 Map Management
- `src/utils/maps/MapManager.ts` — Singleton for map lifecycle management
- `src/utils/maps/constants.ts` — Shared constants for map components
- `src/utils/mapbox-token.ts` — Handles Mapbox token retrieval and validation

#### 🚚 Vehicle & Simulation
- `src/components/map/VehicleSimulationProvider.tsx` — Controls simulation lifecycle
- `src/services/shipment/SimulationFromShipmentService.ts` — Converts shipments to simulated vehicles
- `src/services/SimpleMockVehicleService.ts` — Generates mock vehicle data
- `src/services/maps/MapDirectionsService.ts` — Handles Mapbox Directions API integration

#### 🧠 State Management
- `src/store/useUnifiedVehicleStore.ts` — Single source of truth for vehicle data
- `src/store/map/useMapViewStore.ts` — Stores map viewport state

### 🔄 Data Flow Architecture
```
VehicleSimulationProvider
        ↓ 
SimulationFromShipmentService
        ↓
useUnifiedVehicleStore
        ↓
SimulatedVehicleMap
      ↙     ↘
VehicleMarkerLayer    MapRouteLayer/MapDirectionsLayer
```

### 🧪 Next Integration Steps
1. Enable route visualization by setting enableRoutes=true in SimulatedVehicleMap
2. Integrate MapDirectionsLayer for real-world routing
3. Add start/end destination markers
4. Enhance vehicle information popup

