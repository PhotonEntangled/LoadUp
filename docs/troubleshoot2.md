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

## New Issue: Login Succeeds (Bypass Active) but Redirect Loop Back to Sign-in Page

**Date:** [Current Date/Time]

**Symptoms:**
- After entering credentials for `dev@loadup.com` (with password bypass active), the user is redirected back to `/api/auth/signin` instead of the dashboard.
- Vercel logs show `[AUTH DEBUG] Bypassing password check...` followed immediately by `Middleware: No token found. Redirecting to sign-in page.` on the subsequent request.

**Context:**
- Middleware was updated to use `getToken` for session verification.
- The `authorize` function *is* returning the user object.

**Hypotheses:**
1.  **`NEXTAUTH_SECRET` Mismatch:** The environment variable might differ between the API route runtime and the Edge middleware runtime in Vercel. **Confirmed as Primary Suspect.**
2.  **Cookie Issue:** NextAuth might not be setting the cookie correctly, or the middleware can't read it (path/domain/HttpOnly issue). **Ruled Out:** Logs show cookie `__Secure-next-auth.session-token` is present in middleware request.
3.  **Edge Runtime Issue:** Potential subtle problem with `getToken` on the Edge. **Less Likely:** `getToken` is being called, but fails validation.
4.  **Stale Middleware Deployment:** Vercel might not be running the latest `middleware.ts` code. **(Addressed by force-redeploy)**

**Troubleshooting Steps:**
1.  Added logging to `middleware.ts` to print incoming cookie names. **(Done)**
2.  Added more verbose logging to `middleware.ts` before `getToken` call. **(Done)**
3.  Added explicit cookie config in `options.ts`. **(Done)**
4.  Forced middleware re-deploy with trivial change. **(Done)**
5.  **Action:** User to **reset/re-verify** `NEXTAUTH_SECRET` in Vercel project environment variables (for *all* relevant environments - Preview/Production), ensuring exact match with `.env.local` and no extra characters. **(Done by user - Issue persists)**
6.  **Action:** User to trigger a Vercel re-deploy after fixing secret. **(Done by user - Issue persists)**
7.  Removed temporary password bypass from `options.ts`. **(Done - Re-applied bypass for isolation test in commit 1ea68eb)**
8.  Re-test login using correct password (`password`) after secret verification and redeploy. **(Tested - Failed with Password Mismatch - commit f413879)**
9.  Added logging before bcrypt compare. **(Done - commit 5d61159)**
10. Re-applied bypass to isolate bcrypt vs session issue. **(Done - commit 1ea68eb)**
11. **Current Status:** Login bypass works, but middleware logs show `getToken` returns null despite seeing the session cookie. `NEXTAUTH_SECRET` *should* be correct per user update.
12. Added middleware logging for first 10 chars + length of `NEXTAUTH_SECRET` being used by Edge runtime. **(Done - commit pending)**
13. **Add Detailed Token Logging:** Added `console.log` for the raw value returned by `getToken` in `middleware.ts` and for the `token` object received by the `session` callback in `options.ts`. Rationale: Observe the exact state of the token object at different points to pinpoint where the data loss or invalidation occurs. **(Done - Failed, Logs Missing/Incomplete)**
14. **Log Raw Cookie/Token Values (Re-attempt):** Re-applied logging in `middleware.ts` to confirm presence of raw session cookie string and to log BOTH the parsed object (`getToken`) and the raw JWT string (`getToken({ raw: true })`). Confirmed session callback logging in `options.ts`. Rationale: Ensure logging wasn't missed and determine if the raw token exists even if parsing fails. **(Done - Failed, Logs Still Missing)**
15. **Add Session Callback Entry Log & Re-apply Middleware Logging:** Added log at start of `session` callback (options.ts). Re-re-applied middleware logging for raw cookie/token presence and parsed/raw `getToken` results. Rationale: Confirm session callback entry and ensure middleware logs are definitely included in deployment. **(Done - Failed, Raw Token Also Null)**
16. **Refactor API Route & Log Set-Cookie:** Refactored `app/api/auth/[...nextauth]/route.ts` to use function handler. Added logging to inspect the `Set-Cookie` header in the response *after* `NextAuth()` executes. Added basic error handling. Rationale: Verify the session cookie is being correctly constructed and sent by the API route. **(Done - Failed, Caused HTTP 500)**
17. **Revert API Route Handler:** Reverted `app/api/auth/[...nextauth]/route.ts` back to the simple `const handler = NextAuth(authOptions); export { handler as GET, handler as POST };` style. Rationale: Fix the critical HTTP 500 error introduced by the function handler refactor, which crashed when accessing `req.query.nextauth`. **(Done - Success, 500 fixed)**
18. **Analyze Logs (Post-Revert):** Middleware logs show session cookie (`__Secure-next-auth.session-token`) is NOT received. Raw and Parsed token logs in middleware confirm `getToken` returns null. Session callback entry log is **still missing**. Rationale: Problem shifted to cookie setting/transmission, likely connected to session callback not running. **(Done)**
19. **Simplify JWT Callback:** Temporarily commented out all custom logic in `jwt` callback (options.ts)... Rationale: Isolate if adding custom claims prevents the session callback execution. **(Done - Failed, Session Callback Still Missing)**
20. **Identify Root Cause Candidate:** Discovered `NEXTAUTH_URL` environment variable in Vercel was incorrectly set to `http://localhost:3000`. Rationale: This breaks callback URL generation, origin matching, and potentially cookie security settings in the deployed environment. **(Identified)**
21. **Correct `NEXTAUTH_URL`:** User updated `NEXTAUTH_URL` in Vercel Production environment variables to `https://load-up.vercel.app`. **(Done)**
22. **Trigger New Deployment:** User triggered redeploy after updating env var. **(Done)**
23. **Resolution:** Authentication now functions correctly. Middleware successfully finds and validates the token (`getToken` returns user data). Root cause was incorrect `NEXTAUTH_URL` in Vercel settings. **(RESOLVED)**

