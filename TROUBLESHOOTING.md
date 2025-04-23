# Frontend Troubleshooting Log

This log tracks UI/UX issues encountered during development and their resolutions.

---

## Issue 1: Clipped Selection Highlight on List Items

*   **Affected Pages:** 
    *   `/simulation/[documentId]`
    *   `/shipments/[documentid]`
*   **Symptoms:** When selecting a `ShipmentCard` in the left-hand list column, the blue ring highlight was partially cut off.
*   **Root Cause:** The `minmax(width, 1fr)` definition for the left column in the `grid` layout on both pages had a minimum width (e.g., 320px, 350px) that was too small to accommodate the card content plus the visual highlight effect (ring offset).
*   **Resolution:** Increased the minimum width in the `grid-cols-*` definition to `380px` on both pages:
    *   `app/simulation/[documentId]/page.tsx`: Changed `lg:grid-cols-[minmax(350px,_1fr)_3fr]` to `lg:grid-cols-[minmax(380px,_1fr)_3fr]`.
    *   `app/shipments/[documentid]/page.tsx`: Changed `md:grid-cols-[minmax(320px,_1fr)_2fr]` to `md:grid-cols-[minmax(380px,_1fr)_2fr]`.
*   **Status:** Resolved.

---

## Issue 2: Duplicate Accordion Arrows on Simulation Page List

*   **Affected Pages:** `/simulation/[documentId]`
*   **Symptoms:** Each item in the shipment list accordion displayed two downward/upward arrows - one seemingly part of the trigger and another lower down, creating an inconsistent border effect.
*   **Root Cause:** Incorrect usage of the Shadcn `Accordion` component. The entire `ShipmentCard` component was placed inside the `AccordionTrigger`. The standard pattern requires only the trigger *summary* elements inside `AccordionTrigger`, with expandable details placed inside `AccordionContent`.
*   **Resolution:** Restructured the `.map` loop within `app/simulation/[documentId]/page.tsx`:
    1.  Placed only the core header elements (Load #, PO #, Status Badge/Loader) directly inside the `<AccordionTrigger>`.
    2.  Moved the detailed content (Pickup/Destination info, Delivery Date, Action Buttons) into the `<AccordionContent>` section.
    3.  Ensured the `onClick` handler for selection was attached appropriately to the trigger area.
    4.  Extracted the `StatusBadge` component into its own file (`components/shipments/StatusBadge.tsx`) to allow correct import and usage within the refactored trigger.
*   **Status:** Resolved.

--- 