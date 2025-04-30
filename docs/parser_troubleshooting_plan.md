# Parser Troubleshooting Plan

This document outlines the plan to analyze and fix the parser logic to handle different document formats.

## Objective

Successfully parse various document types (ETD reports, NIRO outstation rates, etc.) into complete and accurate `ParsedShipmentBundle` objects, correctly identifying headers, grouping related rows, extracting/resolving all necessary fields (including distinct primary/secondary item numbers, lot numbers, contact name/phone details, PO numbers), handling specific edge cases like combined load numbers, ensuring correct data presentation, and implementing robust handling for source data inconsistencies.

## Analysis Strategy & History

1.  **Initial Problem:** Parser failed to extract `pickupAddressRaw` and `destinationAddressRaw` for NIRO files.
2.  **Root Cause (Old):** Missing field mapping constants and location resolution logic.
3.  **Implementation:** Field mappings, location resolver logic, and shipment builder adaptations implemented.
4.  **Build/Import Issues:** Resolved path alias and relative import errors.
5.  **Problem (ETD File):** Parser failed (0 bundles) due to multi-line header issues.
6.  **Fix Attempt (Multi-Line Heuristic):** Implemented refined header block detection using lookahead. Succeeded for ETD single sheet.
7.  **Problem (NIRO Multi-Sheet):** Parser produced only **one** bundle, containing incorrectly aggregated items from the first sheet ("PENANG"). Sheets "JOHOR" and "OTHER STATES" produced 0 bundles.
8.  **Investigation (Logging):** Added detailed logging to `_processDataRows`.
9.  **Findings (Logs):** Header detection failure and incorrect grouping logic identified.
10. **Fix #1 (Grouping Key):** Modified `isFirstRowOfNewShipment` (correct keys). PENANG sheet grouped correctly (4 bundles).
11. **Fix #2 (Header Heuristic):** Refined `processSheet` header detection (keyword-based). Successful header detection for all sheets.
12. **Fix #3 (Grouping Scope):** Modified `isFirstRowOfNewShipment` (Load No only). Correct grouping for multi-item rows (12 bundles total).
13. **Database Fixes (NOT NULL constraint):** Added `NOT NULL` to `pickups.shipmentId` and `dropoffs.shipmentId`. Initially caused 0 inserts due to incorrect insertion order. (**RESOLVED**)
14. **Database Fixes (Missing Columns):** Added `tripId`, `pickupId`, `dropoffId` to `shipments_erd`. Fixed insertion order logic in `insertShipmentBundle`. (**RESOLVED**)
15. **Parser Logic (Combined Loads):** Identified that the parser grouped rows for combined load numbers (e.g., "60033 / 60034") correctly but created only one bundle containing all associated items, resulting in **12** total bundles instead of the required **13**. (**Superseded by DB issue**)
16. **Database Insertion Issue (Silent Rollback):** Identified that the 13th bundle's transaction silently failed during `document_shipment_map` insertion, causing a rollback not caught by application logic. (**RESOLVED** by using `DEFERRABLE INITIALLY DEFERRED` foreign key constraint).
17. **Parser Logic (Split Bundle Item Duplication/Mismatch):** Identified that `buildAggregatedBundle` incorrectly aggregated items when processing split loads, leading to duplicates or missing items. (**RESOLVED** by adding logic to skip header row processing and use data coalescing for the second item row in split bundles).
18. **Data Analysis (JSON Output Review):** Confirmed incorrect mapping of "2nd Item Number" to `itemNumber`, presence of combined contact strings in `contactNumber`, and swapped Contact/PO data in specific bundles (e.g., NIRO "OTHER STATES" sheet). Verified `metadata.processingNotes` and `metadata.needsReview` handling for split bundles. (**ANALYSIS COMPLETE**)
19. **Parser Logic (`contactUtils.ts` - Multiple Attempts):** Several attempts made to refine `parseContactString` using various regex strategies and cleaning logic. Initial fixes addressed some cases but led to regressions.
20. **Refined Strategy (Broad Extract/Clean/Validate):** Implemented strategy to broadly extract candidates, clean to digits, validate digits, replace original validated candidates with placeholder ` | `, normalize other separators, and clean/split/filter/join names. Resulted in 12 test failures (down from 15).
21. **Analysis of 12 Failures (Placeholder Artifacts):** Identified that the ` | ` placeholder used for phone replacement, combined with splitting logic, was leaving extra ` | ` separators or the placeholder itself (` ::: ` was used in the code, despite plan saying ` | `) in the final name string.
22. **Refined Strategy (Take 6 - Placeholder & Space Join):** Reinstated ` ::: ` placeholder, refined segment cleaning, joined final names with spaces. Still resulted in 12 failures, mainly due to leftover ` ::: ` placeholders and incorrect joining logic for different separator expectations.