---

## New Issue: API Failures After Fixing Auth (TypeError: $ is not a function)

**Date:** [Current Date/Time]

**Symptoms:**
*   Authentication is working.
*   `/api/documents` (GET & POST) failing with HTTP 500 and `TypeError: $ is not a function`.
*   Error persists after forced redeploy, suggesting issue is not stale cache.

**Hypothesis:** Error likely in `app/api/documents/route.ts` or its interaction with Drizzle/Neon. Potential causes:
    *   Drizzle misconfiguration or version issue related to query building/execution.
    *   Dependency conflict (Drizzle, Neon adapter, Next.js) in Vercel environment.
    *   Build process error incorrectly transforming Drizzle code.
    *   **Correction:** `lib/database/drizzle.ts` was using `postgres.js` adapter, not `@neondatabase/serverless` despite it being in `package.json`. This mismatch or the `postgres.js` adapter itself might cause issues in Vercel.

**Troubleshooting Steps:**
1.  **Code Review:** Reviewed `app/api/documents/route.ts`. Active code paths use `db.select/insert/update`, not `db.query`. **(Done)**
2.  **Force Redeploy (Cache Clear):** Pushed trivial comment change to `app/api/documents/route.ts`. Error persisted. **(Done)**
3.  **Inspect Imports & Init:** Reviewed imports in `api/documents/route.ts`, `lib/database/drizzle.ts`, `services/database/shipmentInserter.ts`. **(Done)**
4.  **Check Dependencies:** Reviewed `package.json`. Noted multiple DB drivers (`@neondatabase/serverless`, `postgres`, `pg`). Identified `postgres.js` was the active adapter in `drizzle.ts`. **(Done)**
5.  **Switch Drizzle Adapter:** Modified `lib/database/drizzle.ts` to use the `@neondatabase/serverless` (Neon HTTP) adapter. **(Done - commit bebd094)**
6.  **Redeploy:** Pushed adapter change to trigger new Vercel deployment. **(Done)**
7.  **Next Step:** User re-tests document GET/POST after deployment finishes. Check Vercel and browser logs for resolution of the `TypeError`. If error persists, further investigation into Drizzle query specifics or dependencies is needed.

---
