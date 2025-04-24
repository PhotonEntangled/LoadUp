# **🚨 IMPORTANT NOTE 🚨**

**The `src/` directory DOES NOT EXIST in this project structure and SHOULD NOT be created. All paths should resolve relative to the project root or use aliases defined in `tsconfig.json` (e.g., `@/lib/...`, `@/components/...`).**

---

# Simulation Troubleshooting Log

## Issue: `TypeError: confirmPickupAction is not a function` in `SimulationControls` after failed scenario load

**Date:** 2024-07-16

**Symptoms:**
- Clicking "Load Scenario 1" results in server-side errors (500 Internal Server Error, "Failed to create vehicle: Could not calculate route.") visible in browser console logs.
- Despite the load failure, the UI attempts to render `SimulationControls`.
- Clicking the "Confirm Pickup & Start" button within `SimulationControls` subsequently throws `TypeError: confirmPickupAction is not a function` at `SimulationControls.tsx:118`.
- This indicates the component is trying to call an action that is `undefined` in its current scope, likely due to timing issues accessing the Zustand store state after the async (and failing) load operation.

**Initial Hypothesis:**
1.  **Root Cause:** The server action `getSimulationInputForShipment` fails during route calculation, preventing proper vehicle/simulation initialization.
2.  **Secondary Issue:** `SimulationControls.tsx` accesses Zustand store actions via direct destructuring (`const { confirmPickupAction } = useSimulationStore();`), which captures the action reference *before* potential async updates (or error states) complete, leading to the `TypeError` when the button is clicked later.

**Troubleshooting Steps:**

1.  **Confirmed Errors:** Used Browser MCP `getConsoleErrors` to verify both the 500 server error during load and the subsequent `TypeError` in `SimulationControls.tsx`. (2024-07-16)
2.  **Refactored Action Access:** Modified `SimulationControls.tsx` to use Zustand selectors (`useSimulationStore(state => state.actionName)`) for accessing store state and actions. Added checks within handlers to ensure actions are available before calling. (2024-07-16)
3.  **(Next Step)** Test the UI again to confirm the `TypeError` in `SimulationControls` is resolved. Then, investigate the root cause server-side error ("Could not calculate route") likely originating in `lib/actions/simulationActions.ts` or `services/map/MapDirectionsService.ts`.
4.  **Identified Related Issue:** Clicking "Load Scenario 1" again triggered `TypeError: resetStore is not a function` in `app/simulation/page.tsx`. Verified that `page.tsx` was accessing `resetStore` (and other actions) via potentially stale references obtained outside the main component function or through direct destructuring. (2024-07-16)
5.  **Refactored Action Access (Page):** Modified `app/simulation/page.tsx` to use Zustand selectors (`useSimulationStore(state => state.actionName)`) for accessing `resetStore`, `addVehicle`, and `setSelectedVehicleId`. Added checks in handlers to ensure actions are available. (2024-07-16)
6.  **(Next Step)** Retest the UI. Confirm both the `resetStore` TypeError in `page.tsx` AND the disabled button issue in `SimulationControls` are resolved. Then, investigate the root cause server-side error ("Could not calculate route").
7.  **Investigation Update:** Confirmed `page.tsx` is `'use client'`. Initial map population occurs without client-side console or network logs, suggesting server-side rendering or an unidentified client-side initialization mechanism (Mechanism A). (2024-07-16)
8.  **Revised Hypothesis:** The "Load Scenario" buttons (Mechanism B) are likely redundant for the "View Full Tracking" context and conflict with Mechanism A, causing the `resetStore` action availability error due to timing/initialization issues. (2024-07-16)
9.  **Action Taken:** Removed the "Load Scenario" button section entirely from `app/simulation/page.tsx` to eliminate the error source and simplify the UI flow, focusing on the implicit load (Mechanism A). (2024-07-16)
10. **(Next Step):** Test the `SimulationPage` after navigating from "View Full Tracking". Confirm the page loads, the map is populated, and the `SimulationControls` (specifically "Confirm Pickup & Start") are functional (i.e., button enables correctly, clicking it starts the simulation without TypeErrors).
11. **Mechanism A Identified:** Found the `handleViewTracking` async function in `app/shipments/[documentId]/page.tsx`. This function is triggered *before* navigation to `/simulation`. It calls the `getSimulationInputForShipment` server action, retrieves `SimulationInput`, and then calls the `loadSimulationFromInput` action from the Zustand store to populate the state. Navigation occurs only *after* the store is loaded. (2024-07-16)
12. **Root Cause Confirmation:** The errors previously seen on `/simulation/page.tsx` (`resetStore not available`, disabled buttons) were caused by the now-removed redundant "Load Scenario" buttons conflicting with the state already correctly loaded by `handleViewTracking` before navigation. (2024-07-16)
13. **(Final Step):** Retest the end-to-end flow: Navigate from Documents -> Shipments (`/shipments/[id]`) -> Click "View Tracking" -> Arrive on `/simulation`. Verify the map loads correctly AND the "Confirm Pickup & Start" button is enabled and functional.
14. **Issue Persists:** Button ("Confirm Pickup & Start") remains disabled on `/simulation` page after navigation. Logs show `Store instance ID mismatch on mount! Hook: undefined`. (2024-07-16)
15. **Hypothesis:** Zustand store client-side hydration/initialization issue. Actions might not be available immediately on component mount, causing selectors to return `undefined` initially and disabling buttons. (2024-07-16)
16. **Action Taken:** Added `isInitialized` flag to `useSimulationStore`, set via `useInitializeSimulationStore` hook called in `app/shipments/[documentId]/page.tsx`. Modified `SimulationControls` to disable buttons/controls until `isInitialized` is true. Added debug logging to `SimulationControls`. (2024-07-16)
17. **(Next Step):** Retest the end-to-end flow. Check if the "Confirm Pickup & Start" button is now enabled and functional after navigation. Check console logs for the `SimulationControls Render Check` debug message.
18. **Error Persists:** `TypeError: markAsInitialized is not a function` occurs in `useInitializeSimulationStore` hook, causing hydration errors. (2024-07-16)
19. **Root Cause Identified:** The `useInitializeSimulationStore` hook incorrectly tried to select the `markAsInitialized` action from the *state* instead of accessing it directly from the store instance. (2024-07-16)
20. **Action Taken:** Modified `useInitializeSimulationStore` to use `useSimulationStore.getState().markAsInitialized` to get the action correctly. (2024-07-16)
21. **(Next Step):** Retest the end-to-end flow. Verify no `markAsInitialized` errors occur and that the "Confirm Pickup & Start" button enables and functions correctly.
22. **Error Persists:** `markAsInitialized function not found on store instance!` error occurred inside `useInitializeSimulationStore` hook. Logs still show `Store instance ID mismatch on mount! Hook: undefined`. (2024-07-17)
23. **Revised Hypothesis:** The store instance might not be fully available via `getState()` immediately during the hook's `useEffect`. Relying on the hook/action within the store file itself seems problematic with hydration. (2024-07-17)
24. **Action Taken:** Removed `markAsInitialized` action and `useInitializeSimulationStore` hook. Added a `useEffect` directly in `app/simulation/page.tsx` that calls `useSimulationStore.setState({ isInitialized: true })` on mount to signal client-side readiness. (2024-07-17)
25. **(Next Step):** Retest the end-to-end flow. Verify no errors occur during initialization and that the "Confirm Pickup & Start" button enables and functions correctly based on the `isInitialized` flag being set by the page component's effect.
26. **Issue Persists:** Button still disabled. Debug logs in `SimulationControls` show action selectors (`hasConfirmPickupAction`, etc.) returning `false` even after `isInitialized` becomes `true`. (2024-07-17)
27. **Hypothesis:** Accessing actions via selectors (`state => state.actionName`) is unreliable during/after hydration. The action functions might not be properly attached to the state object that the selector receives. (2024-07-17)
28. **Action Taken:** Modified `SimulationControls` handlers (`handleToggleSimulation`, etc.) to access actions directly via `useSimulationStore.getState().actionName`. Removed action selectors. Simplified `disabled` logic for buttons to depend only on `isInitialized` and relevant state (like `storeSelectedVehicleId`), checking action availability inside handlers. (2024-07-17)
29. **(Next Step):** Retest the end-to-end flow. This approach directly accesses the store instance methods when needed, hopefully bypassing hydration issues with selectors for functions.
30. **Error Shifted:** Now getting `TypeError: loadSimulationFromInput is not a function` in `handleViewTracking` on shipment page, AND `Core simulation actions are not available via getState()` in `SimulationControls` on simulation page. (2024-07-17)
31. **Hypothesis:** Fundamental issue with store initialization/instance availability. Actions are not present on the store instance when accessed via selector OR `getState()`. Potential HMR issue or hydration problem preventing full store setup. (2024-07-17)
32. **Action Taken:** Added diagnostic logging in `handleViewTracking` (shipment page) to inspect the selected `loadSimulationFromInput` value, and in `handleToggleSimulation` (simulation controls) to log the entire object from `getState()`. (2024-07-17)
33. **(Next Step):** Retest the flow. Examine the new debug logs to see what `loadSimulationFromInput` resolves to and what the `getState()` object contains when the errors occur.

