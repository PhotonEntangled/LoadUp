# 📦 LoadUp Simulation & Tracking Implementation Plan (Atomic & Fool-Proof)

## 🔁 Overall Strategy
- **Goal**: Build a functional **prototype** of the tracking page using mock vehicles and simulated document-upload-to-map workflows. This prototype (code, types, state logic) will serve as a detailed **specification** for generating the final UI using Vercel v0.
- **Approach**: Atomic, modular, and mock-first. Each milestone builds a verifiable piece of the prototype specification.
- **Deadline**: Core prototype (Phases 1-2) completed. Refinement (Phase 3) to proceed before handing off spec to v0.

---

## 📊 Existing Component Capabilities & Gaps (Discovery Summary)

**Context:** Analysis of existing files (`components/map/FleetOverviewMap.tsx`, `components/map/CustomerTrackingView.tsx`) reveals significant implemented logic but critical gaps due to broken/missing dependencies originally expected from `packages/shared`.

**`FleetOverviewMap.tsx`:**
*   **Existing Capabilities (Internal Logic):**
    *   UI & Logic for client-side vehicle filtering (type, status, search).
    *   Local state management for filters, selection, hover.
    *   Structure for rendering multiple vehicle markers (iterates filtered vehicles).
    *   Logic for calculating map bounds based on filtered vehicles.
    *   Event handler structure for map events, vehicle clicks/hovers.
    *   Safe timer utility hooks (`useSafeInterval`, `useSafeTimeout`).
    *   Explicitly disabled simulation logic placeholder comment.
*   **Critical Gaps / Needs:**
    *   Actual map rendering implementation (relied on `MapboxMap` from shared).
    *   Actual marker rendering implementation (relied on `MapboxMarker` from shared).
    *   Route fetching and rendering logic.
    *   Connection to simulation state (relied on `useMapStore` from shared).
    *   Simulation control logic.

**`CustomerTrackingView.tsx`:**
*   **Existing Capabilities (Internal Logic):**
    *   UI & Logic for displaying single shipment status, ETA calculation, sharing.
    *   Logic for processing shipment stops for routing.
    *   Logic for fitting map bounds to a single route.
    *   Structure for rendering a route line and stop markers (relied on `MapboxRoute` from shared).
*   **Critical Gaps / Needs:**
    *   Actual map rendering implementation (relied on `MapboxMap` from shared).
    *   Actual route rendering implementation (relied on `MapboxRoute` from shared).
    *   Potentially marker rendering if needed beyond route stops (relied on `MapboxMarker` from shared).

**Overall Implementation Needs (To Be Built within Main App):**
1.  **Core Map Rendering:** Using `react-map-gl` directly or creating new wrappers.
2.  **Marker Rendering:** Using `react-map-gl` `<Marker>` or Mapbox GL JS sources/layers.
3.  **Route Rendering:** Using `react-map-gl` `<Source>`/`<Layer>` or similar.
4.  **`MapDirectionsService`:** For fetching routes.
5.  **`SimulationFromShipmentService`:** For simulation logic (conversion, position updates).
6.  **`useSimulationStore`:** Dedicated Zustand store for simulation state.
7.  **`types/vehicles.ts`:** Simulation-specific type definitions.
8.  **Connection Logic:** Linking parser output -> service -> store -> map components.
9.  **Snapshot Map Implementation:** Integrating static route display on `/shipments/[id]`.

This confirms the necessity of the creation steps outlined in the subsequent phases.

---

## 🏛️ Architectural Decisions & Strategy (Resulting from Discovery)

**1. File Status & Cleanup:**
*   `BasicMapComponent.tsx`: **Keep** for now as a reference for `react-map-gl` instantiation and API token fetching, but likely redundant long-term.
*   `DriverInterface.tsx`: **Keep for Reference.** Despite the potentially misleading name, this component contains logic (e.g., `handleArrival`, `handleDeparture`) intended for simulating driver state changes within the admin simulation. We will *not* render this component directly, but will refer to its internal logic when building simulation controls (e.g., buttons in a sidebar) that interact with `useSimulationStore`.
*   `MapView.tsx`: **Delete.** Non-functional placeholder.
*   `FleetOverviewMapWrapper.tsx`: **Keep & Refactor.** The concept (state cleanup, error boundary) is valuable but needs refactoring to use the new `useSimulationStore` instead of the missing `useMapStore`.
*   `CustomerTrackingView.tsx`: **Rename** to `ShipmentSnapshotMapView.tsx` to accurately reflect its purpose for the static `/shipments/[id]` page map.

**2. Development Strategy:**
*   Adopt an **Iterative/Hybrid Approach**. Build foundational backend pieces (types, services, store) first, then incrementally integrate frontend visualization components (static marker, then route, then animation), allowing for verification at each stage.

**3. Page Structure & Navigation:**
*   Implement **Separate Pages**: `/tracking` (future live data) and `/simulation` (current development).
*   **Navigation:** Add a temporary link to `/simulation` in the admin sidebar (`components/layout/sidebar.tsx`) for development access. The main "Tracking" link will eventually point to `/tracking`.
*   **Similarity:** `/simulation` and `/tracking` will share `FleetOverviewMap` as a base visual component but differ in data sources, state management (`useSimulationStore` vs. future live store), and controls.

**4. Existing Logic Status:**
*   Core functional logic for map rendering, marker/route display, and animation **needs new implementation** within the main app structure (using `react-map-gl`, services, store) due to broken dependencies on the missing `packages/shared` components/store.
*   Existing component structures (`FleetOverviewMap`, `ShipmentSnapshotMapView`) and reference logic (`DriverInterface`) can serve as inspiration.

**5. Mock Data Strategy:**
*   **Problem:** Using raw parser output JSON (`.debug_output/`) is insufficient as it lacks key fields for full simulation (e.g., Requested Delivery Date) and has type mismatches.
*   **Solution:**
    *   Create a **dedicated mock data file**, e.g., `data/mocks/mockSimulationScenarios.json`.
    *   Define a **new input type** (e.g., `SimulationInput` in `types/simulation.ts`) tailored for simulation needs, including required fields like origin/destination coords (as numbers), RDD, key shipment details.
    *   Populate the mock file with one or more `SimulationInput` scenarios.
    *   **Adapt `SimulationFromShipmentService.createVehicleFromShipment`** to accept `SimulationInput` instead of `ParsedShipmentBundle`.
    *   Update `app/simulation/page.tsx` to load data from this new file and pass `SimulationInput` to the service.
*   **Reference:** The structure of the actual parser output JSON (like `parsed_output_ddc63406-dbe5-41c9-8f29-78b0294aa736_1744671788735.json`) remains a valid reference for understanding available fields (like parsed driver/truck info), even though the simulation will run from the dedicated mock file.

**6. Simulation Trigger:**
*   Use a button on the `/simulation` page (e.g., "Load Scenario 1") to read data from `data/mocks/mockSimulationScenarios.json` and initiate the simulation via the service and store.
*   **Future Goal:** Add a note that after initial simulation development, a mechanism to trigger simulations/snapshots based on *actual* parsed/stored shipment data will be needed for end-to-end testing and integration with the main document workflow.