## Current Root Causes & Pending Tasks

*   **[ACTIVE - Parser Mapping]** Source column "2nd Item Number" is mapped to the standard `itemNumber` field, overwriting primary item number if one exists. (Task 0.2) ✅ **FIXED**
*   **[ACTIVE - Frontend Display]** Frontend display incorrectly shows `itemNumber` (currently sourced from "2nd Item Number") data under the 'Lot #' label. (Task 1.1.5, 1.2.1) ✅ **FIXED**
*   **[ACTIVE - Frontend Display]** Frontend display is missing the 'PO Number' field. (Task 1.1.6, 1.2.2) ✅ **FIXED**
*   **[ACTIVE - Frontend Display]** Frontend display is missing a field for "2nd Item Number". (Task 1.1.7, 1.2.3) ✅ **FIXED**
*   **[ACTIVE - Frontend Display]** Frontend display is missing Contact Name / Phone details. (Task 1.1.8, 1.2.4) ✅ **FIXED**
*   ~~**[ACTIVE - Parser Logic - UNIVERSAL]** Parser does not split combined Contact Name/Phone from source 'Contact Number' column into distinct fields. Needs to handle multiple contacts within the field. (Task 2.1 - Partially addressed by `parseContactString` attempts, but still needs integration)~~ ✅ **FIXED**
*   ~~**[ACTIVE - Parser/Data Quality - SPECIFIC FILES]** Source data (e.g., 'OTHER STATES' sheet) contains swapped values between 'Contact Number' and 'PO Number' columns, requiring validation and correction logic. Needs to handle multiple POs within the field. (Task 3.1 - Utils done, needs integration)~~ ✅ **FIXED**
*   ~~**[SUPERSEDED - Parser Logic - SPECIFIC FILES]** For multi-row loads (e.g., Load #61075 in ETD file), the `rawOriginInput` (e.g., "LOAD UP DIRECT...") is correctly extracted for the first row but is not propagated to the bundles created for subsequent rows of the same load if their `pickupWarehouse` cell is empty. This causes the `insertShipmentBundle` logic to skip mock address resolution for those subsequent rows. (Task 6.1)~~ **Root cause was incorrect row grouping.**
*   ~~**[ACTIVE - Parser Logic - UNIVERSAL]** The row grouping logic in `_processDataRows` incorrectly finalizes a group when it encounters the *same* load number on a subsequent row, instead of accumulating all rows until the load number *changes*. This prevents subsequent rows (often containing only item/weight data) from being processed together with the first row that holds shared information like origin address. (Task 9.1)~~ ✅ **FIXED**
*   **[ACTIVE - Frontend Display / API Mapping]** Despite database logs confirming correct mock address resolution and linking for origin addresses (e.g., Load #61075 now links pickup to Shah Alam Hub address ID), the frontend still displays "N/A" for origin. The issue might be in the `GET /api/shipments` data fetching/mapping logic (`mapDbShipmentToApi`) or the frontend component rendering (`ShipmentDetailView.tsx`). (Task 12.1)
*   **[Potential - Lower Priority]** Parser logic mapping/completeness for various financial/rate columns might need further review across all formats.

## Action Plan (Refinement & New Features)

**Priority -1: Fix Failing `contactUtils.ts` Tests (Highest Priority - Take 7 - Simplification)**

-1. **Feature: Correct Contact String Parsing Logic (Simplified Approach) ✅ COMPLETED**
    *   **Task -1.1 (Analysis):** Review 12 failures from Take 6. Note placeholder and joining issues. **DONE.**
    *   **Task -1.2 (Design - Simplified Strategy):** **DONE.**
        *   Phone Extraction/Validation: Keep as is.
        *   Name Isolation: Replace original validated phone candidates with an **empty string `''`** (no placeholder).
        *   Name Cleaning (Simplified):
            *   Take the resulting `textForNames` string.
            *   Remove parenthesized content.
            *   Normalize *all* separators (`/`, `\n`, `\r`, `;`, `|`) to a **single space `' '`**. (`/[\\/\\n\\r;|]+/g` -> `' '`) 
            *   Remove name prefixes.
            *   Collapse multiple spaces.
            *   Remove purely numeric short artifacts.
            *   Trim final result.
            *   Final Check: If result contains only digits/spaces, return `undefined`. Else return cleaned result or `undefined` if empty.
    *   **Task -1.3 (Implementation):** Apply simplified strategy to `parseContactString` in `services/excel/contactUtils.ts`. **DONE.**
    *   **Task -1.4 (Testing):** Rerun tests. **DONE. All 19 tests now pass!**

**Priority 0: Backend Item Number Mapping Correction (High Priority - Foundational)**

0.  **Feature: Correct Item Number Mapping ✅ COMPLETED**
    *   **Task 0.1 (Analysis):** Review `ExcelParserService.ts` (`mapHeadersToStandardFields`), `fieldMappings.ts`, and example JSON output to confirm "2nd Item Number" mapping. **DONE.**
    *   **Task 0.2 (Design & Implementation):**
        *   Define `secondaryItemNumber?: string | null;` in `ShipmentItem` within `types/shipment.ts`. Also add to `ShipmentItemInsertData` type (likely in `types/parser.types.ts`, or inferred structure in `types/shipment.ts` for now). **DONE (Verified via JSON output).**
        *   Modify `services/excel/fieldMappings.ts`: Change mapping for `"2nd Item Number"` variations to `"secondaryItemNumber"`. Verify primary `"Item Number"` variations correctly map to `"itemNumber"`. **DONE (Verified via JSON output).**
        *   Update `buildShipmentItem` function in `services/excel/shipmentBuilder.ts` to populate `secondaryItemNumber` using `extractStringField` and the appropriate key (found using `findActualKeyForStandardField` if necessary, though direct standard key assumed from `convertRowToRawData`). **DONE (Verified via JSON output).**
        *   **Artifact:** Updated Type Definitions, `fieldMappings.ts`, `shipmentBuilder.ts`. **COMPLETE.**

**Priority 1: Frontend Data Presentation Issues (Minor Complexity - Depends on P0, P2)**

1.  **Feature: Correct Frontend Shipment Data Presentation ✅ COMPLETED**
    *   **Task 1.1 (Analysis):** Perform Data Flow Analysis for Item Numbers, Lot #, PO #, and Contact Details.
        *   **Sub-Task 1.1.1:** Validate `lotSerialNumber` mapping/presence. **DONE.**
        *   **Sub-Task 1.1.2:** Validate `poNumber` mapping/presence (`customerPoNumbers`). **DONE.**
        *   **Sub-Task 1.1.3:** Validate `itemNumber` mapping/presence (currently holds 2nd Item # data). **DONE.** Check for `secondaryItemNumber` after P0 is done. **DONE (P0 Complete).**
        *   **Sub-Task 1.1.4:** Validate `contactNumber` raw storage and absence of parsed fields. **DONE.** Check for parsed fields after P2 is done. **DONE (P2 Complete).**
        *   **Sub-Task 1.1.5:** Identify Frontend Component (`ItemsTab` in `ShipmentDetailView.tsx`). Review "Lot #" binding (`item.sku || item.lotSerialNumber`). **DONE.**
        *   **Sub-Task 1.1.6:** Identify Frontend Component (`OverviewTab` in `ShipmentDetailView.tsx`). Verify absence of PO Number display. **DONE.**
        *   **Sub-Task 1.1.7:** Identify Frontend Component (`ItemsTab` in `ShipmentDetailView.tsx`). Verify absence of "2nd Item Number" display. **DONE.**
        *   **Sub-Task 1.1.8:** Identify Frontend Component (`ContactsTab`/`ContactDetails` in `ShipmentDetailView.tsx`). Verify absence of Contact Details display. **DONE.**
        *   **Artifact:** Data Mapping Document/Update this plan. **UPDATED.**
    *   **Task 1.2 (Implementation - Frontend):** Implement Frontend Display Corrections. **DONE ✅**
        *   **Sub-Task 1.2.1:** Refactor `ItemsTab` (line 358) to bind "Lot #" display *primarily* to `item.lotSerialNumber`. **DONE.**
        *   **Sub-Task 1.2.2:** Enhance `OverviewTab` to display `dropoffData.customerPoNumbers` (Label: "PO Number"). Handle potential multiple POs (display raw or formatted list). **DONE.**
        *   **Sub-Task 1.2.3:** Add a column/field in `ItemsTab` to display the new `item.secondaryItemNumber` (Label: "2nd Item #" or similar). **DONE.**
        *   **Sub-Task 1.2.4:** Enhance `ContactsTab`/`ContactDetails` to display parsed `recipientContactName` and `recipientContactPhone`. Handle multiple contacts (display raw or formatted list). **DONE.**
        *   **Sub-Task 1.2.5:** Perform Unit/Integration Testing. **DONE.**
        *   **Artifact:** Updated Frontend Component Code. **DONE.**

**Priority 2: Backend Parsing Enhancements (Moderate-Complex)**

2.  **Feature: Implement Contact Name/Phone Parsing (Universal Requirement) ✅ COMPLETED**
    *   **Task 2.1 (Design & Implementation):** Develop logic to split raw `contactNumber` string.
        *   **Sub-Task 2.1.1:** Define Heuristics/Regex for common phone patterns (e.g., `(?:\+?60|0)1\d[-\s]?\d{7,8}`, `\d{2}-\d{7,8}`) and name extraction (e.g., text preceding number, handling `/`, `\n`, common prefixes like `SD:` `MR` etc.). Account for `+60`/`0` prefix logic. **DONE (Implemented in `contactUtils.ts`)**
        *   **Sub-Task 2.1.2:** Define strategy for multiple contacts: Store raw string in `metadata`. Attempt to parse *all* distinct valid phone numbers into a single delimited string field `recipientContactPhone` (e.g., separated by ` | `). Attempt to associate names and store in `recipientContactName` (delimited if multiple). Define these fields in `DropoffInsertData` type (`types/shipment.ts` or `types/parser.types.ts`). **DONE (Implemented in `contactUtils.ts`)**
        *   **Sub-Task 2.1.3:** Implement parsing function `parseContactString(rawContact: string | null | undefined): { names: string | undefined, phones: string | undefined }` within new file `services/excel/contactUtils.ts`. (**DECISION:** New file confirmed). **DONE**
        *   **Sub-Task 2.1.4:** Integrate call within `services/excel/shipmentBuilder.ts` (likely in `_buildShipmentBundleParts` or `createShipmentFromRowData` before `DropoffInsertData` is finalized). Runs *after* potential swap correction (Task 3). **DONE (Integrated in _buildShipmentBundleParts)**
        *   **Sub-Task 2.1.5:** Add Unit Tests. **DONE (All tests passing)**
        *   **Artifact:** New Util File, Updated `shipmentBuilder.ts`, Updated Type Definitions. **DONE**

3.  **Feature: Implement Automated Correction for Swapped Contact/PO Data (Specific Files) ✅ COMPLETED**
    *   **Task 3.1 (Analysis & Design):** Define Strategy for Detection and Correction.
        *   **Sub-Task 3.1.1:** Analyze frequency/patterns (confirmed in JSON output for NIRO "OTHER STATES"). **DONE.**
        *   **Sub-Task 3.1.2 (Strategy Selection):** Prioritize Heuristic approach.
            *   **(Heuristic):** Refine detection: `contactNumber` looks like PO (`^HWSH\d+$`, or common PO patterns) AND `poNumber` looks like Contact Info (contains multiple phone patterns from Task 2.1.1, OR contains `/` or `\n`, OR contains name keywords like `SD:` `MR` etc.). **DONE (Implemented in `dataValidationUtils.ts`)**
        *   **Sub-Task 3.1.3:** Define Handling Action: Detect & Attempt Auto-Swap. Add processing note to `metadata.processingNotes`. Add `needsReview: true` flag to `metadata`. Handle multiple distinct POs found in the (potentially swapped into) `poNumber` field - parse and store delimited string in `customerPoNumbers`. **DESIGN REFINED. DONE (Implemented in `dataValidationUtils.ts`)**
        *   **Sub-Task 3.1.4:** Integration Point: New helper module `services/excel/dataValidationUtils.ts`, called within `ExcelParserService.ts` (`_processDataRows` function, after `convertRowToRawData`). The function will return `{ correctedRowData, note, needsReview }`. **DESIGN COMPLETE. DONE (Integrated in _processDataRows function).**
        *   **Artifact:** Design Document/Update to this plan. **UPDATED.**
    *   **Task 3.2 (Implementation - Backend):** Implement Validation/Correction Logic.
        *   **Sub-Task 3.2.1:** Create `services/excel/dataValidationUtils.ts`. (**DECISION:** New file confirmed). **DONE.**
        *   **Sub-Task 3.2.2:** Implement detection, swap, and multi-PO parsing logic. **DONE (Implemented in `detectAndCorrectSwappedFields`).**
        *   **Sub-Task 3.2.3:** Integrate helper call into `_processDataRows` in `services/excel/ExcelParserService.ts`. Ensure `note` and `needsReview` are passed down and added to the final bundle's metadata. **DONE (Integrated in _processDataRows and passed to buildAggregatedBundle).**
        *   **Sub-Task 3.2.4:** Add Unit Tests. **DONE (All passing).**
        *   **Artifact:** New Helper Module, Updated `ExcelParserService.ts`. **DONE.**

**Priority 4: Fix Origin Address Propagation for Multi-Row Loads (SUPERSEDED)**

6.  **Feature: Correct Origin Address Propagation for Multi-Row Loads**
    *   **Task 6.1 (Analysis):** Review logs and code. Confirmed that `_processDataRows` extracts origin from first row, but `_buildProcessingMetadata` (in `shipmentBuilder.ts`) ignores the passed `groupOriginRawInput` when constructing the metadata object, preventing the correct raw origin string from reaching the `insertShipmentBundle` function for subsequent rows.
    *   **Task 6.2 (Design):** Modify `_buildProcessingMetadata` to accept `groupOriginRawInput` via its `sourceInfoInput` parameter. Update its internal logic to prioritize the current row's `pickupWarehouse` data, but fall back to the `groupOriginRawInput` when calculating the `rawOriginInputActual` field for the metadata. Remove redundant logic added previously to `createShipmentFromRowData`.
    *   **Task 6.3 (Implementation):**
        *   Update the `_buildProcessingMetadata` function signature and internal logic in `services/excel/shipmentBuilder.ts`.
        *   Ensure the call site in `createShipmentFromRowData` correctly passes the `groupOriginRawInput` within the `sourceInfoInput` object.
        *   Remove the redundant lines previously added to `createShipmentFromRowData` that attempted to set `metadata.rawOriginInput` after the call to `_buildProcessingMetadata`.
    *   **Task 6.4 (Testing):** Re-upload ETD file. Verify logs (`findOrCreateMockAddress` called for subsequent rows) and frontend display (origin address populated correctly for all rows of a multi-row load).
    *   **Artifact:** Updated `shipmentBuilder.ts`. DONE.

**Priority 5: Fix Row Grouping Logic ✅ COMPLETED**

9.  **Feature: Correct Row Grouping Logic for Multi-Row Shipments**
    *   **Task 9.1 (Analysis):** Re-analyze logs for ETD file. Identify that the loop in `_processDataRows` pushes the `currentGroup` to `groupedRows` every time a row with the *same* `loadNumber` as the previous one is encountered, instead of only when the `loadNumber` *changes*.
    *   **Task 9.2 (Design):** Modify the loop in `_processDataRows`. Introduce a `currentLoadNo` variable. Only push `currentGroup` when `loadNo` from the current row *differs* from `currentLoadNo` (and `currentLoadNo` is set). Update `currentLoadNo` when pushing. Ensure the final group is pushed after the loop.
    *   **Task 9.3 (Implementation):** Implement the revised grouping logic in `_processDataRows` within `services/excel/ExcelParserService.ts`.
    *   **Task 9.4 (Testing):** Re-upload ETD file. Check logs and output JSON. **CONFIRMED: Correctly produces 8 bundles, consolidating multi-row loads as expected. Grouping logic is fully validated.** Frontend still shows N/A for origin.
    *   **Artifact:** Updated `services/excel/ExcelParserService.ts`. **DONE.**

**Priority 6: Fix Mock Address Keyword Matching (Final Parser Task) ✅ COMPLETED**

13. **Feature: Ensure Specific Origin Keywords Match Mock Locations**
    *   **Task 13.1 (Analysis):** Identified that raw inputs like "LOADUP DIRECT DELIVERY , PICK UP AT NIRO SHAH ALAM" were not matching `MOCK-SHAH-ALAM-HUB` due to missing keywords. Resulted in low-confidence fallback resolution. **DONE.**
    *   **Task 13.2 (Implementation):** Added specific keywords (`'niro shah alam'`, `'pick up at niro'`, `'pick up at xin hwa'`, etc.) to the `keywords` array for `MOCK-SHAH-ALAM-HUB` in `services/geolocation/mockAddressData.ts`. **DONE.**
    *   **Task 13.3 (Testing):** Re-ran parsing/insertion. Confirmed inputs now resolve to the correct mock location with high confidence (`mock-keyword` method). **DONE.**
    *   **Artifact:** Updated `services/geolocation/mockAddressData.ts`. **DONE.**

**Priority 7: Fix Delivery Date Display (High Priority - Resolved)**

14. **Feature: Ensure Correct Delivery Date Parsing and Display**
    *   **Task 14.1 (Analysis):** Identified "N/A" display for Planned Delivery Date. Traced data flow: Frontend (`ShipmentDetailView.tsx`) -> API (`route.ts`) -> DB (`dropoffs.dropoff_date`) -> Builder (`shipmentBuilder.ts`) -> Source Field ('Promised Ship Date'). Compared parsed JSON output with source TXT file. Found that `extractDateField` in `parserUtils.ts` only parsed `DD/MM/YYYY` format, failing for `MM/DD/YYYY`. **DONE.**
    *   **Task 14.2 (Design):** Replace unreliable native Date parsing for ambiguous strings with a robust library. Selected `dayjs` with `customParseFormat` plugin. Define list of formats to try, prioritizing `DD/MM/YYYY`. **DONE.**
    *   **Task 14.3 (Implementation):** Added `dayjs` dependency (`npm install dayjs`). Refactored `extractDateField` in `services/excel/parserUtils.ts` to use `dayjs(value, formats, true).toDate()`. Fixed minor linter error related to logging internal data. **DONE.**
    *   **Task 14.4 (Testing):** User reprocessed data. **ISSUE PERSISTS.** New parsed JSON output (`parsed_output_e4dec22e...json`) provided. Frontend still shows \"N/A\". Logging added to `extractDateField` (INFO level, entry type/value) but logs are *still missing* from `docs/log.md` after clean build/restart. **SUSPECTING BUILD/CACHE ISSUE or NON-STRING INPUT.**
    *   **Task 14.5 (Re-Investigation - COMPLETE):** Logs confirmed missing. Cannot diagnose using application logs.
    *   **Task 14.6 (Isolation Test - FAILED):** Standalone Node.js script (`simple-test.ts`) failed execution due to `ts-node` environment/resolution issues even after ESM conversion.
    *   **Task 14.7 (Isolation Test - API Route):** Created temporary API route (`/api/test-date`). Triggered route. **ANALYSIS COMPLETE.**
        *   **Findings:** API response logs confirm `extractDateField` receives `"12/28/24"` as string. `dayjs` parsed it but with local timezone offset (`YYYY-MM-DDT16:00:00Z`). Root cause: Initial parsing didn't use UTC. Secondary issue: Excel numeric date `45655` failed parsing because helper `convertExcelDateToJSDate` returned a formatted string, not a Date object, and had an off-by-one error.
        *   **Action:** Refactored `extractDateField` to use `dayjs.utc()`. Refactored `convertExcelDateToJSDate` (in `lib/excel-helper.ts`) to return `Date | null` and corrected calculation. Linter errors resolved. **FIX IMPLEMENTED.**
    *   **Task 14.8 (Codebase Audit - Date Logic):** Initiated codebase-wide search (`grep`) for date handling logic. 
        *   **Findings:** `dayjs` usage confined to `parserUtils`. Widespread use of `new Date()` constructor (tests, v0 imports, components, helpers) poses inconsistency risk. Multiple `formatDate` helpers exist. `Date.parse` not used. `toISOString`, `getFullYear` used appropriately. **ANALYSIS COMPLETE.**
        *   **Action:** Prioritize fixing `extractDateField`. Log findings for potential future refactoring task to standardize date handling across the application. **FIX IMPLEMENTED.**
        *   **Task 14.9 (Verification):** User restarted server and re-triggered API route `/api/test-date`. **VERIFICATION COMPLETE.**
            *   **Result:** API JSON response confirms `extractDateField` now correctly parses `MM/DD/YY` strings, `DD/MM/YYYY` strings (as UTC), and Excel numeric dates.
        *   **Task 14.10 (Cleanup & Final E2E Test):** Remove temporary API route `/api/test-date`. Restore year validation in `excel-helper.ts` (optional). User to re-run full parse on NIRO file and verify database/frontend display. **PENDING.**
        *   **Artifact:** Updated `services/excel/parserUtils.ts`. Updated `lib/excel-helper.ts`. `app/api/test-date/route.ts` pending removal.

**Priority 8: Implement Truck/Driver Details Parsing (RESOLVED)**

15. **Feature: Add Truck/Driver Details Parsing & Display**
    *   **Task 15.1 (Analysis - Existing Logic):** Review existing `parseTruckDetails` function in `services/excel/shipmentBuilder.ts`. Analyze source data format in `NIRO OUTSTATION...txt`. Evaluate current parser capabilities. **DONE.**
    *   **Task 15.2 (Analysis - Header Mapping):** Identify potential conflict: 'TRANSPORTER' header maps to `pickupWarehouseRaw`. **DONE (Resolved via separate pickup logic, TRUCK DETAILS used).**
    *   **Task 15.3 (Design - Parser):** Modify `parseTruckDetails` to extract IC number. Return structured object `{ name, phone, truckId, ic }`. **DONE.**
    *   **Task 15.4 (Design - Mapping):** Modify `fieldMappings.ts` to map "TRUCK DETAILS" header variations to standard `truckDetails` key. **DONE.**
    *   **Task 15.5 (Implementation - Parser & Tests):** Implement parser changes & mapping. Add detailed logging. **DONE.**
    *   **Task 15.X (Truck Details - Root Cause & Fix):** 
        *   **Problem Recap:** Despite `parseTruckDetails` appearing internally correct (logging showed successful Regex extraction into a structured object), and the calling function `_buildShipmentBundleParts` using standard destructuring/assignment, the final `ParsedShipmentBundle` object (and resulting JSON output) persistently showed the entire multi-line raw string assigned *only* to the `parsedDriverName` field, with other related fields (`parsedDriverPhone`, etc.) being undefined.
        *   **Failed Hypotheses & Fixes:**
            *   Initial focus was on the Regex within `parseTruckDetails`. Multiple refactors were done (including switching from greedy block matching to line-by-line matching) which fixed internal logic but didn't solve the final output issue.
            *   Suspicion shifted to runtime assignment/propagation errors within `_buildShipmentBundleParts`. Extensive logging was added before and after the assignment step, which eventually revealed that the object *returned* by `parseTruckDetails` was already malformed (only containing `driverName`), contradicting earlier internal logs from within the function itself.
            *   Fixing unrelated build errors (context providers, client boundaries) had no impact on this specific runtime parsing issue.
        *   **Root Cause Identified (The "Aha!" Moment):** User hypothesis connecting this to previous multi-value cell issues (like split load numbers) was key. The `TRUCK DETAILS` data originated from a **single cell** in the source file containing multiple lines (Name, IC, Phone, Truck). The crucial error occurred *before* `parseTruckDetails` was called. The code in `_buildShipmentBundleParts` was using the generic `extractStringField(rowData, 'truckDetails')` helper function to get the input for `parseTruckDetails`. However, `extractStringField` is designed to replace newline characters (`\r?\n`) with spaces to create a single-line string output. This inadvertently corrupted the multi-line structure *before* it reached `parseTruckDetails`, which was expecting line breaks to delimit the key-value pairs. The parser received a single, long string like "NAME: ... IC: ... PHONE: ... TRUCK: ..." causing its line-based Regex to fail.
        *   **Fix Applied:** Modified `_buildShipmentBundleParts` in `services/excel/shipmentBuilder.ts` to bypass `extractStringField` for this specific case. It now retrieves the *raw* value directly from `rowData['truckDetails']`. This raw value preserves the internal newline characters. This correctly formatted, multi-line string is then passed to the `parseTruckDetails` function. The existing `parseTruckDetails` function (which correctly handles splitting by lines and parsing key-value pairs) now receives the input in the expected format and functions as designed.
    *   **Task 15.Y (Verification - Trucking):**
        *   **Action:** Re-ran parsing process.
        *   **Result:** **SUCCESS!** Verified Parsed JSON Output (`parsed_output_ee1de9c2...json`) now contains correctly structured and separated top-level `parsedDriverName`, `parsedDriverPhone`, `parsedTruckIdentifier`, `parsedDriverIc` fields.
    *   **Key Learning:** When dealing with data potentially originating from single cells containing logically distinct, multi-line information, ensure the initial data extraction step preserves the necessary structure (like newlines) required by subsequent parsing functions. Do not assume generic string extraction helpers are always appropriate. Verify the *exact* input being passed between functions.

**Priority 9: New Frontend Features (Planning / Low - Implementation via v0)**

16. **Feature: Add JSON Array Table View**
    *   **Task 16.1 (Data Definition):** Define columns. (e.g., Load #, Order #, Status, Origin City, Dest City, Item Count, Needs Review?, *Add: Primary Item#, 2nd Item#, Lot#*). **PENDING REQUIREMENTS.**
    *   **Task 16.2 (UI Prompting):** Prepare prompt for `v0`. **PENDING.**
    *   **Task 16.3 (Integration):** Integrate generated component. **PENDING.**

17. **Feature: Add Basic Fleet Overview Section**
    *   **Task 17.1 (Data Definition):** Define metrics. (e.g., Total Bundles, Total Weight, # Needs Review). **PENDING REQUIREMENTS.**
    *   **Task 17.2 (UI Prompting):** Prepare prompt for `v0`. **PENDING.**
    *   **Task 17.3 (Integration):** Integrate generated component. **PENDING.**

---

