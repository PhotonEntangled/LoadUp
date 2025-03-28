# 📋 LoadUp Project Planning Document (Updated for Simulation & Upload Integration)

## 📜 Project Overview & Context (Generated: [Date])

### Core Goal
To develop an end-to-end AI-driven logistics platform for LoadUp, starting with document processing and culminating in real-time vehicle tracking for administrative oversight. The system must handle various shipment slip formats (Excel, WhatsApp messages, scanned images via OCR), parse them into a standardized schema, and visualize the corresponding vehicle movements on a map.

### Business Logic & Constraints
*   **Focus:** B2B logistics, specifically handling large payloads.
*   **Vehicles:** Primarily 16-wheeler trucks. No need to support diverse vehicle types (motorcycles, cars) at this stage.
*   **Workflow:**
    1.  Receive Shipment Slip (various formats).
    2.  Parse/OCR document → Standardized `Shipment` object (based on ERD schema).
    3.  (Admin) Display parsed data.
    4.  (Admin) Initiate tracking based on shipment data (origin, destination, etc.).
    5.  (Admin) Visualize vehicle movement on a map (initially simulated, later live).
*   **Target Users (Initial):** Admin users require map visualization and tracking control. Driver and Customer interfaces are future scope.

### Simulation Phase Purpose
*   **Goal:** To rapidly develop and test the core tracking visualization pipeline (`Parsed Shipment` → `Vehicle State` → `Map Display` → `Movement Animation`) without reliance on physical vehicles or complex setup.
*   **Method:** Use a hardcoded `mockShipment` object to bypass the document upload/parsing UI. Simulate vehicle movement along a calculated route (initially straight-line, now Mapbox Directions API).
*   **Transition:** Once simulation is stable and functional, the plan is to integrate live data using a spoofing app for testing geofencing/location updates before potentially using real driver data.

### Technical Stack (Relevant)
*   **Frontend:** React, TypeScript
*   **Mapping:** Mapbox GL JS via `react-map-gl` wrapper.
*   **State Management:** Zustand (`useUnifiedVehicleStore`, `useMapViewStore`).
*   **API:** Mapbox Directions API.
*   **Backend/Data:** Currently mocked. Firebase planned for live data phase. OCR pipeline planned but not fully implemented/tested.

### High-Level Roadmap
1.  **Document Processing:** ✅ (Admin UI, Upload, Parsing Logic - partially tested, OCR pending).
2.  **Simulation Setup:** ✅ (Bypass upload, `mockShipment`, `SimulationFromShipmentService`).
3.  **Basic Map Display:** ✅ (`SimulatedVehicleMap`, `VehicleMarkerLayer`, Initial Test Vehicle).
4.  **Simulated Movement & Routing:** 🚧 (Current phase - Animate vehicle, integrate Mapbox Directions API for routes).
5.  **Live Tracking Integration:** (Future - Spoofing app testing, Firebase integration).
6.  **UI/UX Polish & Deployment:** (Future - Refine Admin UI, Upload UI, Sign-in, Deploy for OCR testing).

### Development Philosophy & Best Practices
*   **Simulation First:** Validate core logic with mock data before introducing external dependencies (live data, OCR).
*   **Modularity:** Encapsulate logic in services (`SimulationFromShipmentService`, `MapDirectionsService`) and dedicated components (`VehicleMarkerLayer`, `MapDirectionsLayer`).
*   **Standard Map Integration:** Leverage `react-map-gl` (`<Source>`, `<Layer>`) for adding data (like routes) to the map, aligning with React's declarative patterns. Avoid direct Mapbox GL JS plugin integration unless necessary. Use Directions API directly for route geometry.
*   **Atomic Changes:** Focus prompts and development on single, verifiable outcomes.

---

## 🎯 Current Focus & Issues (Updated: [Date])

