## [Unreleased] - YYYY-MM-DD

### Fixed
- Resolved numerous `Error: React Context is unavailable in Server Components` build errors by creating a dedicated `components/providers.tsx` client component to house `SessionProvider`, `ThemeProvider`, and `ToastProvider`, removing them from the root `app/layout.tsx` server component.
- Corrected import paths and instantiation logic in `scripts/test-etd-parser.ts`.
- Marked API routes (`/api/auth/user`, `/api/tracking`) and pages (`/documents/scan`, `/dashboard/shipments`, `/dashboard/shipments/create`) as `dynamic = 'force-dynamic'` to prevent static generation errors (though the root cause was provider context).
- Corrected placement of `'use client'` directive in `/dashboard/shipments/page.tsx` and `/documents/scan/page.tsx`.
- Corrected `Slider` prop name from `onValueChangeCommit` to `onValueCommit` in `components/simulation/SimulationControls.tsx`.

### Added
- Created `components/providers.tsx` to manage global client-side context providers.
- Added `AWAITING_STATUS` to `shipmentStatusEnum` in `lib/database/schema.ts` to represent shipments missing status in source data.
- Created mock JSON scenario files (`idleStartScenario.json`, `midTripScenario.json`, `atDestinationScenario.json`, `awaitingStatusScenario.json`) in `data/mocks/` for simulation testing.
- Created `services/kv/simulationCacheService.ts` to encapsulate interactions with Vercel KV for storing and retrieving transient simulation state, including `getSimulationState` and `setSimulationState` functions.
- Created `services/kv/simulationCacheService.test.ts` with unit tests for KV interactions, mocking `@vercel/kv`.
- Implemented `app/api/simulation/tick/route.ts` API route to handle simulation worker logic triggered by Vercel Queues, including state fetching (KV), calculation (Turf.js), state update (KV), and location persistence (DB).
- Added `startSimulation` Server Action to `lib/actions/simulationActions.ts` to handle initiation of backend simulation state (creates initial state via service, saves to KV, marks as active).
- Implemented `app/api/simulation/enqueue-ticks/route.ts` API route (GET) to be triggered by Cron. Fetches active simulation IDs from KV, checks status, enqueues tick jobs via `fetch` to Vercel Queue endpoint, and cleans up inactive/stale simulations from the active set.

### Changed
- Modified `app/layout.tsx` to use the new `Providers` component.
- Modified `lib/store/useSimulationStore.ts`:
  - `tickSimulation` now ignores vehicles with `AWAITING_STATUS`.
  - `confirmPickupAction` now prevents execution if the selected vehicle has `AWAITING_STATUS`.
- Modified `components/simulation/SimulationControls.tsx` to disable relevant simulation controls (Confirm & Start, Confirm Delivery, Speed Slider, Follow Toggle) when the selected vehicle has `AWAITING_STATUS`.
- Updated `shipmentsErd` table definition in `lib/database/schema.ts` to use `shipmentStatusEnum` for the `status` column instead of `text`.
- Updated `StatusBadge` component within `components/shipments/ShipmentCard.tsx` to correctly display and style the `AWAITING_STATUS` state.
- Updated internal `StatusBadge` component within `components/shipments/ShipmentDetailView.tsx` to correctly display and style the `AWAITING_STATUS` state.
- Updated conditional logic in `app/shipments/[documentid]/page.tsx` to hide the 'View Tracking' button when shipment status is `AWAITING_STATUS`.
- Refactored `SimulationFromShipmentService.createVehicleFromShipment`:
  - Now accepts optional `initialStatus`, `initialTraveledDistance`, `initialBearing` in `SimulationInput`.
  - Imports and uses singleton `MapDirectionsService.getInstance()`.
  - Fetches route via MapDirectionsService if `initialStatus` is 'Idle' and `routeGeometry` is not provided.
  - Calculates initial vehicle position, bearing, and traveled distance based on `initialStatus` and other inputs using Turf.js.
  - Handles errors during route fetching or state calculation.
  - Sets default vehicle position to map center (`[101.6869, 3.1390]`) instead of `[0,0]` for `AWAITING_STATUS` or if origin coordinates are null.
  - Preserves `null` origin/destination coordinates from input instead of falling back to `[0,0]`.
