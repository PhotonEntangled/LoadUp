# UI Functionality Documentation

**Purpose:** This document details the functionality and intended backend interactions for key UI components within the LoadUp Admin Dashboard. It serves as a guide for UI generation tools (like v0) and frontend developers to ensure consistency between the UI and backend logic.

## 1. Shipment Detail Page (Document-Specific View)

**Page URL:** `/shipments/[documentid]` (Implemented at `app/shipments/[documentid]/page.tsx`)

**Purpose:** Displays a list of individual shipments parsed from a specific uploaded document (`documentid`). Provides details for each shipment via expandable cards, allows selection for a static map preview, and enables actions like downloading shipment data.

**Data Source:** Fetches an array of `ApiShipmentDetail` objects from `GET /api/shipments?documentId=[documentid]`.

## 2. Page Layout (Current Implementation)

The page uses a two-column layout:

*   **Left Column (Main Content):** Displays header information (Document ID, shipment count), a client-side search bar, and a list of `ShipmentCard` components rendered within a Shadcn UI `<Accordion>`.
*   **Right Column (Sticky):** Displays the `StaticRouteMap` component as a map preview for the currently selected shipment.

## 3. Detailed Component Breakdown

### 3.1 Left Column

*   **Header Section:**
    *   Displays `Document ID: [documentid] • [count] shipment(s) found`.
    *   Contains a search input (`<Input type="search">`) to filter the shipment list.
        *   **Functionality:** Filters the currently loaded `shipments` array based on the search term matching *any* field within the `ApiShipmentDetail` object. Uses client-side filtering via `useEffect`/`useState` (`searchTerm`, `filteredShipments`).
        *   **Backend Interaction:** Initial data load from `GET /api/shipments?documentId=[documentid]`. Filtering is client-side after load.
*   **Shipment List Area (`<Accordion type="single" collapsible className="w-full">`):**
    *   Renders a `ShipmentCard` component wrapped in an `<AccordionItem>` for each shipment in `filteredShipments`.
    *   Manages which card is expanded via the Accordion's state.
    *   Displays loading/error/empty placeholders based on the API fetch state.

### 3.2 Shipment Card (`components/shipments/ShipmentCard.tsx`)

*   **UI:** Self-contained, clickable card representing a single shipment, designed to be used within an `<AccordionItem>`. Uses `<AccordionTrigger>` for the header and `<AccordionContent>` for details. Highlights when selected (`isSelected` prop) with a ring. Handles potentially null/missing data gracefully. Shows a loading spinner (`isLoading` prop).
*   **Data Source:** Expects a single prop `shipment` of type `ApiShipmentDetail` (defined in `types/api.ts`).
*   **Header (`<AccordionTrigger>`):**
    *   Displays Load #: `shipment.coreInfo.loadNumber` (or truncated Shipment ID fallback).
    *   Displays PO #: `shipment.coreInfo.poNumber` (if present).
    *   Displays `<StatusBadge status={shipment.coreInfo.status} />`.
    *   Shows loading spinner (`<Loader2>`) instead of status badge if `isLoading` is true.
    *   **Selection Interaction:** Clicking the main header area (excluding the accordion chevron) triggers the `onSelectShipment` callback, passing the `shipment` object. This updates the parent page's `selectedShipment` state.
    *   **Expansion Interaction:** Clicking the accordion chevron toggles the visibility of the `<AccordionContent>`.
*   **Details (`<AccordionContent>`):**
    *   Displayed when the card's accordion item is open.
    *   Shows a grid with:
        *   Pickup Location: `shipment.originAddress.city`, `shipment.originAddress.stateProvince` (with full address in tooltip).
        *   Destination Location: `shipment.destinationAddress.city`, `shipment.destinationAddress.stateProvince` (with full address in tooltip).
        *   Planned Delivery Date: `shipment.coreInfo.plannedDeliveryDate` (Formatted).
    *   **Actions Row:**
        *   Download Dropdown: Offers "Download as CSV" and "Download as JSON" options, triggering `onDownload` callback.
        *   Edit Button: Triggers `onEdit` callback.
        *   **(Note:** The detailed Tabs view described previously in this document under "Shipment Card (**NEW SCHEMA**)" is *not* part of the current `ShipmentCard.tsx` implementation. It likely belongs in a separate `ShipmentDetailView` component or was part of a previous plan.)
