# UI Functionality Documentation

**Purpose:** This document details the functionality and intended backend interactions for key UI components within the LoadUp Admin Dashboard. It serves as a guide for UI generation tools (like v0) and frontend developers to ensure consistency between the UI and backend logic.

## 1. Shipments Table View (`apps/admin-dashboard/components/logistics/shipments/ShipmentTableView.tsx`)

### Description
Displays a table of parsed shipment data obtained from uploaded documents (Excel, TXT). Allows for inspection of core fields, miscellaneous (unmapped) fields, and individual shipment items. Provides actions for downloading shipment data.

### Core Features & Interactions

*   **Data Source:** Populated by an array of `ShipmentData` objects (defined in `types/shipment.ts`).
*   **Core Fields Display:** Shows a predefined set of important fields (Load #, Order #, Ship Date, etc.) as columns. See `CORE_FIELDS` in the component.
    *   **Origin Display:** Displays the raw `pickupWarehouse` field content. If `pickupLocationDetails.resolvedAddress` is available, it could be shown in a tooltip on hover or via an expandable detail section. An icon should indicate the `pickupLocationDetails.resolutionMethod` (e.g., geocoded, lookup, manual, none).
    *   **Destination Display:** Displays the `shipToAddress` field. If `destinationLocation.resolvedAddress` provides a more specific or cleaner version, it could be shown in a tooltip or detail section. Include a resolution method indicator icon here as well.
    *   **Area Display:** Include `shipToArea` as a standard column if deemed important for quick scanning.
*   **Expandable Details (Miscellaneous Fields):**
    *   **Trigger:** Clicking the `Info`/`ChevronDown` icon in the first column of a row.
    *   **Action:** Toggles the visibility of a sub-row displaying:
        *   Key-value pairs from `shipment.miscellaneousFields`.
        *   Potentially more detailed components of `pickupLocationDetails` and `destinationLocation` (like street, city, postal code, coordinates) if not shown elsewhere.
    *   **Backend Interaction:** None directly. Reads data already present in the `ShipmentData` object.
*   **Expandable Items:** (Implementation assumed, based on `ShipmentItemsTable` usage)
    *   **Trigger:** Likely another button or clickable area within the main row (TBD).
    *   **Action:** Toggles the visibility of the `ShipmentItemsTable` component, showing details of items associated with the shipment.
    *   **Backend Interaction:** None directly. Reads `shipment.items` array.
*   **Download Dropdown:**
    *   **Trigger:** Clicking the "Download" button in the "Actions" column.
    *   **Action:** Opens a dropdown menu with options:
        *   **"Download as CSV":**
            *   Calls `downloadShipmentAsCSV` utility (`apps/admin-dashboard/lib/utils.ts`).
            *   Generates a CSV file containing the *core fields*. This should now include `shipToArea`. For location fields, prioritize `resolvedAddress` from `pickupLocationDetails`/`destinationLocation` if available, otherwise use `pickupWarehouse`/`shipToAddress`.
            *   Triggers a browser file download.
            *   **Backend Interaction:** None directly. Uses client-side data.
        *   **"Download as JSON":**
            *   Calls `downloadShipmentAsJSON` utility (`apps/admin-dashboard/lib/utils.ts`).
            *   Generates a JSON file representing the *entire* `ShipmentData` object for the selected shipment, including `items`, `miscellaneousFields`, and the full `pickupLocationDetails` and `destinationLocation` objects.
            *   Triggers a browser file download.
            *   **Backend Interaction:** None directly. Uses client-side data.
*   **Selection Checkbox:** (Presence inferred from `selectedItems` prop)
    *   **Trigger:** Clicking the checkbox in a row (specific column TBD).
    *   **Action:** Toggles the selection state of the shipment, likely calling the `onSelectItem` prop function. Used for bulk actions (future).
    *   **Backend Interaction:** None directly. Manages UI state.
*   **Edit Mode:** (Presence inferred from `isEditMode` and `onEditField` props)
    *   **Trigger:** Likely toggled by a parent component.
    *   **Action:** Renders fields using input elements via `ShipmentField` component, allowing modification.
        *   For location fields, editing might involve updating the raw input (`pickupWarehouse`, `shipToAddress`) or potentially triggering a re-resolution/manual coordinate entry for `pickupLocationDetails`/`destinationLocation`. Edits call the `onEditField` prop function.
    *   **Backend Interaction:** Indirectly triggers updates via `onEditField` prop, which would typically lead to backend API calls in a parent component.

### V0 / UI Generation Notes
*   Replicate the table structure with expandable sections for details/items.
*   Include `shipToArea` in the main columns.
*   Display `pickupWarehouse` and `shipToAddress`. Add tooltips/icons for resolved addresses and resolution status from `pickupLocationDetails` and `destinationLocation`.
*   Implement the Download dropdown with CSV (using resolved addresses preferentially) and JSON (including full location detail objects) options.
*   Ensure core fields match the `CORE_FIELDS` definition.
*   Provide props for `shipments` data, `isEditMode`, and relevant event handlers (`onSelectItem`, `onEditField`).

### Shipment Card View (Alternative / Mobile View) - *Concept*

**Note:** This describes a potential alternative view, separate from the main table. The currently implemented expandable section within the table is described under "Expanded Row Details".

**Layout:** A series of cards, one per shipment, suitable for smaller screens or a more visual overview.

**Key Information (Visible by Default on Card):**

*   **Load #:** `shipment.loadNumber` (Prominent)
*   **Order #:** `shipment.orderNumber`
*   **PO #:** `shipment.poNumber`
*   **Status:** `shipment.status` (Visually distinct, e.g., badge/color)
*   **Pickup:** 
    *   Display `pickupLocationDetails.resolvedAddress` if available and method is not 'none'.
    *   Otherwise, display `pickupLocationDetails.rawInput` or `pickupWarehouse`.
    *   Add a small indicator (e.g., icon) if `resolutionMethod` is 'estimated', 'prescan', or 'manual' vs 'direct'.
*   **Destination:** 
    *   Display `destinationLocation.resolvedAddress`.
    *   Add indicator if resolution method was not 'direct'.
*   **Promised Ship Date:** `shipment.promisedShipDate` (Formatted)
*   **Request Date:** `shipment.requestDate` (Formatted)

**Expandable Details (Click/Tap to Expand Card):**

*   **Pickup Details:**
    *   Raw Input: `pickupLocationDetails.rawInput` (or `pickupWarehouse`)
    *   Resolved: `pickupLocationDetails.resolvedAddress`
    *   Coordinates: `pickupLocationDetails.latitude`, `pickupLocationDetails.longitude` (Perhaps link to a map view)
    *   Method: `pickupLocationDetails.resolutionMethod` / `pickupLocationDetails.resolutionConfidence`
*   **Destination Details:**
    *   Raw Input: `destinationLocation.rawInput`
    *   Resolved: `destinationLocation.resolvedAddress`
    *   Coordinates: `destinationLocation.latitude`, `destinationLocation.longitude`
    *   Method: `destinationLocation.resolutionMethod` / `destinationLocation.resolutionConfidence`
*   **Contact:** `shipment.contactNumber`
*   **Remarks:** `shipment.remarks`
*   **Items:** Display count (`shipment.items.length`) initially. Expand to show a list/table of items similar to the Table View rows:
    *   Item #
    *   Description
    *   Qty
    *   Weight
*   **Weight:** `shipment.totalWeight`
*   **Dates:** `actualShipDate`, `expectedDeliveryDate`
*   **Ship To:** `shipToCustomer`, `shipToArea`
*   **Source Info:** `sourceInfo.sheetName`, `sourceInfo.rowIndex`
*   **Review Status:** `needsReview` (highlight if true)

**Actions (on Card):**

*   Edit Shipment
*   View on Map (if coordinates available)
*   Mark as Reviewed
*   Delete

### Expanded Row Details (Accessed via Chevron)

**Layout:** Appears below the main table row when the chevron icon (<0xF0><0x9F><0x94><0xBD>) is clicked. Uses a grid layout for clarity, particularly for location details.

**Key Sections:**

1.  **Location Details (Appears if `pickupLocationDetails` or `destinationLocation` exist):**
    *   Displayed in a 2-column grid (`md:grid-cols-2`).
    *   **Pickup Card:**
        *   Header: "Pickup" with <0xF0><0x9F><0x97><0xA8>️ icon.
        *   Raw Input: `pickupLocationDetails.rawInput` (or `pickupWarehouse` fallback).
        *   Resolved: `pickupLocationDetails.resolvedAddress`.
        *   Coords: `latitude`, `longitude` (formatted).
        *   Method: `resolutionMethod` with icon (<0xE2><0x9D><0x93> for estimated/prescan, ✅ for direct/manual) indicating confidence.
    *   **Destination Card:**
        *   Header: "Destination" with <0xF0><0x9F><0x97><0xA8>️ icon.
        *   Raw Input: `destinationLocation.rawInput` (or `shipToAddress` fallback).
        *   Resolved: `destinationLocation.resolvedAddress`.
        *   Coords: `latitude`, `longitude` (formatted).
        *   Method: `resolutionMethod` with icon (<0xE2><0x9D><0x93> for estimated/prescan, ✅ for direct/manual) indicating confidence.

2.  **Miscellaneous Fields (Appears if `miscellaneousFields` exist and are not empty):**
    *   Header: "Miscellaneous Fields" with ℹ️ icon.
    *   Displayed in a multi-column grid (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
    *   Each field shown as a key-value pair in a small card.
    *   Supports edit mode via `<Input />` component.

3.  **Items Table (Appears if `expandedItems` state for the row is true - *Note: Currently linked to main row expansion, might need separate toggle*):**
    *   Header: "Items".
    *   Renders the full `ShipmentItemsTable` component, displaying columns for:
        *   Item # (`itemNumber`)
        *   Description (`description`)
        *   Lot/Serial (`lotSerialNumber`)
        *   Qty (`quantity`)
        *   UOM (`uom`)
        *   Weight (`weight`)
        *   Bin (`bin`)
        *   ~~Dimensions~~ (Removed - Not in current data)
        *   ~~Special Handling~~ (Removed - Not in current data)

**Data Mapping Summary:**

*   Uses `pickupLocationDetails` object for pickup info.
*   Uses `destinationLocation` object for destination info.
*   Displays `resolvedAddress` preferably, falls back to `rawInput`.
*   Uses `resolutionMethod` to show status icons.
*   Retains `miscellaneousFields` display (see section below for details).

### Enhanced Section on Miscellaneous Fields Display

**Location:** Rendered within the **Expanded Row Details** section when the chevron (<0xF0><0x9F><0x94><0xBD>) is clicked and if `miscellaneousFields` exists and is not empty.

**Layout & Content:**
*   Header: "Miscellaneous Fields" with ℹ️ icon.
*   Displayed in a multi-column grid (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
*   Each field shown as a key-value pair (Original Header from Excel: Value from Excel) in a small card or list item.
*   Supports edit mode via `<Input />` component if `isEditMode` is true.

**Current State & Future Considerations (Important for v0 / UI Generation):**
*   **Purpose:** This section currently acts as a catch-all for data columns present in the uploaded file but not successfully mapped to a standard field in the `ShipmentData` schema (defined in `types/shipment.ts` and based on `ERD_Schema.md`).
*   **Identified Issues:**
    *   **Misplaced Standard Fields:** Analysis of recent uploads shows some fields that *do* have direct mappings in the ERD (e.g., "Manpower" -> `CustomShipmentDetails.Manpower`) are incorrectly appearing here. This indicates a need for parser refinement in `ExcelParserService.ts`.
    *   **Parsing Errors/Placeholders:** Certain fields (e.g., "Trip Rates", "Total", "STATUS") sometimes appear with seemingly incorrect placeholder values (e.g., "170"). This suggests potential issues in the parsing logic for those specific columns that need further investigation.
    *   **Misplaced Metadata:** Information *about* the parsing process (e.g., `fileName`, `fileSource`, `processingDate`) has sometimes been incorrectly included in `miscellaneousFields`. This data belongs in `sourceInfo` or `parsingMetadata`.
*   **Future UI/UX Improvements:** The current key-value display is functional but basic. Future iterations or v0 generation should consider:
    *   **Grouping/Categorization:** Grouping related miscellaneous fields (e.g., cost-related fields) could improve readability.
    *   **Context/Tooltips:** Providing more context about why a field is considered miscellaneous.
    *   **User Feedback/Mapping Suggestions:** Potentially allowing users to suggest or confirm mappings for recurring miscellaneous fields to improve the parser over time.
    *   **Visual Distinction:** Clearly differentiating between truly unknown data and data that failed parsing or should be mapped elsewhere.

---

### Shipment Table View

**Layout:** A standard data table optimized for displaying multiple shipments with key details visible.

**Columns:**

*   Expand Chevron (<0xF0><0x9F><0x94><0xBD>): Toggles the **Expanded Row Details** section.
*   Core Fields (Defined in `CORE_FIELDS` array):
    *   Load # (`loadNumber`)
    *   Order # (`orderNumber`)
    *   PO # (`poNumber`)
    *   Ship Date (`promisedShipDate` - Formatted)
    *   **Pickup:** (`pickupLocationDetails`)
        *   Displays `resolvedAddress` or `rawInput`.
        *   Includes status icon (<0xE2><0x9D><0x93>/✅) based on `resolutionMethod`.
    *   **Destination:** (`destinationLocation`)
        *   Displays `resolvedAddress` or `rawInput`.
        *   Includes status icon (<0xE2><0x9D><0x93>/✅) based on `resolutionMethod`.
    *   State (`shipToState`)
    *   Contact (`contactNumber`)
    *   Weight (`totalWeight`)
    *   Status (`status`)
    *   Remarks (`remarks`)
*   Items: Shows count (`shipment.items.length`).
*   Actions: Buttons for CSV/JSON download.

**Functionality:**

*   Renders data using `ShipmentField` component for potential edit mode and AI indicators.
*   Handles date formatting via `convertExcelDateToJSDate`.
*   Provides download buttons for individual shipments (CSV/JSON).

# UI Functionality - Shipment Detail Page

**Page URL:** `/shipments/[id]` (Implemented at `apps/admin-dashboard/app/shipments/[id]/page.tsx`)

**Purpose:** Details the functionality, UI components, interactions, and backend data needs for the Shipment Detail page. This page displays the list of individual shipments parsed from a specific uploaded document, provides details for each shipment, and includes a map preview.

## 1. Overview

After selecting a document from the `/documents` page, the user lands here. This page shows a list of shipments extracted from that document. Users can search/filter this list, view details of each shipment (including location info, items, source data, and miscellaneous fields), select a shipment to preview its route on a map, and perform actions like downloading data.

## 2. Page Layout (Current Implementation)

The page uses a two-column layout:

*   **Left Column (Main Content):** Displays the list of `ShipmentCard` components, along with header information (Document ID, shipment count) and a search bar.
*   **Right Column (Sticky):** Displays the `MapPreview` component for the currently selected shipment.

## 3. Detailed Component Breakdown

### 3.1 Left Column

*   **Header Section:**
    *   Displays `Document ID: [id] • [count] shipment(s) found`.
    *   Contains a search input (`<Input type="search">`) to filter the shipment list.
        *   **Functionality:** Filters shipments based on the search term matching *any* field within the `ShipmentData` object (including nested fields like items, locations, misc). Uses client-side filtering via `useEffect` and `useState` (`searchTerm`, `filteredShipments`) based on mock data.
        *   **Backend Need (Phase 3):** Ideally, filtering should happen server-side via `GET /api/shipments?documentId=[id]&search=query`.
*   **Shipment List Area (`<div className="space-y-6">`):**
    *   Renders a `ShipmentCard` component for each shipment in `filteredShipments`.
    *   Displays a placeholder if `filteredShipments` is empty.

### 3.2 Shipment Card (**NEW SCHEMA**) (`components/shipment-detail-page.tsx -> ShipmentCard` - Needs Refactoring/Regeneration)

*   **UI:** Self-contained card representing a single shipment based on the **new ERD-aligned API payload**. Highlights when selected (`isSelected` prop). Handles potentially null/missing data gracefully (displaying 'N/A' or omitting).
*   **Data Source:** Expects an object conforming to the `ShipmentCardDataShape` (defined in `src/types/ShipmentCardDataShape.ts`).
*   **Condensed View (Default):**
    *   **Header:**
        *   Load #: `data.loadNumber` (from `CustomShipmentDetails.customerShipmentNumber`)
        *   Order #: `data.orderNumber` (from `CustomShipmentDetails.customerDocumentNumber`)
        *   PO #: `data.poNumber` (from `DropOffs.customerPoNumbers`) - Display only if present.
        *   Status Badge: Displays text based on `data.status` (derived from `Trips.tripStatus`). Define expected statuses (e.g., 'Planned', 'In Transit', 'Delivered', 'Exception').
    *   **Body:**
        *   Pickup Location: `data.pickupLocation.city`, `data.pickupLocation.state`.
        *   Destination Location: `data.destinationLocation.city`, `data.destinationLocation.state`.
        *   Planned Delivery Date: `data.plannedDeliveryDate` (Formatted, from `CustomBookingDetails.plannedDeliveryDate`). Display 'N/A' if null.
    *   **Footer:** "Show More" button, Action buttons (View on Map, Download, Edit - functionality TBD/Placeholder).
*   **Expanded View (Toggled by "Show More/Less"):**
    *   Reveals a `<Tabs>` component below the condensed view.
    *   **Tabs:**
        *   **Overview:** Displays key dates and details:
            *   `data.remarks` (if present).
            *   Total Weight: `data.totalWeight` (Aggregated from items, display 'N/A' if null).
            *   Planned Pickup: `data.plannedPickupDate` (Formatted).
            *   Planned Delivery: `data.plannedDeliveryDate` (Formatted).
            *   Est. Pickup Arrival: `data.estimatedPickupArrival` (Formatted).
            *   Actual Pickup Arrival: `data.actualPickupArrival` (Formatted, display if present).
            *   Est. Delivery Arrival: `data.estimatedDeliveryArrival` (Formatted).
            *   Actual Delivery Arrival: `data.actualDeliveryArrival` (Formatted, display if present).
            *   Manpower: `data.manpower` (Display if present).
            *   Special Requirements: `data.specialRequirements` (Display if present).
            *   Hazardous: `data.isHazardous` (Display "Yes" or "No").
            *   Equipment: List required equipment (e.g., "Liftgate", "Pallet Jack") based on `data.equipment`.
        *   **Location Details:** Shows two cards (Pickup, Destination) with:
            *   Full Address: `data.pickupLocation.fullAddress` / `data.destinationLocation.fullAddress`.
            *   City, State, Postal Code, Country details.
        *   **Items:** (Requires `ShipmentItems` table in DB)
            *   Displays a `<Table>` listing `data.items`.
            *   Columns: Item #, Description, Lot/Serial #, Quantity, UOM, Weight (KG), Bin. Handles empty item list gracefully.
        *   **Trip Info:**
            *   Trip ID: `data.tripId` (Display if present).
            *   Truck Reg #: `data.tripInfo.truckRegistration` (Display if present).
            *   Transporter: `data.tripInfo.transporterName` (Display if present).
        *   **POD (Proof of Delivery):**
            *   Status: `data.podInfo.podReturned` (Display "Yes" or "No").
            *   Link: `data.podInfo.podUrl` (Provide download/view link if present).
*   **Functionality:**
    *   Displays summarized and detailed shipment info based on the new schema.
    *   `onSelect` prop handles card selection (updates `selectedShipment` state, affecting `MapPreview`).
    *   `onToggleExpand` prop manages the card's expanded state (`expandedCards` state).
    *   Download/Edit/View on Map buttons are placeholders initially; functionality needs re-evaluation based on the new data structure. Map preview requires coordinates from `Addresses` table (not explicitly in current `ShipmentCardDataShape` draft, may need adding or separate fetch).

### 3.3 Right Column - Map Preview (`components/shipment-detail-page.tsx -> MapPreview`)

*   **UI:** Sticky column containing a placeholder map area.
    *   Displays the calculated route summary as a heading (e.g., "Route: Origin Name → Destination Name").
    *   Shows Origin/Destination pins connected by a dashed line.
    *   Displays the selected `shipment.loadNumber`.
    *   Includes a disabled "Open Full Tracking (WIP)" button.
*   **Functionality:** Displays basic route information for the `selectedShipment`.
    *   Currently uses a static placeholder, not a real interactive map.
*   **Interaction:** Updates visually when `selectedShipment` state changes.
*   **Backend Need:** Relies on `ShipmentData` (specifically `pickupLocationDetails` and `destinationLocation` coordinates) passed via the `selectedShipment` prop.

## 4. Backend Data Structure Requirement (**NEW API Payload**)

The backend must provide `GET /api/shipments?documentId=[id]` returning an array of objects conforming *exactly* to the `ShipmentCardDataShape` interface defined in `src/types/ShipmentCardDataShape.ts`.

This API endpoint will be responsible for querying multiple database tables (based on `ERD_Schema.md`, including the new `ShipmentItems` table) and joining/aggregating data to construct the required payload for the frontend `ShipmentCard`.

```typescript
// See src/types/ShipmentCardDataShape.ts for the full definition.
// Example Snippet:
import type { ShipmentCardDataShape } from '@/src/types/ShipmentCardDataShape';

// API Endpoint: GET /api/shipments?documentId=[id]
// Response Body: ShipmentCardDataShape[]
```

## 5. V0 / UI Generation Notes (**NEW Requirements**)

*   **Target:** Generate/Refactor the `ShipmentCard` component (likely within `components/shipment-detail-page.tsx` or as a standalone import) to match the new layout and data requirements outlined in Section 3.2.
*   **Data:** The component must accept a single prop (e.g., `shipmentData`) of type `ShipmentCardDataShape`.
*   **State:** The parent page (`app/shipments/[id]/page.tsx`) will manage fetching the array of `ShipmentCardDataShape` objects from the API (`GET /api/shipments`), handling loading/error states, and managing the `selectedShipment` and `expandedCards` state. It will pass individual `shipmentData` objects and interaction handlers (`onSelect`, `onToggleExpand`) to each rendered `ShipmentCard`.
*   **Styling:** Use Shadcn UI components (`Card`, `Tabs`, `Table`, `Badge`, etc.) and Tailwind CSS.
*   **Handling Missing Data:** Ensure graceful rendering when optional fields in `ShipmentCardDataShape` are null or undefined (e.g., display 'N/A', '-', or omit the section).
*   **Placeholders:** Action buttons (Download, Edit, View on Map) can be placeholders initially. Map Preview integration is separate.

```typescript
// Example structure - Refer to types/shipment.ts for the full definition
interface ShipmentData {
  id: string;
  loadNumber: string;
  // ... other core fields
  pickupLocationDetails: LocationDetails | null;
  destinationLocation: LocationDetails | null;
  items: ShipmentItem[];
  miscellaneousFields: Record<string, any>;
  sourceInfo: SourceInfo | null;
  // ... and all other fields as defined in the canonical type
}

interface LocationDetails {
  rawInput: string | null;
  resolvedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  resolutionMethod: string | null;
  resolutionConfidence: number | null;
}

// ... other nested types (ShipmentItem, SourceInfo)
```

## Phase 3.5a: Frontend Re-Planning (Shipments View)

**Goal:** Align frontend components displaying shipment data with the new relational database schema defined in `ERD_Schema.md`.

### 1. Shipment Card (`ShipmentCard.tsx` - To be Refactored/Generated)

**Purpose:** Display a concise summary of a single shipment, typically within the `ShipmentDetailPage`'s list.

**Assumed Data Needs (for display):**
*   Primary Identifier: `loadNumber` or `orderNumber`
*   Status: `status`
*   Origin Summary: `originAddress.city`, `originAddress.state`
*   Destination Summary: `destinationAddress.city`, `destinationAddress.state`
*   Key Metric: `itemCount` or `customDetails.weight`
*   Indicator: `needsReviewFlag` (e.g., show an icon)

### 2. Shipment Detail Page (`apps/admin-dashboard/app/shipments/[id]/page.tsx`)

**Purpose:** Display a list of all shipments parsed from a specific document (`documentId`). It fetches data and renders multiple `ShipmentCard` components (or a similar list/table item).

**Data Fetching:** Uses `fetch` to call the backend API endpoint responsible for retrieving shipment data for a given document.

### 3. API Endpoint: `GET /api/shipments`

**Purpose:** Provide shipment data (potentially filtered/paginated) associated with a specific document.

**Query Parameter:** `documentId` (Required)

**Proposed Response Payload Structure (`ShipmentApiResponseItem[]`):**

```typescript
interface ShipmentApiResponseItem {
  // --- Core Shipment Info (from shipmentsErd) ---
  shipmentId: string; // UUID
  documentId: string;
  status: string; // e.g., 'Processing', 'Parsed', 'Delivered'
  loadNumber: string | null;
  orderNumber: string | null;
  proNumber: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string

  // --- Related Data (Joined/Fetched) ---
  originAddress: {
    addressId: string;
    fullAddress: string; // Primary display field (or maybe city/state)
    city: string | null;
    state: string | null;
    postalCode: string | null;
  } | null;

  destinationAddress: {
    addressId: string;
    fullAddress: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  } | null;

  pickupDetails: { // From pickups table
    scheduledDate: string | null; // ISO Date string
  } | null;

  dropoffDetails: { // From dropoffs table
    scheduledDate: string | null; // ISO Date string
  } | null;

  customDetails: { // From customShipmentDetails table
    weight: number | null;
    quantity: number | null;
    pieces: number | null;
    pallets: number | null;
    tripRate: number | null;
    dropCharge: number | null;
    manpowerCharge: number | null;
    totalCharge: number | null;
  } | null;

  itemCount: number; // Calculated from items table

  // --- Metadata ---
  parserConfidence: number | null;
  needsReviewFlag: boolean;
  processingErrors: string[] | null;
}
```

**Next Steps (Following this plan):**
1.  **(3.5b)** Refactor/Re-generate UI components (`ShipmentCard`) based on these data needs.
2.  **(3.5c)** Integrate the updated UI components.
3.  **(3.5d)** Update the `/api/shipments` *stub* to return mock data matching this new `ShipmentApiResponseItem` structure.
4.  **(3.5e)** Verify UI against the updated stub.
5.  **(3.5f)** Proceed with Parser Refinement to generate `ParsedShipmentBundle`.