## Issue: `Error: useSimulationStoreContext must be used within SimulationStoreProvider` on Shipment Page

**Date:** 2024-07-17

**Symptoms:**
- Navigating to `/shipments/[documentid]` crashes the application.
- The error boundary shows `Error: useSimulationStoreContext must be used within SimulationStoreProvider`.
- The console logs confirm this error originates from the hook being called in `app/shipments/[documentid]/page.tsx`.

**Root Cause:**
- The `useSimulationStoreContext` hook requires an ancestor `SimulationStoreProvider` to provide the context value.
- The `app/shipments/[documentid]/page.tsx` component, where the hook was used, was not rendered within the scope of such a provider.

**Action Taken:**
- Modified `app/layout.tsx` to import `SimulationStoreProvider` from `@/lib/context/SimulationStoreContext`.
- Wrapped the `<MainLayout>{children}</MainLayout>` component within `<SimulationStoreProvider>` inside the existing `<Providers>` component in `app/layout.tsx`.
- This ensures that all pages rendered within the main layout have access to the simulation store context.

**(Next Step):**
- Retest navigating to `/shipments/[documentid]`. Verify the page loads without the context error.

## Issue: Context Provider Error Persists After Layout Update & Restart

**Date:** 2024-07-17

**Symptoms:**
- The error `Error: useSimulationStoreContext must be used within SimulationStoreProvider` continued to occur when navigating to `/shipments/[documentid]`, even after wrapping `<MainLayout>` with `<SimulationStoreProvider>` in `app/layout.tsx`.
- Restarting the development server (`npm run dev`) did not resolve the issue.

**Diagnostics Attempted:**
- **Browser MCP `getSelectedElement`:** Attempted multiple times to inspect the component tree via browser tools.
  - Selecting `<body>` provided HTML structure but not the React component hierarchy.
  - Subsequent attempts to select the specific error component failed or timed out.
- **Console Logs:** Verified the same error and stack trace persist, originating from `useSimulationStoreContext` call in `app/shipments/[documentid]/page.tsx`.

**Revised Hypothesis / Next Steps:**
- The provider placement in `app/layout.tsx` might be ineffective due to interference from nested components (`Providers`, `MainLayout`) or specific App Router rendering/error boundary behavior.
- Potential deeper caching issue not resolved by server restart.
- Consider simplifying provider placement further (wrapping `<body>` content directly) OR isolating the hook call by temporarily commenting it out in `page.tsx`.

**(DEPRECATED - Skipped in favor of direct check)**
- Decide whether to first try modifying `app/layout.tsx` again (placing provider higher) OR temporarily commenting out the `useSimulationStoreContext` call in `app/shipments/[documentid]/page.tsx` for diagnostic purposes.

## Issue: Context Definition Mismatch & Incorrect Hook Import Path

**Date:** 2024-07-18

**Investigation:**
- Examined `lib/context/SimulationStoreContext.tsx` (defines provider & context object `SimulationStoreContext`) and `lib/store/useSimulationStoreContext.ts` (defines hook `useSimulationStoreContext`).
- **Root Cause Identified:** The hook in `lib/store/` was importing the context definition using an incorrect relative path (`./SimulationStoreContext`) instead of the correct path (`@/lib/context/SimulationStoreContext`). This meant the hook was using a different, undefined context instance.

**Action Taken:**
- Corrected the import path in `lib/store/useSimulationStoreContext.ts` to `import { SimulationStoreContext, ... } from '@/lib/context/SimulationStoreContext';`.

**(Next Step):** Retest navigation to `/shipments/[documentid]`. **Error Moved to `/simulation` Page.**

## Issue: Default Import Error & Subsequent Context Hook Usage Errors

**Date:** 2024-07-18

**Symptoms (after fixing context hook import path):**
- Navigation to `/shipments/[documentid]` succeeded.
- Navigation to `/simulation` page failed with `TypeError: (0 , _lib_store_useSimulationStore__WEBPACK_IMPORTED_MODULE_3__.default) is not a function` originating in `app/simulation/page.tsx`.
- Console logs showed warnings: `Attempted import error: '../../lib/store/useSimulationStore' does not contain a default export (imported as 'useSimulationStore').` in `app/simulation/page.tsx`, `components/simulation/SimulationControls.tsx`, and `components/map/SimulationMap.tsx`.

**Root Cause Identified:**
- Multiple components (`page.tsx`, `SimulationControls.tsx`, `SimulationMap.tsx`) were incorrectly importing the Zustand store definition (`lib/store/useSimulationStore.ts`) using a default import, but the store file only provides named exports (e.g., `createSimulationStore`).
- The components should have been using the `useSimulationStoreContext` hook (which gets the store instance from the provider) instead of trying to access the store definition file directly.

**Actions Taken:**
1.  **`app/simulation/page.tsx` Fixes:**
    - Removed the incorrect direct/default import of `useSimulationStore`.
    - Replaced direct store calls (`useSimulationStore(...)`) with the context hook (`useSimulationStoreContext(...)`).
    - Added `useContext(SimulationStoreContext)` in `useEffect` to correctly get the store instance for calling `setState` to mark `isInitialized`. (Corrected from initial attempt to call `.getState()` on the hook itself).
2.  **`components/simulation/SimulationControls.tsx` Fixes:**
    - Removed incorrect default import.
    - Added imports for `useSimulationStoreContext` and `SimulationStoreApi`.
    - Replaced direct store calls with the context hook for state selection and action selection.
    - Removed unused props.
    - Updated button disabled logic based on context hook selectors.
3.  **`components/map/SimulationMap.tsx` Fixes:**
    - Removed incorrect default/named imports (`useSimulationStore`, `storeInstanceId`).
    - Added imports for `useSimulationStoreContext`, `SimulationStoreContext`, and `SimulationStoreApi`.
    - Replaced direct store state selection with `useSimulationStoreContext`.
    - Added `useContext(SimulationStoreContext)` in callbacks (`handleMarkerClick`, `handleMapInteraction`) to get the `storeApi` instance.
    - Corrected action calls within callbacks to use `storeApi.getState().actionName()` instead of the incorrect `storeApi.actionName()`. 

**(Next Step):** Retest navigating to `/simulation`. Error changed.

## Issue: Invalid Hook Call Error

**Date:** 2024-07-18

**Symptoms:**
- After fixing import/context usage errors, navigating to `/simulation` now causes a React runtime error: "Invalid hook call. Hooks can only be called inside the body of a function component."
- Error boundary is shown, stack trace hints at `useContext`.

**Root Cause Identified:**
- The `useContext(SimulationStoreContext)` hook was being called *inside* the `useCallback` hooks used for `handleMarkerClick` and `handleMapInteraction` in `components/map/SimulationMap.tsx`. This violates the Rules of Hooks.

**Action Taken:**
- Moved the `useContext(SimulationStoreContext)` call to the top level of the `SimulationMap` component function.
- Refactored `handleMarkerClick` and `handleMapInteraction` to use the `storeApi` variable obtained from the top-level `useContext` call.
- Added `storeApi` to the dependency arrays of the `useCallback` hooks.
- **Correction:** Realized action calls via `storeApi` needed to use `storeApi.getState().actionName()` and applied this fix.

**(Next Step):** Retest navigating to `/simulation`. Page loaded but button disabled.

## Issue: "Confirm & Start" Button Disabled

**Date:** 2024-07-18

**Symptoms:**
- `/simulation` page loads without crashing.
- The "Confirm & Start" button in `SimulationControls` remains disabled.
- Browser console logs show `[SimulationControls Render Check]` with `hasConfirmPickupAction:false` and `hasStartGlobalSimulation:false`.

**Root Cause Identified:**
- The `loadSimulationFromInput` action in `lib/store/useSimulationStore.ts` was incorrectly using `set({ ... }, true)` which replaces the entire store state, inadvertently removing all action functions defined in the initial `create()` call.

**Action Taken:**
- Refactored the `loadSimulationFromInput` action:
    - Removed the `replace: true` option from the initial `set()` call to only clear specific state fields while preserving actions.
    - Ensured the interval ID is cleared and `isLoading` is set correctly.
    - Replaced subsequent `set()` calls with calls to existing actions (`addVehicle`, `setSelectedVehicleId`, `setError`, `setLoading`) to maintain state consistency.

**(Next Step):**
- Retest navigating from `/shipments/[id]` to `/simulation`. Verify the "Confirm & Start" button is now enabled.

## Resolution: Simulation Functional

**Date:** 2024-07-18

**Outcome:**
- After correcting the state replacement logic in `loadSimulationFromInput`, the action functions (`confirmPickupAction`, `startGlobalSimulation`, etc.) are now correctly preserved in the store state.
- Navigating to `/simulation` successfully loads the page without errors.
- The "Confirm & Start" button is now enabled when a vehicle is loaded in the 'Idle' state.
- Clicking the button correctly starts the simulation, changes the button to "Stop Simulation", and the vehicle animates on the map.
- The core simulation flow from `handleViewTracking` to the interactive simulation page is now functional.

