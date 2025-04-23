# UI Functionality - Documents Page (Shipment Slips List)

**Page URL:** `/documents` (Implemented at `apps/admin-dashboard/app/documents/page.tsx`)

**Purpose:** Details the functionality, UI components, interactions, and backend data needs for the Shipment Slips page, listing uploaded documents.

## 1. Overview

Displays uploaded documents, allowing filtering (search by filename, filter by status), uploading new slips, and navigating to view extracted shipments.

## 2. Page Components & Layout (Current Implementation)

*   **Header Area:** Contains search input, status filter, and upload button aligned to the right.
*   **Document Grid:** Displays document cards using `DocumentCard` component (implicitly defined within the page file).

## 3. Detailed Component Breakdown

### 3.1 Header Area

*   **Search Input (`<Input type="search">`):**
    *   **UI:** Input with placeholder "Search documents...".
    *   **Functionality:** Filters documents via API. Updates state (`searchQuery`), debounced value triggers `fetchDocuments`. Backend stub implements basic filename filtering.
    *   **Interaction:** Uses `useState` (`searchQuery`) and `useDebounce`. `onChange` updates state, `useEffect` triggers debounced fetch.
    *   **Backend Need (Phase 3):** `GET /api/documents?search=query` endpoint. -> ✅ API Stub created & filtering implemented.
*   **Status Filter (`<Select>`):**
    *   **UI:** Dropdown with options: 'All', 'Needs Review', 'Delayed', 'In Transit', 'Completed', 'Mixed'.
    *   **Functionality:** Filters documents via API. Updates state (`statusFilter`), triggers `fetchDocuments`. Backend stub implements status filtering.
    *   **Interaction:** Uses `useState` (`statusFilter`). `onValueChange` updates state, `useEffect` triggers fetch.
    *   **Backend Need (Phase 3):** `GET /api/documents?status=filter` endpoint. -> ✅ API Stub created & filtering implemented.
*   **Upload Slip Button (`<Button>`):**
    *   **UI:** Button labeled "↑ Upload Slip".
    *   **Functionality:** Currently logs a message to the console (`handleUpload`). Intended to trigger an upload modal/component.
    *   **Backend Need:** `POST /api/documents/upload` endpoint (for file reception).

### 3.2 Document Grid

*   **UI:** Responsive grid (`sm:grid-cols-2 lg:grid-cols-3`). Includes loading and error states.
*   **Functionality:** Renders `DocumentCard` for each document in `documents` state (fetched from API). Displays loading/error/empty placeholders.
*   **Backend Need (Phase 3):** `GET /api/documents` returning `DocumentMetadata[]`. -> ✅ API Stub created & connected.

### 3.3 Document Card (Implicit Component within `map`)

*   **UI:** Individual card within the grid. Contains:
    *   Filename (`<h3>`)
    *   Status Badge (`<StatusBadge>`) - Displays `doc.shipmentSummaryStatus`.
    *   Delete Button (`<Button variant="ghost" size="icon">`) with Trash icon, wrapped in `<AlertDialog>`.
    *   Date Parsed (`<span>`)
    *   Shipment Count (`<span>`)
    *   "View Shipments" Button (`<Button asChild> <Link>...`) - Navigates to `/shipments/[doc.id]`.
*   **Functionality:** Provides a document summary and navigation link. Triggers deletion confirmation dialog.
*   **Interaction:** 
    *   "View Shipments" button links to the detail page.
    *   Delete button triggers `AlertDialog`.
    *   `AlertDialogAction` calls `handleDeleteDocument(doc.id)`.
*   **Backend Need (per document - `DocumentMetadata`):**
    *   `id`: Unique identifier (used in navigation link).
    *   `filename`: Displayed.
    *   `shipmentSummaryStatus`: Displayed by `StatusBadge`.
    *   `dateParsed`: Displayed (formatted by `formatDate`).
    *   `shipments`: Displayed (shipment count).

## 4. Backend Data Structure Requirement (`DocumentMetadata`)

The backend must provide `GET /api/documents` returning `DocumentMetadata[]` where each object contains at least:

```typescript
interface DocumentMetadata {
  id: string; 
  filename: string; 
  shipmentSummaryStatus: 'Needs Review' | 'Delayed' | 'In Transit' | 'Completed' | 'Mixed'; // Or other relevant statuses
  dateParsed: string | Date; // Date/time parsing completed
  shipments: number; // Count of associated shipments
  // Optional fields like uploadDate, processingStatus ('PROCESSING', 'PROCESSED', 'ERROR'), errorMessage could also be useful.
}
```
*(Note: Adjusted based on current UI usage. `shipmentSummaryStatus` is crucial for the filter/badge.)* -> ✅ API Stub returns this structure.

## 5. V0 / UI Generation Notes (Post-Integration Summary)

*   The component now fetches data from `GET /api/documents` using `fetch` within `useEffect`. 
*   Client-side filtering has been removed. Filtering logic is implemented in the `fetchDocuments` call (via query params) and the backend API stub.
*   Loading and error states are handled during data fetching.
*   The `StatusBadge` component handles rendering based on `shipmentSummaryStatus` (using local component definition).
*   The "View Shipments" button correctly links to `/shipments/[id]`.
*   The layout is responsive.
*   Upload functionality triggers a dialog containing `<LogisticsDocumentUploader />`, with success/error callbacks triggering toasts via the parent page's directly imported `toast` function. 
*   **NEW:** Delete button added to each card, triggering an `AlertDialog` for confirmation. The `handleDeleteDocument` function currently simulates deletion and refreshes the list. Needs connection to `DELETE /api/documents/:id`. ✅ UI Implemented. 