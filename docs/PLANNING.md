# 📋 LoadUp Project Planning Document (Consolidated)

**(Generated: [Current Date])**

## 📜 Project Goals & Objectives

### Core Goal
Develop an end-to-end AI-driven logistics platform for LoadUp, focusing initially on processing diverse shipment documents (Excel, text, images via OCR) into a standardized schema and visualizing associated vehicle movements for administrative oversight.

### Vision
Build a production-ready, simulation-first logistics system linking document uploads to vehicle tracking on a map, designed for modularity and future integration with live data.

### Business Context
* **Focus:** B2B logistics, primarily large payloads (e.g., 16-wheeler trucks). Support for other vehicle types is out of scope initially.
* **Target Users (Initial):** Admin users requiring document processing, data visualization, and vehicle tracking control. Driver/Customer interfaces are future scope.
* **Core Workflow:**
    1.  Receive/Upload Shipment Slip (various formats).
    2.  Parse/OCR → Standardized `Shipment` object.
    3.  Admin: View parsed data & initiate tracking.
    4.  Admin: Visualize vehicle movement (simulated first, then live).

### Sprint Objective (Target: 48h from start)
> Simulate a parsed shipment slip creating a vehicle that animates from pickup to dropoff on the tracking page map. Vehicle reaches destination, admin is prompted to confirm delivery, and shipment is marked as "delivered" — using mock data initially.

---

## 💡 Development Principles & Strategy

### Simulation First
* **Purpose:** Rapidly develop and test the core tracking visualization pipeline (`Parsed Shipment` → `Vehicle State` → `Map Display` → `Movement Animation`) using mock data (`mockShipment`) before integrating external dependencies (live data, OCR, complex UI).
* **Method:** Bypass upload UI initially. Use `SimulationFromShipmentService` for vehicle creation. Simulate movement using Mapbox Directions API routes.
* **Transition:** Plan to integrate live data via a spoofing app for testing before potentially using real driver data (e.g., via Firebase).

### Modularity & Best Practices
* Encapsulate logic in services (e.g., `SimulationFromShipmentService`, `MapDirectionsService`, `ExcelParserService`) and dedicated components.
* Use standard `react-map-gl` patterns (`<Source>`, `<Layer>`) for map data integration. Interact with Mapbox APIs (like Directions) directly for data retrieval.
* Focus development prompts on single, verifiable outcomes (1 file → 1 outcome → 1 state update).
* Maintain `types/shipment.ts` as the canonical source for shipment data interfaces. Regularly verify type consistency and imports.
* Use dedicated "Formatter/Mapper" functions for complex data transformations between backend (API routes/DB) and frontend, promoting separation of concerns (the "Librarian's Assistant" pattern).

---

## 🗺️ System Architecture & Core Files

### High-Level Data Flow
Upload/Mock Data → 📄 ExcelParserService → 📦 ParsedShipmentBundle → 💾 shipmentInserter (DB Transaction) → 📡 API → 📊 Admin UIMockParsedShipment → 🛠 SimulationFromShipmentService → 🚚 SimulatedVehicle → 🧠 useUnifiedVehicleStore → 🗺 SimulatedVehicleMap (→ Layers)
### Technical Stack (Relevant)
* **Frontend:** React, TypeScript, Zustand (`useUnifiedVehicleStore`, `useMapViewStore`)
* **Mapping:** Mapbox GL JS via `react-map-gl`, Mapbox Directions API, Turf.js (for animation)
* **Backend/Data:** Next.js API Routes, Drizzle ORM, PostgreSQL. OCR pipeline planned. Firebase considered for live data.
* **Parsing:** `xlsx` library.

### Core Files & Responsibilities

* **Document Processing & Parsing:**
    * `services/excel/ExcelParserService.ts`: Parses Excel/text files into `ParsedShipmentBundle`.
    * `services/excel/shipmentBuilder.ts`: Converts `RawRowData` into `ParsedShipmentBundle`.
    * `services/excel/fieldMappings.ts`: Defines header-to-schema field mappings.
    * `types/shipment.ts`: Canonical `ShipmentData` interfaces (potentially needs update).
    * `types/parser.types.ts`: Defines `ParsedShipmentBundle` and related insert types.
    * `app/api/documents/route.ts`: Handles document upload, parsing initiation, and GET requests.
    * `services/database/shipmentInserter.ts`: Handles transactional insertion of `ParsedShipmentBundle` into DB.
* **Map Components & Services:**
    * `components/map/SimulatedVehicleMap.tsx`: Main map view.
    * `components/map/VehicleMarkerLayer.tsx`: Renders vehicle markers.
    * `components/map/MapDirectionsLayer.tsx`: Renders API-based routes and start/end markers.
    * `services/maps/MapDirectionsService.ts`: Fetches Mapbox routes.