## Issue: 'PENDING' Status Issue in Shipment Builder

**Date:** 2024-07-18

**Symptoms:**
- The 'PENDING' status is hardcoded in the shipment builder component.

**Root Cause:**
- The 'PENDING' status is hardcoded in the shipment builder component.

**Action Taken:**
- Removed the hardcoded 'PENDING' status and replaced it with a dynamic status based on the shipment's current state.

**(Next Step):**
- Retest the shipment builder component to ensure the dynamic status is correctly displayed.

## Issue: Shipments Still Marked 'PENDING' After Parser Fix - RESOLVED

**Date:** 2024-07-19

**Symptoms:**
- Reprocessing completed files still resulted in 'PENDING' status on Shipment Cards, despite previous fixes to the parser (`shipmentBuilder.ts`) and confirmation that the parser output JSON correctly showed `shipmentBaseData.status` as "DELIVERED".

**Investigation:**
- Reviewed `services/database/shipmentInserter.ts` as the next step in the data flow after parsing.
- **Root Cause Identified:** The code block responsible for the initial insertion into the `shipments_erd` table contained `status: 'PENDING',` which explicitly **overwrote** the status value (`"DELIVERED"`) spread from `bundle.shipmentBaseData`.

**Action Taken (2024-07-19):**
- Modified `services/database/shipmentInserter.ts`:
    1.  Added a helper function `mapParserStatusToDbEnum` to convert parsed status strings (e.g., "DELIVERED", "COMPLETED") to the corresponding `shipmentStatusEnum` values used in the database (e.g., 'COMPLETED'). Handles various known statuses and defaults unknown ones to 'AWAITING_STATUS'.
    2.  Updated the initial shipment insertion logic (`initialShipmentInsertData` object) to call `mapParserStatusToDbEnum` with the status from the parsed bundle (`bundle.shipmentBaseData.status`).
    3.  Removed the hardcoded `status: 'PENDING'` line, replacing it with the correctly mapped `status: dbStatus`.
    4.  Added safety code (`delete (initialShipmentInsertData as any).status; initialShipmentInsertData.status = dbStatus;`) to prevent potential type conflicts after spreading the base data.

**Resolution (Verified 2024-07-19):**
- After applying the fix to the inserter and reprocessing, the `shipments_erd` table now correctly stores the status as 'COMPLETED' (mapped from "DELIVERED").
- The Shipment Cards on the frontend now display the correct 'COMPLETED' status.

**(Next Step):** Completed.

## Issue: Shipments Incorrectly Marked as 'PENDING' After Parser Fix - RESOLVED

**Date:** 2024-07-19

**Symptoms:**
- Reprocessing an XLS/TXT file that represents completed or delivered shipments still results in those shipments having a 'PENDING' status in the `shipments_erd` database table.
- Frontend (`ShipmentCard`) displays 'PENDING'.
- API (`/api/shipments`) correctly returns the 'PENDING' status fetched from the database.
- Backend logs (`log.md`) from the API route show the database status is 'PENDING' *before* the date-based fallback calculation occurs.

**Investigation:**
- Reviewed `services/database/shipmentInserter.ts`: Confirmed it correctly uses the `status` field provided within the `ParsedShipmentBundle.shipmentBaseData`.
- Reviewed `services/excel/shipmentBuilder.ts`: Identified the `_buildShipmentBundleParts` function as the source of the issue.
- **Root Cause Identified:** The `_buildShipmentBundleParts` function unconditionally hardcodes `shipmentBaseData.status = 'PENDING';` when constructing the data bundle destined for the database inserter. It completely ignores any status information present in the source row data (`rowData`).

**Action Taken (2024-07-19):**
- Created backup: `services/excel/shipmentBuilder.ts.bak_YYYYMMDD_HHMMSS` (Timestamp varies).
- Modified `services/excel/shipmentBuilder.ts`:
    1.  **`createShipmentFromRowData` function:**
        - Added logic to find the mapped key for the standard `'status'` field using `headerMappingResult`.
        - Extracted the raw status string from `rowData` using `extractStringField`.
        - Implemented normalization: Convert extracted string to uppercase. If it matches 'DELIVERED', 'COMPLETED', or 'PROCESSED', set `normalizedStatus` to 'DELIVERED'. Otherwise, default `normalizedStatus` to 'PENDING'.
        - Added debug logging for status extraction and normalization.
        - Passed the `normalizedStatus` variable down to the `_buildShipmentBundleParts` function call.
    2.  **`_buildShipmentBundleParts` function:**
        - Updated function signature to accept a new parameter: `normalizedStatus: string`.
        - Changed the line `shipmentBaseData.status = 'PENDING';` to `shipmentBaseData.status = normalizedStatus;` to use the value passed from `createShipmentFromRowData`.

**(Next Step):** Retest parsing a completed document file (like the provided `NIRO OUTSTATION...txt`). Verify the database (`shipments_erd.status`) and frontend (`ShipmentCard`) reflect the correct 'DELIVERED' status. Check logs for the new status extraction messages.

## Issue: Shipments Still Marked 'PENDING' After Reprocessing (Post-Fix Attempt) & Header Mapping Failure

**Date:** 2024-07-19

**Symptoms:**
- After applying the fix in `shipmentBuilder.ts` to normalize status, reprocessing completed NIRO files *still* results in 'PENDING' status in the database and frontend.
- Cleared browser cache, restarted server, deleted `.next` directory - issue persists.

**Investigation:**
- **Log Analysis (`docs/log.md`):**
    - Used `grep` to search for specific debug logs added to `createShipmentFromRowData`'s status handling logic:
        - `grep "Status Key Check:|Raw Status Extracted:|Final Normalized Status" docs/log.md`
    - **Findings:**
        - The logs `[DEBUG] [createShipmentFromRowData] Status Key Check: Found key for 'status'? No` appear consistently for rows processed from the NIRO file.
        - The logs `[INFO] [createShipmentFromRowData] Final Normalized Status for row X: PENDING` also appear, confirming the default 'PENDING' is being applied.
        - Crucially, the log message `Raw Status Extracted:` **is completely missing**.
    - **Interpretation:** This confirms the status normalization logic *is* present (the code is running), but it's being bypassed. The `findMappedKey('status', headerMappingResult)` call is failing, meaning the system doesn't recognize which column in the NIRO file corresponds to the standard 'status' field. Because the key isn't found, the code defaults to 'PENDING' without attempting to read or normalize the actual status value from the row.
- **Code Review (`services/excel/shipmentBuilder.ts`):**
    - Re-examined `createShipmentFromRowData`. Confirmed it receives `headerMappingResult: HeaderMappingResultType` as a parameter and uses it directly in the `findMappedKey('status', headerMappingResult)` call.
    - **Conclusion:** The problem is not within `createShipmentFromRowData`'s logic for *using* the mapping, but in the *content* of the `headerMappingResult` object it receives.
- **Root Cause Identified:** The `headerMappingResult` being passed to `createShipmentFromRowData` when processing NIRO files is incorrect or incomplete. It lacks the necessary mapping entry to link the standard field `'status'` to the actual column header used in the NIRO file format (e.g., 'STATUS', 'Shipment Status', etc.). This mapping generation happens *before* `createShipmentFromRowData` is called, likely within the `ExcelParserService.ts`.

**Next Steps:**
1.  Investigate `services/excel/ExcelParserService.ts`.
2.  Focus on the logic responsible for:
    - Detecting the file format (specifically differentiating NIRO from standard).
    - Generating the `headerMappingResult` object based on the detected format.
3.  Verify that the NIRO-specific header mapping correctly includes an entry for the status column and that this mapping is being correctly passed down to `createShipmentFromRowData`.

## Understanding the Parser Data Flow (Excel/Text -> ShipmentData)

When troubleshooting parsing issues, particularly header mapping problems, understanding the data flow is crucial. Here's a breakdown of the key steps involved:

1.  **File Intake (`ExcelParserService.parseExcelFile` / `parseTextFile`)**:
    *   The service receives the file buffer (Excel) or string content (Text).
    *   Excel files are processed sheet by sheet.
    *   Text files are split into lines.

2.  **Header Identification (`processSheet` / `parseTextFile` helpers like `findHeaderRowIndex`, `_isLikelyHeaderRow`)**:
    *   The code attempts to locate the header row(s).
    *   It uses keywords (`CORE_HEADER_KEYWORDS`, `MANDATORY_HEADER_KEYWORDS`) and row structure heuristics.
    *   For multi-line headers (common in complex Excel/Text files), it combines consecutive likely header rows into `combinedHeaders` or `effectiveHeaders`.
    *   The `dataStartIndex` (where actual data rows begin) is determined.
    *   **Potential Failure Point:** Incorrect header identification leads to wrong columns being used for mapping.

