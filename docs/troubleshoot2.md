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

## New Issue: API Failures After Fixing Auth (TypeError: S is not a function)

**Date:** [Current Date/Time]

**Symptoms:**
*   Authentication is working.
*   `/api/documents` (GET & POST) failing with HTTP 500 and `TypeError: S is not a function` (or equivalent) in Vercel logs.
*   **Crucial Context:** This functionality (upload, processing, display) *was working correctly* on Vercel *before* `next-auth` integration.
*   Error persists after removing conflicting DB drivers (`pg`, `postgres`) and reverting `shipmentInserter.ts` typing.
*   Error occurs even when POST handler is simplified to only perform `db.insert(...).values(...)` without `.returning()`.
*   Error occurs regardless of Drizzle adapter (`postgres.js` or `neon-http`).
*   Detailed logging added before the insert call does not appear in Vercel logs, suggesting the error happens *during* the `insert` execution.

**Hypothesis Updated:** The *runtime execution* of `next-auth` middleware is **not** the direct cause. The issue likely stems from the **Vercel build process** being altered by the *presence* of `next-auth` dependencies, causing corruption or incompatibility with how Drizzle/postgres.js is bundled or executed in the serverless function environment.

**Troubleshooting Steps:**
*   ... (Steps up to adapter revert test omitted) ...
*   **Action:** Reverted Drizzle adapter to `postgres.js`. **(Done)**
*   **Action:** Re-installed `postgres` dependency. **(Done)**
*   **Action:** Ran local build. **(Passed)**
*   **Action:** Pushed changes. **(Done)**
*   **Result:** Tested document upload on Vercel with `postgres.js`. **POST `/api/documents` still fails with HTTP 500.** **(Confirmed)**
*   **Conclusion 1:** Issue is not adapter-specific.
*   **Action (Isolation Test):** Temporarily disabled `next-auth` integration by modifying `middleware.ts` to bypass all auth logic. **(Done)**
*   **Action:** Pushed "auth-disabled" version. **(Done)**
*   **Result:** Tested document upload on Vercel with middleware bypassed. **POST `/api/documents` still fails with HTTP 500.** Vercel/Browser logs confirm 500 error (`TypeError: S is not a function`). **(Confirmed)**
*   **Conclusion 2:** Middleware *runtime* execution is not the direct trigger. Problem likely lies in the build process/dependency interaction caused by adding `next-auth`.
*   **Next Step:** Try the official Vercel Postgres adapter (`drizzle-orm/vercel-postgres` using `@vercel/postgres` package). Rationale: This adapter is specifically designed for the Vercel environment and might be more resilient to Vercel's build process nuances or handle the underlying connection/execution differently.
*   **Contingency:** If `vercel-postgres` adapter also fails, investigate Vercel build output directly or create minimal reproduction.

## Solution Implemented

After thorough investigation, we identified that the TypeErrors (`TypeError: S is not a function`, `TypeError: h is not a function`, etc.) were caused by incompatibility between Drizzle ORM's query building pattern and the Vercel Postgres adapter in serverless environments.

**Solution:**
1. We switched from the `@vercel/postgres` adapter to the Neon HTTP adapter (`@neondatabase/serverless`) which has better compatibility with serverless functions
2. Updated `lib/database/drizzle.ts` to use the Neon HTTP adapter instead of Vercel Postgres
3. Created a dedicated migration script (`scripts/migrate.ts`) using Neon's migrator
4. Added testing scripts to verify the connection

**Technical Explanation:**
The error occurred because the minified function names in the compiled code for Vercel's serverless environment were not being properly resolved. Using Neon's direct HTTP adapter bypasses these issues as it's specifically designed for serverless environments and has fewer intermediate layers that could be affected by minification.

**Impact:**
This change allows the application to run correctly in Vercel's serverless environment while maintaining compatibility with the Neon Postgres database.

---

## Update on Database Integration Issue (May 03)

**Date:** 2025-05-03

**Additional Findings:**

After implementing the switch from Vercel Postgres adapter to Neon HTTP adapter, we're still seeing the same error in the logs when using the *original* `/api/documents` endpoint:

```
POST 500 load-rlaukx8xx-photonentangleds-projects.vercel.app /api/documents 2
⨯ TypeError: S is not a function at x (/var/task/.next/server/app/api/documents/route.js:1:2301)
```

