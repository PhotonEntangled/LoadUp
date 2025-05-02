# LoadUp Troubleshooting Log - Part 2

## Issue: Last Known Location Marker Not Displaying on Static Map (Shipment Page) - Continued from troubleshoot.md

**Date:** 2024-07-30 (Continued)

**Symptoms:**
- The `StaticRouteMap` component on the `/shipments/[documentid]` page does not visually display the marker for the `lastKnownPosition`.
- This occurs even after clicking the "Refresh Location" button, which successfully fetches the LKL data (confirmed by success toast and browser/server logs showing valid GeoJSON Point feature being returned).
- The route line and origin/destination markers render correctly.

**Investigation Plan (Continued):**
1.  Perform detailed code review of marker rendering logic within `StaticRouteMap.tsx`.
2.  Test the component visually after deployment.

**(Next Step - 2024-07-30):** Read and analyze `components/map/StaticRouteMap.tsx` to understand the rendering logic for the `lastKnownPosition` marker.

## Refactoring Live Tracking (Phase 9.R) - Summary

**Date:** 2024-07-31

**Goal:** Refactor live tracking from `/app/tracking/[shipmentId]` to `/app/tracking/[documentId]`, mirroring the `/app/simulation/[documentId]` pattern.

**Key Actions & Observations:**

1.  **Route Correction:** Confirmed `/app/tracking/[documentId]` as the correct target route, aligning with simulation. Updated `LoadUp_Live_Tracking_Plan.md`.
2.  **File System Instability:** Encountered significant issues using `Move-Item` for directory renaming (`[shipmentId]` -> `[documentId]`). Standard commands proved unreliable, leading to inconsistent states. **Concern:** This instability warrants caution; reliance on manual filesystem manipulation introduces potential for error.
3.  **In-Place Refactoring:** Due to file system issues, component refactoring (`TrackingPageView`, `useLiveTrackingStore`, `TrackingMap`) was performed within the *incorrect* `[shipmentId]` path initially.
    *   `TrackingPageView`: Modified to use `documentId`, fetch shipments, handle selection, trigger store subscription, fetch route geometry via new action (`getRouteGeometryAction`), and pass static data (origin/dest coords, route geometry) to `TrackingMap`. Addressed various linter errors.
    *   `useLiveTrackingStore`: Simplified state, updated `subscribe` signature, removed map instance handling.
    *   `TrackingMap`: Updated to receive static data via props.
4.  **Route Fetching Action:** Added `getRouteGeometryAction` in `lib/actions/trackingActions.ts`.
5.  **File Cleanup:** Deleted obsolete `test-*` directories and `app/tracking/page.tsx`. Manually handled deletion of `app/tracking-stabilized`.
6.  **Manual Directory Rename:** Instructed user to *manually* delete any residual `[documentId]` directory and rename `[shipmentId]` to `[documentId]`. **Critical:** User confirmation received, but this manual step bypasses version control tracking for the rename itself and relies on correct execution.
7.  **Navigation UI Updates:**
    *   Added "Track Live" button to `app/documents/page.tsx`.
    *   Replaced combined button on `app/shipments/[documentid]/page.tsx` with separate "Simulate" and "Track Live" buttons (passing `selectedShipmentId` query param for the latter).
8.  **Documentation:** Updated `LoadUp_Live_Tracking_Plan.md` and `docs/fileMap.json` throughout.

**Outcome:** Phase 9.R (Refactoring) is complete. The codebase *should* now reflect the intended structure and logic for document-level live tracking.

**Next Step:** Proceed immediately to Phase 9.9 (Testing) to rigorously verify the refactored implementation, paying close attention to potential side effects from the refactoring process and the manual file system changes.

---

## New Issue: Map not displaying on live tracking page (`/tracking/[documentId]`), shipment cards show N/A, no markers/route. Errors related to SVG loading and potential Firestore subscription failures.

**Date:** [Current Date/Time]

**Context:** Occurred after integrating `last_known_bearing` and attempting to use a custom SVG map marker. Firestore rules might also be blocking reads due to lack of authentication context.

**Troubleshooting Steps:**
1.  Removed custom SVG loading in `TrackingMap.tsx`, reverted to default `'marker-15'` icon. **(Done)**
2.  Identified that Firestore rules require authenticated user (`request.auth != null`).
3.  Confirmed NextAuth Credentials provider has a development user (`dev@loadup.com`). **(Done)**
4.  Confirmed Firebase Project ID (`loadup-logistics-dev`) is correct in `.env.local`. **(Done)**
5.  Verified Firestore Security rules allow reads for authenticated users. **(Done - Rules provided by user)**
6.  Confirmed `FirestoreLiveTrackingService.ts` reads from correct path (`/active_vehicles/{shipmentId}`). **(Done)**
7.  **Next Steps:**
    - Deploy latest fix (default marker).
    - Verify user can log in using dev credentials.
    - Test live tracking page again while authenticated.
    - Check browser console logs and network tab for Firestore connection/read errors *after* logging in.
    - Check Firestore console to confirm mock sender is writing data to the expected path (`/active_vehicles/{shipmentId}`).

---