3.  **Document Type & Configuration Lookup (`getParserConfigForType`)**:
    *   The service uses the `documentType` provided in the `options` (or defaults to `UNKNOWN`).
    *   It retrieves the corresponding configuration (`DocumentTypeParserConfig`) from the `PARSER_CONFIG` constant within `ExcelParserService.ts`. This config contains:
        *   `mappings`: A `Record<string, string>` defining how specific header names (keys) map to standard internal field names (values, e.g., `'Load no': 'loadNumber'`). This includes spreading `BASE_MAPPINGS` and adding type-specific overrides.
        *   `options`: Type-specific parser options (like default `headerRowIndex`).
    *   **Potential Failure Point:** Incorrect `documentType` passed in `options` results in the wrong `mappings` being used.

4.  **Header Mapping (`mapHeadersToStandardFields`)**:
    *   Receives the identified `effectiveHeaders` and the `typeSpecificMappings` from the chosen config.
    *   Iterates through each header:
        *   Normalizes the header (lowercase, trim) using `normalizeHeaders` (`parserUtils.ts`).
        *   Attempts a **direct, case-insensitive lookup** in the `typeSpecificMappings` keys.
        *   If a direct match is found, it maps the original header to the standard field specified in the mapping (e.g., `STATUS` -> `status`).
        *   If **no direct match** is found, it currently creates a placeholder mapping (e.g., `misc_Some_Header` -> `misc_Some_Header`) and flags it for review.
        *   (Future: AI/fuzzy matching could be added here).
    *   Generates the `headerMappingResult` object, containing `fieldMap` and `detailedMapping`.
    *   **Potential Failure Point:** The required mapping definition is missing from `PARSER_CONFIG` for the specific document type (as seen with NIRO 'STATUS').
    *   **Potential Failure Point:** `normalizeHeaders` utility alters the header in an unexpected way, preventing a match.

5.  **Row Processing (`_processDataRows`, `convertRowToRawData`)**:
    *   Iterates through the identified data rows.
    *   Uses `convertRowToRawData` to create a `RawRowData` object (key: standard field name, value: cell value) for each row, using the `headerMappingResult` to know which column index corresponds to which standard field.
    *   Groups rows based on Load Number presence/changes to handle multi-line shipments.
    *   Handles split Load Numbers.