**7. Truck/Driver Information Display:**
*   **Requirement:** The simulation needs to load and display associated Truck/Driver information (Name, Phone, Identifier, IC) parsed from the source document (available in `ParsedShipmentBundle` / JSON output).
*   **Implementation:**
    *   Add optional truck/driver fields to `SimulationInput` and `SimulatedVehicle` types.
    *   Update `SimulationFromShipmentService` to transfer this data.
    *   **UI Approach:** Plan for a **details sidebar/panel** on the `/simulation` page. When a vehicle is selected (via map marker click or list), this panel will display relevant details, including shipment info and the associated truck/driver information read from the `SimulatedVehicle` state in `useSimulationStore`.

**8. V0 Integration Workflow (Clarified):**
*   **Prototype Role:** The code developed in Phases 1-3 (services, store, types, basic map/control structures) serves as the **working specification** for Vercel v0.
*   **V0 Role:** Vercel v0 will be prompted using descriptions derived from this specification to generate the **initial UI code** (React components using Tailwind/Shadcn) for elements like the map display, styled markers, popups, buttons, speed controls, and details panels.
*   **Integration Step:** The UI code generated by v0 will then need to be **integrated** into the main application codebase, connecting it to the prototype's backend logic (store state, actions, service calls).
*   **Refinement Purpose:** Phase 3 focuses on refining the prototype to make it a *clearer and more complete specification* for v0 (e.g., defining data needed for popups), not necessarily building the final UI pixel-perfectly in *this* codebase.

**NEW 9. Backend Simulation Architecture (The "Professional Kitchen" Approach):**
*   **Problem:** Persisting simulation state reliably from the client-side (Zustand store) is fragile and inefficient. Updates can be lost if the browser tab closes or network connection fails.
*   **Goal:** Implement a robust, scalable backend system to manage active simulations and reliably persist `last_known_location` data to the primary database (`shipments_erd`).
*   **Analogy ("Professional Kitchen"):**
    *   **Order Taker (API/Server Action):** Receives the request to start tracking a shipment.
    *   **Dispatch Board (Job Queue - e.g., RabbitMQ, SQS, BullMQ):** The Order Taker places a job on the queue to track the shipment. This decouples the request from the processing.
    *   **Live Status Whiteboard (Cache - e.g., Redis):** A fast in-memory store holding the *latest* calculated state (position, % complete, etc.) for actively simulated vehicles. Updated frequently by the worker.
    *   **Dedicated Dispatchers (Backend Worker Service - e.g., Node.js service):** Processes jobs from the queue. For each job:
        1. Reads current state from Cache (Redis).
        2. Calculates the next simulation step.
        3. Updates the Cache (Redis) with the new state.
        4. **Uses the Reliable Pen (`VehicleTrackingService`):** Calls `updateShipmentLastKnownLocation` to persist the crucial `last_known_latitude/longitude/timestamp` to the main database (PostgreSQL/Neon).
    *   **Reliable Pen (`VehicleTrackingService`):** The service we built and tested, responsible *only* for the final database write.
*   **Benefits:** Reliability (server-managed), Scalability (add more workers), Data Integrity (persisted to DB), Decoupling (separates concerns).
*   **Foundation for Live Tracking:** Yes, this architecture (Queue, Worker, Cache, DB Update Service) directly provides the foundation needed for future real-time tracking integration (Phase 8+). The source of the update event would change (e.g., from a simulation timer to a real GPS feed via WebSocket/MQTT), but the processing pipeline (Worker updating Cache and DB) remains conceptually the same.
*   **Chosen Tech Stack:** Based on analysis and ecosystem fit, the proposed implementation uses: 
    *   **Job Queue:** Vercel Queues
    *   **Cache:** Vercel KV (`@vercel/kv`)
    *   **Worker Logic:** Next.js API Route (triggered by Vercel Queues)
    *   **Job Enqueuer:** ~~Vercel Cron Jobs (to periodically add tick jobs)~~ **External Trigger** (e.g., GitHub Actions Schedule, third-party Cron service) due to Vercel Hobby plan limits.
    *   **DB Persistence:** `services/VehicleTrackingService.ts` (existing)

---

## 🔄 V0 Integration Strategy & Workflow (Explicit)

**Core Principle:** Vercel v0 output provides a structural and stylistic starting point. Manual integration and adaptation using `react-map-gl` and existing project logic (stores, services, types) are required.

**Integration Steps for EACH V0-Generated File/Component:**

1.  **Identify Target Location:** Determine the correct directory within the main project structure (`components/`, `app/`, `lib/`, etc.) where the V0 file's functionality belongs.
2.  **Check for Existing File:** **CRITICAL:** Before copying the V0 file, **check if a file with the same name OR serving the same purpose already exists** in the target location within the main project.
3.  **Decision:**
    *   **If No Existing File:** Copy the V0 file into the target location. Proceed to adaptation (Step 4).
    *   **If Existing File Exists:**
        *   **Conflict Files (Logger, Store, Types):** Discard the V0 version and keep the existing project version (as previously decided). Ensure any V0 components *using* these imports are updated later.
        *   **Other Components (e.g., Pages, Layouts):** Carefully compare the existing project file and the V0 file. Decide whether to:
            *   **Merge:** Integrate relevant structural or stylistic elements from the V0 file into the existing project file.
            *   **Replace:** (Use with caution) If the existing file is minimal or less developed, consider replacing it with the V0 file, but be prepared to re-integrate any necessary existing logic.
            *   **Discard V0:** If the existing project file is more advanced or the V0 structure is unsuitable, discard the V0 file.
4.  **Adaptation & Integration:**
    *   **Imports:** Correct any broken import paths, especially for core utilities like `logger`, `useSimulationStore`, and project types.
    *   **Map Logic:** Replace any Mapbox Static Image API logic with interactive `react-map-gl` implementations based on the Phase 3/4 specifications.
    *   **State/Service Connections:** Connect the component to the correct Zustand store actions (`useSimulationStore`) and service functions (`SimulationFromShipmentService`, `MapDirectionsService`).
    *   **Props:** Ensure the component receives the correct props from its parent (e.g., page loaders, parent components).
    *   **Styling:** Adjust Tailwind/Shadcn classes as needed to match the project's design system.
5.  **Verification:** Test the integrated component thoroughly to ensure it functions correctly with the project's backend logic and interactive map features.

---

## 🛠️ Integration Progress Log (Manual)

**Goal:** Manually integrate V0-generated UI structure and components, replacing static/non-functional parts with interactive `react-map-gl` implementations and connecting them to the project's existing state management, services, and types.