* **Simulation:**
    * `services/shipment/SimulationFromShipmentService.ts`: Converts shipments to simulated vehicles, handles animation logic (using Turf.js).
* **State Management:**
    * `store/useUnifiedVehicleStore.ts`: Vehicle data state.
    * `store/map/useMapViewStore.ts`: Map viewport state.
* **UI (Admin Dashboard):**
    * `app/layout.tsx` & `components/layout/main-layout.tsx`: Core UI structure.
    * `app/documents/page.tsx`: Document list and upload UI.
    * `app/shipments/[id]/page.tsx`: Shipment list and detail view for a specific document.
    * `components/shipments/ShipmentDetailView.tsx`: Tabbed display of shipment details.
    * `components/shipments/ShipmentCard.tsx`: Displays summary info in the shipment list.
* **Geolocation/Mocking:**
    * `services/geolocation/mockAddressResolver.ts`: Provides mock address resolution.
    * `services/geolocation/mockAddressData.ts`: Data for mock resolver.

---

## 🚀 Current Status & Next Steps

### ✅ Completed Recently
* **UI Integration (Phases 1-3):** Basic UI components integrated into `app/`, layout refined, basic data fetching connected.
* **API Route Implementation:** `GET /api/documents`, `GET /api/shipments` (basic), `POST /api/documents` implemented with Drizzle.
* **Schema Verification:** Database schema reviewed and aligned.
* **Transactional Insertion Service:** `services/database/shipmentInserter.ts` implemented and verified to handle multi-bundle insertions correctly.
* **Parser Refinement (Core):** `ExcelParserService` refactored to handle text files, multi-sheet processing, improved header detection, corrected field mappings (`secondaryItemNumber`), automated swap corrections, contact parsing, and correct row grouping (now produces **8 bundles** for NIRO file, consolidating multi-row loads). 
* **Mock Address Resolution:** Basic mechanism implemented (`mockAddressResolver.ts`), confirmed working during DB insertion, and keywords updated for specific origin patterns (e.g., "NIRO SHAH ALAM").
* **Frontend Data Display:** Verified correct display of all key fields (Item #, 2nd Item #, Lot #, PO #, Contacts, Origin/Destination Address) in `ShipmentDetailView.tsx`.

### 🚧 Current Focus & Issues
*   **Simulation & Mapping (Next Major Phase):** Implement `SimulationFromShipmentService` to create simulated vehicles from parsed shipments and integrate map visualization (`SimulatedVehicleMap`).
*   **Parser Refinement (Load Splitting - CONSIDERED COMPLETE FOR NOW):** Logic for splitting combined load numbers (e.g., "60033 / 60034") is **deferred** for implementation but considered functionally complete for the current phase as per user direction.
*   **Parser Refinement (Invoice Data - POSTPONED):** Parsing invoice data is postponed until after the initial simulation/mapping phase.

### 🔜 Future Enhancements (Post-Simulation/Mapping)
*   **(Deferred) Implement Split Load Handling:** Add logic to `ExcelParserService` to handle combined load numbers and generate separate bundles (Target: 13 bundles for original NIRO file spec).
*   **(Deferred) Implement Invoice Data Parsing:** Add mappings and parsing logic for financial columns.
*   **Real Geocoding:** Replace mock address resolver with actual geocoding API calls.
*   **Parser Confidence/Review:** Implement flagging (`needsReview`) for ambiguous cases like the combined load number (once implemented).
*   **UI/UX Polish:** Error handling, loading states, potentially refine `GET /api/shipments` payload based on final UI needs.
*   **Live Tracking Integration:** Firebase, spoofing app.
* Address remaining TODOs.

---

## 📝 Data Integrity & Schema Notes

*   **Denormalized Driver/Truck Info:** The `shipments_erd` table contains `driver_name`, `driver_phone`, `driver_ic`, and `truck_plate` fields directly. Analysis of parser output (`*.json`) suggests these are populated directly from parsed document data (e.g., specific cells or "truckDetails" sections) during the `shipmentInserter` process, rather than via foreign keys to canonical `drivers` or `vehicles` tables initially.
    *   **Implication:** For mapping data (e.g., to `SimulationInput`), these direct fields on `shipments_erd` should be treated as the primary source derived from the document.
    *   **Context:** This may be related to historical frontend display issues. The current display works, so changes impacting these fields require caution.
*   **NULL Prevalence (Driver/Truck):** Due to LoadUp using third-party transporters, driver and truck information fields (`driver_name`, `driver_phone`, `driver_ic`, `truck_plate`) will frequently be `NULL` in the database for many shipments. Robust NULL handling in data consumers (like the Server Action creating `SimulationInput`) is essential. Optional fields in `SimulationInput` must correctly map to `undefined` in these cases.
*   **Truck Identifier Ambiguity:** `shipments_erd` has `truck_plate` (text), and `custom_shipment_details` has `truck_id` (text), while `vehicles` primary key `id` is `uuid` but has `plate_number` (text).
    *   **Current Strategy:** Map `SimulationInput.truckId` from `shipments_erd.truck_plate`, assuming it corresponds to the identifier parsed from the document (`parsedTruckIdentifier` in JSON).
    *   `TODO: Verify definitively if `shipments_erd.truck_plate` is the correct and intended field for identifying the truck associated with a shipment for simulation/tracking purposes. Confirm linkage strategy if interaction with the `vehicles` table is ever required.`

---

## 🧹 Consolidated TODO List

**(Generated: [Current Date])**

*(This section remains largely the same as the previous version, summarizing TODOs across different files. Ensure this list is kept up-to-date as tasks are completed.)*

### 🔒 Security (`__tests__/security/auth.security.test.ts`)
* `TODO: Implement test for too many failed login attempts`
* `TODO: Implement test for multiple failed attempts followed by a successful login`
* `TODO: Implement test for session expiration`
* `TODO: Implement test for concurrent sessions`
* `TODO: Implement test for password reset flow`

### 🌐 API Routes (`app/api/...`)
* **`documents/route.ts`:**
    * `TODO: Add authentication check`
    * `TODO: Implement actual file storage logic (e.g., S3, local disk)`
* **`shipments/route.ts`:**
    * `TODO: Add authentication check` (GET)
    * `TODO: Implement proper pagination logic if needed` (GET)
    * `TODO: Implement search/filtering capabilities` (GET)
    * `TODO: Review and potentially refine the query logic and response payload (`ShipmentApiResponseItem`) to ensure all necessary data for the refined UI (`ShipmentCard`, `ShipmentDetailView`, *especially origin address*) is efficiently retrieved and mapped.`

### 💾 Database (`lib/database/schema.ts`)
* `TODO: Consider using enums for status fields (e.g., trips.tripStatus, pickUps.activityStatus)`
* `TODO: Define relationships more explicitly if needed`
* `TODO: Add comments explaining complex fields/tables`
* `TODO: Finalize TENANT definition if multi-tenancy is required`

### 📄 Parsing & Data Handling
* **`services/excel/ExcelParserService.ts`:**
    * `TODO (Deferred): Implement logic to detect and split combined load numbers, correctly associating subsequent row data.`
    * `TODO (Deferred): Implement flagging (`needsReview` metadata) for bundles created from split/combined load numbers.`
    * `TODO (Deferred): Add parsing logic for invoice data columns ("Trip Rates", "Drop", "Manpower", "Total").`
    * `TODO: Add more robust type conversion and error handling in helper functions`
    * `TODO: Verify handling of merged cells or unusual formatting`
    * `TODO: Regression test other formats (ETD) after load splitting/invoice parsing changes (when implemented).`
* **`services/excel/fieldMappings.ts`:**
    * `TODO (Deferred): Add mappings for "Trip Rates", "Drop", "Manpower", "Total" headers.`
    * `TODO (Future): Enhance mapping structure to support header synonyms`
* **`services/excel/shipmentBuilder.ts`:**
    * `TODO (Deferred): Add logic to parse invoice data (Trip Rates, etc.) as numbers.`
    * `TODO: Confirm all necessary fields are populated from parser output`
    * `TODO: Handle potential null/undefined values gracefully during data extraction`
* **`services/geolocation/locationResolver.ts`:**
    * `TODO: Replace mock resolver with actual geocoding API calls`
* **(General Parsing Strategy):**
    * `TODO (Future): Evaluate feasibility and reliability of using AI for mapping headers in *new/unknown* document formats.`

### 🎭 Mock Data & Resolvers
* **`services/geolocation/mockAddressResolver.ts`:**
    * `TODO: Implement better matching logic (fuzzy search?)`
    * `TODO: Add error handling for cases where no match is found`
* **`services/geolocation/mockAddressData.ts`:**
    * `TODO: Expand mock data set for better testing coverage`

### 💻 UI & Components
* **`app/shipments/[id]/page.tsx`:**
    * `TODO: Add proper loading and error states`
    * `TODO: Ensure component correctly fetches and displays all 8 consolidated shipments.`
* **`components/shipments/ShipmentCard.tsx`