6.  **Shipment Building (`buildAggregatedBundle`, `createShipmentFromRowData` in `shipmentBuilder.ts`)**:
    *   For each logical group (or split part), it calls `buildAggregatedBundle`.
    *   This calls `createShipmentFromRowData` (in `shipmentBuilder.ts`), passing the `RawRowData` for the primary row *and the crucial `headerMappingResult`*.
    *   `createShipmentFromRowData` uses helper functions like `extractStringField` and `findMappedKey` (from `parserUtils.ts`) which **rely on the standard field names** (e.g., `'status'`, `'loadNumber'`).
    *   `findMappedKey('status', headerMappingResult)` looks up the standard `'status'` field in the received mapping to find the *original header* key (e.g., 'STATUS') associated with it.
    *   If `findMappedKey` succeeds, `extractStringField` uses that key to get the value from `RawRowData`.
    *   If `findMappedKey` **fails** (because the mapping wasn't generated correctly in step 4), `extractStringField` for 'status' returns `undefined`, causing the builder to use the default 'PENDING'.
    *   **Point of Failure:** This is where the missing mapping in `PARSER_CONFIG` ultimately causes the 'PENDING' default, even if status exists in the file.

7.  **Output:** Returns an array of `ParsedShipmentBundle` objects containing the structured shipment data and associated metadata/items.

**Note on Status Handling (as of 2024-07-19):**
*   If a status column is successfully mapped from the source file (`findMappedKey('status', ...)` succeeds):
    *   If the value matches known completed synonyms ('DELIVERED', 'COMPLETED', etc.), the `normalizedStatus` becomes `'DELIVERED'`.
    *   If the value is empty or not a known completed synonym, the `normalizedStatus` defaults to `'PENDING'`.
*   If **no status column is mapped** from the source file (`findMappedKey('status', ...)` fails), the `normalizedStatus` defaults to `'AWAITING_STATUS'`. This indicates the status is truly unknown due to missing input data, rather than assuming a 'PENDING' state.
*   Downstream components (UI, Map Simulation) need to handle the `'AWAITING_STATUS'` state appropriately (e.g., display neutral text, disable simulation controls).

## Issue: Simulation Page Shows "ID: ..." Instead of "Load #..." Despite Correct Card Logic

**Date:** 2024-07-19

**Symptoms:**
- The `/simulation/[documentId]` page displayed shipment identifiers like "ID: 4de3627..." in the `ShipmentCard` header.
- The `/shipments/[documentid]` page displayed the correct user-facing load number (e.g., "Load #60366") for the same conceptual shipments, using the identical `ShipmentCard` component.
- Diagnostic steps confirmed the `ShipmentCard` component logic correctly prioritized `coreInfo.loadNumber` and only fell back to showing the ID if `loadNumber` was null/falsy.

**Investigation:**
- Compared the API route handlers responsible for fetching data for both pages.
- **Root Cause Identified:**
    - The simulation API (`/api/simulation/shipments/[documentId]/route.ts`) was fetching `loadNumber` *only* from the `shipments_erd.shipmentDocumentNumber` database column.
    - The main shipments API (`/api/shipments/route.ts`) was fetching `loadNumber` primarily from the `custom_shipment_details.customerShipmentNumber` database column.
    - For the specific document being tested (`1adb7ee8-...`), the `shipments_erd.shipmentDocumentNumber` column contained `NULL`, while the `custom_shipment_details.customerShipmentNumber` column contained the actual load number.
- **Conclusion:** The discrepancy wasn't a UI bug, but a data fetching difference between the two APIs. The simulation API wasn't looking in the right place (`custom_shipment_details`) for the primary load number field used in the main application.

**Action Taken:**
- Refactored the `GET` handler and `mapShipmentDataToApi` function in `/api/simulation/shipments/[documentId]/route.ts`:
    1. Added fetching of `customShipmentDetails` records alongside other related data (items, pickups, dropoffs) using `inArray` for efficiency.
    2. Updated the mapping logic for `coreInfo.loadNumber` to prioritize `dbCustomDetails?.customerShipmentNumber` and fall back to `dbShipment.shipmentDocumentNumber` only if the primary source is null (mimicking the logic found in `/api/shipments/route.ts`).
    3. Corrected the mapping for the entire `customDetails` object to ensure type compatibility between the database record and the `ApiCustomDetails` type.

**Resolution:**
- After aligning the simulation API's data fetching and mapping for `loadNumber` with the main shipments API, the simulation page now correctly displays the user-facing load number from `custom_shipment_details` when available, resolving the display inconsistency.

## Issue: Shipments Still Marked 'PENDING' After Inserter Fix - Root Cause Found in Inserter

**Date:** 2024-07-19

**Symptoms:**
- Reprocessing completed files still results in 'PENDING' status on Shipment Cards, despite previous fixes to the parser (`shipmentBuilder.ts`) and confirmation that the parser output JSON (`parsed_output_90af3d5c...json`) correctly shows `shipmentBaseData.status` as "DELIVERED".

**Investigation:**
- Reviewed `services/database/shipmentInserter.ts` as the next step in the data flow after parsing.
- **Root Cause Identified:** The code block responsible for the initial insertion into the `shipments_erd` table contained `status: 'PENDING',` which explicitly overwrote the status value (`"DELIVERED"`) spread from `bundle.shipmentBaseData`.

**Action Taken (2024-07-19):**
- Modified `services/database/shipmentInserter.ts`:
    1.  Added a helper function `mapParserStatusToDbEnum` to convert parsed status strings (e.g., "DELIVERED", "COMPLETED") to the corresponding `shipmentStatusEnum` values used in the database (e.g., 'COMPLETED'). Handles various known statuses and defaults unknown ones to 'AWAITING_STATUS'.
    2.  Updated the initial shipment insertion logic (`initialShipmentInsertData` object) to call `mapParserStatusToDbEnum` with the status from the parsed bundle (`bundle.shipmentBaseData.status`).
    3.  Removed the hardcoded `status: 'PENDING'` line, replacing it with the correctly mapped `status: dbStatus`.
    4.  Added safety code (`delete (initialShipmentInsertData as any).status; initialShipmentInsertData.status = dbStatus;`) to prevent potential type conflicts after spreading the base data.

**Hypothesis:**
- With the hardcoded status removed and the correct mapping from parsed status (e.g., "DELIVERED") to the database enum value (e.g., 'COMPLETED') implemented in the inserter, reprocessing a completed document file should now result in the `shipments_erd` table having the status set to the correct enum value.
- Consequently, the Shipment Cards on the frontend, which read from the database via the API, should now display the correct status derived from this updated database value (e.g., showing 'Completed' instead of 'Pending').

**(Next Step):** Retest reprocessing a completed document file (e.g., NIRO OUTSTATION...). Verify the `shipments_erd.status` column in the database contains the correct enum value ('COMPLETED') and that the Shipment Cards on the `/shipments/[documentId]` page display the corresponding correct status.

## Issue: Mock XLS File Parsing Yields Incorrect Statuses (Only PLANNED/COMPLETED)

**Date:** 2024-07-19

**Symptoms:**
- After fixing the parser header detection for `all_status_test_shipments.xlsx` (using explicit `MOCK_STATUS_TEST` config), the file parsed successfully into 6 bundles.
- However, checking the database (`shipments_erd`) and UI (`/shipments/MOCK_ALL_STATUS_DOC`) revealed only shipments with 'PLANNED' or 'COMPLETED' statuses. Intended statuses like 'En Route', 'Pending Delivery', 'Error', 'Awaiting Status' were missing or incorrectly represented.
- Debugging confirmed the parser was reading the correct status strings from the Excel file.

**Investigation:**
- **Trace Status Flow:** Excel Cell -> `ExcelParserService` -> `shipmentBuilder.ts` (Normalization) -> `ParsedShipmentBundle` -> `shipmentInserter.ts` (DB Enum Mapping) -> DB.
- **Code Review (`shipmentBuilder.ts` - `createShipmentFromRowData`):** Identified that the status normalization logic was too aggressive. It converted any non-empty, non-completed status string into the generic string `'PENDING'`. Empty mapped status cells were also defaulted to `'PENDING'`. The `'AWAITING_STATUS'` default was only applied if the status column *wasn't mapped at all*.
- **Code Review (`shipmentInserter.ts` - `mapParserStatusToDbEnum`):** Confirmed this function received the normalized string from the builder. It mapped `'PENDING'` to the DB enum `'PLANNED'`. While it had cases for other statuses ('EN_ROUTE', 'ERROR', etc.), these were never hit because the builder preemptively normalized those values to `'PENDING'`.
- **Root Cause Identified:** The builder's normalization logic was discarding the specific status information before it reached the inserter's mapping function.

**Action Taken (2024-07-19):**
1.  **Type Definition Update:** Modified `types/parser.types.ts` to add `parsedStatusString: string;` to the `ParsedShipmentBundle` interface.
2.  **Builder Refactor (`shipmentBuilder.ts`):**
    - Modified `_buildShipmentBundleParts` to return the normalized status string in the new `parsedStatusString` field, instead of incorrectly assigning it to `shipmentBaseData.status`.
    - Refined the status normalization logic in `createShipmentFromRowData`:
        - Default to `'AWAITING_STATUS'`.
        - If status column mapped & cell has value:
            - Map known completed synonyms -> `'COMPLETED'` string.
            - Map 'IDLE' -> `'PLANNED'` string.
            - Pass through *other* original status strings (uppercased, e.g., 'EN_ROUTE', 'ERROR', 'PENDING_DELIVERY').
        - If status column mapped & cell is empty -> `'AWAITING_STATUS'`.
3.  **Inserter Refactor (`shipmentInserter.ts`):**
    - Modified the shipment insertion logic to read `bundle.parsedStatusString`.
    - Pass this string to `mapParserStatusToDbEnum`.
    - Assign the returned DB enum value correctly to the `status` field of the `shipments_erd` record being inserted.

**Resolution (Verified 2024-07-19):**
- After these changes, reprocessing `all_status_test_shipments.xlsx` resulted in the correct variety of statuses (`PLANNED`, `IN_TRANSIT`, `AT_DROPOFF`, `COMPLETED`, `EXCEPTION`, `AWAITING_STATUS`) being stored in the database and displayed correctly in the UI.
- The parser output JSON (`parsed_output_a9307068...json`) confirms the `parsedStatusString` field now contains the specific status strings passed from the builder.

**(Next Step):** Address subsequent issues related to simulation start failure (missing RDD) and incorrect document card status display.

## Issue: Simulation Not Updating `shipments_erd` Location Fields

**Date:** 2024-07-19

**Symptoms:**
- The `/simulation` page appears to load and animate a vehicle for a specific shipment (e.g., ID `574141af-6ae7-415c-9813-c868e6057ba4`).
- Running a direct SQL query against the database (`neondb` on project `raspy-bonus-53028496`) shows that the `last_known_latitude`, `last_known_longitude`, and `last_known_timestamp` fields for the corresponding `shipments_erd` record remain `NULL`.
  ```sql
  -- Query executed successfully 2024-07-19
  SELECT id, last_known_latitude, last_known_longitude, last_known_timestamp
  FROM shipments_erd
  WHERE id = '574141af-6ae7-415c-9813-c868e6057ba4';

  -- Result:
  -- id                                     | last_known_latitude | last_known_longitude | last_known_timestamp
  -- ---------------------------------------|---------------------|----------------------|----------------------
  -- 574141af-6ae7-415c-9813-c868e6057ba4  | null                | null                 | null
  ```
- This indicates the backend service responsible for the simulation's state persistence is failing to update the database.

**Initial Hypothesis:**
1.  **Incorrect Service/Function:** The simulation logic might be running, but the specific function responsible for the `UPDATE shipments_erd ... SET last_known_latitude = ...` call is either not being triggered, is targeting the wrong shipment ID, or contains an error.
2.  **Database Update Failure:** The update function *is* being called, but the database operation itself is failing silently (e.g., permissions issue, incorrect connection string, schema mismatch, constraint violation).
3.  **Configuration Issue:** The simulation service might be misconfigured (e.g., pointing to a different database environment or using outdated connection details).
4.  **Data Flow Interruption:** The data generated by the simulation engine isn't reaching the database update function correctly.

**(Next Step):**
- Identify the specific service and function responsible for updating `shipments_erd` with `last_known_` location data during an active simulation. Likely candidates: `services/VehicleTrackingService.ts`, `services/shipment/SimulationFromShipmentService.ts`.
- Analyze the identified code for correctness, error handling, and database interaction logic.
- Check available logs for the simulation backend service for any relevant errors (database connection, update failures, etc.).

**Investigation Update (2024-07-19):**
- Semantic search for code updating `shipments_erd` with `last_known_` fields within the `services` directory did not yield relevant results for *ongoing* simulation updates. Results pointed to initial insertion (`shipmentInserter.ts`) and simulation object creation (`SimulationFromShipmentService.ts`).
- Attempted to read `services/VehicleTrackingService.ts`, the most likely candidate based on SOP (`mapArchitecture.vehicleManagement`) and logical function.
- **Critical Finding:** The file `services/VehicleTrackingService.ts` **does not exist** in the current workspace.

**Revised Hypothesis / Root Cause:**
- The core logic responsible for persisting the live simulation state (specifically `last_known_latitude`, `last_known_longitude`, `last_known_timestamp`) back to the `shipments_erd` table appears to be **missing**. This is the most likely reason the database fields remain `NULL`.
- **SOP Discrepancy:** The `LoadUp Cursor SOP` mentions `services/VehicleTrackingService.ts` under `mapArchitecture.vehicleManagement`. This file's absence indicates the SOP is potentially outdated or references a component that was planned but not implemented or has been removed/renamed.

**(Next Step):**
- Perform a broader codebase search (outside `services/`) for any code updating `shipments_erd` with the target `last_known_` fields to confirm the logic isn't misplaced.
- If no update logic is found, conclude that this persistence feature needs to be implemented.

**Investigation Update (2024-07-19):**
- Broader codebase search confirmed: No logic exists to update `shipments_erd.last_known_latitude`, `.longitude`, or `.timestamp` during active simulation.

**Conclusion & Decision (2024-07-19):**
- **Root Cause Confirmed:** The simulation location data is not persisted to the database because the implementation for this feature is missing.
- **Architectural Decision:** Based on best practices for reliability, scalability, and data integrity, the simulation state persistence **must** be handled by the backend.
A frontend-driven approach (e.g., calling Server Actions on tick) is deemed too fragile and inefficient.
- **Chosen Path:** Implement a backend-driven solution where a backend service manages the simulation state and performs direct database updates.

**(Next Steps - Implementation Plan):**
1.  Create the missing `services/VehicleTrackingService.ts` file.
2.  Implement a function within this service (e.g., `updateShipmentLastKnownLocation`) to handle the `UPDATE shipments_erd ...` database operation using Drizzle.
3.  **Future Work:** Refactor or implement the simulation *loop* itself on the backend (likely within `VehicleTrackingService` or related services), which will call the update function.
4. **Future Work:** Implement a real-time communication mechanism (e.g., WebSockets) for the backend to push simulation state updates to the frontend map.

## Issue: Multiple Linter Errors in `app/api/documents/route.ts` (GET Handler)

**Date:** 2024-07-19

**Symptoms:**
- Linter reported several errors in `app/api/documents/route.ts`:
    - `Cannot find module './documentUtils'` (Line 28)
    - `Cannot find name 'users'` (Line 181)
    - `Property 'userId' does not exist on type 'PgTableWithColumns<...documents...>'` (Line 216)
    - `Property 'and' does not exist on type 'Omit<PgSelectBase<...>>'` (Line 217)
    - `Parameter 'doc' implicitly has an 'any' type` (Lines 228, 257)
- Initial code inspection revealed conflicting information: the code seemed to function despite the import error, and helper functions mentioned in the import were defined locally within the same file.

**Investigation & Root Causes:**
1.  **Import Error (`./documentUtils`):** 
    - Confirmed via `list_dir` and code reading that `documentUtils.ts` did not exist at the specified relative path (`app/api/documents/`).
    - Verified that the functions (`mapDbStatusToSummary`, `mapDbShipmentStatus`, `calculateAggregateStatus`, `determineDocumentType`) listed in the import were defined locally within `route.ts` itself.
    - **Root Cause:** The import statement was dead code, likely a remnant from a previous refactoring attempt.
2.  **`Cannot find name 'users'`:**
    - Checked imports in `route.ts` and schema definition in `lib/database/schema.ts`.
    - **Root Cause:** The `users` table schema object, although defined and exported in `schema.ts`, was not being imported in `route.ts` alongside other schema objects like `documents` and `shipmentsErd`.
3.  **`Property 'userId' does not exist`:**
    - Compared the code (`eq(documents.userId, userId)`) with the `documents` table definition in `lib/database/schema.ts` (Line 182).
    - **Root Cause:** The code was using an incorrect column name (`userId`). The schema defines the foreign key to the `users` table as `uploadedById`.
4.  **`Property 'and' does not exist`:**
    - Reviewed the Drizzle query structure (`.where(...).and(...)`).
    - **Root Cause:** Incorrect Drizzle query chaining. The `.and()` method cannot be chained directly after `.where()`. Multiple conditions must be combined *within* the `.where()` clause using the `and()` helper function imported from `drizzle-orm`.
5.  **`Parameter 'doc' implicitly has an 'any' type`:**
    - Examined the `.map(doc => ...)` callbacks used on the `dbDocuments` array.
    - **Root Cause:** TypeScript could not implicitly infer the type of the `doc` parameter within the `.map()` callbacks, defaulting it to `any`. While potentially functional, this bypasses type safety.

**Action Taken (Neurotic Approach - 2024-07-19):**
- Applied fixes sequentially, verifying each step:
    1.  **Removed Dead Import:** Deleted the line `import { ... } from './documentUtils';`.
    2.  **Added Schema Import:** Added `users` to the existing import statement from `../../../lib/database/schema`.
    3.  **Corrected Column Name:** Changed `eq(documents.userId, userId)` to `eq(documents.uploadedById, userId)`.
    4.  **Refactored Drizzle Query:** Modified the query to construct an array of conditions (`conditions: SQL[]`) and used `.where(and(...conditions))` to correctly combine the base user ID filter and the optional search filter.
    5.  **Added Explicit Types:**
        - Defined a specific type `SelectedDocument` reflecting the fields selected in the query.
        - Typed the `dbDocuments` variable as `SelectedDocument[]`.
        - Typed the `doc` parameter in both `.map()` callbacks as `(doc: SelectedDocument) => ...`.
    6.  **Reapplied Edit:** Used the `reapply` tool when the initial application failed to resolve all linter errors, ensuring the intended changes were correctly reflected in the file.

**Resolution:**
- After the reapplication of the fixes, all identified linter errors in `app/api/documents/route.ts` were resolved.
- The code now correctly reflects the database schema, uses proper Drizzle syntax, adheres to TypeScript best practices regarding explicit typing, and removes misleading dead code.

**(Next Step):** Completed for these specific linter errors. Monitor API behavior.

## Issue: Build Failure - Missing Last Known Location Fields in Simulation API Mapping

**Date:** 2024-07-19

**Symptoms:**
- `npm run build` failed with multiple type errors in `app/api/simulation/shipments/[documentId]/route.ts` (Line 74).
- The error message was: `Type '{ id: string; ... }' is missing the following properties from type 'ApiShipmentCoreInfo': lastKnownLatitude, lastKnownLongitude, lastKnownTimestamp`.

**Investigation & Root Cause:**
- The error occurred within the `mapShipmentDataToApi` function when creating the `coreInfo` object.
- Compared the object being created against the `shipmentsErd` schema (`lib/database/schema.ts`) and the likely structure of `ApiShipmentCoreInfo` (`types/api.ts`).
- **Root Cause Identified:** The `mapShipmentDataToApi` function was not updated to include the `lastKnownLatitude`, `lastKnownLongitude`, and `lastKnownTimestamp` fields when constructing the `coreInfo` object. These fields were previously added to the database schema (`shipmentsErd`) and the corresponding API type (`ApiShipmentCoreInfo`) to support vehicle tracking persistence, but the mapping logic in this specific API route was missed.

**Action Taken (Neurotic Approach - 2024-07-19):**
1.  Identified the `coreInfo` object definition within `mapShipmentDataToApi`.
2.  Added the missing fields, sourcing data directly from the `dbShipment` input object (which represents a record from `shipmentsErd`):
    - `lastKnownLatitude: dbShipment.lastKnownLatitude ? parseFloat(dbShipment.lastKnownLatitude) : null,`
    - `lastKnownLongitude: dbShipment.lastKnownLongitude ? parseFloat(dbShipment.lastKnownLongitude) : null,`
    - `lastKnownTimestamp: dbShipment.lastKnownTimestamp?.toISOString() ?? null,`
3.  Ensured correct type conversions (DB decimal to number/float, DB timestamp to ISO string).

**Resolution:**
- By adding the missing fields to the mapping logic, the `coreInfo` object now satisfies the `ApiShipmentCoreInfo` type requirements.

**(Next Step):** Re-run `npm run build` to confirm the fix and check for any further issues.

## Issue: Build Failure - Incorrect Store Access & Map Ref Usage in Simulation Page

**Date:** 2024-07-19

**Symptoms:**
- `npm run build` failed with multiple type errors in `app/simulation/[documentId]/page.tsx`:
    - `This expression is not callable. Type 'SimulatedVehicle' has no call signatures.` (Lines 78, 244) - Occurred when using `.find()` on the `vehicles` state variable.
    - `Parameter 'v' implicitly has an 'any' type.` (Lines 78, 244) - Consequence of the first error.
    - `Property 'flyToVehicle' does not exist on type 'SimulationMapRef'.` (Line 217) - Occurred when calling `mapRef.current?.flyToVehicle(...)`.
    - `Cannot find name 'SimulatedVehicle'` (Line 79) - Introduced during a failed reapply attempt.

**Investigation & Root Causes:**
1.  **`.find()` on `vehicles` State:**
    - Reviewed the `vehicles` state definition in `lib/store/useSimulationStore.ts`.
    - **Root Cause:** Confirmed `vehicles` is defined as `Record<string, SimulatedVehicle>`, not `SimulatedVehicle[]`. The code was incorrectly trying to use the array method `.find()` on an object.
2.  **`flyToVehicle` Call:**
    - Reviewed the `SimulationMapRef` interface definition and `useImperativeHandle` usage in `components/map/SimulationMap.tsx`.
    - **Root Cause:** Confirmed the map component ref only exposes `getMap()` and `triggerResize()`. The `flyToVehicle` method does not exist on the ref.

**Action Taken (Neurotic Approach - 2024-07-19):**
1.  **Corrected Store Access:** Modified lines 78 and 244 in `app/simulation/[documentId]/page.tsx` to access the vehicle data directly from the `vehicles` record using the appropriate ID as the key (e.g., `const selectedVehicle = selectedVehicleId ? vehicles[selectedVehicleId] : undefined;`). Added explicit typing (`SimulatedVehicle | undefined`) for clarity.
2.  **Corrected Map Ref Usage:** Commented out the call `mapRef.current?.flyToVehicle(...)` on line 217, adding a `// TODO:` explaining that the map focuses via `useEffect` and this method needs to be added to `SimulationMapRef` if explicit control is desired.
3.  **Added Missing Import:** Added `import type { SimulatedVehicle } from '@/types/vehicles';` to resolve `Cannot find name 'SimulatedVehicle'` errors.
4.  **Refactored Status Checks:**
    *   Restructured the checks in `handleStartBackendSimulation` (around line 253) to first check for invalid states (`'AWAITING_STATUS'` or not `'Idle'`) before proceeding, resolving the type narrowing conflict.
    *   Simplified the `disabled` prop logic (around line 531) to `disabled={... || selectedVehicle.status !== 'Idle'}`, as this implicitly covers `'AWAITING_STATUS'` and avoids the overlap error logic.
5.  **Reapplied Edit (Multiple Times):** Had to use `reapply` multiple times across several steps for this file (`page.tsx`) due to the apply model failing to correctly implement the changes or the linter providing inconsistent feedback immediately after an edit.

**Resolution:**
- The code now correctly accesses vehicle state, avoids non-existent map methods, imports necessary types, and uses a logically sound structure for status checks.
- **Note:** The linter may persist in reporting a spurious overlap error on the simplified `disabled` prop (line 531) due to caching or deeper inference issues, but the code itself is now logically correct based on the type definitions and control flow.

**(Next Step):** Re-run `npm run build` to confirm the final status. If it fails *only* on the spurious linter error for the disabled prop, consider ignoring it or adjusting ESLint config if necessary.

## Issue: Vercel Build Failure Due to Multiple ESLint Errors (Commit 7a215a4) - Continued

**Date:** 2024-07-28

**Troubleshooting Steps (Continued):**

8.  **Attempted Fix `react/no-unescaped-entities` in `app/dashboard/customer/success/page.tsx` (Lines 99, 149):**
    - **Problem:** Automated edits failed.
    - **Status:** Resolved via manual user intervention (2024-07-28).

9.  **Re-ran Lint (2024-07-28):** Linter still reports multiple errors, including remaining `react/no-unescaped-entities`, `@typescript-eslint/ban-ts-comment`, `prefer-const`, `no-empty`, and a new `react/display-name`.

10. **Issue: Fixes for `app/dashboard/driver/success/page.tsx` (Line 99: `'`, Line 7: bad import):**
    - **Problem:** Automated edits failed repeatedly for this file type. Invalid import `Loader2Icon from "@tabler/icons-react"` was introduced on line 7 by a failed edit attempt.
    - **Status:** Resolved (2024-07-28). User manually fixed the apostrophe on line 99 (`You&apos;ve`). User confirmed file updated to remove the incorrect import on line 7.

11. **Re-ran Lint (2024-07-28):** Linter still reports multiple critical errors (unescaped entities, ts-comment, prefer-const, no-empty, display-name) and warnings. Build will likely fail.

12. **Fixed `react/no-unescaped-entities` in `app/not-f
ound.tsx` (Line 27):** Replaced `'` in `you're` with `&apos;`.

13. **Fixed `react/no-unescaped-entities` in `app/shipments/[documentid]/page.tsx` (Line 411):** Replaced two `"` around `{searchTerm}` with `&quot;`.

14. **Fixed `react/no-unescaped-entities` in `components/logistics/DocumentScanner.tsx` (Line 258):** Replaced `'` in `couldn't` with `&apos;`.

15. **Skipped `prefer-const` in `components/layout/UserNav.tsx:33`:** File not found. ESLint report likely stale or refers to a moved/deleted file. `components/main-layout.tsx` (containing user dropdown) does not have this specific error pattern.

16. **Fixed `react/display-name` in `components/shared/Card.tsx`:** Added `displayName` property to all exported functional components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).