*   **Step 1: Dependency Check (✅ COMPLETED)**
    *   Verified `react-map-gl`, `mapbox-gl`, `@turf/turf` in `package.json`.
    *   Consolidated `mapbox-gl.css` import into `app/layout.tsx`.
    *   Removed redundant CSS imports from individual map components.
    *   User confirmed `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable setup.
*   **Step 2: Sidebar Link (✅ COMPLETED)**
    *   Verified link `"/simulation"` already exists in `components/Sidebar.tsx`.
*   **Step 3: Integrate `SimulationControls` & Layout (✅ COMPLETED)**
    *   Located V0 source files:
        *   `v0-imports/components/simulation/SimulationControls.tsx`
        *   `v0-imports/components/ui/slider.tsx` (dependency for Controls)
        *   `v0-imports/app/simulation/page.tsx` (layout guide)
    *   Checked project structure:
        *   `components/simulation/` directory did not exist.
        *   `components/ui/slider.tsx` did not exist.
        *   `app/simulation/page.tsx` **exists**.
    *   Created `components/simulation/` directory.
    *   Copied V0 `SimulationControls.tsx` to `components/simulation/SimulationControls.tsx`.
    *   Copied V0 `slider.tsx` to `components/ui/slider.tsx`.
    *   Installed missing dependency: `npm install @radix-ui/react-slider`.
    *   Fixed import errors in `components/simulation/SimulationControls.tsx`.
    *   Modified existing `app/simulation/page.tsx`:
        *   Adopted V0 grid layout structure.
        *   Imported and rendered `<SimulationControls />`.
        *   Removed old manual control buttons/logic.
        *   Moved "Load Scenario" buttons into controls column.
        *   Resolved linter error related to loading state text.
*   **Step 4: Implement Interactive `SimulationMap` (✅ COMPLETED)**
    *   Created base file `components/map/SimulationMap.tsx`.
    *   Implemented marker rendering with styling.
    *   Implemented popup display on marker click.
    *   Implemented route line display for selected vehicle.
    *   Replaced `<FleetOverviewMapWrapper />` with `<SimulationMap />` in `app/simulation/page.tsx`.
*   **Step 5: Implement Interactive `StaticRouteMap` (✅ COMPLETED)**
    *   Created base file `components/map/StaticRouteMap.tsx` with rendering logic for route, origin/dest markers, and conditional last known position marker.
    *   Integrated `<StaticRouteMap />` into `app/shipments/[documentid]/page.tsx`:
        *   Added Mapbox token fetching logic to the page.
        *   Replaced map preview placeholder.
        *   Passed origin/destination coordinates and token as props.
        *   Passed `null` for `routeGeometry` and `lastKnownPosition` (reflecting current data availability).
        *   Added conditional rendering based on coordinate availability.
        *   Added "Refresh Location" button UI with placeholder handler.
        *   Handled combined loading and error states.

---

## 🗂️ Key File Responsibilities (Updated - Reflecting Discovery & Strategy)

**🛑 Important Note:** Initial file discovery confirms that several expected files/directories (`VehicleMarkerLayer.tsx`, `MapDirectionsLayer.tsx`, `SimulationFromShipmentService.ts`, `MapDirectionsService.ts`, `useUnifiedVehicleStore.ts`, `useMapViewStore.ts`, `store/`, `services/map/`, `services/shipment/`) **do not exist** in the primary application structure (`components/`, `services/`, `store/`). Much of the existing map functionality appears to rely on components and state management within a separate `packages/shared` directory, which needs further investigation. Planning proceeds based on *creating* necessary files/logic or adapting/understanding `packages/shared`.

### 🗺️ Map Rendering & Display
- **`/simulation` Page (Admin Simulation - CURRENT FOCUS):**
    - `FleetOverviewMap.tsx` (inside `components/map/`): **Identified Base Component.** Renders multiple vehicles using `MapboxMarker` from `packages/shared`. Uses `useMapStore` from `packages/shared`. Simulation logic is currently *disabled* within this file. **Requires significant adaptation** for our simulation goals: connect to `useSimulationStore`, implement direct map/marker/route rendering using `react-map-gl`, integrate animation logic.
    - `FleetOverviewMapWrapper.tsx`: Provides context/state cleanup (needs refactor for `useSimulationStore`), error boundary.
    - `MapboxMap`, `MapboxMarker` (inside `packages/shared` - *Broken Links*): Imports are broken. Functionality needs to be implemented directly using `react-map-gl`.
    - `useMapStore` (inside `packages/shared` - *Broken Link*): Import is broken. Will be replaced by `useSimulationStore`.
- **`/shipments/[id]` Page (Snapshot):**
    - `ShipmentSnapshotMapView.tsx` (**Renamed** from `CustomerTrackingView.tsx`, inside `components/map/`): **Candidate Component.** Designed for single shipment display. Structure for showing stops/route exists but relies on broken `MapboxRoute` import. Needs implementation using `react-map-gl`.
    - `MapboxRoute` (inside `packages/shared` - *Broken Link*): Import is broken. Route rendering needs direct implementation.
- **`/tracking` Page (Future Live Data):**
    - Will likely reuse `FleetOverviewMap` structure but refactored to connect to live data sources (e.g., WebSockets/Firebase) instead of `useSimulationStore`.

### 🚚 Simulation & Vehicle State (To Be Created/Verified)
- `services/shipment/SimulationFromShipmentService.ts` (**To Be Created**): Will convert `SimulationInput` -> `SimulatedVehicle` (including truck/driver info), manage animation logic (using Turf.js).
- `services/map/MapDirectionsService.ts` (**Created**): Will fetch Mapbox Directions API routes.
- `store/useSimulationStore.ts` (**Created** in `lib/store/`): Dedicated Zustand store for managing simulated vehicle states, simulation status (running/stopped), speed, etc. (Alternative: Adapt `useMapStore` from `packages/shared` if feasible).
- `types/vehicles.ts` (**Created**): Will define `SimulatedVehicle` and related types, potentially adapting from `packages/shared/src/types/shipment-tracking`.
- `types/simulation.ts` (**To Be Created**): Will define `SimulationInput` type (will add truck/driver fields).
- `data/mocks/mockSimulationScenarios.json` (**To Be Created**): Will contain mock `SimulationInput` data (incl. truck/driver info).

### 🚚 Simulation & Map
- `SimulatedVehicleMap.tsx` — Renders the map with vehicles
- `StabilizedVehicleTrackingProvider.tsx` — Controls simulation lifecycle and props
- `VehicleServiceFactory.ts` — Swaps between mock and real tracking sources
- `SimpleMockVehicleService.ts` — Feeds static or simulated vehicle objects
- `VehicleTrackingService.ts` — Real-time tracking (WebSocket / Firebase)
- `useUnifiedVehicleStore.ts` — Zustand store for all vehicle states

### 📄 Document Upload → Shipment Parser
#### 📤 Upload & Display UI
- `LogisticsDocumentUploader.tsx` — Main uploader (drag and drop)
- `FileUploader.tsx`, `file-upload.tsx`, `enhanced-file-upload.tsx` — Generic upload components
- `DocumentScanner.tsx` — Web and mobile scanning interface
- `ShipmentDataDisplay.tsx` — Final UI that displays parsed result

#### 🧠 Parsing Logic
- `ExcelParserService.ts` — Parses Excel into raw JSON rows
- `GoogleVisionService.ts`, `DocumentParser.ts` — OCR pipeline for scanned documents
- `ShipmentParser.ts` — Transforms Excel/OCR JSON into standardized format (matches ERD schema)
- `ShipmentDataProcessor.ts` — Cleans and normalizes parsed shipment data
- `ProcessedDocumentService.ts` — Stores results in DB

#### 📡 API Endpoints
- `/api/ai/document-processing/route.ts` — AI-powered field matching
- `/api/shipments/[id]/documents/route.ts` — Document submission endpoint
- `packages/database/services/shipmentService.ts` — DB utility for storing docs

#### 🧾 Types, Schema, State
- `document-processing.ts`, `schema/documents.ts` — Types for doc parsing
- `documentStore.ts` — Zustand store for uploaded/processed documents

---

## 🔨 Phase 1: Foundational Setup & Static Display (Targeting `/simulation` Page - **COMPLETED**)

**Goal:** Establish core structure, define types (incl. truck/driver info), create mock data (incl. truck/driver info), adapt services, render map on `/simulation`, display static vehicle marker.

### ✅ 1.1: Directory, Type Setup & Cleanup (Completed)
- [ ] Perform file actions: Rename `CustomerTrackingView.tsx`, Delete `MapView.tsx`.
- [ ] Create/Verify directories: `services/map/`, `services/shipment/`, `data/mocks/`.
- [ ] Create/Verify `types/vehicles.ts`: Update `SimulatedVehicle` to include optional `driverName`, `driverPhone`, `truckId`, `driverIc` fields.
- [ ] Create `types/simulation.ts`: Define `SimulationInput` interface (incl. coords, RDD, key shipment details, optional truck/driver info).
- [ ] Create `data/mocks/mockSimulationScenarios.json`: Populate with `SimulationInput` object(s) including coordinates and sample truck/driver info.
- [ ] Install/Verify dependencies: `@turf/turf`, `@mapbox/mapbox-sdk`.

### ✅ 1.2: Basic Map Directions Service (Completed)
- [ ] Create/Verify `services/map/MapDirectionsService.ts`.
- [ ] Implement/Verify basic `fetchRoute` function.

### ✅ 1.3: Basic Simulation Service (Adapt Input & Conversion) (Completed)
- [ ] Create/Verify `services/shipment/SimulationFromShipmentService.ts`.
- [ ] Modify `createVehicleFromShipment` to accept `SimulationInput`.
- [ ] Update function logic to extract data (coords, shipment details, **truck/driver info**) from `SimulationInput` and include it in the returned `SimulatedVehicle`.

### ✅ 1.4: Simulation State Store Setup (Completed)
- [ ] Create/Verify `lib/store/useSimulationStore.ts`.
- [ ] Define/Verify state structure & basic actions.

### ✅ 1.5: `/simulation` Page Setup & Static Vehicle Display (Completed)
- [ ] Create/Verify `/simulation` page (`app/simulation/page.tsx`).
- [ ] Implement temporary sidebar link to `/simulation`.
- [ ] Render `FleetOverviewMapWrapper` / `FleetOverviewMap`.
- [ ] Modify `FleetOverviewMap`: Instantiate map, fetch token.
- [ ] Modify `handleLoadAndSimulate` on `/simulation` page: Load from `mockSimulationScenarios.json`, call adapted service with `SimulationInput`, call `addVehicle`.
- [ ] Connect `FleetOverviewMap` to `useSimulationStore` to read `vehicles`.
- [ ] Implement basic marker rendering in `FleetOverviewMap`.
- [ ] **Verification:** Page renders map & button. Clicking button loads scenario, calls service, updates store, displays static marker. (Truck/driver info is now *in* the store state for the vehicle, ready for future UI display).

---

## 🧪 Phase 2: Route Display & Basic Animation (Targeting `/simulation` Page - **COMPLETED**)

**Goal:** Display the route for the selected vehicle and implement the core animation loop for a single vehicle on the `/simulation` page.

### ✅ 2.1: Display Route on Map (Completed)
- [ ] Modify `FleetOverviewMap` to:
    - Read the `route` GeoJSON from the selected vehicle's state in `useSimulationStore`.
    - Implement route rendering logic (e.g., using `react-map-gl` `<Source>` and `<Layer>`) to display the route line on the map.
    - Optionally display distinct markers for origin/destination.
- [ ] **Verification:** Confirm the fetched route line appears correctly on the `/simulation` map when the mock vehicle is loaded.

### ✅ 2.2: Implement Animation Logic (Completed - `calculateNewPosition` utility)
- [ ] Implement the `calculateNewPosition(vehicle, timeDelta, speedMultiplier)` helper function within `SimulationFromShipmentService` (using Turf.js).
- [ ] Add necessary state and actions to `useSimulationStore`: `isSimulationRunning`, `simulationSpeedMultiplier`, `startGlobalSimulation`, `stopGlobalSimulation`, `setSimulationSpeed`, `updateVehicleState`.
- [ ] Implement the `tickSimulation` logic:
    - Set up a `setInterval` (using `useSafeInterval` pattern from `FleetOverviewMap`?) triggered by `startGlobalSimulation` and cleared by `stopGlobalSimulation`.
    - Inside the interval: If `isSimulationRunning`, iterate vehicles in store (just one for now). For the 'En Route' vehicle, call `calculateNewPosition`, then call `updateVehicleState` with the new position, bearing, status, etc.
- [ ] **Verification:** Confirm the vehicle marker smoothly animates along the displayed route when simulation is started. Status should change to 'At Dropoff' upon completion.

### ✅ 2.3: Implement Simulation Loop in Store (Completed - `tickSimulation`, `setInterval`)
- [ ] Add necessary state and actions to `useSimulationStore`: `isSimulationRunning`, `simulationSpeedMultiplier`, `startGlobalSimulation`, `stopGlobalSimulation`, `setSimulationSpeed`, `updateVehicleState`.
- [ ] Implement the `tickSimulation` logic:
    - Set up a `setInterval` (using `useSafeInterval` pattern from `FleetOverviewMap`?) triggered by `startGlobalSimulation` and cleared by `stopGlobalSimulation`.
    - Inside the interval: If `isSimulationRunning`, iterate vehicles in store (just one for now). For the 'En Route' vehicle, call `calculateNewPosition`, then call `updateVehicleState` with the new position, bearing, status, etc.
- [ ] **Verification:** Confirm the vehicle marker animates along the route on the `/tracking` map, controllable via Start/Stop.

### ✅ 2.4: Add UI Controls for Simulation (Completed - Start/Stop/Speed Buttons)
- [X] Add simple UI elements to `/simulation` page.
- [X] Connect controls to store actions.
- [X] **Verification:** Buttons control animation. Status display updates. Details panel exists.

---

## ✨ Phase 3: Simulate Driver Interactions (NEW PHASE)

**Goal:** Introduce simulated steps for driver confirmation of pickup and delivery to make the simulation workflow more realistic, aligning with concepts referenced in `DriverInterface.tsx`.

### 🛠️ 3.1: Implement "Confirm Pickup" Logic
- [ ] **Store:** Create `confirmPickup(vehicleId)` action (sets status to 'En Route', resets distance/time).
- [ ] **Store:** Modify `startGlobalSimulation` to only manage the global timer/running state, removing automatic status change.
- [ ] **Store:** Modify `tickSimulation` to only process vehicles already 'En Route'.
- [ ] **UI (`SimulationControls`):** Refactor "Start/Stop" button logic:
    - If simulation stopped & vehicle 'Idle', button shows "Confirm Pickup & Start". Calls `confirmPickup` then `startGlobalSimulation`.
    - If simulation running, button shows "Stop Simulation". Calls `stopGlobalSimulation`.
    - (Consider edge cases: starting with no vehicle selected, or vehicle already en route).
- [ ] **Verification:** Vehicle only starts moving after explicit "Confirm Pickup & Start" action. Status updates correctly.

### 🛠️ 3.2: Implement "Confirm Delivery" Logic
- [ ] **Store:** Modify `tickSimulation`: When destination reached, set status to `'Pending Delivery Confirmation'` instead of 'At Dropoff'.
- [ ] **Store:** Create `confirmDelivery(vehicleId)` action (sets status to 'Completed' or 'At Dropoff', potentially stops simulation).
- [ ] **UI (`SimulationControls`):** Add "Confirm Delivery" button, visible only when selected vehicle status is `'Pending Delivery Confirmation'`. Button calls `confirmDelivery`.
- [ ] **Verification:** Vehicle stops at destination awaiting confirmation. Status updates correctly upon confirmation.

---

## ✨ Phase 4 (Previously 3): Refine Prototype & Define Specifications for v0 UI Generation

**Goal:** Enhance the prototype components (map markers, popups, panels, controls), define the target page layout, and generate clear specifications...

### NEW 📐 4.1: Define Target Page Layout (`/simulation` & `/tracking`)
- [X] **Requirement:** Define the target page structure, intended to be implemented *after* component refinement (Tasks 4.2-4.5):
    - **Overall:** Persistent Sidebar + Main Content Area.
    - **Main Content Area:** Split into two primary columns.
        - **Content Column 1 (Left, e.g., ~30% width):** List/Selector Area. Displays selectable items (mock scenarios for `/simulation`, active shipments for `/tracking`). Component should visually resemble the shipment cards seen in the *left column* of `/shipments/[id]` (consider adapting existing `ShipmentCard` code/logic).
        - **Content Column 2 (Right, e.g., ~70% width):** Map & Interaction Area. Contains the main interactive map (`SimulationMap` or future `TrackingMap`) taking up the majority of the space, plus the associated controls and selected vehicle details (`SimulationControls`, details panel). Note: This is distinct from the right-column layout (Map Preview + Tabs) on the `/shipments/[id]` page.
- [ ] **Consideration:** Define responsive behavior.
- [X] **Verification:** Layout structure requirement is clearly documented for V0 generation. **(Marking complete as requirement is defined)**

### 🎨 4.2 (Prev 4.1): Define Marker Styling, Popup, & Details Panel Content
- [X] **Marker Icon:** Implemented truck icon using SVG.
- [X] **Marker Rotation:** Implemented basic rotation based on `vehicle.bearing`. Centering adjusted.
- [X] **Marker Status Styling:** Define/implement visual differentiation (e.g., color) for the dynamic marker based on `VehicleStatus` (Idle, En Route, Pending Delivery Confirmation, Completed, Error).
- [X] **Marker Highlighting:** Implement visual feedback (e.g., size/outline change) on the selected marker when clicked.
- [X] **Details Panel Content:** Define/implement which fields appear in the dedicated right-hand panel when a vehicle is selected. Essential fields identified:
    - Core: `Vehicle ID`, `Shipment ID`, `Current Status`
    - Asset: `Driver Name`, `Driver Phone`, `Truck ID`
    - Trip: `Origin` (Short), `Destination` (Short), `RDD`, `Recipient Name`, `Recipient Phone`
    - Refs (Optional): `Customer Shipment #`, `Customer PO #`
    - Notes (Optional): `Remarks` (Concise)