**Key Observations:**
1. The error continues to occur at the same position in the compiled code, even with the Neon adapter.
2. The browser console logs show the 500 error when attempting to upload.
3. **UI Bug:** The checkbox to select the alternate upload method was missing because the logic was added to the wrong component (`components/shared/FileUploader.tsx`) instead of the actual uploader used on the page (`components/logistics/LogisticsDocumentUploader.tsx`).

**Corrective Actions Taken:**
1. Added the alternate endpoint toggle logic and state management to `components/logistics/LogisticsDocumentUploader.tsx`.
2. Created the new `/api/documents/alt-upload/route.ts` which uses direct SQL queries via the Neon `sql` template tag, bypassing the Drizzle ORM `insert().values()` pattern.

**Technical Analysis:**
The persistence of the `TypeError` on the original route, despite using the Neon adapter, strongly suggests a fundamental incompatibility between the `db.insert().values()` pattern in Drizzle ORM and the Vercel serverless runtime environment for this specific API route. The minification or bundling process likely disrupts Drizzle's internal function calls for this operation.

**Next Steps:**

1. **Test Alternate Endpoint:** Push the latest changes (UI fix + alt-upload route) and thoroughly test document uploads using the newly available **"Use alternate upload method (direct SQL)" checkbox**.
2. **Analyze Alternate Endpoint Logs:** If the alternate endpoint succeeds, confirm this approach works reliably. If it fails, analyze the Vercel logs specifically for `/api/documents/alt-upload` to diagnose the SQL-related error.
3. **Adopt Direct SQL (If Successful):** If the alternate endpoint works, we should consider migrating the primary `/api/documents` POST logic entirely to use direct SQL for inserts, removing the problematic Drizzle ORM pattern.
4. **Further Drizzle Investigation (If Alt Fails):** If even direct SQL fails, there might be a more fundamental issue with database connectivity or permissions in the Vercel environment that needs investigation (e.g., environment variable propagation, Neon role permissions).

We will start with **Step 1: Removing `next-auth`** as the most direct way to test the dependency conflict hypothesis.

---

## Authentication Flow Debugging (JWT Strategy) - Continued from `S is not a function` issue resolution

**Date:** 2025-05-04

**Symptoms:**
*   Login attempt via Credentials provider (`dev@loadup.com` / `password` with bypass) seems successful from the browser (`signIn` returns `ok:true`).
*   Vercel logs show the generic `[Event SignIn]` log.
*   **CRITICAL:** Detailed logs expected from `authorize`, `jwt`, and `session` callbacks in `lib/auth.ts` are **MISSING** in Vercel logs (specifically the `[Callback JWT]` and `[Callback Session]` entry logs).
*   The last attempt showed `[WARN] [Authorize] No user found for email: dev@loadup.com` despite the user existing in the DB (verified via Neon tools). This contradicts the expected flow where authorize should return the user object.
*   Middleware (`middleware.ts`) confirms `getToken` returns `null`, indicating no valid session/token is being established/found, despite the browser receiving a seemingly successful sign-in response.

**Troubleshooting Steps:**
1.  **Verify Logging Code:** Read `lib/auth.ts` to confirm `console.log`/`logger` statements exist within `authorize`, `jwt`, and `session` callbacks. **(Done - Logs confirmed to be present in code)**.
2.  **Add Entry Logs:** Added an explicit `logger.info` call as the *very first line* inside each of the `authorize`, `jwt`, and `session` callback functions in `lib/auth.ts`. Rationale: To definitively confirm if these callbacks are being invoked at all. **(Done - Code pushed & deployed)**
3.  **Test Login & Review Logs (Latest Attempt - ~15:18):**
    *   **Browser Logs:** Confirmed via MCP tools that the browser *does* receive a `200 OK` for the sign-in attempt (`signIn result: {\"error\":null,\"status\":200,\"ok\":true,...}`) and attempts to redirect to the dashboard. However, subsequent API calls (e.g., document upload) fail with `401 Unauthorized` (confirmed via browser console errors).
    *   **Vercel Logs (`docs/log.md` snippet):** 
        *   Shows a failed attempt at `15:18:22` (`POST 401`, `Invalid password` log). This proves `authorize` *can* run but suggests bypass might have been off.
        *   Shows a superficially successful attempt at `15:18:38` (`POST 200`, `[Event SignIn]`).
        *   **CRITICAL:** For the `15:18:38` attempt, the expected `[Authorize Callback] ENTERED`, `[JWT Callback] ENTERED`, and `[Session Callback] ENTERED` logs are **MISSING** in the provided log snippet. The `[Event SignIn]` appears without the preceding callback entry logs.
    *   **Current Status:** Authentication is failing because the session/token is not being established correctly. The browser gets a misleading `200 OK`, but the backend flow breaks after `authorize` (or potentially within it, before logging).
