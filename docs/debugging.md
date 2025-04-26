# Debugging Log

## Simulation Issues (Phase 7)

*   **Lingering Last Known Location (LKL):** The LKL marker persists on the static map (`/shipments/[documentid]`) even after a simulation is stopped or completed. This suggests stale data in `shipments_erd.lastKnown...` columns isn't being cleared or the map isn't correctly interpreting the final state.
*   **Simulation Restart on Navigation:** Navigating away from and back to the `/simulation/[documentId]` page often causes the simulation for the selected shipment to restart from the beginning, losing its previous state. This likely involves page load/`useEffect` logic unconditionally re-initializing the simulation.
*   **Incomplete Route Color Progression:** The visual route progression (green line) on the simulation map sometimes doesn't reach the absolute end of the route, even when the vehicle status is `Pending Delivery Confirmation` or `Completed`.

## Code Comparison Findings (vs. origin/main) - [Date YYYY-MM-DD]

Comparison between attached modified files (from main workspace) and baseline `origin/main` (in `LoadUp_compare` directory) revealed the following:

*   **`app/api/simulation/tick-worker/route.ts`:** No changes identified. Modified version matches baseline.
*   **`lib/actions/simulationActions.ts`:** No changes identified. Modified version matches baseline.
*   **`app/shipments/[documentid]/page.tsx`:**
    *   **Primary Change:** Refactored shipment list display to use ShadCN `Accordion` component instead of custom state (`expandedCards`, `toggleCardExpansion`) for managing card expansion/collapse.
    *   Other core logic (data fetching, map rendering, button handlers) appears unchanged.
*   **`app/simulation/[documentId]/page.tsx`:**
    *   **Primary Change:** Altered the pattern for accessing the Zustand simulation store (`SimulationStoreContext`), shifting from primarily `useSimulationStoreContext` hook selectors to using `useContext` + `useStore(store, selector)`.
    *   Core logic and component structure appear unchanged.
*   **`lib/store/useSimulationStore.ts`:**
    *   **Significant Refactoring:**
        *   Error/Loading state management changed from global flags (`error`, `isLoading`) to keyed objects (`errorState`, `loadingState`) for per-action tracking.
        *   Removed direct database update calls (`updateShipmentLastPosition` server action) from the `tickSimulation` function.
        *   `tickSimulation` now triggers a `fetch` call to the `/api/simulation/tick-worker` endpoint on each tick for vehicles 'En Route'.
        *   Removed several actions (`addVehicle`, `setError`, `setLoading`, `confirmPickupAction`, `confirmDropoffAction`).
        *   Added `setVehicleFromServer` and `clearActionError` actions.
        *   Modified `removeVehicle` to clean up new keyed state objects.
        *   Modified error handling in various actions to use the new keyed `errorState`.