- [X] **Verification:** Marker uses icon, rotates, changes style with status, highlights on selection. Details Panel shows required information.

### NEW ✨ 4.3: Implement Route Color Progression
- [X] **Goal:** Change route line color to indicate progress (e.g., orange behind, green ahead). - **COMPLETED** (Using Green behind, Grey ahead)
- [X] **Approach:** Utilize Mapbox GL JS `line-gradient` paint property based on `["line-progress"]`.
- [X] **Implementation:** Calculate progress ratio (`traveledDistance / routeDistance`). Define gradient stops (green -> grey). Update the layer's paint property dynamically as the vehicle moves.
- [X] **Verification:** Route line color updates correctly during simulation.

### NEW 📍 4.4: Implement Persistent Origin/Destination Markers
- [X] **Goal:** Display static markers at the start (origin) and end (destination) points of the selected vehicle's route. - **COMPLETED**
- [X] **Iconography:**
    - **Origin:** Use a logistic hub-inspired icon. - *Using Home icon placeholder*
    - **Destination:** Use a clever/witty icon appropriate for logistics delivery. - *Using Flag icon placeholder*
    - **Fallback:** If custom icons are unsatisfactory, revert to standard map pins (e.g., green for destination, distinct color/shape for origin).
- [X] **Implementation:** Add `<Marker>` components for origin/destination coordinates, conditionally rendered when a vehicle with a route is selected. Style with appropriate icons. - *Placeholder icons used, size adjusted per request.*
- [X] **Verification:** Distinct markers appear correctly at origin and destination points.