### 📈 Current State Summary
*   **Map Initialization:** `SimulatedVehicleMap` loads correctly using `react-map-gl`.
*   **Initial Vehicle:** A test vehicle (`TEST_VEHICLE_001`) appears on load with a dedicated UI panel (Zoom/Remove buttons). **Source of this panel is confirmed to be OUTSIDE `TrackingControls.tsx` and `SimulatedVehicleMap.tsx`**. Likely rendered in the parent component using the map.
*   **Simulated Vehicle:** Clicking "Simulate Shipment Upload" correctly:
    *   Uses `SimulationFromShipmentService` to create `sim-loa123456-c96a7fd6` from `mockShipment`.
    *   Adds the vehicle to `useUnifiedVehicleStore`.
    *   Renders the vehicle's marker (emoji) via `VehicleMarkerLayer`.
    *   Fetches real-world route data via `MapDirectionsService`.
    *   Logs (`[SimulatedVehicleMap] Passing routeData...`) indicate `SimulatedVehicleMap` prepares and passes `routeData` to `MapDirectionsLayer` component instance.
*   **Missing Routes/Markers:** Despite data preparation, `<MapDirectionsLayer>` component instances are **not displaying** the route line or start/end markers for the simulated vehicle. Console logs *from within* `MapDirectionsLayer` (e.g., prop reception, GeoJSON generation) are **missing**, pointing to an internal issue within that component.
*   **Missing UI Panel:** The simulated vehicle (`sim-loa123456-c96a7fd6`) **does not** have the same UI panel (Zoom/Remove) as `TEST_VEHICLE_001` because no component currently rendered dynamically generates these panels based on store data.

### ❓ Key Questions & Blockers
1.  **Why are routes and start/end markers not rendering via `MapDirectionsLayer` even though `SimulatedVehicleMap` creates the component instance and passes valid `routeData` props?** (Hypothesis: Internal issue in `MapDirectionsLayer.tsx` - possibly effect dependencies, state updates, or interaction with map layers).
2.  **Where is the UI panel for `TEST_VEHICLE_001` rendered, and what logic determines its visibility?** (Hypothesis: Logic exists in the parent component rendering `SimulatedVehicleMap`, possibly tied to vehicle selection state or specific vehicle IDs/properties).

### 🗺️ Architecture Recap (Relevant Components)
- `SimulatedVehicleMap.tsx`: Main map view using `react-map-gl`. Renders layers.
- `VehicleMarkerLayer.tsx`: Renders vehicle markers (working).
- `MapDirectionsLayer.tsx`: Renders routes/start-end markers from API/prop data (intended, but failing silently).
- `useUnifiedVehicleStore.ts`: State management for vehicles (working).
- `SimulationFromShipmentService.ts`: Converts `mockShipment` to `SimulatedVehicle` (working).
- `MapDirectionsService.ts`: Fetches Mapbox route (working).
- `TrackingControls.tsx`: Renders overall stats/toggles, *not* individual vehicle panels.

### 🚀 Next Steps
1.  **(Discovery)** Locate the Uber clone reference directory in the codebase for comparison.
2.  **(Debug)** Add detailed logging inside `MapDirectionsLayer.tsx` (prop reception, `useEffect` triggers, state changes, GeoJSON processing, layer rendering attempts) to trace the failure point.
3.  **(Discovery)** Examine the parent component(s) that render `SimulatedVehicleMap` to find the source of the `TEST_VEHICLE_001` UI panel and understand its rendering logic.

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
- [x] Route lines drawn (READY FOR IMPLEMENTATION)
- [ ] Vehicle filter support (search, status)

### 🚗 Phase 2.5: Mapbox Directions API Integration (CURRENT FOCUS)
- [x] Create MapDirectionsService for Mapbox API handling
- [x] Implement MapDirectionsLayer for visualizing API routes
- [x] Integrate MapDirectionsLayer with SimulatedVehicleMap
- [x] Add real-world routing between vehicle origin and destination
- [x] Implement start/destination markers and tooltips

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
- Real-world route lines between origin and destination with Mapbox Directions API
- Start/end destination markers with custom styling
- Pulsing animations for route visualization

### 🚧 What Needs Improvement
- Multiple vehicle simulation and UI controls need enhancement
- Error handling for failed route lookups could be more robust
- Need better performance for large numbers of vehicles
- Animation smoothness could be improved for complex routes

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