- Modified `app/api/simulation/route.ts` to accept `scenarioFilename` and dynamically read/return the specified mock JSON from `data/mocks/`.
- Modified `app/simulation/page.tsx`:
  - Replaced single load button with specific buttons for each test scenario (Idle Start, Mid-Trip, At Destination, Awaiting Status).
  - Updated handler `handleLoadScenario` to call the API with the selected filename and pass the returned `SimulationInput` to the `loadSimulationFromInput` store action.
- Enhanced `services/kv/simulationCacheService.ts` with functions (`addActiveSimulation`, `removeActiveSimulation`, `getActiveSimulations`) and corresponding unit tests to manage the set of active simulation IDs in Vercel KV.

### Removed
- Removed direct import of `mockSimulationScenarios.json` from `app/api/simulation/route.ts`.
- Removed incorrect subdirectory `data/mocks/testScenarios/`.

### Notes
- **User Concern:** User expressed concern that previous changes related to Toast components might be causing instability or regressions. While current build errors pointed to `SessionProvider`, the context handling refactor addresses all providers. Monitoring Toast behavior during runtime testing is advised.
- **Update:** Despite provider refactoring, the `useToast must be used within a ToastProvider` error persisted specifically during the build of `/documents/scan`. User hypothesizes this indicates potential runtime errors or instability in toast functionality when the application is run via `npm run dev`. Further investigation focused on `app/documents/scan/page.tsx` is required.
- **Additional User Context:** User noted that the 'Scan Document' tab within the main upload dialog component (likely triggered from `/documents`) does not function correctly, preventing switching to the scanner view within that dialog. While the current build error is on the dedicated `/documents/scan` page route, this broken UI behavior might indicate related underlying issues in how scanning components are managed or rendered conditionally, potentially impacting build analysis.
- **Runtime vs. Build Conflict Concern:** User explicitly raised the concern that efforts to fix build errors might be dismantling code structures that were intentionally designed (despite build issues) to ensure correct runtime functionality observed during `npm run dev`. This highlights a potential conflict between build-time static analysis requirements and existing runtime logic.
- **Build Diagnostic:** Build succeeded *only* after commenting out the `useToast()` hook invocation within `app/documents/scan/page.tsx`. This confirms the hook call is the direct trigger for the build failure on this page, despite correct provider setup. Root cause remains unclear (potential build analysis quirk, hook bug, or page-specific conflict).
- **Runtime Testing Results:** `npm run dev` server starts successfully. Core upload functionality confirmed working. However, the "Scan Document" tab in the main upload dialog remains non-functional. This confirms the build error likely stems from issues within the scanning feature's implementation/integration rather than a global provider or simple hook usage problem.
- **Strategy Shift:** Given the persistent build error specifically tied to `useToast` on `/documents/scan` despite correct setup, and the known runtime issues with the related dialog tab, prioritizing runtime debugging of the upload dialog and scan feature integration (`LogisticsDocumentUploader.tsx`) before revisiting the build error.
- **Resolution for Build:** Based on user context that the scan functionality is a placeholder, the `useToast()` hook call and its usages within `app/documents/scan/page.tsx` will remain commented out temporarily. This allows `npm run build` to succeed while acknowledging the scan feature and its associated toast notifications are incomplete and will be addressed during future development.
- **Build Success:** Confirmed `npm run build` completes successfully with `useToast` commented out in `app/documents/scan/page.tsx`. The persistent ESLint config loading error remains but does not block the build.
- **Mock Data Strategy:** Confirmed plan to use existing parsed JSON output (`ParsedShipmentBundle` objects from `.debug_output`) as the mock data source for simulation development, bypassing the need for mock Excel files. Mock data will need origin/destination coordinates and represent in-progress shipments.
- **Parsing Strategy Discussion:** Acknowledged user hypothesis regarding AI parsing for simpler formats (like TXT). While AI is feasible for unstructured/new formats, adapting the existing `ExcelParserService` logic is likely more pragmatic for known TXT formats mirroring handled Excel structures. AI parsing remains a candidate for future OCR/diverse format integration.
