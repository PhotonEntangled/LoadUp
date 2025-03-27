# 📦 LoadUp Simulation & Tracking Implementation Plan (Atomic & Fool-Proof)

## 🔁 Overall Strategy
- **Goal**: Build a fully functional tracking page using mock vehicles and simulate document-upload-to-map workflows.
- **Approach**: Atomic, modular, and mock-first. Each milestone must be self-contained and validated visually.
- **Deadline**: All web milestones must be completed within 48 hours before moving to mobile.

---

## 🗂️ Key File Responsibilities (Updated)

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

## 🔨 Phase 1: Vehicle Simulation Foundation

### ✅ 1.1: Static Map Vehicle
- [ ] Display single vehicle from mock store on `FleetOverviewMapV2`
- [ ] Vehicle has ID, type, status (hardcoded)

### ✅ 1.2: Animate Vehicle
- [ ] Simulate movement on circular route
- [ ] Runs via interval inside provider
- [ ] Render remains stable

### ✅ 1.3: Controls
- [ ] Start/Stop
- [ ] Speed dropdown
- [ ] Connected to Zustand state

---

## 🧪 Phase 2: Scalable Vehicle Logic

### 🚛 2.1: Multiple Sim Vehicles
- [ ] Display 2–5 vehicles
- [ ] Randomized or named IDs

### 📦 2.2: Shipments to Vehicles
- [ ] Assign each vehicle a shipment payload
- [ ] Show ID, status, route visually

### 📍 2.3: Basic Routes
- [ ] Route: PO → destination
- [ ] Coordinates mocked
- [ ] Optional: visible route line

---

## 📤 Phase 3: Shipment Upload → Map Flow

### 📄 3.1: Mock Upload Integration
- [ ] Simulate upload from `LogisticsDocumentUploader.tsx`
- [ ] Output from `ShipmentParser.ts` feeds mock vehicles

### 🔍 3.2: Match Schema to ERD
- [ ] Match fields using mapping in `ShipmentParser.ts`
- [ ] Display `orderId`, `weight`, `contact`, `poNumber`, etc.
- [ ] Unknown values pushed to `misc` (fallback)

### 🚚 3.3: Generate Sim Vehicle
- [ ] Use `SimulationFromShipmentService.ts` (new file) to create vehicle objects
- [ ] Attach coordinates
- [ ] Push to `useUnifiedVehicleStore`

### 🗺️ 3.4: Display Parsed Shipments
- [ ] Vehicles on map linked to parsed doc
- [ ] Tooltip/popup with details
- [ ] Validate with sample Excel (13 shipment rows)

---

## 🌐 Phase 4: Mockoon API + WebSocket

### 🛠 4.1: Setup Mockoon
- [ ] Endpoints:
  - `GET /vehicles`
  - `POST /upload-shipment`
  - WebSocket channel for `/vehicle-updates`

### 📡 4.2: Live Update Simulation
- [ ] Push random location changes via socket
- [ ] Sync with Zustand store

### 🧯 4.3: Fallback
- [ ] Graceful degradation to polling if socket fails

---

## 🔄 Phase 5: Unified Vehicle Architecture

### 🧠 5.1: Zustand Unification
- [ ] All vehicles live in `useUnifiedVehicleStore`
- [ ] Real or Sim flag

### 🔎 5.2: Filters
- [ ] Status, type, search bar

### 🧪 5.3: Source Swap
- [ ] `VehicleServiceFactory` handles all swaps

---

## 🔥 Phase 6: Firebase Integration

### 🔐 6.1: Hook Up Firebase
- [ ] Plug in real-time updates
- [ ] Use subscriptions in `VehicleTrackingService`

### 🔁 6.2: Replace Mock
- [ ] Swap out factory connection

### 🚨 6.3: Failover
- [ ] Last known position cache
- [ ] Alert on connection failure

---

## 🧠 Cursor Prompt Example
```ts
We want to simulate what happens when a driver uploads a shipment slip. Use mock Excel data (see sample file) to:

1. Parse shipment info using `ShipmentParser.ts`
2. Generate a simulated vehicle
3. Assign a route from origin to destination
4. Push the vehicle into `UnifiedVehicleStore`
5. Display vehicle on `FleetOverviewMapV2` with metadata tooltip
```

---

## ✅ Project Milestones (48-Hour Sprint)
- [ ] Vehicle appears on map (mocked)
- [ ] Document upload parses to valid schema
- [ ] Parsed row becomes moving vehicle
- [ ] Route animates between PO and destination
- [ ] Tooltip shows shipment info
- [ ] Support multiple uploads
- [ ] Swap to Firebase-ready service with fallback

---

## 📁 Suggested Folder Structure
```
src/
├── components/
│   └── map/
│   └── logistics/
├── services/
│   └── mock/
│   └── firebase/
│   └── shipment/
├── adapters/
├── store/
├── types/
```

---

## 🧷 Best Practices
- Never couple parsing logic to UI
- Every parsed shipment must resolve to:
  - A standardized schema
  - A usable simulation config
- Push all vehicles (mock or real) through one shared store
- Cursor prompts should ask for isolated, testable code units
- Avoid skipping steps: validate milestone before scaling

---

Let’s build this right, one verified simulation at a time ✅

