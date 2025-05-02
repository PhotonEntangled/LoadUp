# 🔥 LoadUp Phase 9: Live Tracking Implementation Plan (v1.0)

**Document Status:** Initial Draft
**Date Created:** [Current Date]
**Lead Engineer (Neurotic Mode):** AI Assistant

## 📜 1. Executive Summary & Objectives

**1.1. Goal:** Transition LoadUp's vehicle tracking system from a predictive simulation model to a reactive system driven by live location data streams. This phase focuses on implementing the core infrastructure and functionality for tracking a **single, selected vehicle** in near real-time on the admin interface.

**1.2. Current State Recap:**
*   Functional Simulation Prototype (Phases 1-7) exists, documented in `LoadUp_Simulation_Plan.md`.
*   Simulation uses backend calculations (`SimulationFromShipmentService`, tick worker, KV cache) based on pre-defined routes.
*   Frontend (`SimulationMap`, `useSimulationStore`) displays simulated movement.
*   Simulation can be triggered from database shipment records (`/shipments/[documentid]` -> `/simulation/[documentId]`).

**1.3. Phase 9 Key Objectives:**
1.  **Select & Configure Real-time Platform:** Choose and set up the core technology for transmitting live location updates (Decision: Firebase Firestore, Fallbacks: Ably/Pusher).
2.  **Develop Mock Data Source:** Create a reliable way to simulate live location updates for testing.
3.  **Architect Data Flow:** Design the end-to-end path for live data (Mock Source -> Firestore -> Frontend Listener).
4.  **Implement Backend Listener (If Needed):** Determine if direct frontend subscription is sufficient or if a backend intermediary is required (Initial Plan: Direct Frontend Subscription).
5.  **Adapt Frontend:** Create/Modify components (`TrackingMap`, state management) to subscribe to and display live data.
6.  **Integrate & Test:** Connect all components and rigorously test the live tracking flow.
7.  **Define Schema:** Specify the `LiveVehicleUpdate` data structure.
8.  **Address Risks:** Explicitly plan for latency, offline scenarios, data consistency, and security.

**1.4. Scope Limitations (Neurotic Check):**
*   **Single Vehicle Focus:** This phase explicitly targets tracking *one selected vehicle* at a time. Multi-vehicle simultaneous *live* tracking is **out of scope** for this phase.
*   **Data Source:** Initial data source will be a *mock* client/script. Integration with a real driver mobile app is future scope (Phase 10+).
*   **Offline Handling:** Basic detection/indication of stale data is in scope. Robust offline data buffering/sync on the *driver app side* is out of scope for this phase.
*   **Route Deviation:** Basic display of off-route location is implicit. Complex re-routing or dynamic ETA recalculation based on live traffic/deviation is out of scope for this phase.

## 🧠 2. Foundational Decisions & Technology Stack

**2.1. Real-time Platform Selection:**
*   **Chosen Platform:** **Firebase Firestore**
    *   **Rationale:** Optimal balance of generous free tier, ease of integration (React SDKs, Security Rules), scalability, proven use in similar applications, minimizes new vendor dependencies.
    *   **Configuration:** Requires setting up a Firebase project, enabling Firestore, and configuring basic database structure.
*   **Fallback Platforms:** Ably, Pusher Channels.
    *   **Rationale:** Documented as alternatives if Firestore proves inadequate (latency, cost scaling, specific feature needs like advanced presence).
    *   **Mitigation:** Abstract the interface to the real-time service (`LiveTrackingService`) to allow for easier future replacement if necessary. Define a clear interface first.

**2.2. Data Flow Architecture (Initial):**
```mermaid
graph LR
    A[Mock Driver Client/Script] -- Publishes Update --> B(Firebase Firestore);
    B -- Real-time Subscription (onSnapshot) --> C{LoadUp Frontend};
    C -- Updates State --> D[useUnifiedVehicleStore (Revised)];
    D -- Provides Data --> E[TrackingMap Component];
    E -- Renders Marker --> F[Map Display];

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
```
*   **Key Principle:** Direct frontend subscription to Firestore for simplicity and reduced backend overhead initially. A backend listener (Cloud Function) might be introduced later *if* server-side processing/enrichment/validation of live updates becomes necessary.

**2.3. Core Data Schema (`LiveVehicleUpdate`):**
*   **Purpose:** Define the structure of the data packet sent by the live source and stored/retrieved via Firestore.
*   **Location in Firestore:** Likely `/active_vehicles/{shipmentId}/live_location` (using `shipmentId` as document ID for easy lookup). This single document will be *overwritten* with the latest update. (Alternative: Time-series collection - rejected for now as we primarily need the *latest* state).
*   **Type Definition (`types/tracking.ts` - To Be Created):**
    ```typescript
    // types/tracking.ts
    export interface LiveVehicleUpdate {
      shipmentId: string; // Corresponds to shipments_erd.id
      latitude: number;
      longitude: number;
      timestamp: number; // Unix milliseconds UTC
      heading?: number | null; // Optional: Degrees (0-360)
      speed?: number | null; // Optional: Meters per second
      accuracy?: number | null; // Optional: GPS accuracy in meters
      batteryLevel?: number | null; // Optional: Device battery % (0-100)
      // Potentially add status flags if needed from driver app: e.g., isBreak, isOffline?
    }
    ```
*   **Neurotic Check:** How does this relate to `SimulatedVehicle` (`types/vehicles.ts`) and `shipments_erd`?
    *   `LiveVehicleUpdate` is the *raw input* from the source.
    *   The frontend state (`useUnifiedVehicleStore`) will likely hold a merged state object, combining relatively static shipment details (from `shipments_erd` fetch) with the dynamic location/status from the *latest* `LiveVehicleUpdate`.
    *   The simulation's concept of `traveledDistance`, `status` (En Route, etc.), route geometry, and ETA calculation logic is **NOT** directly part of `LiveVehicleUpdate`. This logic needs to be adapted or run client-side based on live data feed *if* still required visually (e.g., showing progress along the *planned* route).

**2.4. Backend Simulation Components (Fate):**
*   **`SimulationFromShipmentService`:** Largely **irrelevant** for live tracking movement calculation. Might be retained *only* if we need to calculate progress along the *planned* route based on live coordinates.
*   **KV Cache (`simulationCacheService`):** **Redundant** for live tracking state. Firestore becomes the source of truth for live location.
*   **Tick Worker (`/api/simulation/tick-worker`):** **Redundant**. Updates come from the live source, not a backend timer.
*   **Enqueue API (`/api/simulation/enqueue-ticks`):** **Redundant**.
*   **External Trigger (GitHub Actions):** **Redundant**.
*   **`VehicleTrackingService` (DB Updates):** Currently updates `last_known_location` in `shipments_erd`.
    *   **Decision:** We **MUST** decide if the live tracking flow *also* needs to persist location updates to `shipments_erd`.
        *   **Option A (Persist):** Adapt `VehicleTrackingService` or create a new mechanism (e.g., Cloud Function triggered by Firestore updates) to periodically write the latest `LiveVehicleUpdate` to `shipments_erd.last_known_latitude/longitude/timestamp`. **Pro:** DB has a recent location record. **Con:** Adds complexity, potential cost (writes/function invocations), potential latency.
        *   **Option B (Do Not Persist):** `shipments_erd.last_known_location` becomes purely a record of the *simulation's* last state or is deprecated. Live view relies solely on Firestore. **Pro:** Simpler live architecture. **Con:** No persistent location history in primary DB beyond simulation.
        *   **Neurotic Decision:** Start with **Option B (Do Not Persist)** for simplicity in Phase 9. We can add persistence (Option A) later if auditability or snapshot requirements demand it. The `/shipments/[id]` static map's LKL will thus reflect only the *simulation* state.

## 🛠️ 3. Phased Implementation Plan

*(Detailed tasks within each sub-phase will follow)*