### 🗺️ 4.5 (Prev 4.4): Define Map Interaction Requirements
- [X] **Specify Initial Zoom Behavior:** Zoom directly to the vehicle's starting position upon selection/load. *(Changed from Fit Bounds)* - **COMPLETED**
- [X] **Specify Zoom-to-Route:** Make fitting bounds to the entire route a manual action (e.g., button).
- [X] **Specify Follow-Vehicle:** Implement a toggle to keep the map centered on the moving vehicle. Disable follow on manual map interaction. - **LOGIC IMPLEMENTED, UI ADDED**
- [ ] **Specify "View Full Details" Link:** Requirement documented. (Implementation deferred until layout refactor).
- [X] **Verification:** Initial zoom goes to vehicle. Follow vehicle works as expected. Requirements documented.

### NEW 🔄 4.6 (Prev 4.5): Refine Turning Animation Logic
- [X] **Goal:** Make marker rotation appear more natural for sharp turns vs. curves.
- [X] **Investigation:** Analyze `calculateNewPosition` and `turf.bearing`/`turf.along` behavior with route geometry.
- [X] **Potential Solutions:** Adjust bearing calculation lookahead, modify animation step size, investigate Mapbox geometry details, or accept current behavior for V0 spec.
- [X] **Verification:** Turning animation feels more realistic (or decided acceptable for now).

### 🛡️ 4.7 (Prev 4.6): Define Error Handling & Edge Case Requirements
- [ ] ... (Requirements documented)

### 🧹 4.8 (Prev 4.7): Code Cleanup & Refactoring (Prototype Code)
- [ ] ... (Requirements documented)

### NEW ⏱️ 4.9: Implement ETA Calculation and Display
- [X] **Goal:** Calculate and display the Estimated Time of Arrival for the selected vehicle. - **COMPLETED**
- [X] **Calculation Logic:**
    - Determine remaining distance (`routeDistance - traveledDistance`).
    - Determine effective speed (e.g., use Mapbox route duration initially, or `baseSpeed * simulationSpeedMultiplier`). - *Using base speed approach.*
    - Calculate remaining time (`remainingDistance / effectiveSpeed`).
    - Calculate ETA (`currentTime + remainingTime`).
