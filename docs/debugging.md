# Debugging Log

## Simulation Issues (Phase 7)

*   **Lingering Last Known Location (LKL):** The LKL marker persists on the static map (`/shipments/[documentid]`) even after a simulation is stopped or completed. This suggests stale data in `shipments_erd.lastKnown...` columns isn't being cleared or the map isn't correctly interpreting the final state.
*   **Simulation Restart on Navigation:** Navigating away from and back to the `/simulation/[documentId]` page often causes the simulation for the selected shipment to restart from the beginning, losing its previous state. This likely involves page load/`useEffect` logic unconditionally re-initializing the simulation.
*   **Incomplete Route Color Progression:** The visual route progression (green line) on the simulation map sometimes doesn't reach the absolute end of the route, even when the vehicle status is `Pending Delivery Confirmation` or `Completed`.