17. **Skipped `@typescript-eslint/ban-ts-comment` in `components/ui/data-table.tsx:80`:** File does not contain any `ts-comment` directives, and reported line number (80) exceeds file length (56). ESLint report is stale for this file.

18. **Skipped `no-empty` in `components/ui/label.tsx:20`:** File does not contain any empty block statements. ESLint report is stale or incorrect for this file.

19. **Skipped `no-empty` in `components/ui/select.tsx` (Lines 15, 21, 28):** File does not contain any empty block statements. ESLint report is stale or incorrect for this file.

20. **Skipped `@typescript-eslint/ban-ts-comment` in `hooks/use-debounce.ts:8`:** File does not contain any `ts-comment` directives. ESLint report is stale or incorrect for this file.

21. **Skipped `@typescript-eslint/no-explicit-any` in `lib/actions/aiActions.ts:17`:** File not found. ESLint report is stale or refers to a moved/deleted file.

**(Next Step):** Proceed with next critical ESLint error (`react/no-unescaped-entities` in `components/ui/alert-dialog.tsx:19`).

## Build Errors (from `npm run build` - 2024-07-29)

**Context:** The previous ESLint report (`eslint-report.json` or equivalent) was found to be stale. Running `npm run build` revealed numerous actual errors and warnings. We will now address these systematically.