- [X] **Display:** Show the formatted ETA (e.g., "ETA: 14:35 (in 2h 10m)") in the Details Panel (`SimulationControls`). Update dynamically.
- [X] **Verification:** ETA displays correctly and updates during simulation.

---

## 📤 Phase 5 (Prev 4): Integrating Real Parsed Data & Snapshot Map

**Goal:** Define requirements for connecting simulation to real data and implementing the static `/shipments/[id]` map.

**Context & Decisions from Planning Discussion:**
*   **Trigger Mechanism:** The simulation for a specific shipment will be initiated via the existing **"View Live Tracking / Simulation" button** on the `/shipments/[id]` page (`app/shipments/[documentid]/page.tsx`). **(✅ Implemented)**
*   **Core Task:** The primary goal is to build the application logic that:
    1.  Fetches the relevant parsed shipment data from the database based on the ID from the `/shipments/[id]` page context (**using a Server Action**). **(✅ Implemented)**
    2.  Transforms this database record into the `SimulationInput` format required by `SimulationFromShipmentService` (**within the Server Action**). **(✅ Implemented)**
    3.  Navigates to `/simulation` (or integrates view later) and populates the `useSimulationStore` with the generated `SimulatedVehicle`. **(✅ Implemented)**
*   **Parser Limitations:** Acknowledged that the current parser primarily handles completed trips from XLS. Testing the Phase 5 connection mechanism will initially use this available DB data. Testing "en route" scenarios triggered from DB data may require manual modification of DB records as a workaround, rather than modifying the parser itself for this phase. **(❗ Limitation Identified)**
*   **Scalability & Map Scope (DECISION):** Phase 5 focuses on simulating *one selected shipment* at a time on the `/simulation` page. The **Fleet Overview feature (displaying multiple live vehicles simultaneously) is definitively SCRAPPED** from future plans to maintain focus and reduce complexity. Future live tracking (Phase 8+) will concentrate on robust single-shipment tracking displays.
*   **UI Layout (`/simulation` Page):** The intended layout for `/simulation` aligns with Task 4.1 and user preference: A two-column layout similar to `/shipments`, with a selectable list/cards on the left (even if initially showing only the single loaded shipment) and the map/controls on the right. **(Deferred to Phase 5.6)**
*   **JSON Input Idea:** Loading simulation from a separate JSON file is considered a valid *backup testing strategy* but not the primary implementation path for Phase 5, which focuses on the DB connection. **(Now Elevated to Phase 5.5 for specific initial state testing)**

### 5.1: Define Parser Output Connection Requirements **(✅ Partially Implemented - Core Connection)**
- [X] **Task 5.1.1 (Data Mapping):** Define the precise mapping from database fields (across relevant tables like `shipments_erd`, `pickups`, `dropoffs`, `addresses`, `customShipmentDetails`, potentially parsed driver/truck info if stored) to the fields required by the `SimulationInput` type (`types/simulation.ts`). **(Definition Complete)**
    *   Required fields include: `originCoordinates`, `destinationCoordinates`, `requestedDeliveryDate`, `shipmentId`, `driverName`, `driverPhone`, `truckId`, `driverIc`, etc.
    *   **Data Handling Strategy:**
        *   **Mandatory:** `originCoordinates`, `destinationCoordinates`, `shipmentId`. If data is missing or invalid in the DB, the transformation process must fail and return an error.
        *   **Optional:** `requestedDeliveryDate`, `driverName`, `driverPhone`, `truckId`, `driverIc`, `originAddressString`, `destinationAddressString`, `recipientName`, `recipientPhone`, `associatedPoNumber`, `remarks`. If data is missing/null, map to `null` or `undefined` in the `SimulationInput` object.
- [X] **Task 5.1.2 (Transformation Logic Location & Implementation):**
    *   **Decision:** Implement the logic within a **Next.js Server Action** (e.g., in `actions/simulationActions.ts`). **(Implemented)**
    *   **Implementation:** Create a function like `getSimulationInputForShipment(shipmentId: string): Promise<SimulationInput | { error: string }>`. This function will perform necessary database queries (using Drizzle, likely involving joins) and map the results to the `SimulationInput` structure, applying the mandatory/optional data handling strategy. **(Implemented)**
    *   **NEW Task 5.1.2a (Handle Completed):** Modify `getSimulationInputForShipment` and/or `loadSimulationFromInput` (TBD) to check the DB status. If the shipment is already 'DELIVERED' or 'COMPLETED', either load the simulation directly into a static 'Completed' state or prevent simulation start with a user message. **(Prevents illogical re-simulation)**
- [X] **Task 5.1.3 (Button Handler):** Implement the `onClick` handler for the "View Live Tracking / Simulation" button in `app/shipments/[documentid]/page.tsx`. This handler will:
    *   Get the current `shipmentId`.
    *   Call the `getSimulationInputForShipment` Server Action.
    *   Check the result: If error, display message; if success, proceed.
    *   Call a store action (e.g., `loadSimulationFromInput(simulationInput)`) to potentially clear existing state and add the new vehicle.
    *   Navigate to `/simulation`. **(Implemented)**
- [X] **Task 5.1.4 (Store Action):** Create the `loadSimulationFromInput` (or similar) action in `useSimulationStore.ts` to handle receiving the `SimulationInput` and setting up the store state for the new simulation. **(Implemented)**
- [ ] **Task 5.1.5 (Testing):** Test the end-to-end flow using existing data in the database (potentially manually modified for specific states if needed). **(❗ Limited Testing Done - Blocked by data source)**
- [X] **Task 5.1.3 (Button Handler):** Implement the `onClick` handler... **(Implemented)**
- [X] **Task 5.1.4 (Store Action):** Create the `loadSimulationFromInput`... **(Implemented)**
- [ ] **Task 5.1.5 (Testing):** Test the end-to-end flow... **(❗ Limited Testing Done - Blocked by data source & lack of initial state testing)**

### 🗺️ 5.2: Define Snapshot Map (`/shipments/[id]`) Requirements **(✅ UI Implemented, Functionality Limited)**
- [X] **Requirement:** Specify component (`StaticRouteMap`). **(Implemented)**
- [X] **Requirement:** Define data needed (origin, dest, route geometry, last known position). **(Props Defined)**
- [X] **Requirement:** Specify visual elements (route line, origin/dest markers, optional last known position marker). **(Implemented)**
- [X] **Requirement:** Define expected props. **(Implemented)**
- [ ] **Requirement:** Implement refresh mechanism for last known location. **(Backend Pending - Blocked until live data/mocking)**
- [X] **NEW Requirement:** Add "View Full Tracking" button/link on the map preview area, conceptually linking to `/tracking/[shipmentId]`. **(Requirement Documented)**
- [ ] **Verification:** Requirements documented. **UI renders correctly with static completed data. Refresh button exists but is non-functional.**

**--- ARCHITECTURAL NOTE (Phase 5.2 Scope Limitation) ---**
**The 'Last Known Position' feature implemented in Phase 5.2 relies on periodic updates originating *only* from the currently active single-vehicle simulation instance (`useSimulationStore`). The persisted position in `shipments_erd` reflects the state *the last time that specific shipment's simulation was run*. It does **not** provide concurrent, real-time updates for multiple vehicles within a document. Achieving simultaneous, real-time tracking for multiple vehicles requires a different architecture (e.g., involving Firebase RTDB or a dedicated time-series DB and event-driven updates), which is planned for Phase 8 and explicitly outside the scope of this Phase 5.2 implementation.**
**--- END ARCHITECTURAL NOTE ---**