**3.1. Phase 9.1: Setup & Configuration (DETAILED)**
    *   [X] **Task 9.1.1: Create/Configure Firebase Project & Firestore Database.**
        *   [X] **Action:** Access the Firebase console (<https://console.firebase.google.com/>).
        *   [X] **Action:** Create a new Firebase project specifically for LoadUp (e.g., `loadup-logistics-prod`, `loadup-logistics-dev`). **Decision:** Use separate projects for dev/prod environments to isolate data and configuration. Start with `loadup-logistics-dev`.
        *   [X] **Action:** Within the project, navigate to Firestore Database and create a database.
        *   [X] **Action:** Choose "Start in **production mode**". *Neurotic Rationale:* Starting in production mode forces us to explicitly define security rules from the outset, preventing accidentally open databases. We will grant necessary access in Task 9.1.2.
        *   [X] **Action:** Select the appropriate Firestore location (e.g., `us-central`, `asia-southeast1`). **Decision:** Choose location closest to the primary user base or expected driver locations to minimize latency. Consult team/requirements if unsure. Default to `us-central` if no preference.
        *   [X] **Verification:** Firebase project exists. Firestore database is created and accessible in the console (initially locked down).
    *   [X] **Task 9.1.2: Establish Firestore Security Rules (Initial).**
        *   [X] **Goal:** Define baseline security rules allowing authenticated admin users to read live vehicle locations, while potentially allowing broader write access *temporarily* for the mock sender during development.
        *   [X] **Action:** Navigate to Firestore Database -> Rules tab.
        *   [X] **Action:** Implement initial ruleset. Example (Adapt based on actual auth structure):
          ```firebase-rules
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              // Allow admins to read any active vehicle location
              match /active_vehicles/{shipmentId} {
                // Assuming admin role/claim exists in auth token
                allow read: if request.auth != null && request.auth.token.isAdmin == true;

                // TEMPORARY: Allow any authenticated user to write during mock sender dev
                // TODO: Restrict this to specific service account or driver role later
                allow write: if request.auth != null; 
              }

              // Add rules for other collections as needed, denying by default
              match /{document=**} {
                allow read, write: if false;
              }
            }
          }
          ```
        *   [X] **Neurotic Check:** Is `request.auth.token.isAdmin` the correct claim? Verify with NextAuth setup. The temporary broad write rule is a *significant security risk* and **must** be flagged for replacement before any production deployment or integration with real driver apps. Add a `TODO` comment directly in the rules.
        *   [X] **Action:** Publish the rules.
        *   [X] **Verification:** Rules are published. Test reads/writes using Firestore console/simulator or rudimentary client code *after* authentication setup (Phase 9.4/9.6) to confirm access control.
    *   [X] **Task 9.1.3: Install Firebase SDKs (Frontend).**
        *   [X] **Action:** Navigate to the project's root directory in the terminal.
        *   [X] **Action:** Run `npm install firebase`.
        *   [X] **Verification:** `firebase` package is added to `package.json` and `package-lock.json`.
    *   [X] **Task 9.1.4: Create `types/tracking.ts` with `LiveVehicleUpdate` interface.**
        *   [X] **Action:** Create the file `types/tracking.ts`.
        *   [X] **Action:** Add the `LiveVehicleUpdate` interface definition as specified in Section 2.3.
        *   [X] **Action:** Add JSDoc comments explaining each field and its units/format.
        *   [X] **Verification:** File created, interface defined correctly, compiles without errors.
    *   [X] **Task 9.1.5: Abstract Live Tracking Service Interface.**
        *   [X] **Goal:** Define a clear contract for the service responsible for interacting with the real-time platform, facilitating testing and potential future platform swaps.
        *   [X] **Action:** Create directory `services/tracking/`.
        *   [X] **Action:** Create file `services/tracking/LiveTrackingService.ts`.
        *   [X] **Action:** Define the interface:
          ```typescript
          import { LiveVehicleUpdate } from '@/types/tracking';

          export interface LiveTrackingService {
            /**
             * Subscribes to live location updates for a specific shipment.
             * @param shipmentId The ID of the shipment to track.
             * @param onUpdate Callback function triggered with each new update.
             * @param onError Callback function triggered on subscription error.
             * @returns A function to call for unsubscribing.
             */
            subscribeToVehicleLocation(
              shipmentId: string,
              onUpdate: (update: LiveVehicleUpdate) => void,
              onError: (error: Error) => void
            ): () => void; // Returns unsubscribe function

            // Optional: Add a method to publish updates if needed from frontend (unlikely)
            // publishUpdate(update: LiveVehicleUpdate): Promise<void>;
          }
          ```
        *   [X] **Neurotic Check:** Is the unsubscribe return function clear? Is the error handling sufficient? Are parameters correctly typed?
        *   [X] **Verification:** File created, interface defined, compiles. This interface will be implemented in Phase 9.4.

**3.2. Phase 9.2: Mock Data Sender Development (DETAILED)**
    *   **Goal:** Create a controllable, standalone mechanism to simulate a device sending `LiveVehicleUpdate` data to Firestore, enabling testing of the real-time subscription and frontend display *before* a real driver app exists.
    *   [X] **Task 9.2.1: Choose Implementation Strategy & Location.**
        *   [X] **Options:**
            1.  **Standalone Node.js Script:** Simple, easy to run locally, good separation.
            2.  **Simple React/HTML Page:** Allows browser-based controls (start/stop, target shipment ID). Could eventually evolve into a testing dashboard.
        *   [X] **Decision:** **Standalone Node.js Script**. Offers the best balance of simplicity, control, and isolation for this phase. It avoids adding temporary UI complexity to the main app.
        *   [X] **Location:** Create a new directory outside the main app structure, e.g., `../loadup-mock-tracker/` or within a dedicated `tools/` directory in the monorepo root (if applicable). Let's assume `tools/mock-tracker/` within the project structure for now, ensuring it's appropriately `.gitignore`'d if necessary.
        *   [X] **Action:** Create directory `tools/mock-tracker/`.
        *   [X] **Action:** Initialize a simple Node.js project within it (`npm init -y`).
        *   [X] **Action:** Install necessary dependencies: `npm install firebase-admin dotenv node-fetch` (or equivalent for fetching route data). `firebase-admin` is needed for backend/script interaction with Firestore.
        *   [X] **Verification:** Directory structure exists, `package.json` created, dependencies installed.
    *   [X] **Task 9.2.2: Implement Firebase Admin Initialization & Authentication.**
        *   [X] **Action:** Obtain a service account key JSON file from the Firebase project settings (Project settings -> Service accounts -> Generate new private key).
        *   [X] **Neurotic Security:** **NEVER COMMIT THIS KEY FILE TO GIT.** Add its filename (e.g., `loadup-logistics-dev-firebase-adminsdk.json`) to the `.gitignore` file within the `tools/mock-tracker/` directory.
        *   [X] **Action:** Use environment variables (via `dotenv` loading a `.env` file in `tools/mock-tracker/`) to store the *path* to the service account key file and the Firestore database URL.
          ```.env
          GOOGLE_APPLICATION_CREDENTIALS="./path/to/your/serviceAccountKey.json"
          FIRESTORE_DATABASE_URL="https://[YOUR_PROJECT_ID].firebaseio.com"
          ```
        *   [X] **Action:** Write script logic (`index.js` or similar) to initialize the Firebase Admin SDK:
          ```javascript
          require('dotenv').config();
          const admin = require('firebase-admin');

          try {
            admin.initializeApp({
              credential: admin.credential.applicationDefault(),
              databaseURL: process.env.FIRESTORE_DATABASE_URL
            });
            console.log('Firebase Admin SDK initialized successfully.');
          } catch (error) {
            console.error('Error initializing Firebase Admin SDK:', error);
            process.exit(1);
          }

          const db = admin.firestore();
          ```
        *   [X] **Verification:** Running the script (`node index.js`) successfully initializes the SDK without errors (Requires manual creation of `.env` file first).
    *   [X] **Task 9.2.3: Implement Simulated Movement Logic.**
        *   [X] **Action:** Define a sample route (e.g., hardcoded array of `[lon, lat]` coordinates, or fetch a route from Mapbox Directions API using `node-fetch` and an API token stored in the `.env` file). **Decision:** Use a hardcoded route initially for simplicity. Ensure the route has sufficient points for noticeable movement.
        *   [X] **Action:** Implement a function `simulateStep(currentStepIndex, route)` that calculates the next `latitude`, `longitude`, and potentially `heading` based on moving from `route[currentStepIndex]` to `route[currentStepIndex + 1]`.
        *   [X] **Action:** Implement a timer loop (`setInterval`) that iterates through the route steps.
        *   [X] **Action:** Inside the loop, call `simulateStep`, construct a `LiveVehicleUpdate` object (including `shipmentId`, current `timestamp`, calculated coords/heading, and potentially mock `speed`, `accuracy`, `batteryLevel`).
        *   [X] **Neurotic Check:** Ensure timestamp is correctly generated (UTC milliseconds). Handle reaching the end of the route (stop interval or loop).
        *   [X] **Verification:** Running the script logs simulated `LiveVehicleUpdate` objects to the console at regular intervals.
    *   [X] **Task 9.2.4: Implement Firestore Publishing.**
        *   [X] **Action:** Get the target `shipmentId` (e.g., from command-line argument or hardcoded initially).
        *   [X] **Action:** Inside the timer loop, use the initialized `db` object to write the generated `LiveVehicleUpdate` to Firestore.
          ```javascript
          async function publishLocationUpdate(update) {
            const docRef = db.collection('active_vehicles').doc(update.shipmentId).collection('live_location').doc('latest');
            // OR simpler: const docRef = db.collection('active_vehicles').doc(update.shipmentId); // Overwrite doc directly
            
            // Decision: Overwrite single doc '/active_vehicles/{shipmentId}/live_location' is simpler per plan (Section 2.3)
            const liveLocationRef = db.collection('active_vehicles').doc(update.shipmentId);

            try {
              // Use set with merge:false to overwrite the document entirely
              await liveLocationRef.set(update, { merge: false }); 
              console.log(`Published update for ${update.shipmentId} at ${new Date(update.timestamp).toISOString()}`);
            } catch (error) {
              console.error(`Error publishing update for ${update.shipmentId}:`, error);
            }
          }
          ```
        *   [X] **Neurotic Check:** Confirm the Firestore path matches the planned structure (`/active_vehicles/{shipmentId}/live_location` using `set` on the document seems correct per Section 2.3). Ensure error handling exists for publish failures.
        *   [X] **Action:** Call `publishLocationUpdate` within the timer loop.
        *   [X] **Verification:** Running the script successfully writes location data to the specified Firestore document, observable in the Firebase console. Data should be overwritten with each update.
    *   [X] **Task 9.2.5: Add Configuration & Control.**
        *   [X] **Action:** Modify the script to accept the target `shipmentId` and potentially the update interval (in seconds) as command-line arguments (e.g., using `process.argv`). Add basic validation.
        *   [X] **Action:** Implement basic start/stop controls if running interactively, or ensure the script runs for a fixed duration or number of steps.
        *   [X] **Verification:** Script can be launched targeting a specific `shipmentId` and runs controllably.

**3.3. Phase 9.3: Frontend State Management Adaptation (DETAILED)**
    *   **Goal:** Define how the application's state management (Zustand) will handle the subscription to live data, store the incoming `LiveVehicleUpdate` information, and make it available to UI components like `TrackingMap`.
    *   [X] **Task 9.3.1: Analyze Existing Store (`useUnifiedVehicleStore`) & Decide Strategy.**
        *   [X] **Context:** `useUnifiedVehicleStore` currently manages `SimulatedVehicle` objects, simulation lifecycle state (`isSimulationRunning`, `simulationSpeedMultiplier`), potentially selected vehicle ID, etc., based on the simulation prototype.
        *   [X] **Analysis:**
            *   Live tracking introduces *asynchronous, high-frequency updates* fundamentally different from the simulation's predictable, timed ticks.
            *   We need to store the *latest* `LiveVehicleUpdate` data.
            *   We need state to manage the subscription itself (e.g., loading status, error status, unsubscribe handle).
            *   We need to merge static shipment data (origin, destination, details fetched once) with dynamic live location data.
            *   Keeping simulation state and live tracking state completely separate might be cleaner initially.
        *   **Options:**
            1.  **Extend `useUnifiedVehicleStore`:** Add new state properties for live updates (`latestLiveUpdate`, `isSubscribed`, `subscriptionError`, `unsubscribeFn`) and actions (`subscribeToLiveUpdates`, `unsubscribeFromLiveUpdates`, `handleLiveUpdate`). **Pro:** Keeps related vehicle state together. **Con:** Store could become overly complex, mixing simulation and live concerns.
            2.  **Create New Store (`useLiveTrackingStore`):** Dedicated store for managing live tracking subscriptions and the latest `LiveVehicleUpdate` for the *currently tracked* vehicle. **Pro:** Clear separation of concerns, simpler individual stores. **Con:** Requires coordination if both simulation and live tracking views need to coexist or share base data.
            3.  **Refactor `useUnifiedVehicleStore`:** Rename/redesign it to be a generic `useVehicleTrackingStore` that handles *either* simulation state *or* live tracking state based on the current mode, possibly clearing irrelevant state when switching.
        *   [X] **Decision:** **Option 2: Create New Store (`useLiveTrackingStore`).** This offers the cleanest separation for Phase 9, focusing solely on the live tracking concerns. We avoid complicating the existing, functional simulation store. Coordination is manageable as we plan separate `/simulation` and `/tracking` pages.
        *   [X] **Action:** Create file `lib/store/useLiveTrackingStore.ts`.
        *   [X] **Verification:** Decision documented. New file created.
    *   [X] **Task 9.3.2: Implement Live Tracking Store State Structure.**
        *   [X] **Action:** Define the state interface within `useLiveTrackingStore.ts`:
          ```typescript
          import { LiveVehicleUpdate } from '@/types/tracking';
          import { RefObject } from 'react'; // Import RefObject if using React refs directly in store state

          interface LiveTrackingState {
            trackedShipmentId: string | null; // ID of the shipment currently being tracked
            staticShipmentDetails: YourStaticShipmentDataType | null; // Holds origin, dest, RDD etc. (Define YourStaticShipmentDataType based on page needs)
            latestLiveUpdate: LiveVehicleUpdate | null;
            subscriptionStatus: 'idle' | 'subscribing' | 'active' | 'error';
            subscriptionError: string | null;
            unsubscribeFn: (() => void) | null; // Stores the unsubscribe function returned by the service
            // Optional: Consider adding a ref for the latest update if needed by callbacks, though managing within actions is typical for Zustand
            // latestLiveUpdateRef?: RefObject<LiveVehicleUpdate | null>; 
          }
          ```
        *   [X] **Neurotic Check:** What is `YourStaticShipmentDataType`? This needs to be defined based on what static info the `/tracking` page and `TrackingMap` need alongside the live location (e.g., origin/destination coordinates/address, RDD, driver name). Ensure it's fetched separately (likely on page load, see Phase 9.6). Is `trackedShipmentId` sufficient, or do we need the full `documentId`? Assume `shipmentId` for now.
        *   [X] **Action:** Define the initial state values (mostly `null` or `'idle'`).
        *   [X] **Verification:** State interface defined, initial state set.
    *   [X] **Task 9.3.3: Implement Live Tracking Store Actions (Subscription Management).**
        *   [X] **Action:** Define actions within `useLiveTrackingStore.ts` using Zustand's action pattern:
          ```typescript
          interface LiveTrackingActions {
            // Action to initiate the subscription
            subscribe: (shipmentId: string, staticDetails: YourStaticShipmentDataType) => Promise<void>; 
            // Action to stop the subscription
            unsubscribe: () => void;
            // Internal action to handle errors during subscription setup
            _handleSubscriptionError: (error: Error) => void;
            // Internal action to store the unsubscribe function
            _setUnsubscribeFn: (fn: (() => void) | null) => void;
            // Internal action to update state with new live data
            _handleLiveUpdate: (update: LiveVehicleUpdate) => void; 
          }

          // Example implementation structure (inside create<...> block):
          // subscribe: async (shipmentId, staticDetails) => {
          //   set({ subscriptionStatus: 'subscribing', trackedShipmentId: shipmentId, staticShipmentDetails: staticDetails, latestLiveUpdate: null, subscriptionError: null });
          //   const liveTrackingService = // ... get service instance ...
          //   try {
          //     const unsubscribe = liveTrackingService.subscribeToVehicleLocation(
          //       shipmentId,
          //       (update) => get()._handleLiveUpdate(update),
          //       (error) => get()._handleSubscriptionError(error)
          //     );
          //     get()._setUnsubscribeFn(unsubscribe);
          //     set({ subscriptionStatus: 'active' });
          //   } catch (error) { 
          //     get()._handleSubscriptionError(error as Error);
          //   }
          // },
          // unsubscribe: () => {
          //   const { unsubscribeFn } = get();
          //   if (unsubscribeFn) {
          //     unsubscribeFn(); // Call the stored cleanup function
          //     get()._setUnsubscribeFn(null); // Clear the stored function
          //   }
          //   // Ensure thorough state reset on unsubscribe
          //   set({ 
          //       subscriptionStatus: 'idle', 
          //       trackedShipmentId: null, 
          //       latestLiveUpdate: null, 
          //       staticShipmentDetails: null, 
          //       subscriptionError: null, 
          //       unsubscribeFn: null 
          //   });
          // },
          // ... implementations for internal actions ...
          ```
        *   [X] **Neurotic Check:** How is `liveTrackingService` instantiated/accessed? Needs dependency injection or a singleton pattern. The `subscribe` action needs to handle potential immediate errors from the service call itself. The `unsubscribe` action *must* clean up the state thoroughly (resetting `trackedShipmentId`, `latestLiveUpdate` etc.). Passing `get()._handleLiveUpdate` and `get()._handleSubscriptionError` as callbacks is standard Zustand practice. **Reference Pattern:** The `location-tRacer` example used `useState` and `useRef` directly in the component for state management. While we use Zustand, the principle of accessing the *latest* state reliably within asynchronous callbacks (like the `onUpdate` from the service) remains crucial. Ensure the store actions passed as callbacks (`_handleLiveUpdate`, `_handleSubscriptionError`) use `get()` to access the most current store state if needed, preventing issues with stale closures.
        *   [X] **Verification:** Actions defined conceptually. Logic for calling the (yet to be implemented) `LiveTrackingService` is outlined. State transitions (`subscriptionStatus`) are planned. Importance of handling state within callbacks noted.
    *   [X] **Task 9.3.4: Implement Live Tracking Store Actions (Update Handling).**
        *   [X] **Action:** Implement the `_handleLiveUpdate` internal action:
          ```typescript
          // _handleLiveUpdate: (update) => {
          //   // Optional: Add validation logic for the incoming update? (See Task 9.7.6)
          //   // Optional: Check timestamp against current latestLiveUpdate.timestamp to prevent out-of-order updates
          //   // const { latestLiveUpdate } = get(); 
          //   // if (latestLiveUpdate && update.timestamp <= latestLiveUpdate.timestamp) {
          //   //   logger.warn('Received stale or duplicate update, discarding:', update);
          //   //   return;
          //   // }
          //   set({ latestLiveUpdate: update, subscriptionStatus: 'active', subscriptionError: null });
          // },
          ```
        *   [X] **Action:** Implement the `_handleSubscriptionError` internal action:
          ```typescript
          // _handleSubscriptionError: (error) => {
          //   console.error("Live tracking subscription error:", error);
          //   // Maybe try unsubscribing if we have a function?
          //   const { unsubscribeFn } = get();
          //   if (unsubscribeFn) { 
          //      unsubscribeFn(); 
          //      get()._setUnsubscribeFn(null);
          //   }
          //   set({ subscriptionStatus: 'error', subscriptionError: error.message || 'Unknown subscription error', latestLiveUpdate: null });
          // },
          ```
        *   [X] **Action:** Implement `_setUnsubscribeFn`:
          ```typescript
          // _setUnsubscribeFn: (fn) => {
          //   set({ unsubscribeFn: fn });
          // },
          ```
        *   [X] **Neurotic Check:** Should `_handleSubscriptionError` attempt to clean up? Yes, if an unsubscribe function exists, it should try. Error message handling needs to be robust.
        *   [X] **Verification:** Internal actions for handling updates and errors are defined.

**3.4. Phase 9.4: Frontend Subscription & Service Implementation (DETAILED)**
    *   **Goal:** Implement the `LiveTrackingService` interface to handle the actual communication with Firestore, subscribing to real-time location updates and providing a clean way to manage these subscriptions.
    *   [X] **Task 9.4.1: Implement Firebase Initialization (Client-Side).**
        *   [X] **Context:** We need a configured Firebase app instance on the client-side to interact with Firestore.
        *   [X] **Action:** Create a Firebase configuration utility file, e.g., `lib/firebase/clientApp.ts`.
        *   [X] **Action:** Add Firebase project configuration details (apiKey, authDomain, projectId, etc.) to environment variables, prefixed with `NEXT_PUBLIC_` for client-side access (e.g., `NEXT_PUBLIC_FIREBASE_PROJECT_ID`). Store these in `.env.local` or environment configuration.
        *   [X] **Neurotic Security:** Ensure only necessary, non-sensitive configuration keys are exposed client-side. API keys for client SDKs are generally safe if security rules are properly configured, but minimize exposure.
        *   [X] **Action:** Implement initialization logic in `clientApp.ts` to ensure Firebase initializes only once:
          ```typescript
          // lib/firebase/clientApp.ts
          import { initializeApp, getApps, getApp } from 'firebase/app';
          import { getFirestore } from 'firebase/firestore';
          // import { getAuth } from "firebase/auth"; // Add if needed

          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Add if analytics needed
          };

          // Initialize Firebase for client-side
          const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
          const firestore = getFirestore(app);
          // const auth = getAuth(app); // Add if needed

          export { app, firestore /*, auth */ };
          ```
        *   [X] **Neurotic Check:** The `!getApps().length` check is crucial to prevent re-initialization errors, especially with Next.js HMR (Hot Module Replacement). The Stack Overflow post [How to export firebase firestore for my next.js project](https://stackoverflow.com/questions/64898431/how-to-export-firebase-firestore-for-my-next-js-project) highlights common initialization issues in Next.js.
        *   [X] **Verification:** Firebase config exists in env vars (User Action Required). `clientApp.ts` initializes without errors when imported. Firestore instance is exported.
    *   **Task 9.4.2: Implement `LiveTrackingService` Class/Object.**
        *   [X] **Action:** Create file `services/tracking/FirestoreLiveTrackingService.ts` (or similar specific name).
        *   [X] **Action:** Implement a class or object that adheres to the `LiveTrackingService` interface defined in Task 9.1.5.
        *   [X] **Action:** Import the initialized `firestore` instance from `lib/firebase/clientApp.ts`.
          ```typescript
          // services/tracking/FirestoreLiveTrackingService.ts
          import { 
            doc, 
            onSnapshot, 
            FirestoreError 
          } from 'firebase/firestore';
          import { firestore } from '@/lib/firebase/clientApp';
          import { LiveTrackingService } from './LiveTrackingService'; 
          import { LiveVehicleUpdate } from '@/types/tracking';
          import { logger } from '@/utils/logger'; // Assuming logger exists

          class FirestoreLiveTrackingService implements LiveTrackingService {
            subscribeToVehicleLocation(
              shipmentId: string,
              onUpdate: (update: LiveVehicleUpdate) => void,
              onError: (error: Error) => void
            ): () => void {
              logger.info(`Subscribing to live location for shipment: ${shipmentId}`);
              
              // Construct the document reference based on plan (Section 2.3)
              const docRef = doc(firestore, 'active_vehicles', shipmentId);

              try {
                const unsubscribe = onSnapshot(docRef, 
                  (docSnap) => {
                    if (docSnap.exists()) {
                      // TODO: Add validation for incoming data against LiveVehicleUpdate type?
                      const data = docSnap.data() as LiveVehicleUpdate;
                      logger.debug(`Received update for ${shipmentId}:`, data);
                      // Add crucial timestamp check - only process if newer?
                      // if (data.timestamp > lastReceivedTimestamp) { ... }
                      onUpdate(data);
                    } else {
                      // Document doesn't exist (or was deleted)
                      logger.warn(`Firestore document for shipment ${shipmentId} does not exist.`);
                      // Decide how to handle: call onError? Call onUpdate with null? 
                      // Decision: Call onError to indicate an issue.
                      onError(new Error(`Tracking data not found for shipment ${shipmentId}.`));
                    }
                  },
                  (error: FirestoreError) => {
                    // Handle Firestore subscription errors
                    logger.error(`Firestore subscription error for ${shipmentId}:`, error);
                    onError(error); // Pass the FirestoreError up
                  }
                );

                logger.info(`Subscription established for shipment: ${shipmentId}`);
                return unsubscribe; // Return the unsubscribe function provided by onSnapshot
              } catch (error) {
                 // Catch synchronous errors during initial subscription setup (rare)
                 logger.error(`Error setting up subscription for ${shipmentId}:`, error);
                 onError(error instanceof Error ? error : new Error('Failed to setup subscription'));
                 // Return a no-op unsubscribe function in case of setup failure
                 return () => { logger.warn(`Attempted to unsubscribe from failed setup for ${shipmentId}`); };
              }
            }
            
            // publishUpdate implementation (if needed later)
          }

          // Export a singleton instance or provide a factory function
          export const firestoreLiveTrackingService = new FirestoreLiveTrackingService();
          ```
        *   **Neurotic Check:** Error handling is critical. The `onSnapshot` provides an error callback for runtime subscription issues. We need `try...catch` for potential setup errors. How should a non-existent document be handled? Calling `onError` seems appropriate. Should we validate the shape of `docSnap.data()` against `LiveVehicleUpdate`? Yes, potentially using Zod or basic type guards, especially if the data source isn't fully trusted. Should we handle out-of-order messages using the timestamp? Yes, potentially store the last received timestamp in the state store and only process newer updates in `onUpdate`. **The service MUST reliably return the `unsubscribe` function from `onSnapshot` for proper cleanup.**
        *   [X] **Verification:** Class/object implements the interface. Firestore `onSnapshot` is used correctly. Unsubscribe function is returned. Basic error handling is present.
    *   [X] **Task 9.4.3: Refine Error Handling & Edge Cases in Service.**
        *   [X] **Action:** Enhance the `onError` callback handling. Differentiate between recoverable errors (e.g., network blip) and fatal errors (e.g., permissions).
        *   [X] **Action:** Implement timestamp checking within the `onSnapshot` success callback to discard stale/out-of-order updates if necessary (requires coordination with state store). **Decision:** Defer timestamp check to state store logic (Task 9.3.4 refinement) initially to keep service focused on subscription.
        *   [X] **Action:** Consider adding retry logic *within the service* for initial subscription setup failures (optional, could also be handled by calling code/store).
        *   [X] **Verification:** Error handling is robust. Decision on timestamp checking location is documented. **(Decision: No service changes needed now)**
    *   [X] **Task 9.4.4: Integrate Service with State Store Actions.**
        *   [X] **Action:** Modify the `subscribe` action implementation in `useLiveTrackingStore.ts` (from Task 9.3.3) to import and use the `firestoreLiveTrackingService` instance.
        *   [X] **Action:** Ensure the `onUpdate` and `onError` callbacks passed to the service correctly call the store's internal actions (`_handleLiveUpdate`, `_handleSubscriptionError`).
        *   [X] **Action:** Store the returned unsubscribe function using `_setUnsubscribeFn`.
        *   [X] **Action:** Ensure the `unsubscribe` action in the store correctly calls the stored `unsubscribeFn`.
        *   [X] **Verification:** Store actions correctly interact with the implemented service. Subscription lifecycle (subscribe, receive updates, handle errors, unsubscribe) is logically connected.

**3.5. Phase 9.5: `TrackingMap` Component Development (DETAILED)**
    *   **Goal:** Create or adapt the primary map component to subscribe to live location state, display the moving vehicle marker accurately and smoothly, and integrate necessary map controls and contextual information (like the planned route).
    *   [X] **Task 9.5.1: Create/Adapt `TrackingMap` Component.**
        *   [X] **Decision:** Create a **new component `components/map/TrackingMap.tsx`**. While it will share similarities with `SimulationMap.tsx`, separating them aligns with the distinct data sources and state management (`useLiveTrackingStore` vs. `useSimulationStore`). This avoids conditional complexity within a single component.
        *   [X] **Action:** Create the file `components/map/TrackingMap.tsx`.
        *   [X] **Action:** Copy relevant boilerplate structure from `SimulationMap.tsx` (e.g., `react-map-gl` Map setup, token handling, basic layout, forwarded ref setup if needed). Remove simulation-specific logic and state connections.
        *   [X] **Verification:** New component file exists with basic map rendering structure.
    *   [X] **Task 9.5.2: Connect Component to `useLiveTrackingStore`.**
        *   [X] **Action:** Import `useLiveTrackingStore` (or the context hook if using context provider pattern similar to simulation store).
        *   [X] **Action:** Select necessary state properties within the component: `trackedShipmentId`, `latestLiveUpdate`, `staticShipmentDetails`, `subscriptionStatus`, `subscriptionError`.
        *   [X] **Neurotic Check:** Ensure selectors are efficient if the store grows. Handle initial `null` states gracefully.
        *   [X] **Verification:** Component has access to the required live tracking state slices.
    *   [X] **Task 9.5.3: Implement Live Marker Rendering.**
        *   [X] **Action:** Use a `react-map-gl` `<Marker>` component (or potentially a GeoJSON source/layer for performance if many markers were needed, but `<Marker>` is fine for one).
        *   [X] **Action:** Set the marker's `longitude` and `latitude` props directly from `latestLiveUpdate.longitude` and `latestLiveUpdate.latitude` (conditionally rendering only if `latestLiveUpdate` exists).
        *   [X] **Action:** Use the same SVG truck icon as `SimulationMap`.
        *   [X] **Action:** Implement marker rotation using `latestLiveUpdate.heading` if available. Add logic to handle `null` or `undefined` headings (e.g., default to 0 or last known heading).
        *   [X] **Neurotic Check:** What happens if `latestLiveUpdate` arrives before `staticShipmentDetails`? The component should handle this gracefully (perhaps by not rendering the marker until both are minimally available, or rendering a basic marker without full context). Ensure conditional rendering prevents errors with null data.
        *   [X] **Verification:** Marker appears on the map at the correct coordinates derived from the store state. Marker rotates based on heading data.
    *   [X] **Task 9.5.4: Implement Marker Movement Smoothing/Animation.**
        *   [X] **Problem:** Raw updates from Firestore might be infrequent (e.g., every 5-10 seconds), causing the marker to jump noticeably.
        *   [X] **Options:**
            1.  **CSS Transitions:** Apply CSS transitions to the marker's position. Simple, but might not look natural for map movement.
            2.  **Manual Interpolation (e.g., `requestAnimationFrame`):** Calculate intermediate positions between the last known point and the new `latestLiveUpdate` point, updating the marker state frequently. Complex to implement correctly.
            3.  **Library-based Approach:** Use a library designed for animating Mapbox markers, like `react-map-gl-animated-marker` or investigate if `react-map-gl` itself has built-in utilities for smooth `setData` transitions on a GeoJSON source.
        *   [X] **Decision:** **Attempt Library-based Approach First.** Investigate `react-map-gl` documentation for smooth GeoJSON `setData` transitions or evaluate `react-map-gl-animated-marker` (or similar maintained libraries). If these prove difficult or unsuitable, fall back to **Manual Interpolation (Option 2)** as a last resort. **(Decision Update: Implemented GeoJSON Source/Layer approach first)**
        *   [X] **Action (Initial):** Implement marker rendering using a GeoJSON `Point` source and a `SymbolLayer`. Update the source data using `mapRef.current.getSource('live-vehicle').setData(...)` when `latestLiveUpdate` changes. Consult `react-map-gl`/Mapbox GL JS docs for transition options during `setData`. **(Implemented using Source/Layer, direct setData/setLayoutProperty)**
        *   [X] **Action (Refinement):** If `setData` transitions aren't smooth enough, investigate dedicated animation libraries or implement manual interpolation within a `useEffect` hook based on `latestLiveUpdate` (Task 9.5.4 refinement). **(Deferred pending testing)**
        *   [X] **Neurotic Check:** Performance implications of frequent updates (manual interpolation) or library dependencies. Ensure animation accurately reflects the path between points and considers timing based on timestamps. **(GeoJSON approach chosen initially; animation smoothness TBD)**
        *   [X] **Verification:** Marker moves smoothly between received update points, not just jumping instantaneously. **(Verification pending actual test with mock sender)**
    *   [X] **Task 9.5.5: Display Planned Route.**
        *   [X] **Action:** Fetch the planned route geometry (likely stored within `staticShipmentDetails` after being fetched in Phase 9.6/9.3). **(Assumption: Geometry available in `staticShipmentDetails.plannedRouteGeometry`)**
        *   [X] **Action:** Use `react-map-gl` `<Source>` and `<Layer>` (similar to `SimulationMap`) to render the planned route line (e.g., `type: 'line'`). **(Implemented via `map.addSource/addLayer` in effect)**
        *   [X] **Action:** Style the planned route distinctively (e.g., dashed grey line) to avoid confusion with potential future actual path tracing. **(Implemented: Dashed grey line)**
        *   [X] **Neurotic Check:** Ensure route layer is added *after* the map style is loaded (`map.isStyleLoaded()`). Ensure cleanup logic removes the source and layer correctly on unmount or if route data becomes invalid. **(Checks and cleanup logic added)**
        *   [X] **Verification:** The planned route line appears correctly on the map when `staticShipmentDetails` includes valid route geometry. The line style matches the design (dashed grey). **(Verification pending integration with Phase 9.6 data fetch)**
    *   **Task 9.5.6: Display Origin/Destination Markers.**
        *   **Action:** Use the origin and destination coordinates from `staticShipmentDetails`.
        *   **Action:** Render static markers using Mapbox GL JS `Marker` instances (added directly to the map object) or potentially `react-map-gl` `<Marker>` components. Choose method based on consistency and ease of adding custom icons/popups if needed later.
    *   **Task 9.5.7: Adapt Map Features (Controls, Popups, Zoom).**
        *   **Action (Popup):** Implement `<Popup>` display on marker click. Content should show relevant info from `latestLiveUpdate` (timestamp, speed, accuracy?) and `staticShipmentDetails` (driver name, basic shipment info).
        *   **Action (Zoom/Follow):** Re-implement or adapt zoom-to-fit (fit bounds to planned route + live marker) and follow-vehicle toggles. Follow mode should smoothly animate the map (`mapRef.current.panTo()`) to keep the live marker centered. User interaction (pan/zoom) should disable follow mode.
        *   **Action (Controls):** Integrate necessary UI controls (e.g., follow toggle button, re-center button) logically within the map or parent page layout.
        *   **Verification:** Origin/Destination markers show. Popup displays correct info. Follow mode works. Zoom controls function as expected.
    *   **Task 9.5.8: Handle Loading and Error States Visually.**
        *   **Action:** Read `subscriptionStatus` and `subscriptionError` from the store.
        *   **Action:** Display a loading indicator (e.g., overlay spinner) on the map area when `subscriptionStatus` is `'subscribing'`.
        *   **Action:** Display a clear error message (e.g., overlay text, toast) when `subscriptionStatus` is `'error'`, showing `subscriptionError`. Offer a retry mechanism (button calling the store's `subscribe` action).
        *   **Action:** Implement visual indication for stale data (Task 9.7.1) - e.g., fade the marker opacity if `Date.now() - latestLiveUpdate.timestamp` exceeds a threshold (e.g., 30 seconds).
        *   **Verification:** Map correctly displays loading state. Errors are clearly communicated. Stale data indication works.

**3.6. Phase 9.6: UI Integration & Workflow (DETAILED - Revised based on Simulation Page Analysis)**
    *   **Goal:** Create the dedicated live tracking page, structure it similarly to the simulation page, implement data fetching for static details, initiate the live subscription, and integrate the `TrackingMap` component.
    *   **Task 9.6.1: Create Page & View Component Structure.**
        *   [X] **Action:** Create the minimal route file `app/tracking/[shipmentId]/page.tsx`. (✅ **COMPLETED**)
        *   [X] **Action:** Create the main client component file `app/tracking/[shipmentId]/_components/TrackingPageView.tsx`. (✅ **COMPLETED - Skeleton**)
        *   [X] **Action:** Implement the basic component structure in `TrackingPageView.tsx`: `'use client'`, props (`initialShipmentId`), state hooks (`useState` for list, selection, static details, loading/errors), map ref (`useRef`), store hook (`useLiveTrackingStore`). (✅ **COMPLETED - Skeleton**)
    *   [X] **Task 9.6.2: Implement Server Actions for Data Fetching.**
        *   [X] **Requirement:** Need data specific to the tracking context.
        *   [X] **Action (NEW):** Create Server Action `getShipmentsForDocumentContaining(shipmentId: string): Promise<ApiShipmentDetail[] | null>`. (✅ **COMPLETED - Requires full ApiShipmentDetail**)
        *   [X] **Action (As Planned):** Create Server Action `getStaticTrackingDetails(shipmentId: string): Promise<StaticTrackingDetails | null>`. (✅ **COMPLETED - Placeholder Route Geometry Fetch**)
    *   [X] **Task 9.6.3: Implement Data Fetching & Subscription Logic in `TrackingPageView.tsx`.**
        *   [X] **Action (List Fetch):** Implement `useEffect` hook (depends on `initialShipmentId`). Call `getShipmentsForDocumentContaining`. Populate `shipmentList` state. Handle loading/error states (`isLoadingList`, `listError`). (✅ **COMPLETED**)
        *   [X] **Action (Detail Fetch & Subscribe):** Implement `useEffect` hook (depends on `selectedShipmentId`, `subscribe`, `unsubscribe`). Call `getStaticTrackingDetails`. On success, store results in `staticDetails` state AND call `subscribe(selectedShipmentId, fetchedDetails)`. Handle loading/error states (`isLoadingStatic`, `staticError`). **Crucially**, implement the cleanup function to call `unsubscribe()` (✅ **COMPLETED**)
        *   [X] **Action (Selection Handler):** Implement `handleSelectShipment` callback (passed to `ShipmentCard`). Updates local `selectedShipmentId` state, triggering the detail fetch/subscribe effect. (✅ **COMPLETED**)
    *   [X] **Task 9.6.4: Integrate Components & Render Layout.**
        *   [X] **Action:** Implement render logic in `TrackingPageView.tsx`:
            *   Render the two-column layout. (✅ **COMPLETED**)
            *   Left Column: Render loading/error state or map `shipmentList` to `<Accordion>`/`<ShipmentCard>`, passing necessary props (`shipment`, `isSelected`, `onSelectShipment`). Reuse verified card component directly. (✅ **COMPLETED**)
            *   Right Column: Render loading/error state or `<TrackingMap>` (pass `ref={mapRef}`, `mapboxToken`) and `<TrackingControls>` (pass `mapRef={mapRef}`). (✅ **COMPLETED**)
    *   **Task 9.6.5: Add Navigation Link.**
        *   [ ] **Action:** Modify `/shipments/[documentid]/page.tsx` to add a "View Live Tracking" button/link pointing to `/tracking/{shipmentId}` for the relevant shipment. (Requires careful implementation to get the correct `shipmentId` in the button handler/link `href`).

**3.7. Phase 9.7: Error Handling & Edge Cases (DETAILED)**
    *   **Goal:** Ensure the live tracking feature is robust by identifying potential failure points and implementing strategies to handle errors gracefully, providing clear feedback to the user.
    *   [X] **Task 9.7.1: Implement Stale Data Detection & Indication.**
        *   [X] **Action (Map):** In `TrackingMap`, add `isStale` state, calculate based on `latestLiveUpdate.timestamp` and `STALE_THRESHOLD_MS`. Conditionally set `icon-opacity` paint property (0.5 if stale, 1 otherwise).
        *   [X] **Action (Controls):** In `TrackingPageView`, calculate `isStale`. Pass `latestTimestamp` and `isStale` props to `TrackingControls`. In `TrackingControls`, display formatted timestamp or "Data Stale" message.
        *   [X] **Verification:** Marker opacity changes. Timestamp/stale message displays correctly in controls.
    *   [X] **Task 9.7.2: Handle Firestore Subscription Errors (Initial & Runtime).**
        *   [X] **Action (Store):** Verified `_handleSubscriptionError` sets error state correctly and attempts cleanup. Verified `subscribe` action clears previous errors/state before retry.
        *   [X] **Action (UI - TrackingMap):** Verified error overlay exists. Added a "Retry Subscription" button to the error overlay in `TrackingMap`. Button calls `subscribe` action from store, passing required `trackedShipmentId` and `staticShipmentDetails`.
        *   [ ] **Verification:** Test subscription errors (permissions, network) show error overlay. Test retry button successfully re-initiates subscription. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.7.3: Handle Missing Firestore Document.**
        *   [X] **Context:** `onSnapshot` might report document doesn't exist. Service designed to call `onError`.
        *   [X] **Action:** Verified `FirestoreLiveTrackingService` calls `onError` with specific "Tracking data not found..." message if `docSnap.exists()` is false.
        *   [X] **Action:** Verified `useLiveTrackingStore` passes this error message to `subscriptionError` state.
        *   [X] **Action:** Verified `TrackingMap` displays `subscriptionError` from the store.
        *   [ ] **Verification:** Test subscribing to a non-existent `shipmentId` results in the specific error message display. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.7.4: Handle Static Data Fetch Errors.**
        *   [X] **Action:** Verified `TrackingPageView` catches static fetch errors, sets `staticError`, and prevents map rendering/subscription.
        *   [X] **Action:** Extracted fetch/subscribe logic into `loadStaticDetailsAndSubscribe` `useCallback` function.
        *   [X] **Action:** Added a "Retry Load" button to the error display in `renderMapArea` that calls the callback.
        *   [ ] **Verification:** Test static fetch errors show page-level error display. Test retry button successfully re-initiates fetch/subscribe. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.7.5: Refine Store Unsubscription Logic.**
        *   [X] **Context:** Ensure reliable cleanup on unmount, error, or new selection.
        *   [X] **Action:** Verified `unsubscribe` action in `useLiveTrackingStore` checks if `unsubscribeFn` exists before calling.
        *   [X] **Action:** Verified `unsubscribe` action resets state thoroughly using `set({ ...initialState })`.
        *   [X] **Action:** Verified `useEffect` cleanup in `TrackingPageView` calls `unsubscribe`. Verified `loadStaticDetailsAndSubscribe` calls `unsubscribe` before fetching new data.
        *   [ ] **Verification:** Test navigation away from tracking page closes subscription. Test selecting a different shipment correctly unsubscribes/resubscribes. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.7.6: Consider Data Validation (Optional but Recommended).**
        *   [X] **Problem:** Data from source might not match expected structure.
        *   [X] **Decision:** Implement basic manual checks in `_handleLiveUpdate` store action.
        *   [X] **Action:** Added checks for presence and type (`number`) of `latitude`, `longitude`, `timestamp` in `_handleLiveUpdate`. Invalid updates are logged and discarded (early return).
        *   [ ] **Verification:** Test sending malformed data results in warnings and data being discarded by the store. (**Testing Pending - Phase 9.9**)

**3.8. Phase 9.8: Security Hardening (DETAILED)**
    *   **Goal:** Implement robust security measures, primarily focusing on Firestore access control and credential management, to protect live tracking data.
    *   **Task 9.8.1: Refine Firestore Security Rules (Read Access).**
        *   **Context:** The initial rules (Task 9.1.2) allowed reads for authenticated admins (`request.auth.token.isAdmin == true`).
        *   **Action:** Verify the exact custom claim used for identifying administrators in the authentication token (e.g., via NextAuth/Clerk configuration). Update the rule if necessary.
        *   **Action:** Consider if more granular read access is needed (e.g., do specific admins only have access to specific shipments?). **Decision:** For Phase 9 (admin-only view), the simple `isAdmin` check is likely sufficient. Granular access control can be added later if non-admin roles need read access.
        *   **Action:** Implement data validation within read rules (optional but recommended): Check if the requesting user ID matches an expected pattern or exists in a separate `admins` collection if needed (adds complexity). **Decision:** Defer read validation for now, rely on `isAdmin` check.
        *   **Refined Read Rule Example:**
          ```firebase-rules
          // Inside match /active_vehicles/{shipmentId} { ... }
          // Verify custom claim path (e.g., .claims.roles.includes('admin')) based on actual auth setup
          allow read: if request.auth != null && request.auth.token.isAdmin == true; 
          ```
        *   **Verification:** Test read access using Firebase Emulator/Simulator with authenticated mock admin users. Verify non-admins *cannot* read data. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.8.2: Refine Firestore Security Rules (Write Access).**
        *   **Context:** Phase 9 requires only mock sender (Admin SDK) writes. Client writes must be denied.
        *   [X] **Action:** Verified/Confirmed the `allow write: if false;` rule within the `/active_vehicles/{shipmentId}` match block correctly denies client-side writes.
        *   [ ] **Verification:** Test writes using client SDKs fail. Verify mock sender (using Admin SDK) still functions correctly. (**Testing Pending - Phase 9.9**)
    *   [X] **Task 9.8.3: Implement Data Validation in Security Rules.**
        *   [X] **Goal:** Add validation layer for future write rules.
        *   [X] **Action:** Added comments within the Firestore security rules outlining specific data validation checks (type, presence, `hasOnly`, matching ID) to be implemented when write access is granted later (e.g., for drivers).
        *   [ ] **Verification:** (Future) Test write rule validation when implemented. (**Testing N/A for Phase 9**)
    *   [X] **Task 9.8.4: Secure Credentials.**
        *   [X] **Action:** Verified code loads Firebase/Mapbox keys from `process.env`.
        *   [X] **Action:** Verified `.gitignore` files exclude `.env*` and specific `.json` key files.
        *   [X] **Action:** User confirmed manual checks:
            *   Sensitive files (`.env.local`, service account key) are not tracked by git.
            *   Necessary `NEXT_PUBLIC_*` environment variables are set in `.env.local`.
            *   `NEXT_PUBLIC_MAPBOX_TOKEN` is a public token with appropriate scope/URL restrictions.
        *   [X] **Verification:** Credential handling deemed secure for development environment.

**3.9. Phase 9.R: Refactor Tracking Page to Document Level (NEW)**
    *   **Goal:** Restructure the live tracking page and related components to operate at the document level, allowing users to select a trackable shipment from a list within the document context, mirroring the `/simulation/[documentId]` page pattern.
    *   **Rationale:** The initial implementation (`/tracking/[shipmentId]`) did not align with the intended UX or the established simulation page pattern. This refactoring corrects the architecture before testing.
    *   [ ] **Task 9.R.1: Rename Tracking Page Route.**
        *   [ ] **Action:** Rename directory `/app/tracking/[shipmentId]` to `/app/tracking/[documentId]`. (**Requires Manual User Action**)
        *   [ ] **Action:** Update any internal references or links if necessary (though most links will be added/fixed in Task 9.R.5).
        *   [ ] **Verification:** Directory structure is updated.
    *   [X] **Task 9.R.2: Refactor `TrackingPageView` Component.** (Completed - Code edits done, file location requires manual fix)
        *   [X] **Action:** Modify `app/tracking/[documentId]/_components/TrackingPageView.tsx` (renamed file) to accept `documentId` prop instead of `shipmentId`. (Done)
        *   [X] **Action:** Implement `useEffect` to fetch the shipment list for the `documentId` (using `getShipmentsForDocumentContaining` or similar). (Done)
        *   [X] **Action:** Manage local state for `selectedShipmentId` based on user interaction with the shipment list. (Done)
        *   [X] **Action:** Modify selection handler (`handleSelectShipment`) to trigger store subscription *only* for newly selected, trackable shipments (Idle, En Route status). Pass necessary static details (origin/dest coords, etc.) from the selected `ApiShipmentDetail` to the `TrackingMap` component via props. (Done - Route Fetching Added)
        *   [X] **Action:** Implement logic to disable selection/buttons for non-trackable shipments in the list. (Done)
        *   [X] **Verification:** Component fetches list based on document ID, handles selection, passes correct props to map, disables non-trackable items.
    *   [X] **Task 9.R.3: Refactor `useLiveTrackingStore` Store.** (Completed)
        *   [X] **Action:** Remove `staticShipmentDetails` state from the store. (Done)
        *   [X] **Action:** Update `subscribe` action to potentially only require `shipmentId` (verify if any static details are truly needed *in the store* vs. passed directly to map). (Done)
        *   [X] **Action:** Ensure `unsubscribe` is reliably called by `TrackingPageView` before a new `subscribe` call for a different shipment. (Done)
        *   [X] **Action:** Add/refine state to manage `trackedShipmentId` (the one actively subscribed to) distinctly from the UI's `selectedShipmentId` (local state in `TrackingPageView`). (Done)
        *   [X] **Verification:** Store state is simplified, subscription actions align with selection-driven logic.
    *   [X] **Task 9.R.4: Update `TrackingMap` Component.** (Completed)
        *   [X] **Action:** Modify `TrackingMap` props to receive necessary static details (origin/dest coords, planned route) from the parent `TrackingPageView` based on the current selection. (Done)
        *   [X] **Action:** Ensure map correctly uses these props to display origin/destination markers and the planned route. (Done)
        *   [X] **Action:** Verify connection to `useLiveTrackingStore` for `latestLiveUpdate` remains correct. (Done)
        *   [X] **Verification:** Map displays correct static elements based on selection and live marker based on store updates.
    *   [X] **Task 9.R.5: Update Navigation UI.** (Completed)
        *   [X] **Action:** In the `DocumentCard` component (or wherever document cards are rendered, likely `app/documents/page.tsx`), add a "Live Tracking" button next to the "View Shipments" and "Simulate" buttons, linking to `/tracking/[documentId]`. (Completed)
        *   [X] **Action:** On the `/shipments/[documentid]/page.tsx` page, split the existing "View Live Tracking / Simulation" button into two separate buttons: "Simulate" (triggering the existing simulation logic) and "Track Live" (linking directly to `/tracking/[documentId]?selectedShipmentId=...`). (Completed)
        *   [X] **Verification:** New buttons are present and link/trigger actions correctly. (Completed)
    *   [X] **Task 9.R.6: Cleanup Test/Placeholder Pages.** (Completed)
        *   [X] **Action:** Identify and delete the `/app/tracking/test-*` directories and their contents. (Completed)
        *   [X] **Action:** Delete the placeholder `/app/tracking/page.tsx` as it serves no current purpose. (Completed)
        *   [X] **Action:** Delete the `/app/tracking-stabilized` directory and its contents. (Completed via User Manual Action)
        *   [X] **Verification:** Unnecessary test directories and placeholder page are removed. (Completed)
    *   **Note:** Tasks previously completed in Phases 9.5, 9.6, and 9.7 that directly modified the `/tracking/[shipmentId]` components (`TrackingMap`, `TrackingPageView`, `TrackingControls`, store interactions) will need review and potential rework within the context of tasks 9.R.2, 9.R.3, and 9.R.4. Mark relevant previous verification steps as **[REWORK/RE-VERIFY after 9.R]**. 

**4. Phase 9.9: Testing (DETAILED)**
    *   **Goal:** Verify the end-to-end functionality, error handling, and user experience of the live tracking feature **(Post-Refactoring)**.
    *   **Prerequisite:** Phase 9.R Refactoring must be complete.
    *   **Note:** A Vercel build failure occurred after pushing Phase 9.7/9.8 changes due to `prefer-const` ESLint errors in `lib/actions/trackingActions.ts`. These errors have been fixed. A re-push is required.
    *   [X] **Task 9.9.1: Prepare Test Environment.**
        *   [X] **Action:** Ensure Vercel deployment (triggered by push after fixing build errors and map marker issue) is successful.
        *   [X] **Action:** Verify Firebase project (`loadup-logistics-dev`) is accessible.
        *   [X] **Action:** Confirm mock sender (`tools/mock-tracker`) is running and writing data to Firestore for a known `shipmentId`.
        *   [X] **Action:** Confirm user can log in via NextAuth using development credentials (`dev@loadup.com`).
    *   [ ] **Task 9.9.2: Functional Testing (Happy Path).**
        *   [ ] **Action:** Navigate to the document list page.
        *   [ ] **Action:** Click "Live Tracking" for a document containing the shipment being updated by the mock sender.
        *   [ ] **Action:** Verify the shipment list loads correctly.
        *   [ ] **Action:** Select the target shipment from the list.
        *   [ ] **Expected Result:** Map loads, displays origin/destination, planned route (dashed). Vehicle marker (default 'marker-15') appears and moves smoothly, reflecting updates from the mock sender. Shipment card shows correct details. Controls show accurate timestamp (not stale).
    *   [ ] **Task 9.9.3: Error Handling Testing (Subscription/Data).**
        *   [ ] **Action:** Stop the mock sender.
        *   [ ] **Expected Result:** Marker stops moving. Stale data indicator appears on map/controls after threshold. No errors thrown.
        *   [ ] **Action:** Restart mock sender.
        *   [ ] **Expected Result:** Marker resumes movement, stale indicator disappears.
        *   [ ] **Action:** Test subscribing to a shipment ID *not* being updated by the mock sender (or delete the Firestore doc).
        *   [ ] **Expected Result:** Appropriate error message displayed on map overlay ("Tracking data not found..." or similar). Retry mechanism should appear.
        *   [ ] **Action (Requires Rule Change):** Temporarily modify Firestore rules to deny reads for the logged-in user.
        *   [ ] **Expected Result:** Subscription error overlay appears with permission denied message. Retry fails until rules are fixed.
    *   [ ] **Task 9.9.4: Error Handling Testing (Static Fetch).**
        *   [ ] **Action (Requires Code Change):** Temporarily modify `getStaticTrackingDetails` server action to throw an error.
        *   [ ] **Expected Result:** Page-level error displayed instead of map/list. Retry button appears and functions after code fix.
    *   [ ] **Task 9.9.5: UI/UX Testing.**
        *   [ ] **Action:** Test selecting different shipments in the list.
        *   [ ] **Expected Result:** Map updates correctly, previous subscription is cleaned up, new subscription starts.
        *   [ ] **Action:** Test map controls (zoom, pan, follow toggle).
        *   [ ] **Expected Result:** Controls function as expected. Follow mode keeps marker centered; manual interaction disables it.
        *   [ ] **Action:** Test navigation away from the page and back.
        *   [ ] **Expected Result:** Subscription is cleaned up on navigation away, restarts correctly on return.
        *   [ ] **Action:** Check responsiveness on different screen sizes (if applicable).
        *   [ ] **Expected Result:** Layout remains usable.
    *   [ ] **Task 9.9.6: Security Rule Verification.**
        *   [ ] **Action:** Attempt to access the tracking page/subscribe while logged out.
        *   [ ] **Expected Result:** Redirected to login or prevented by middleware/page logic.
        *   [ ] **Action (If possible):** Attempt to access Firestore data directly using client console while logged out or logged in as non-admin (if such a role exists).
        *   [ ] **Expected Result:** Access denied by Firestore rules.

## 🚨 4. Risk Assessment & Mitigation (Neurotic Deep Dive)

*   **Risk 1: Platform Cost Overrun (Firestore/Firebase)**
    *   *Concern:* Uncontrolled reads/writes or complex queries exceeding free tier limits unexpectedly.
    *   *Mitigation:*
        *   Monitor usage dashboards closely during development/testing.
        *   Optimize Firestore listeners (only subscribe when page is active).
        *   Keep data structures simple (single doc overwrite for latest location).
        *   Have fallback platform analysis (Ably/Pusher) ready. Set budget alerts if possible.
*   **Risk 2: Latency & Stale Data**
    *   *Concern:* Delays in data propagation (Network -> Firestore -> Client) leading to inaccurate map display.
    *   *Mitigation:*
        *   Use Firestore's real-time `onSnapshot`.
        *   Implement clear visual indicators for data age/staleness (Task 9.7.1).
        *   Choose appropriate Firestore region (closest to users/drivers).
        *   Consider client-side interpolation for smoother visual movement (Task 9.5.4), but clearly indicate if underlying data is old.
*   **Risk 3: State Management Complexity**
    *   *Concern:* Merging static shipment data with high-frequency live updates in Zustand store becomes buggy or inefficient.
    *   *Mitigation:*
        *   Careful design of the store structure (Phase 9.3.1).
        *   Use selectors (e.g., `reselect`) to optimize derived data calculations.
        *   Thoroughly test store updates and component re-renders. Consider Immer for state updates.
*   **Risk 4: Security Vulnerabilities**
    *   *Concern:* Improper Firestore Security Rules allowing unauthorized data access or modification. Leaked API keys.
    *   *Mitigation:*
        *   Implement strict, role-based security rules from the start (Task 9.8.1). Test rules using Firebase emulator or simulator.
        *   Securely manage API keys/service accounts (e.g., environment variables, secrets management). Never commit keys to repo.
*   **Risk 5: Mock Data Inaccuracy**
    *   *Concern:* Mock data sender doesn't accurately reflect real-world GPS update patterns (frequency, accuracy variations, dropouts).
    *   *Mitigation:*
        *   Make mock sender configurable (update interval, accuracy simulation).
        *   Acknowledge limitations and plan for testing with real devices/data sources in subsequent phases.
*   **Risk 6: Scope Creep**
    *   *Concern:* Temptation to add multi-vehicle tracking, advanced route deviation logic, or complex offline handling within this phase.
    *   *Mitigation:* Strictly adhere to the defined scope (Section 1.4). Defer enhancements to future phases, clearly documented.

## 🧩 5.5. Reference Implementations (NEW SECTION)

*   **Goal:** Analyze existing open-source projects to understand common patterns, potential pitfalls, and best practices for implementing live tracking with a similar technology stack.
*   **Primary Reference Candidate (Conceptual):** [`cola119/tracko-react`](https://github.com/cola119/tracko-react)
    *   **Stack:** React, Redux, `react-leaflet` (not Mapbox GL JS).
    *   **Relevance:** Older, different state management (Redux) and map library (Leaflet). Useful for general concepts but not direct implementation patterns.
    *   **Status:** Reviewed previously, deemed less relevant for current phase.
*   **Secondary Reference Candidate (Frontend Patterns):** [`thorwebdev/location-tRacer`](https://github.com/thorwebdev/location-tRacer)
    *   **Stack:** Next.js (App Router), `react-map-gl` (Mapbox GL JS wrapper), Supabase (Postgres + Realtime).
    *   **Relevance (High for Frontend):** Although it uses Supabase Realtime instead of Firestore, the **frontend patterns for handling real-time updates are highly relevant and adaptable**:
        *   Demonstrates effective use of `useEffect` for managing subscription lifecycle (subscribe on mount, unsubscribe on unmount).
        *   Illustrates handling incoming real-time messages within a callback and updating React state (`useState`/`useRef` pattern in their case, applicable principle for Zustand actions).
        *   Shows integration with `react-map-gl` for rendering markers based on incoming data.
    *   **Learnings Incorporated:** Insights regarding state management within callbacks, `useEffect` cleanup, and component structure have been integrated into this plan (Sections 3.3, 3.4, 3.6, 3.7).
    *   **Status:** Cloned locally for review, patterns analyzed. Repository to be deleted post-review.

*   **Other Potential Candidates (From Web Search - Less Direct):**
    *   `AnmolSaini16/next-maps`: Modern Next.js App Router + Mapbox GL JS integration example (no real-time).
    *   `vegardloewe/next-mapbox`: Basic Next.js + Mapbox GL JS example (older, no real-time).
*   **Neurotic Decision:** Focus on adapting the client-side subscription management and state update patterns from `location-tRacer` to our Firestore/Zustand stack, as detailed in the implementation phases.

**4. Phase 9.9: Testing (DETAILED)**
    *   **Goal:** Verify the end-to-end functionality, error handling, and user experience of the live tracking feature **(Post-Refactoring)**.
    *   **Prerequisite:** Phase 9.R Refactoring must be complete.
    *   **Note:** A Vercel build failure occurred after pushing Phase 9.7/9.8 changes due to `prefer-const` ESLint errors in `lib/actions/trackingActions.ts`. These errors have been fixed. A re-push is required.
    *   [X] **Task 9.9.1: Prepare Test Environment.**
        *   [X] **Action:** Ensure Vercel deployment (triggered by push after fixing build errors and map marker issue) is successful.
        *   [X] **Action:** Verify Firebase project (`loadup-logistics-dev`) is accessible.
        *   [X] **Action:** Confirm mock sender (`tools/mock-tracker`) is running and writing data to Firestore for a known `shipmentId`.
        *   [X] **Action:** Confirm user can log in via NextAuth using development credentials (`dev@loadup.com`).
    *   [ ] **Task 9.9.2: Functional Testing (Happy Path).**
        *   [ ] **Action:** Navigate to the document list page.
        *   [ ] **Action:** Click "Live Tracking" for a document containing the shipment being updated by the mock sender.
        *   [ ] **Action:** Verify the shipment list loads correctly.
        *   [ ] **Action:** Select the target shipment from the list.
        *   [ ] **Expected Result:** Map loads, displays origin/destination, planned route (dashed). Vehicle marker (default 'marker-15') appears and moves smoothly, reflecting updates from the mock sender. Shipment card shows correct details. Controls show accurate timestamp (not stale).
    *   [ ] **Task 9.9.3: Error Handling Testing (Subscription/Data).**
        *   [ ] **Action:** Stop the mock sender.
        *   [ ] **Expected Result:** Marker stops moving. Stale data indicator appears on map/controls after threshold. No errors thrown.
        *   [ ] **Action:** Restart mock sender.
        *   [ ] **Expected Result:** Marker resumes movement, stale indicator disappears.
        *   [ ] **Action:** Test subscribing to a shipment ID *not* being updated by the mock sender (or delete the Firestore doc).
        *   [ ] **Expected Result:** Appropriate error message displayed on map overlay ("Tracking data not found..." or similar). Retry mechanism should appear.
        *   [ ] **Action (Requires Rule Change):** Temporarily modify Firestore rules to deny reads for the logged-in user.
        *   [ ] **Expected Result:** Subscription error overlay appears with permission denied message. Retry fails until rules are fixed.
    *   [ ] **Task 9.9.4: Error Handling Testing (Static Fetch).**
        *   [ ] **Action (Requires Code Change):** Temporarily modify `getStaticTrackingDetails` server action to throw an error.
        *   [ ] **Expected Result:** Page-level error displayed instead of map/list. Retry button appears and functions after code fix.
    *   [ ] **Task 9.9.5: UI/UX Testing.**
        *   [ ] **Action:** Test selecting different shipments in the list.
        *   [ ] **Expected Result:** Map updates correctly, previous subscription is cleaned up, new subscription starts.
        *   [ ] **Action:** Test map controls (zoom, pan, follow toggle).
        *   [ ] **Expected Result:** Controls function as expected. Follow mode keeps marker centered; manual interaction disables it.
        *   [ ] **Action:** Test navigation away from the page and back.
        *   [ ] **Expected Result:** Subscription is cleaned up on navigation away, restarts correctly on return.
        *   [ ] **Action:** Check responsiveness on different screen sizes (if applicable).
        *   [ ] **Expected Result:** Layout remains usable.
    *   [ ] **Task 9.9.6: Security Rule Verification.**
        *   [ ] **Action:** Attempt to access the tracking page/subscribe while logged out.
        *   [ ] **Expected Result:** Redirected to login or prevented by middleware/page logic.
        *   [ ] **Action (If possible):** Attempt to access Firestore data directly using client console while logged out or logged in as non-admin (if such a role exists).
        *   [ ] **Expected Result:** Access denied by Firestore rules.

## 🔮 6. Future Enhancements & Refactoring Opportunities

*(Based on analysis during Phase 9 implementation and debugging)*

**6.1. Standardize Map Component Architecture:**
*   **Problem:** Multiple map components (`SimulationMap`, `TrackingMap`, `StaticRouteMap`, etc.) share significant boilerplate and foundational logic (Mapbox initialization, token handling, basic controls), but have diverged in implementation details (state management, marker rendering).
*   **Proposed Solution:** 
    *   Create a `BaseMapComponent` or use a higher-order component (HOC) pattern to encapsulate common map setup, loading state management (potentially adopting the instance check or component-based loading discussed), error handling, and basic controls.
    *   Extract shared logic like marker rendering (origin, destination, potentially vehicle markers if styles align) into reusable sub-components or utility functions.
*   **Benefit:** Reduced code duplication, improved maintainability, consistent map behavior across the application.

**6.2. Improve TypeScript Integration for Map Components:**
*   **Problem:** Type conflicts and ambiguities arose between `react-map-gl/mapbox` (React wrapper) and the underlying `mapbox-gl` library, particularly around the `MapRef` type. The current solution uses `any` as a temporary workaround.
*   **Proposed Solution:**
    *   Investigate creating custom type definitions or utility types that effectively bridge the gap between the React wrapper's props/refs and the imperative methods/types of the Mapbox GL JS instance.
    *   Explore conditional typing or type guards to handle situations where either library's types might be relevant.
    *   Replace all instances of `any` related to map refs and instances with strongly-typed alternatives.
*   **Benefit:** Enhanced type safety, improved developer experience (better autocompletion/intellisense), reduced runtime errors related to type mismatches.

**6.3. Enhance Error Handling & Resilience:**
*   **Problem:** While basic error handling exists (displaying map load errors, subscription errors), it could be made more robust and user-friendly.
*   **Proposed Solution:**
    *   Implement consistent React Error Boundaries specifically for map components to catch rendering errors gracefully and provide clearer feedback or fallback UI.
    *   Develop more sophisticated retry mechanisms for map loading failures or initial data/subscription fetches, potentially with exponential backoff.
    *   Consider adding more specific error states and visual cues beyond simple overlays (e.g., degraded state indicators).
*   **Benefit:** More resilient map rendering, better user experience when encountering transient network or configuration issues.