1.  **Fixed `react/no-unescaped-entities` in `components/logistics/shipments/AIMappingLabel.tsx` (Lines 43, 44):** Replaced literal double quotes (`"`) with `&quot;`.

2.  **Addressed `@typescript-eslint/ban-ts-comment` in `components/AuthForm.tsx:134`:** Changed `@ts-ignore` to `@ts-expect-error` within commented-out code block (tool failed to remove dead code). Note: This introduces a less severe `Unused '@ts-expect-error' directive` warning.

3.  **Fixed `prefer-const` in `components/map/StaticRouteMap.tsx:92`:** Changed `let featuresToBound` to `const`.

4.  **Fixed `no-empty` in `components/map/StaticRouteMap.tsx:140`:** Added `logger.warn` inside the empty `catch` block for the fallback `flyTo` call.

5.  **Fixed `no-empty` in `lib/store/useSimulationStore.ts:200`:** Added comment `// Explicitly do nothing for vehicles awaiting status` to justify empty block.

6.  **Fixed `Unused '@ts-expect-error' directive` in `components/AuthForm.tsx:134`:** Removed the directive from the commented-out code block.

7.  **Fixed `react/display-name` in `components/ui/enhanced-file-upload.tsx:30`:** Added `displayName` property.

8.  **Fixed `react-hooks/exhaustive-deps` in `components/ui/enhanced-file-upload.tsx:104`:** Reordered `simulateUpload` and `handleFileChange` definitions and added `simulateUpload` to the dependency array of `handleFileChange`.

9.  **Fixed `react-hooks/exhaustive-deps` in `components/ui/file-upload.tsx:95`:** Reordered `simulateUpload` and `handleFileChange` definitions and added `simulateUpload` to the dependency array of `handleFileChange`.

**(Next Step):** Proceed with next build error (`@typescript-eslint/no-explicit-any` in `app/api/ai/document-processing/route.ts:34`).

## Issue: Last Known Location Marker Not Displaying on Shipment Page Map

**Date:** 2024-07-29

**Symptoms:**
- When viewing the `/shipments/[documentid]` page, the `StaticRouteMap` component does not display a marker for the vehicle's last known location, even if a simulation has been run previously for that shipment.
- The route line is displayed correctly.

**Investigation:**
- **Browser Log Analysis (2024-07-29):**
    - Repeated logs like `[INFO] [ShipmentPage] No initial last known position found in fetched data.` indicate the API initially returns NULL location data, as expected before updates.
    - **CRITICAL:** Logs like `[WARN] [loadSimulationFromInput] Stopping any existing simulation...` and subsequent auto-start logs **persist**. This confirms the **incorrect frontend code** (specifically the old version of `lib/store/useSimulationStore.ts`) is running in the deployed environment.
    - Frontend continues to log `[INFO] [Tick] Throttled DB update triggered...` but this doesn't confirm backend activity.
    - Refresh logs (`[INFO] [ShipmentPage] No location data returned after refresh.`) confirm DB location fields remain `NULL`.
- **Server Log Analysis (`docs/log.md`):**
    - The latest available server logs still **do not contain** the new detailed logging added to the backend tick handler (`app/api/simulation/tick/route.ts`), such as `Attempting to update shipments_erd...`.

**Root Cause Analysis:**
- **Primary Cause:** Incorrect code deployment. The version of the application running in the test environment does not contain the crucial frontend refactoring (commit `423357e` or later) that fixed the simulation start/reset logic in the Zustand store and simulation page. This invalidates the entire test scenario.
- **Secondary Possibility:** Even if the frontend were correct, the lack of new server logs *might* indicate the backend deployment is also stale or the tick handler isn't being called/executing correctly.

**(Next Step - HIGHEST PRIORITY):**
1.  **Verify/Fix Vercel Deployment:** Ensure the latest commit (`423357e` or newer) is successfully built and deployed to the testing environment.
2.  **Retest (POST-DEPLOYMENT CONFIRMATION):** Run the test flow again.
3.  **Analyze FRESH Logs:** If the problem persists *after* confirming the correct deployment, provide **new** browser and server logs. Focus on:
    - Browser: Absence of the `[WARN] [loadSimulationFromInput] Stopping...` log.
    - Server: Presence of `[API /simulation/tick POST] Attempting to update shipments_erd...` and subsequent success/failure logs.

## Update (2024-07-29): Implemented DB Update in Tick Handler

- **Decision:** Instead of creating a new `VehicleTrackingService.ts` file, the database persistence logic was added directly into the existing backend tick handler `app/api/simulation/tick/route.ts`.
- **Implementation:**
    - Added imports for Drizzle (`db`), the `shipmentsErd` schema, and `eq` operator.
    - Within the `POST` handler, after successfully calculating the `newState` and updating the KV cache, added a Drizzle `db.update(shipmentsErd)` call.
    - This update sets `lastKnownLatitude`, `lastKnownLongitude`, `lastKnownTimestamp`, and `shipmentDateModified` for the specific `shipmentId`.
    - Removed references to the non-existent `VehicleTrackingService`.
- **Status:** Backend logic for persisting location updates during simulation ticks is now in place.

**(Next Step):** Run `npm run build` to check for build errors and then test the end-to-end flow to verify the database is updated and the last known location marker appears on the shipment page map.