---

### **NEW** 🧪 5.5: Enhanced Testing via JSON Input **(PRIORITY)**

**Goal:** Implement a mechanism to load simulation scenarios directly from JSON files **on the `/simulation` page** to bypass database limitations and enable robust testing of various **initial simulation states** ('Pending Pickup', 'En Route' from mid-point, 'Pending Delivery Confirmation', etc.), which cannot be tested with the current DB data flow.

- [ ] **Task 5.5.1 (JSON Data Structure):** Finalize the structure for mock `SimulationInput` objects within `.json` files (e.g., `data/mocks/testScenarios/enRouteShipment.json`). Ensure it includes fields to represent different starting states (e.g., `initialStatus`, potentially `initialTraveledDistance`, `initialBearing`).
- [ ] **Task 5.5.2 (Loading Mechanism):** Design and implement a way to load these JSON files **on the `/simulation` page**. 
    *   **Decision:** Repurpose the existing "Load Scenario 1" button/handler (`handleLoadAndSimulate` or similar). Rename button (e.g., "Load JSON Test Scenario"). Handler should accept a file identifier/path, fetch/parse the local JSON, and pass the `SimulationInput` to the store.
    *   (Neurotic Check: Ensure this JSON loading path is distinct and doesn't break the DB-driven loading triggered from `/shipments/[id]` page).
- [ ] **Task 5.5.3 (Service/Store Adaptation):** Ensure `SimulationFromShipmentService.createVehicleFromShipment` and `useSimulationStore` actions (`loadSimulationFromInput` or a new dedicated action) can correctly handle `SimulationInput` originating from JSON, **honoring fields like `initialStatus`, `initialTraveledDistance`, `initialBearing` to set the starting state accurately.**
- [ ] **Task 5.5.4 (Testing):** Create several JSON mock files representing different scenarios (pending pickup, en route part-way, near destination) and verify that loading them correctly initializes the simulation state and visual representation **in the intended starting state.**

---

### **NEW** 🖼️ 5.6: Refactor Simulation Page UI **(Deferred)**

**Goal:** Implement the planned two-column UI layout for `/simulation` page for improved user experience and structure, aligning with Task 4.1 definition. (**Deferred until after Phase 5.5 provides robust initial state testing capabilities**).

- [ ] **Task 5.6.1 (Layout Implementation):** Refactor `app/simulation/page.tsx` to use a two-column grid layout.
    *   **Left Column:** Implement a list/card view component to display selectable simulation scenarios (initially loaded from DB or JSON). This component should resemble `ShipmentCard` visually. Selecting an item triggers loading its data into the simulation state.
    *   **Right Column:** Contain the `SimulationMap` component and the `SimulationControls` component.
- [ ] **Task 5.6.2 (Selector Logic):** Implement the logic for the left-column selector to trigger the appropriate loading action (DB fetch or JSON load) and update the simulation store when a scenario is selected. Ensure only the selected scenario's vehicle/route is displayed on the map.
- [ ] **Task 5.6.3 (Integration):** Ensure seamless interaction between the selector, map, and controls.

---

## 🌐 Phase 6: UI Refinement & Cleanup (NEW PHASE)

**Goal:** Address minor UI/UX issues identified in the simulation prototype, perform code cleanup, and prepare for potential handoff or further feature development.

- [ ] **Task 6.1 (Load Number Display):** Verify fix for `ShipmentCard` title fallback logic ensures correct display even if `loadNumber` is null in DB. **(Code updated, Needs Verification)**
- [ ] **Task 6.2 (Address Tooltips):** Verify tooltip implementation on `ShipmentCard` works correctly for truncated addresses. **(Code updated, Needs Verification)**
- [X] **Task 6.3 (Column Widths):** Verify adjusted column widths (`minmax(350px, ...)`) on `/simulation/[documentId]` and `/shipments/[documentid]` prevent highlight clipping. **(Code updated, Needs Verification)** -> **VERIFIED COMPLETE**
- [X] **NEW Task 6.4 (Accordion Trigger Sensitivity):** Prevent the `AccordionTrigger` click from re-selecting/re-loading the simulation if the item is already selected. The click should only toggle the accordion state in this case. -> **VERIFIED COMPLETE**
- [X] **NEW Task 6.5 (Accordion UI Glitches):** 
    - [X] Fix duplicate loading spinners appearing on the `AccordionTrigger`.
    - [X] Fix duplicate dropdown arrows (one on trigger, one inside `ShipmentCard` content) by hiding the internal `ShipmentCard` arrow when rendered in the accordion. -> **VERIFIED COMPLETE**
- [X] **NEW Task 6.6 (Initial Selection Highlight):** Ensure the shipment clicked on the `/shipments/[id]` page is automatically highlighted (selected) in the list when the `/simulation/[documentId]` page loads. (Implement via query parameter). -> **VERIFIED COMPLETE**
- [ ] **Task 6.7 (Code Cleanup - Phase 4.8):** 
    - [ ] Review and refactor prototype code in map components, services, store, and page files for clarity, consistency, and removal of commented-out/unused code.
    - [ ] Ensure proper error handling and logging throughout the simulation flow.
    - [ ] Add necessary comments for complex sections.
- [ ] **Task 6.8 (File Map Update):** Update/create `fileMap.json` (or similar documentation) to accurately reflect the key files involved in the simulation feature and their responsibilities.
- [ ] **Task 5.6.7 (Revisit Entry Point):** Implement "Simulate" button on `/documents` page `DocumentCard` to link to `/simulation/[documentId]`.

---

## 🌐 Phase 7 (Prev 6): Multi-Vehicle & Mock API (Deferred)

---

## 🔥 Phase 8 (Prev 7): Firebase Integration (Deferred)

**Goal:** Replace simulation with live data source for **single-shipment tracking**. **Deferring** significantly.

### ~~🔐 8.1: Hook Up Firebase~~
### ~~🔁 8.2: Replace Mock~~
### ~~🚨 8.3: Failover~~
- [ ] **Consideration:** Architecture must handle potential live route deviations... **(Required for Phase 8)**
- [ ] **(NEW) Consideration for Phase 8:** Implement status backflow mechanism (writing simulation/tracking status back to the database) as part of real-time integration.

---

## 🧠 Cursor Prompt Example (Reflecting v0 Workflow)
```ts
Task: Define Phase 3.1 Marker Styling & Popup Requirements for v0

1.  **Document Marker Style Spec:** In `FleetOverviewMap.tsx` (or plan doc), specify:
    *   Use truck icon (e.g., Font Awesome or SVG).
    *   Color code by `status`: Idle (gray), En Route (blue), At Dropoff (green), Error (red).
    *   Rotate marker based on `vehicle.bearing`.
2.  **Document Popup Content Spec:** Specify required fields from `SimulatedVehicle`: `id`, `shipmentId`, `status`, `driverName`, `truckId`.
3.  **(Optional Prototype):** Implement *basic* marker styling changes (e.g., color based on status) and a *very basic* `react-map-gl` `<Popup>` showing the vehicle ID, primarily to verify data flow for the v0 specification.
4.  **Goal:** Provide clear requirements for Vercel v0 to generate the styled marker component and the popup component.
```

---

## ✅ Project Milestones (Updated)
- [X] Setup Complete
- [X] Services Created
- [X] Store Created
- [X] Static Vehicle Displayed (Origin Marker)
- [X] Route Displayed
- [X] Animation Working (Core loop)
- [X] Phase 3 Complete: Simulated driver interactions implemented (Confirm Pickup/Delivery).
- [X] Phase 4 Specs Defined: Requirements for V0 generation documented/prototyped for:
    - [X] Target Layout (`/simulation` & `/tracking`) **(Requirement Defined, Implementation Deferred to 5.6)**
    - [X] Route Color Progression
    - [X] Persistent Origin/Destination Markers
    - [X] Map Interactions (Initial Zoom, Follow Vehicle, Manual Fit Bounds Button Req)
    - [X] Turning Animation Logic (Accepted)
    - [X] Error Handling Requirements
    - [X] ETA Calculation & Display
- [X] **Phase 4 Implementation Complete:** Component refinements implemented:
    - [X] Task 4.2a: Marker Status Styling (Color based on vehicle.status) - **VERIFIED COMPLETE**
    - [X] Task 4.2b: Marker Highlighting (Visual feedback on selection) - **Tentatively COMPLETE** (Code logic verified, visual confirmation limited by single marker)
    - [X] Task 4.2c: Details Panel Content (Display all required fields) - **VERIFIED COMPLETE**
    - [ ] Task 4.8: Code Cleanup & Refactoring (Prototype Code)
- [X] **Phase 5.1 (DB Connection) - Implemented:** Core logic connecting `/shipments/[id]` button -> Server Action -> Store -> `/simulation` page is functional. **Testing limited by completed shipment data & lack of initial state tests.**
- [X] **Phase 5.2 (Snapshot Map) - UI Implemented:** `StaticRouteMap` component integrated on `/shipments/[id]`. Displays map/route for completed shipments. **Refresh functionality blocked pending backend data.**
- [X] **Phase 5.5 (JSON Input Testing) - COMPLETE:** Implemented and verified mechanism to load simulations from JSON files, confirming correct initial state handling for Idle, En Route, Pending Confirmation, and Awaiting Status scenarios.
- [X] **Phase 5.6 (REVISED - UI Refactor for Tracking Prototype) - PARTIALLY COMPLETE:** Create `/simulation/[documentId]` page to prototype the `/tracking` page interaction, using real shipment data.
    - [X] **Task 5.6.1 (Routing & Page Creation):** Create dynamic route `app/simulation/[documentId]/page.tsx`. Create basic client component structure, extract `documentId` param.
    - [X] **Task 5.6.2 (Data Fetching):** Implement `useEffect` to fetch shipment data for the `documentId` via `GET /api/simulation/shipments/[documentId]` (Corrected API). Handle loading/error states. Store fetched data (e.g., `ShipmentCardDataShape[]`) in state.
    - [X] **Task 5.6.3 (Layout):** Implement two-column grid layout (e.g., `lg:grid-cols-[minmax(350px,_1fr)_3fr]`). Left column: Header(deferred), Search(deferred), List. Right column: Map (top, flex-grow) + Controls (bottom, flex-none).
    - [X] **Task 5.6.4 (Shipment List):** Use/Adapt `ShipmentCard` to render fetched shipments in the left column. Implement selection state (`selectedShipmentId`) and `onSelect` handler.
    - [X] **Task 5.6.5 (Map & Controls Integration):** Place `<SimulationMap />` and `<SimulationControls />` in the right column as per layout (Map above, Controls below). Refactored controls for compactness.
    - [X] **Task 5.6.6 (Initiate Simulation):** Wire up selection (`onSelect` or `useEffect`): Find selected shipment data -> call `getSimulationInputForShipment` -> call `loadSimulationFromInput`.
    - [X] **Task 5.6.6a (Auto-Start):** Simulation auto-starts if loaded vehicle is 'En Route'.
    - [X] **Task 5.6.7 (Entry Point):** Add "Simulate" button/link to `DocumentCard` on `/documents` page `DocumentCard` to link to `/simulation/[documentId]`.
- [X] **NEW Task (Bug Fix - Store):** Fix SimulationFromShipmentService instantiation/usage in `loadSimulationFromInput`.
- [X] **NEW Task (Bug Fix - Store):** Implement state cleanup in `loadSimulationFromInput` to remove previous simulation artifacts (markers, etc.) when loading a new one.
- [ ] **Phase 6+ - Deferred:** Multi-vehicle, Live Data Integration, etc.
- [X] **NEW Task (Bug Fix):** Correct 'Pending' status display on `ShipmentCard`.
- [X] **NEW Task (Logic):** Prevent re-simulation of completed shipments.
- [X] **NEW Task (Logic):** Correct initial position for 'Completed' status simulation. 
- [ ] **(Deferred) Shipment Page UX:** Add document selection directly to shipments page.
- [X] **NEW Task (Status Handling):** Adapt Downstream Components for `AWAITING_STATUS` (CURRENT FOCUS)
- [X] **NEW Task SH.1 (Simulation):** Update simulation logic (`useSimulationStore`, `SimulationControls`, `SimulationMap`, **`SimulationFromShipmentService`**) to handle `AWAITING_STATUS`.
    - `useSimulationStore`: `tickSimulation` ignores, `confirmPickupAction` prevents. **(✅ Verified)**
    - `SimulationControls`: Relevant controls disabled. **(✅ Verified)**
    - `SimulationFromShipmentService`: Sets default vehicle position to map center (`[101.6869, 3.1390]`) instead of `[0,0]` if origin is null. Preserves `null` for origin/destination coords instead of `[0,0]` fallback. **(✅ Implemented & Verified)**
    - `SimulationMap`: Vehicle marker displays at default center; Origin/Destination markers correctly *do not* render if coordinates are null. **(✅ Behavior Verified)**
- [X] **NEW Task SH.2 (UI):** Update UI components (`ShipmentCard`, `ShipmentDetailView` status badges, status filters/displays) to present `AWAITING_STATUS` appropriately (e.g., display "Awaiting Status" text, use a neutral visual indicator). Hide 'View Tracking' button. **(✅ Verified)**
- [X] **NEW Task SH.3 (DB Verify):** Confirmed `status` column uses `shipmentStatusEnum` which includes `AWAITING_STATUS`. Migration was successful. **(✅ Verified)**
- [X] **NEW Task 5.7 (All-Status Mock) - COMPLETE:** Mock XLS created, parser adjusted, trigger added, verified end-to-end status handling.
- [X] **NEW Phase 10 (Backend Simulation Arch) - Partially Completed / Pivoted:** KV Service, Tick Worker, Enqueuer API, Initiation Action, and Frontend Trigger implemented. Vercel Cron removed; **Requires external trigger setup.**
- [ ] **Phase 6+ - Deferred:** Multi-vehicle, Live Data Integration, etc.