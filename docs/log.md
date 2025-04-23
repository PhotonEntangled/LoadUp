[18:35:19.220] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 7a215a4)
[18:35:19.458] Previous build caches not available
[18:35:19.852] Warning: Failed to fetch one or more git submodules
[18:35:19.852] Cloning completed: 632.000ms
[18:35:20.195] Running build in Washington, D.C., USA (East) – iad1
[18:35:20.407] Running "vercel build"
[18:35:20.905] Vercel CLI 41.6.2
[18:35:21.519] Running "install" command: `npm install`...
[18:35:27.032] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[18:35:28.646] npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
[18:35:29.410] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[18:35:29.679] npm warn deprecated glob@8.1.0: Glob versions prior to v9 are no longer supported
[18:35:30.377] npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead
[18:35:30.554] npm warn deprecated fstream@1.0.12: This package is no longer supported.
[18:35:30.920] npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
[18:35:31.090] npm warn deprecated @types/winston@2.4.4: This is a stub types definition. winston provides its own type definitions, so you do not need this installed.
[18:35:33.723] npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
[18:35:33.767] npm warn deprecated @humanwhocodes/config-array@0.11.14: Use @eslint/config-array instead
[18:35:33.897] npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is
[18:35:33.950] npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is
[18:35:34.312] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:34.510] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:34.613] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:35.007] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:35.278] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:35.368] npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
[18:35:35.412] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:35.552] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:35.723] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[18:35:40.184] npm warn deprecated eslint@8.57.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
[18:36:00.797] 
[18:36:00.798] added 1408 packages, and audited 1409 packages in 39s
[18:36:00.798] 
[18:36:00.798] 343 packages are looking for funding
[18:36:00.799]   run `npm fund` for details
[18:36:00.830] 
[18:36:00.830] 5 vulnerabilities (4 moderate, 1 high)
[18:36:00.830] 
[18:36:00.831] To address all issues possible (including breaking changes), run:
[18:36:00.831]   npm audit fix --force
[18:36:00.831] 
[18:36:00.831] Some issues need review, and may require choosing
[18:36:00.832] a different dependency.
[18:36:00.832] 
[18:36:00.832] Run `npm audit` for details.
[18:36:00.900] Detected Next.js version: 14.2.28
[18:36:00.903] Running "npm run build"
[18:36:01.153] 
[18:36:01.153] > loadup-admin-dashboard@0.1.0 prebuild
[18:36:01.154] > echo 'Starting build process'
[18:36:01.154] 
[18:36:01.160] Starting build process
[18:36:01.161] 
[18:36:01.161] > loadup-admin-dashboard@0.1.0 build
[18:36:01.162] > next build
[18:36:01.162] 
[18:36:01.856] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[18:36:01.858] This information is used to shape Next.js' roadmap and prioritize features.
[18:36:01.859] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[18:36:01.859] https://nextjs.org/telemetry
[18:36:01.860] 
[18:36:01.977]   ▲ Next.js 14.2.28
[18:36:01.978] 
[18:36:02.021]    Creating an optimized production build ...
[18:36:36.313]  ⚠ Compiled with warnings
[18:36:36.314] 
[18:36:36.314] ./node_modules/keyv/src/index.js
[18:36:36.314] Critical dependency: the request of a dependency is an expression
[18:36:36.314] 
[18:36:36.314] Import trace for requested module:
[18:36:36.315] ./node_modules/keyv/src/index.js
[18:36:36.315] ./node_modules/cacheable-request/src/index.js
[18:36:36.315] ./node_modules/got/dist/source/core/index.js
[18:36:36.315] ./node_modules/got/dist/source/create.js
[18:36:36.315] ./node_modules/got/dist/source/index.js
[18:36:36.315] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[18:36:36.315] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[18:36:36.315] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[18:36:36.315] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[18:36:36.315] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[18:36:36.315] ./app/api/directions/route.ts
[18:36:36.321] 
[18:37:03.306]  ✓ Compiled successfully
[18:37:03.307]    Linting and checking validity of types ...
[18:37:17.172] 
[18:37:17.181] Failed to compile.
[18:37:17.181] 
[18:37:17.182] ./app/api/ai/document-processing/route.ts
[18:37:17.182] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.182] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.182] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.182] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.183] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.183] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.183] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.183] 34:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.183] 35:3  Warning: Unexpected console statement.  no-console
[18:37:17.184] 56:5  Warning: Unexpected console statement.  no-console
[18:37:17.184] 60:7  Warning: Unexpected console statement.  no-console
[18:37:17.184] 79:11  Warning: 'parseOptions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.184] 257:5  Warning: Unexpected console statement.  no-console
[18:37:17.184] 280:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.185] 286:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.185] 356:7  Warning: Unexpected console statement.  no-console
[18:37:17.185] 364:7  Warning: Unexpected console statement.  no-console
[18:37:17.185] 372:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.187] 418:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.187] 
[18:37:17.187] ./app/api/ai/field-mapping/route.ts
[18:37:17.188] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.188] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.188] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.188] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.188] 
[18:37:17.189] ./app/api/ai/image-extraction/route.ts
[18:37:17.189] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.189] 
[18:37:17.189] ./app/api/ai/test-connection/route.ts
[18:37:17.189] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.190] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.190] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.190] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.190] 
[18:37:17.190] ./app/api/auth/[...nextauth]/options.ts
[18:37:17.191] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.191] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.191] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.191] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.191] 103:11  Warning: Unexpected console statement.  no-console
[18:37:17.192] 113:12  Warning: Unexpected console statement.  no-console
[18:37:17.192] 117:9  Warning: Unexpected console statement.  no-console
[18:37:17.192] 148:9  Warning: Unexpected console statement.  no-console
[18:37:17.192] 
[18:37:17.192] ./app/api/auth/login/route.ts
[18:37:17.193] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.193] 34:5  Warning: Unexpected console statement.  no-console
[18:37:17.193] 59:5  Warning: Unexpected console statement.  no-console
[18:37:17.193] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.193] 90:5  Warning: Unexpected console statement.  no-console
[18:37:17.194] 
[18:37:17.194] ./app/api/auth/logout/route.ts
[18:37:17.194] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.194] 6:5  Warning: Unexpected console statement.  no-console
[18:37:17.194] 12:5  Warning: Unexpected console statement.  no-console
[18:37:17.194] 
[18:37:17.195] ./app/api/auth/route.ts
[18:37:17.195] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.195] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.195] 
[18:37:17.195] ./app/api/auth/signout/route.ts
[18:37:17.196] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.196] 
[18:37:17.196] ./app/api/auth/user/route.ts
[18:37:17.196] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.196] 7:5  Warning: Unexpected console statement.  no-console
[18:37:17.197] 14:7  Warning: Unexpected console statement.  no-console
[18:37:17.197] 23:7  Warning: Unexpected console statement.  no-console
[18:37:17.197] 
[18:37:17.197] ./app/api/directions/route.ts
[18:37:17.198] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.198] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.198] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.198] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.199] 
[18:37:17.199] ./app/api/documents/[id]/route.ts
[18:37:17.200] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.200] 
[18:37:17.201] ./app/api/documents/route.ts
[18:37:17.201] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.201] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.201] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.202] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.202] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.202] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.202] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.203] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.203] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.203] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.203] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.203] 464:11  Error: 'failedBundleIndices' is never reassigned. Use 'const' instead.  prefer-const
[18:37:17.203] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.204] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.204] 
[18:37:17.204] ./app/api/documents/upload/route.ts
[18:37:17.204] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.204] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.205] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.205] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.205] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.205] 
[18:37:17.205] ./app/api/etl/process-shipment-slips/route.ts
[18:37:17.206] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.206] 
[18:37:17.206] ./app/api/shipments/[id]/route.ts
[18:37:17.206] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.206] 10:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.206] 
[18:37:17.207] ./app/api/shipments/route.ts
[18:37:17.207] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.207] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.207] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.207] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.208] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.209] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.209] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.209] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.209] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.209] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.210] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.210] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.210] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.210] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.210] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.211] 394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.211] 
[18:37:17.211] ./app/api/simulation/enqueue-ticks/route.ts
[18:37:17.211] 5:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.211] 29:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.212] 94:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.212] 
[18:37:17.212] ./app/api/simulation/route.ts
[18:37:17.212] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.212] 
[18:37:17.213] ./app/api/simulation/shipments/[documentId]/route.ts
[18:37:17.213] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.213] 
[18:37:17.213] ./app/api/simulation/tick/route.ts
[18:37:17.213] 7:26  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.214] 11:7  Warning: 'MIN_DISTANCE_THRESHOLD_METERS' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.214] 16:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.214] 
[18:37:17.214] ./app/api/users/route.ts
[18:37:17.214] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.215] 
[18:37:17.215] ./app/auth/_components/AuthForm.tsx
[18:37:17.215] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.215] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.215] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.215] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.216] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.216] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.216] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.216] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.217] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.217] 66:9  Warning: Unexpected console statement.  no-console
[18:37:17.217] 71:9  Warning: Unexpected console statement.  no-console
[18:37:17.217] 77:11  Warning: Unexpected console statement.  no-console
[18:37:17.217] 81:9  Warning: Unexpected console statement.  no-console
[18:37:17.218] 83:11  Warning: Unexpected console statement.  no-console
[18:37:17.218] 85:13  Warning: Unexpected console statement.  no-console
[18:37:17.218] 91:13  Warning: Unexpected console statement.  no-console
[18:37:17.218] 94:13  Warning: Unexpected console statement.  no-console
[18:37:17.218] 98:9  Warning: Unexpected console statement.  no-console
[18:37:17.226] 110:9  Warning: Unexpected console statement.  no-console
[18:37:17.226] 115:9  Warning: Unexpected console statement.  no-console
[18:37:17.226] 132:5  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.226] 
[18:37:17.227] ./app/auth/forgot-password/page.tsx
[18:37:17.227] 18:44  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.227] 
[18:37:17.227] ./app/auth/sign-in/page.tsx
[18:37:17.228] 13:5  Warning: Unexpected console statement.  no-console
[18:37:17.228] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.230] 24:5  Warning: Unexpected console statement.  no-console
[18:37:17.230] 163:12  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.230] 
[18:37:17.231] ./app/auth/sign-up/page.tsx
[18:37:17.231] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.231] 
[18:37:17.231] ./app/dashboard/customer/success/page.tsx
[18:37:17.231] 9:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.233] 99:16  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.233] 149:29  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.233] 
[18:37:17.234] ./app/dashboard/driver/success/page.tsx
[18:37:17.234] 9:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.234] 99:16  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.234] 
[18:37:17.234] ./app/dashboard/map/page.tsx
[18:37:17.235] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.235] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.236] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.236] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.236] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.237] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.237] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.238] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.238] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.238] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.239] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.239] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.239] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.240] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.240] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.241] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.241] 
[18:37:17.241] ./app/dashboard/shipments/create/page.tsx
[18:37:17.241] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.242] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.242] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.249] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.249] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.249] 
[18:37:17.250] ./app/dashboard/shipments/page.tsx
[18:37:17.257] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.257] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.257] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.257] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.258] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.259] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.259] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.259] 
[18:37:17.259] ./app/debug/page.tsx
[18:37:17.259] 22:5  Warning: Unexpected console statement.  no-console
[18:37:17.260] 
[18:37:17.260] ./app/documents/page.tsx
[18:37:17.260] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.260] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.260] 9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.261] 10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.261] 11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.261] 12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.261] 13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.261] 82:5  Warning: Unexpected console statement.  no-console
[18:37:17.262] 90:7  Warning: Unexpected console statement.  no-console
[18:37:17.262] 109:5  Warning: Unexpected console statement.  no-console
[18:37:17.262] 116:7  Warning: Unexpected console statement.  no-console
[18:37:17.262] 124:5  Warning: Unexpected console statement.  no-console
[18:37:17.262] 138:5  Warning: Unexpected console statement.  no-console
[18:37:17.263] 
[18:37:17.263] ./app/documents/scan/page.tsx
[18:37:17.263] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.263] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.263] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.264] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.264] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.264] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.264] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.264] 77:5  Warning: Unexpected console statement.  no-console
[18:37:17.265] 88:5  Warning: Unexpected console statement.  no-console
[18:37:17.265] 
[18:37:17.265] ./app/documents/view/[id]/page.tsx
[18:37:17.265] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.265] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.266] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.266] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.266] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.266] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.266] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.267] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.267] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.267] 
[18:37:17.268] ./app/error.tsx
[18:37:17.268] 3:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.268] 
[18:37:17.268] ./app/not-found.tsx
[18:37:17.268] 27:45  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.269] 
[18:37:17.269] ./app/page.tsx
[18:37:17.269] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.269] 
[18:37:17.269] ./app/shipments/[documentid]/page.tsx
[18:37:17.270] 4:32  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.270] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.270] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.270] 21:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.271] 25:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.271] 48:12  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.271] 214:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.271] 238:9  Warning: Unexpected console statement.  no-console
[18:37:17.271] 242:11  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.272] 249:11  Warning: 'handleRefreshLocation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.272] 269:13  Warning: Unexpected console statement.  no-console
[18:37:17.272] 330:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.272] 331:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.273] 411:52  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.273] 411:65  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.273] 477:45  Warning: Unexpected console statement.  no-console
[18:37:17.273] 
[18:37:17.274] ./app/simulation/[documentId]/page.tsx
[18:37:17.274] 3:46  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.274] 13:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.276] 35:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.276] 155:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.277] 224:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.277] 294:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.277] 
[18:37:17.277] ./app/simulation/page.tsx
[18:37:17.277] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.278] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.278] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.278] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.278] 
[18:37:17.278] ./app/tracking/test-combined/_page.tsx
[18:37:17.279] 81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.279] 83:3  Warning: Unexpected console statement.  no-console
[18:37:17.279] 100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.279] 104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.280] 106:3  Warning: Unexpected console statement.  no-console
[18:37:17.280] 132:3  Warning: Unexpected console statement.  no-console
[18:37:17.280] 137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.280] 140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.281] 145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.281] 146:5  Warning: Unexpected console statement.  no-console
[18:37:17.281] 
[18:37:17.281] ./app/tracking/test-new-map/_page.tsx
[18:37:17.281] 9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.282] 69:3  Warning: Unexpected console statement.  no-console
[18:37:17.282] 92:3  Warning: Unexpected console statement.  no-console
[18:37:17.282] 99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.282] 
[18:37:17.283] ./app/tracking/test-vehicle-list/_page.tsx
[18:37:17.283] 69:3  Warning: Unexpected console statement.  no-console
[18:37:17.283] 73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.283] 77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.283] 82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.284] 83:5  Warning: Unexpected console statement.  no-console
[18:37:17.284] 
[18:37:17.284] ./app/tracking-stabilized/page.tsx
[18:37:17.284] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.284] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.285] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.285] 3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.285] 4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.285] 9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.286] 202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.286] 
[18:37:17.286] ./components/AuthForm.tsx
[18:37:17.286] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.287] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.287] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.287] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.287] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.289] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.289] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.289] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.290] 68:9  Warning: Unexpected console statement.  no-console
[18:37:17.290] 70:9  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.290] 76:9  Warning: Unexpected console statement.  no-console
[18:37:17.290] 87:11  Warning: Unexpected console statement.  no-console
[18:37:17.291] 94:9  Warning: Unexpected console statement.  no-console
[18:37:17.291] 96:11  Warning: Unexpected console statement.  no-console
[18:37:17.291] 99:13  Warning: Unexpected console statement.  no-console
[18:37:17.291] 107:13  Warning: Unexpected console statement.  no-console
[18:37:17.291] 111:13  Warning: Unexpected console statement.  no-console
[18:37:17.292] 116:9  Warning: Unexpected console statement.  no-console
[18:37:17.297] 134:9  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.297] 158:5  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.297] 173:11  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.298] 184:5  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.298] 198:11  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.298] 
[18:37:17.298] ./components/VehicleMarker.tsx
[18:37:17.299] 22:3  Warning: 'isHovered' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.299] 27:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.299] 58:9  Warning: 'handleMouseEnter' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.299] 59:9  Warning: 'handleMouseLeave' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.300] 62:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.300] 
[18:37:17.300] ./components/document-page.tsx
[18:37:17.300] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.300] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.301] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.301] 75:5  Warning: Unexpected console statement.  no-console
[18:37:17.301] 85:7  Warning: Unexpected console statement.  no-console
[18:37:17.301] 110:5  Warning: Unexpected console statement.  no-console
[18:37:17.302] 124:9  Warning: Unexpected console statement.  no-console
[18:37:17.302] 135:5  Warning: Unexpected console statement.  no-console
[18:37:17.302] 151:5  Warning: Unexpected console statement.  no-console
[18:37:17.302] 
[18:37:17.302] ./components/drivers/DriverManagement.tsx
[18:37:17.303] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.303] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.303] 
[18:37:17.303] ./components/logistics/DocumentScanner.tsx
[18:37:17.304] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.304] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.304] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.304] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.304] 264:60  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[18:37:17.305] 
[18:37:17.305] ./components/logistics/LogisticsDocumentUploader.tsx
[18:37:17.305] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.305] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.306] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.306] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.306] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.306] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.307] 87:7  Warning: Unexpected console statement.  no-console
[18:37:17.307] 93:7  Warning: Unexpected console statement.  no-console
[18:37:17.307] 109:7  Warning: Unexpected console statement.  no-console
[18:37:17.307] 
[18:37:17.307] ./components/logistics/ShipmentDataDisplay.tsx
[18:37:17.308] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.308] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.308] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.308] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.309] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.309] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.309] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.309] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.309] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.310] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.310] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.310] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.310] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.311] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.311] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.311] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.311] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.311] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.312] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.312] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.312] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.312] 
[18:37:17.313] ./components/logistics/shipments/AIMappingLabel.tsx
[18:37:17.313] 43:26  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.313] 43:50  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.313] 44:27  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.314] 44:43  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[18:37:17.314] 
[18:37:17.314] ./components/logistics/shipments/ShipmentCardView.tsx
[18:37:17.314] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.314] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.315] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.315] 40:39  Warning: Unexpected console statement.  no-console
[18:37:17.315] 
[18:37:17.315] ./components/logistics/shipments/ShipmentDetailsView.tsx
[18:37:17.316] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.316] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.316] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.316] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.316] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.317] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.317] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.317] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.317] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.318] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.318] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.318] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.318] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.318] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.319] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.319] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.319] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.319] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.320] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.320] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.320] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.320] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.320] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.321] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.321] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.321] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.321] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.322] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.322] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.322] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.322] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.322] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.323] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.323] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.323] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.323] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.324] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.324] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.324] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.324] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.325] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.325] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.325] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.325] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.326] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.326] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.326] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.326] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.327] 58:5  Warning: Unexpected console statement.  no-console
[18:37:17.327] 62:5  Warning: Unexpected console statement.  no-console
[18:37:17.327] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.327] 
[18:37:17.327] ./components/logistics/shipments/ShipmentField.tsx
[18:37:17.328] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.328] 
[18:37:17.328] ./components/logistics/shipments/ShipmentItemsTable.tsx
[18:37:17.329] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.329] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.329] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.330] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.330] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.330] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.330] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.331] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.331] 
[18:37:17.331] ./components/logistics/shipments/ShipmentTableView.tsx
[18:37:17.331] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.332] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.332] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.332] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.332] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.333] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.333] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.333] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.333] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.334] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.334] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.334] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.334] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.335] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.335] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.336] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.336] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.336] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.336] 
[18:37:17.336] ./components/main-layout.tsx
[18:37:17.336] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.336] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 110:21  Warning: Unexpected console statement.  no-console
[18:37:17.337] 117:21  Warning: Unexpected console statement.  no-console
[18:37:17.337] 124:21  Warning: Unexpected console statement.  no-console
[18:37:17.337] 
[18:37:17.337] ./components/map/BasicMapComponent.tsx
[18:37:17.337] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 
[18:37:17.337] ./components/map/DriverInterface.tsx
[18:37:17.337] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.337] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.337] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.337] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[18:37:17.337] 
[18:37:17.337] ./components/map/FleetOverviewMap.tsx
[18:37:17.338] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.338] 
[18:37:17.338] ./components/map/ShipmentSnapshotMapView.tsx
[18:37:17.338] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.338] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.338] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.338] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.338] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.338] 
[18:37:17.338] ./components/map/SimulationMap.tsx
[18:37:17.338] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.338] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.339] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.339] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.339] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.339] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.339] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.339] 
[18:37:17.339] ./components/map/StaticRouteMap.tsx
[18:37:17.339] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.339] 20:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.339] 51:3  Warning: 'mapboxToken' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.339] 92:13  Error: 'featuresToBound' is never reassigned. Use 'const' instead.  prefer-const
[18:37:17.339] 140:99  Error: Empty block statement.  no-empty
[18:37:17.339] 
[18:37:17.339] ./components/sentry-provider.tsx
[18:37:17.339] 29:11  Warning: Unexpected console statement.  no-console
[18:37:17.339] 
[18:37:17.339] ./components/shared/Avatar.tsx
[18:37:17.339] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[18:37:17.339] 
[18:37:17.339] ./components/shipment-detail-page.tsx
[18:37:17.339] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.340] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 131:5  Warning: Unexpected console statement.  no-console
[18:37:17.340] 137:6  Warning: Unexpected console statement.  no-console
[18:37:17.340] 
[18:37:17.340] ./components/shipments/ShipmentCard.tsx
[18:37:17.340] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.340] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 42:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 45:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 
[18:37:17.341] ./components/shipments/ShipmentHistory.tsx
[18:37:17.341] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.341] 
[18:37:17.341] ./components/shipments/ShipmentStatusTimeline.tsx
[18:37:17.341] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.341] 
[18:37:17.341] ./components/shipments/ShipmentsTable.tsx
[18:37:17.341] 129:5  Warning: Unexpected console statement.  no-console
[18:37:17.341] 
[18:37:17.341] ./components/simulation/ScenarioSelector.tsx
[18:37:17.341] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 
[18:37:17.342] ./components/simulation/SimulationControls.tsx
[18:37:17.342] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 
[18:37:17.342] ./components/ui/custom-select.tsx
[18:37:17.342] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 
[18:37:17.342] ./components/ui/dialog.tsx
[18:37:17.342] 3:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.342] 6:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.342] 8:1  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[18:37:17.342] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.342] 
[18:37:17.342] ./components/ui/dropdown.tsx
[18:37:17.342] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 
[18:37:17.342] ./components/ui/enhanced-file-upload.tsx
[18:37:17.342] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.342] 30:35  Error: Component definition is missing display name  react/display-name
[18:37:17.342] 104:5  Warning: React Hook useCallback has a missing dependency: 'simulateUpload'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.342] 
[18:37:17.342] ./components/ui/file-upload.tsx
[18:37:17.342] 95:5  Warning: React Hook useCallback has a missing dependency: 'simulateUpload'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:37:17.342] 
[18:37:17.343] ./components/users/UserManagement.tsx
[18:37:17.343] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.343] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.343] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.343] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.343] 
[18:37:17.343] ./lib/actions/auth.ts
[18:37:17.343] 20:5  Warning: Unexpected console statement.  no-console
[18:37:17.343] 27:5  Warning: Unexpected console statement.  no-console
[18:37:17.343] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.343] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.343] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.343] 61:5  Warning: Unexpected console statement.  no-console
[18:37:17.343] 
[18:37:17.343] ./lib/actions/shipmentUpdateActions.ts
[18:37:17.343] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.343] 
[18:37:17.344] ./lib/actions/simulationActions.ts
[18:37:17.344] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.344] 328:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 
[18:37:17.344] ./lib/api.ts
[18:37:17.344] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.344] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[18:37:17.345] 
[18:37:17.345] ./lib/auth-client.ts
[18:37:17.345] 16:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 20:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 34:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 43:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 47:7  Warning: Unexpected console statement.  no-console
[18:37:17.345] 67:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 83:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 92:5  Warning: Unexpected console statement.  no-console
[18:37:17.345] 96:7  Warning: Unexpected console statement.  no-console
[18:37:17.345] 
[18:37:17.345] ./lib/auth.ts
[18:37:17.345] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.345] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.345] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 49:9  Warning: Unexpected console statement.  no-console
[18:37:17.345] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.345] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.345] 54:9  Warning: Unexpected console statement.  no-console
[18:37:17.345] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.346] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.346] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.346] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.346] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 
[18:37:17.346] ./lib/context/SimulationStoreContext.tsx
[18:37:17.346] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 
[18:37:17.346] ./lib/database/schema.ts
[18:37:17.346] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.346] 
[18:37:17.346] ./lib/document-processing.ts
[18:37:17.346] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.346] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.347] 
[18:37:17.347] ./lib/excel-helper.ts
[18:37:17.347] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.347] 
[18:37:17.347] ./lib/simple-auth.ts
[18:37:17.347] 16:5  Warning: Unexpected console statement.  no-console
[18:37:17.347] 19:5  Warning: Unexpected console statement.  no-console
[18:37:17.347] 30:5  Warning: Unexpected console statement.  no-console
[18:37:17.347] 34:7  Warning: Unexpected console statement.  no-console
[18:37:17.347] 44:5  Warning: Unexpected console statement.  no-console
[18:37:17.347] 67:3  Warning: Unexpected console statement.  no-console
[18:37:17.348] 71:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 83:9  Warning: Unexpected console statement.  no-console
[18:37:17.348] 91:9  Warning: Unexpected console statement.  no-console
[18:37:17.348] 111:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 122:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 131:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 149:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 160:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 164:9  Warning: Unexpected console statement.  no-console
[18:37:17.348] 174:5  Warning: Unexpected console statement.  no-console
[18:37:17.348] 
[18:37:17.348] ./lib/store/SimulationStoreContext.tsx
[18:37:17.348] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.348] 
[18:37:17.348] ./lib/store/documentStore.ts
[18:37:17.348] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.348] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.348] 
[18:37:17.348] ./lib/store/useSimulationStore.ts
[18:37:17.348] 102:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.348] 108:46  Warning: 'removed' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:37:17.348] 188:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.348] 196:11  Warning: 'vehiclesProcessed' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:37:17.348] 200:55  Error: Empty block statement.  no-empty
[18:37:17.348] 436:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:37:17.348] 
[18:37:17.348] ./lib/store/useSimulationStoreContext.ts
[18:37:17.349] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.349] 
[18:37:17.349] ./lib/validations.ts
[18:37:17.349] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:37:17.349] 
[18:37:17.349] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[18:37:17.360] Error: Command "npm run build" exited with 1
[18:37:17.990] 