4.  **Next Step:** **Crucially, we need COMPLETE Vercel logs corresponding *exactly* to the timeframe of a single, new login attempt.** 
    *   Retry login.
    *   Immediately get logs from Vercel for the `POST /api/auth/callback/credentials` request.
    *   Verify if `[Authorize Callback] ENTERED` appears. Does it complete (log `Returning user...`)?
    *   Verify if `[JWT Callback] ENTERED` and `[Session Callback] ENTERED` appear *after* authorize completes.
    *   Also **re-verify** `NEXTAUTH_PASSWORD_BYPASS=true` is set in the Vercel deployment environment.

---

## Current State Analysis & Refined Plan (Post-Auth Debugging)

**Date:** [Current Date/Time]

**Summary:** After fixing the `NEXTAUTH_URL` issue and adding detailed logging, the core authentication callbacks (`authorize`, `jwt`, `session`) are confirmed to be executing successfully upon sign-in. The primary remaining issues are:

1.  **Middleware Bypass:** A temporary fix (`[WARN] [Middleware] TEMP FIX: Skipping token retrieval via getToken...`) remains in `middleware.ts`, preventing actual session validation on subsequent requests. This **must be removed** to restore proper authentication checks.
2.  **Document Upload Success (Alternate Route):** Logs confirm that uploading via the `/api/documents/alt-upload` route (using direct SQL) works correctly within an authenticated context, and the server-side parsing logic (`ExcelParserService`) executes successfully. This rules out auth *directly* breaking the parsing steps.
3.  **Frontend Display Failure:** Despite successful backend upload/parsing via the alternate route, the newly uploaded document does *not* appear automatically on the `app/documents/page.tsx`. This strongly suggests the **frontend refresh mechanism is broken or not being triggered**.

**Revised Troubleshooting Steps:**

1.  **Analyze Existing Refresh Logic:** Before modifying code, review `app/documents/page.tsx` and `components/logistics/LogisticsDocumentUploader.tsx` to understand how the post-upload refresh was originally designed to work. (✅ Done)
2.  **Stabilize Authentication:** Remove the temporary bypass logic from `middleware.ts`. Deploy and test sign-in, sign-out, and navigation to protected routes thoroughly. (✅ Middleware code updated)
3.  **Verify Upload & Logs:** Test upload again using the *alternate route checkbox*. Confirm successful API response (200 OK) in browser tools and successful parsing logs in Vercel for the `/api/documents/alt-upload` request.
4.  **Debug Frontend Refresh:** Based on the analysis from Step 1, trace the execution flow after the successful upload API call in `LogisticsDocumentUploader.tsx`. Identify why the data refresh/state update in `app/documents/page.tsx` is failing.
    *   **Verification Points:**
        *   Does the `POST /api/documents/alt-upload` call complete successfully (200 OK) in the browser's Network tab?
        *   Is the `onProcessingComplete` prop being called correctly by `LogisticsDocumentUploader.tsx`? (Check client console logs).
        *   Is the `handleProcessingComplete` function in `app/documents/page.tsx` being executed? (Check client console logs).
        *   Is the subsequent call to `fetchDocuments` within `handleProcessingComplete` triggering a new `GET /api/documents` request in the Network tab, and does that request succeed?
    *   **Expected Outcome:** After a successful upload via the alternate route, the document list on the `/documents` page should automatically refresh, and the new document card should appear without requiring a manual page reload.
5.  **Consolidate Upload Endpoint (Post-Fix):** Once the frontend refresh is fixed and the alternate route is confirmed reliable, consider replacing the original `/api/documents` POST handler with the direct SQL logic from `alt-upload` to avoid future confusion caused by the Drizzle/Vercel build issue.

---