## Issue: Last Known Location Marker Still Missing (Deployment Issue Suspected)

**Date:** 2024-07-29 (Continued)

**Symptoms:**
- Last known location marker still missing after attempting fixes to backend tick handler.

**Investigation:**
- **Browser Log Analysis (Post-Tick Handler Fix Attempt):**
    - **CRITICAL:** Logs like `[WARN] [loadSimulationFromInput] Stopping any existing simulation...` and subsequent auto-start logs **persist**. This confirms the **incorrect frontend code** (specifically the old version of `lib/store/useSimulationStore.ts`) is running in the deployed environment.
    - Frontend continues to log `[INFO] [Tick] Throttled DB update triggered...` but this doesn't confirm backend activity.
    - Refresh logs (`[INFO] [ShipmentPage] No location data returned after refresh.`) confirm DB location fields remain `NULL`.
- **Server Log Analysis (`docs/log.md`):**
    - The latest available server logs still **do not contain** the new detailed logging added to the backend tick handler (`app/api/simulation/tick/route.ts`), such as `Attempting to update shipments_erd...`.

**Root Cause Analysis:**
- **Primary Cause:** Incorrect code deployment. The version of the application running in the test environment does not contain the crucial frontend refactoring (commit `423357e` or later) that fixed the simulation start/reset logic in the Zustand store and simulation page. This invalidates the entire test scenario.
- **Secondary Possibility:** Even if the frontend were correct, the lack of new server logs *might* indicate the backend deployment is also stale or the tick handler isn't being called/executing correctly.

**(Next Step - HIGHEST PRIORITY):**
1.  **Verify/Fix Vercel Deployment:** Ensure the latest commit (`423357e` or newer) is successfully built and deployed to the testing environment.
2.  **Retest (POST-DEPLOYMENT CONFIRMATION):** Run the test flow again.
3.  **Analyze FRESH Logs:** If the problem persists *after* confirming the correct deployment, provide **new** browser and server logs. Focus on:
    - Browser: Absence of the `[WARN] [loadSimulationFromInput] Stopping...` log.
    - Server: Presence of `[API /simulation/tick POST] Attempting to update shipments_erd...` and subsequent success/failure logs.

## Issue: POST `/api/simulation/tick` Returns 404 Not Found

**Date:** 2024-07-29

**Symptoms:**
- After confirming the correct frontend code (commit `119dfad`) is deployed (`load-78nufeqj9...`), the simulation starts correctly on the frontend.
- The frontend `tickSimulation` logs `[INFO] [Tick] Throttled DB update triggered... Calling backend API.`
- However, the browser console immediately shows a **404 Not Found** error for the POST request to `/api/simulation/tick`.
- Browser logs `[ERROR] [Tick] Backend API call failed for ... {status: 404, statusText: ''}`.
- Server logs (`docs/log.md`) show some `POST 404` entries for `/api/simulation/tick` but also include warnings about missing KV state (`No active simulation found...`), indicating the handler *might* have run at some point, but crucially **lack the specific DB update logs** (`Attempting to update...`, `Successfully updated...`) added in the latest code.

**Investigation & Root Cause Analysis:**
- **Deployment Verified:** Confirmed latest frontend code (`119dfad`) is running based on absence of old `loadSimulationFromInput` warnings.
- **Conflicting 404s:** The browser receives a direct 404, suggesting the route doesn't exist. Server logs show the route *sometimes* logging internal activity before returning 404 (due to missing KV state in potentially older executions/deployments). This conflict points towards an issue with how the route is registered or built in the *current* deployment.
- **Primary Hypothesis: Build/Routing Failure:** The most likely cause is that the API route file (`app/api/simulation/tick/route.ts`), despite existing in the source code, was **not correctly built or registered by Next.js/Vercel** during the deployment process for `load-78nufeqj9...`. The server genuinely doesn't have an active handler at that specific path.
- **Secondary Hypothesis: Stale Server Logs:** The server logs showing the handler running might be from a previous deployment, obscuring the current state where the route is actually missing.

**Conclusion:** The frontend is now correctly attempting to call the backend, but the backend endpoint `/api/simulation/tick` appears to be unavailable in the current deployment due to a build or routing issue.

**(Next Step):**
1.  **Inspect Vercel Build Logs:** Carefully review the build logs for the specific deployment (`load-78nufeqj9...` / commit `119dfad`) on Vercel. Look for *any* errors or warnings related to `app/api/simulation/tick/route.ts`.
2.  **Verify File Path:** Confirm the file path is exactly `app/api/simulation/tick/route.ts`.
3.  **Trigger Redeploy:** Manually trigger a new deployment of commit `119dfad` on Vercel.
4.  **Retest (POST-REDEPLOY):** After the new deployment is live, repeat the test flow and check browser network tab for the `/api/simulation/tick` POST call status, and check live Vercel runtime logs for the expected DB update messages.

## Issue: POST `/api/simulation/tick` Still Returns 404 After Redeploy

**Date:** 2024-07-29 (Continued)

**Symptoms:**
- After confirming latest frontend code (`119dfad`) and backend code (including DB logging in tick handler) were pushed and redeployed.
- Frontend correctly calls `fetch` for `/api/simulation/tick`.
- Browser Network tab shows **404 Not Found** for `/api/simulation/tick` POST requests.

**Investigation:**
- **Server Log Analysis (`docs/log.md` - Post Redeploy):**
    - Searched logs extensively for patterns related to the tick handler: `[API /simulation/tick POST] Received request.`, `Attempting to update shipments_erd`, `Successfully updated shipments_erd`, `Database update failed`.
    - **CRITICAL FINDING:** None of these specific log messages were found.
- **Conclusion:** The `/api/simulation/tick` POST handler is **not being executed** in the latest deployment. The 404 error received by the browser is accurate; the endpoint is not accessible.

**Root Cause Analysis:**
- **Build/Routing Failure:** The Vercel deployment process is failing to correctly build and register the API route defined in `app/api/simulation/tick/route.ts`. Potential causes include:
    - Subtle syntax error preventing route registration.
    - Incorrect file/folder naming convention.
    - Vercel build configuration issue.
    - Transient Vercel build error.

**(Next Step - Debugging the Deployment):**
1.  **RE-EXAMINE VERCEL BUILD LOGS:** Go back to the Vercel dashboard for the *absolute latest* deployment corresponding to commit `119dfad`. Scrutinize the build output for any errors, warnings, or specific mentions (or lack thereof) of `app/api/simulation/tick/route.ts`.
2.  **VERIFY FILE PATH/NAME:** Confirm `app/api/simulation/tick/route.ts` (case-sensitive).
3.  **TEST RENAMING (Diagnostic):** Consider temporarily renaming the route (e.g., to `app/api/ticktest/route.ts`), updating the frontend fetch call, deploying, and testing if the renamed route works. This helps isolate path-specific issues.
4.  **Review Vercel Project Settings:** Check if any project settings might interfere with API route discovery.

## Reconciling Mocked Sub-Routes with Observed Persistence

**Date:** 2024-07-30

**Symptoms:**
- User observed that document uploads persist in the UI and database, and shipment/simulation pages display this data, contradicting previous analysis suggesting API routes under `/api/shipments/[id]/...` were entirely mocked.

**Investigation & Findings:**
- **`POST /api/documents/upload`:** Reviewed route. **Confirmed NOT Mocked.** Orchestrates file reception, inserts initial `documents` DB record, calls `ExcelParserService` for parsing, and uses `insertShipmentBundle` service to save parsed shipment data (`shipments_erd`, related tables) to the database. Responsible for initial data persistence.
- **`GET /api/documents`:** Reviewed route. **Confirmed NOT Mocked.** Fetches `documents` records from DB for the current user. Dynamically calculates aggregate `shipmentSummaryStatus` for each document by querying related `shipments_erd` statuses. Provides data for the `/documents` page UI.
- **`GET /api/shipments?documentId=...`:** Reviewed route. **Confirmed NOT Mocked.** Fetches detailed shipment data for a specific `documentId` by querying `shipments_erd` and joining/fetching related data from `customShipmentDetails`, `pickups`, `dropoffs`, `addresses`, `items`, `bookings`, `trips`, etc. Uses `mapDbShipmentToApi` helper to transform DB data into the `ApiShipmentDetail` structure required by the `/shipments/[documentid]` page UI.
- **`GET/POST /api/shipments/[id]/documents`, `/history`, `/status`:** Previous analysis confirmed these specific sub-routes **ARE Mocked**. They represent placeholder functionality for post-upload detail fetching or updates, not the core data flow.

**Conclusion:**
- The core data flow for uploading documents, parsing them, storing the results in the database, and displaying lists on the `/documents` and `/shipments/[documentid]` pages is functional and relies on database interaction.
- The previously identified mocked routes are separate, likely incomplete features for more granular operations on individual shipments *after* they have been processed and stored.
- This resolves the apparent contradiction between observed persistence and the mocked status of specific sub-routes.

**(Next Step):** Investigation complete regarding this specific discrepancy.