*   **Functionality:**
    *   Displays summarized shipment info using `ApiShipmentDetail` data.
    *   Handles selection via `onSelectShipment` prop.
    *   Handles expansion via the parent `<Accordion>`.
    *   Provides Download/Edit actions via props (`onDownload`, `onEdit`).

### 3.3 Right Column - Map Preview (`StaticRouteMap.tsx`)

*   **UI:** Sticky column containing the `StaticRouteMap` component.
*   **Functionality:** Displays a non-interactive map preview for the `selectedShipment`.
    *   Fetches route geometry via `fetchRouteGeometry` (calling `GET /api/maps/directions`) when `selectedShipment` changes and has valid coordinates.
    *   Displays Origin (<0xF0><0x9F><0x8F><0xA0>) and Destination (<0xF0><0x9F><0x8F><0xB4>) markers based on `selectedShipment.originAddress` and `selectedShipment.destinationAddress` coordinates.
    *   Displays the calculated route line (`currentRouteGeometry`).
    *   Optionally displays the last known vehicle position (`currentLastPosition`, fetched via `getShipmentLastKnownLocation` action or derived from initial load) as a <0xF0><0x9F><0x9A><0x9A> marker. Includes a refresh button (`onRefreshLocation`) to re-fetch this.
    *   Includes an "Open Full Tracking" button (`onViewTracking`) - currently navigates to the simulation page.
*   **Interaction:** Updates visually when `selectedShipment` changes, triggering fetches for route and potentially last known location. Shows loading/error states for map data fetching (`mapDataLoading`, `mapError`).
*   **Backend Need:**
    *   Relies on coordinates within the `ApiShipmentDetail` object (`originAddress`, `destinationAddress`).
    *   Calls `GET /api/maps/directions` (proxied Mapbox Directions API) to get route geometry.
    *   Calls `getShipmentLastKnownLocation` server action (optional, for refresh) to get `lastKnownPosition`.

## 4. Backend Data Structure Requirement (`ApiShipmentDetail`)

The backend must provide `GET /api/shipments?documentId=[documentid]` returning an array of objects conforming to the `ApiShipmentDetail` interface defined in `types/api.ts`. This structure includes `coreInfo`, `originAddress`, `destinationAddress`, and potentially other nested details needed by the `ShipmentCard`.

```typescript
// See types/api.ts for the full definition.
// Example Snippet:
import type { ApiShipmentDetail } from '@/types/api';

// API Endpoint: GET /api/shipments?documentId=[documentid]
// Response Body: ApiShipmentDetail[] 
```

## 5. V0 / UI Generation Notes (Current State)

*   **Target Component:** `ShipmentCard.tsx`.
*   **Data:** Accepts `shipment: ApiShipmentDetail` prop.
*   **Parent Page (`app/shipments/[documentid]/page.tsx`):**
    *   Manages fetching `ApiShipmentDetail[]` from the API.
    *   Handles overall loading/error states.
    *   Manages `selectedShipment` state (updated by `ShipmentCard`'s `onSelectShipment`).
    *   Wraps `ShipmentCard` components in `<Accordion>` and `<AccordionItem>`.
    *   Passes interaction handlers (`onSelectShipment`, `onDownload`, `onEdit`) to `ShipmentCard`.
    *   Manages state and fetching for the `StaticRouteMap` (`currentRouteGeometry`, `currentLastPosition`, etc.).
*   **Styling:** Uses Shadcn UI (`Accordion`, `Card` styling via AccordionItem, `Button`, `DropdownMenu`, `Tooltip`, `Badge`) and Tailwind CSS.
*   **Handling Missing Data:** `ShipmentCard` displays 'N/A' or omits elements gracefully for null/undefined fields in `ApiShipmentDetail`.
*   **Map Preview:** The `StaticRouteMap` component is used for the preview, displaying origin/destination/route and optionally last known location. It is *not* the interactive `SimulationMap`.
*   **Simulation Navigation:** The "Open Full Tracking" button on the map preview currently serves as the primary link to navigate to the simulation page (`/simulation/[documentId]`).
