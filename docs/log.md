[11:04:15.654] Running build in Washington, D.C., USA (East) – iad1
[11:04:15.751] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 70e0fe0)
[11:04:17.015] Warning: Failed to fetch one or more git submodules
[11:04:17.016] Cloning completed: 1.265s
[11:04:22.328] Restored build cache from previous deployment (5QXqUqQLFUpNnZ44hiYwa9aC2nNz)
[11:04:23.196] Running "vercel build"
[11:04:23.632] Vercel CLI 41.6.2
[11:04:23.985] Running "install" command: `npm install`...
[11:04:30.733] 
[11:04:30.734] added 66 packages, and audited 1475 packages in 6s
[11:04:30.734] 
[11:04:30.735] 343 packages are looking for funding
[11:04:30.735]   run `npm fund` for details
[11:04:30.759] 
[11:04:30.759] 5 vulnerabilities (4 moderate, 1 high)
[11:04:30.760] 
[11:04:30.760] To address all issues possible (including breaking changes), run:
[11:04:30.760]   npm audit fix --force
[11:04:30.761] 
[11:04:30.761] Some issues need review, and may require choosing
[11:04:30.761] a different dependency.
[11:04:30.761] 
[11:04:30.761] Run `npm audit` for details.
[11:04:30.803] Detected Next.js version: 14.2.28
[11:04:30.804] Running "npm run build"
[11:04:30.922] 
[11:04:30.922] > loadup-admin-dashboard@0.1.0 prebuild
[11:04:30.923] > echo 'Starting build process'
[11:04:30.923] 
[11:04:30.927] Starting build process
[11:04:30.928] 
[11:04:30.928] > loadup-admin-dashboard@0.1.0 build
[11:04:30.929] > next build
[11:04:30.929] 
[11:04:31.824]   ▲ Next.js 14.2.28
[11:04:31.825] 
[11:04:31.856]    Creating an optimized production build ...
[11:04:44.739]  ⚠ Compiled with warnings
[11:04:44.739] 
[11:04:44.739] ./node_modules/keyv/src/index.js
[11:04:44.739] Critical dependency: the request of a dependency is an expression
[11:04:44.739] 
[11:04:44.739] Import trace for requested module:
[11:04:44.739] ./node_modules/keyv/src/index.js
[11:04:44.739] ./node_modules/cacheable-request/src/index.js
[11:04:44.740] ./node_modules/got/dist/source/core/index.js
[11:04:44.740] ./node_modules/got/dist/source/create.js
[11:04:44.740] ./node_modules/got/dist/source/index.js
[11:04:44.740] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[11:04:44.740] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[11:04:44.740] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[11:04:44.740] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[11:04:44.740] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[11:04:44.740] ./app/api/directions/route.ts
[11:04:44.740] 
[11:04:56.041]  ✓ Compiled successfully
[11:04:56.042]    Linting and checking validity of types ...
[11:05:08.338] 
[11:05:08.338] Failed to compile.
[11:05:08.339] 
[11:05:08.339] ./app/api/ai/document-processing/route.ts
[11:05:08.339] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.339] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.339] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.339] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.339] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.340] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.340] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.340] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.340] 42:3  Warning: Unexpected console statement.  no-console
[11:05:08.340] 63:5  Warning: Unexpected console statement.  no-console
[11:05:08.340] 67:7  Warning: Unexpected console statement.  no-console
[11:05:08.341] 250:5  Warning: Unexpected console statement.  no-console
[11:05:08.341] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.341] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.342] 349:7  Warning: Unexpected console statement.  no-console
[11:05:08.342] 357:7  Warning: Unexpected console statement.  no-console
[11:05:08.342] 
[11:05:08.342] ./app/api/ai/field-mapping/route.ts
[11:05:08.342] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.342] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.342] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.342] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.342] 
[11:05:08.342] ./app/api/ai/image-extraction/route.ts
[11:05:08.347] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.348] 
[11:05:08.348] ./app/api/ai/test-connection/route.ts
[11:05:08.348] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.348] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.348] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.348] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.348] 
[11:05:08.348] ./app/api/auth/[...nextauth]/options.ts
[11:05:08.348] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.348] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.351] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.351] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.351] 103:11  Warning: Unexpected console statement.  no-console
[11:05:08.351] 113:12  Warning: Unexpected console statement.  no-console
[11:05:08.351] 117:9  Warning: Unexpected console statement.  no-console
[11:05:08.351] 148:9  Warning: Unexpected console statement.  no-console
[11:05:08.351] 
[11:05:08.351] ./app/api/auth/login/route.ts
[11:05:08.352] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.352] 34:5  Warning: Unexpected console statement.  no-console
[11:05:08.352] 59:5  Warning: Unexpected console statement.  no-console
[11:05:08.352] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.352] 90:5  Warning: Unexpected console statement.  no-console
[11:05:08.352] 
[11:05:08.352] ./app/api/auth/logout/route.ts
[11:05:08.352] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.352] 6:5  Warning: Unexpected console statement.  no-console
[11:05:08.352] 12:5  Warning: Unexpected console statement.  no-console
[11:05:08.352] 
[11:05:08.352] ./app/api/auth/route.ts
[11:05:08.352] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.352] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.352] 
[11:05:08.352] ./app/api/auth/signout/route.ts
[11:05:08.352] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.353] 
[11:05:08.353] ./app/api/auth/user/route.ts
[11:05:08.353] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.353] 7:5  Warning: Unexpected console statement.  no-console
[11:05:08.353] 14:7  Warning: Unexpected console statement.  no-console
[11:05:08.353] 23:7  Warning: Unexpected console statement.  no-console
[11:05:08.353] 
[11:05:08.353] ./app/api/directions/route.ts
[11:05:08.353] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.353] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.353] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.353] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.353] 
[11:05:08.353] ./app/api/documents/[id]/route.ts
[11:05:08.353] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 
[11:05:08.354] ./app/api/documents/route.ts
[11:05:08.354] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.354] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.355] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.355] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.355] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.355] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.356] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.356] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.357] 
[11:05:08.357] ./app/api/documents/upload/route.ts
[11:05:08.357] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.357] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.357] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.358] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.358] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.358] 
[11:05:08.358] ./app/api/etl/process-shipment-slips/route.ts
[11:05:08.358] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.358] 
[11:05:08.358] ./app/api/shipments/[id]/route.ts
[11:05:08.358] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.358] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.359] 
[11:05:08.359] ./app/api/shipments/route.ts
[11:05:08.361] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.361] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.362] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.362] 
[11:05:08.362] ./app/api/simulation/enqueue-ticks/route.ts
[11:05:08.362] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.363] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.363] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.363] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.363] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.363] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.363] 
[11:05:08.364] ./app/api/simulation/route.ts
[11:05:08.364] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.368] 
[11:05:08.368] ./app/api/simulation/shipments/[documentId]/route.ts
[11:05:08.368] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.368] 
[11:05:08.368] ./app/api/simulation/tick-worker/route.ts
[11:05:08.368] 135:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.368] 
[11:05:08.368] ./app/api/users/route.ts
[11:05:08.368] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.368] 
[11:05:08.368] ./app/auth/_components/AuthForm.tsx
[11:05:08.369] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.369] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.369] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.369] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.369] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.369] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.369] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.369] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.369] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.369] 66:9  Warning: Unexpected console statement.  no-console
[11:05:08.369] 71:9  Warning: Unexpected console statement.  no-console
[11:05:08.369] 77:11  Warning: Unexpected console statement.  no-console
[11:05:08.369] 81:9  Warning: Unexpected console statement.  no-console
[11:05:08.369] 83:11  Warning: Unexpected console statement.  no-console
[11:05:08.370] 85:13  Warning: Unexpected console statement.  no-console
[11:05:08.370] 91:13  Warning: Unexpected console statement.  no-console
[11:05:08.370] 94:13  Warning: Unexpected console statement.  no-console
[11:05:08.370] 98:9  Warning: Unexpected console statement.  no-console
[11:05:08.370] 110:9  Warning: Unexpected console statement.  no-console
[11:05:08.370] 115:9  Warning: Unexpected console statement.  no-console
[11:05:08.370] 
[11:05:08.370] ./app/auth/sign-in/page.tsx
[11:05:08.370] 13:5  Warning: Unexpected console statement.  no-console
[11:05:08.370] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.370] 24:5  Warning: Unexpected console statement.  no-console
[11:05:08.370] 
[11:05:08.370] ./app/auth/sign-up/page.tsx
[11:05:08.370] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 
[11:05:08.371] ./app/dashboard/customer/success/page.tsx
[11:05:08.371] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.371] 
[11:05:08.371] ./app/dashboard/driver/success/page.tsx
[11:05:08.371] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.371] 
[11:05:08.371] ./app/dashboard/map/page.tsx
[11:05:08.371] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.371] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.372] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.372] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.372] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.372] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.373] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.373] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 
[11:05:08.373] ./app/dashboard/shipments/create/page.tsx
[11:05:08.373] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.373] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 
[11:05:08.375] ./app/dashboard/shipments/page.tsx
[11:05:08.375] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.375] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.376] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.376] 
[11:05:08.376] ./app/debug/page.tsx
[11:05:08.376] 22:5  Warning: Unexpected console statement.  no-console
[11:05:08.376] 
[11:05:08.376] ./app/documents/page.tsx
[11:05:08.376] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.377] 82:5  Warning: Unexpected console statement.  no-console
[11:05:08.377] 90:7  Warning: Unexpected console statement.  no-console
[11:05:08.377] 109:5  Warning: Unexpected console statement.  no-console
[11:05:08.377] 116:7  Warning: Unexpected console statement.  no-console
[11:05:08.377] 124:5  Warning: Unexpected console statement.  no-console
[11:05:08.377] 138:5  Warning: Unexpected console statement.  no-console
[11:05:08.380] 
[11:05:08.380] ./app/documents/scan/page.tsx
[11:05:08.380] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.380] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.380] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.380] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.380] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.380] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.381] 77:5  Warning: Unexpected console statement.  no-console
[11:05:08.381] 88:5  Warning: Unexpected console statement.  no-console
[11:05:08.381] 
[11:05:08.381] ./app/documents/view/[id]/page.tsx
[11:05:08.381] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.381] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 
[11:05:08.382] ./app/page.tsx
[11:05:08.382] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 
[11:05:08.382] ./app/shipments/[documentid]/page.tsx
[11:05:08.382] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.382] 27:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.382] 270:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.382] 409:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 410:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.382] 
[11:05:08.382] ./app/simulation/[documentId]/page.tsx
[11:05:08.382] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.383] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.383] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.383] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.383] 
[11:05:08.383] ./app/simulation/page.tsx
[11:05:08.383] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.383] 
[11:05:08.383] ./app/tracking/[shipmentId]/_components/TrackingPageView.tsx
[11:05:08.383] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.383] 14:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.384] 35:10  Warning: 'staticDetails' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.384] 108:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.398] 147:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.398] 
[11:05:08.398] ./app/tracking/test-combined/_page.tsx
[11:05:08.398] 81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.399] 83:3  Warning: Unexpected console statement.  no-console
[11:05:08.399] 100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.399] 104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.399] 106:3  Warning: Unexpected console statement.  no-console
[11:05:08.399] 132:3  Warning: Unexpected console statement.  no-console
[11:05:08.399] 137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.399] 140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.399] 145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.399] 146:5  Warning: Unexpected console statement.  no-console
[11:05:08.399] 
[11:05:08.399] ./app/tracking/test-new-map/_page.tsx
[11:05:08.399] 9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.399] 69:3  Warning: Unexpected console statement.  no-console
[11:05:08.400] 92:3  Warning: Unexpected console statement.  no-console
[11:05:08.400] 99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.400] 
[11:05:08.400] ./app/tracking/test-vehicle-list/_page.tsx
[11:05:08.400] 69:3  Warning: Unexpected console statement.  no-console
[11:05:08.400] 73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.400] 77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.400] 82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.400] 83:5  Warning: Unexpected console statement.  no-console
[11:05:08.400] 
[11:05:08.400] ./app/tracking-stabilized/page.tsx
[11:05:08.400] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.401] 
[11:05:08.401] ./components/AuthForm.tsx
[11:05:08.401] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.403] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.404] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.409] 68:9  Warning: Unexpected console statement.  no-console
[11:05:08.409] 76:9  Warning: Unexpected console statement.  no-console
[11:05:08.409] 87:11  Warning: Unexpected console statement.  no-console
[11:05:08.409] 94:9  Warning: Unexpected console statement.  no-console
[11:05:08.409] 96:11  Warning: Unexpected console statement.  no-console
[11:05:08.409] 99:13  Warning: Unexpected console statement.  no-console
[11:05:08.409] 107:13  Warning: Unexpected console statement.  no-console
[11:05:08.409] 111:13  Warning: Unexpected console statement.  no-console
[11:05:08.409] 116:9  Warning: Unexpected console statement.  no-console
[11:05:08.409] 
[11:05:08.409] ./components/document-page.tsx
[11:05:08.409] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.410] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.410] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.410] 75:5  Warning: Unexpected console statement.  no-console
[11:05:08.410] 85:7  Warning: Unexpected console statement.  no-console
[11:05:08.410] 110:5  Warning: Unexpected console statement.  no-console
[11:05:08.410] 124:9  Warning: Unexpected console statement.  no-console
[11:05:08.411] 135:5  Warning: Unexpected console statement.  no-console
[11:05:08.411] 151:5  Warning: Unexpected console statement.  no-console
[11:05:08.411] 
[11:05:08.411] ./components/drivers/DriverManagement.tsx
[11:05:08.411] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.411] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.412] 
[11:05:08.412] ./components/logistics/DocumentScanner.tsx
[11:05:08.412] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.412] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.412] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.412] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.412] 
[11:05:08.412] ./components/logistics/LogisticsDocumentUploader.tsx
[11:05:08.413] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.414] 87:7  Warning: Unexpected console statement.  no-console
[11:05:08.414] 93:7  Warning: Unexpected console statement.  no-console
[11:05:08.414] 109:7  Warning: Unexpected console statement.  no-console
[11:05:08.414] 
[11:05:08.414] ./components/logistics/ShipmentDataDisplay.tsx
[11:05:08.414] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.415] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.415] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.415] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.415] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.415] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.416] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.416] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.416] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.417] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.417] 
[11:05:08.417] ./components/logistics/shipments/ShipmentCardView.tsx
[11:05:08.417] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.417] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.417] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.417] 40:39  Warning: Unexpected console statement.  no-console
[11:05:08.417] 
[11:05:08.417] ./components/logistics/shipments/ShipmentDetailsView.tsx
[11:05:08.418] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.418] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.418] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.418] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.419] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.420] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.420] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.421] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.422] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.422] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.422] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.422] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.422] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.423] 58:5  Warning: Unexpected console statement.  no-console
[11:05:08.423] 62:5  Warning: Unexpected console statement.  no-console
[11:05:08.423] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.423] 
[11:05:08.424] ./components/logistics/shipments/ShipmentField.tsx
[11:05:08.424] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.424] 
[11:05:08.424] ./components/logistics/shipments/ShipmentItemsTable.tsx
[11:05:08.424] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 
[11:05:08.425] ./components/logistics/shipments/ShipmentTableView.tsx
[11:05:08.425] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.425] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.427] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.427] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.427] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.427] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.428] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.429] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.430] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.430] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.430] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.430] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.430] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.430] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.431] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.431] 
[11:05:08.431] ./components/main-layout.tsx
[11:05:08.431] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.431] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.431] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.431] 110:21  Warning: Unexpected console statement.  no-console
[11:05:08.431] 117:21  Warning: Unexpected console statement.  no-console
[11:05:08.431] 124:21  Warning: Unexpected console statement.  no-console
[11:05:08.431] 
[11:05:08.432] ./components/map/BasicMapComponent.tsx
[11:05:08.433] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.433] 
[11:05:08.433] ./components/map/DriverInterface.tsx
[11:05:08.433] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.433] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.433] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.434] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.434] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.434] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.434] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.434] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.434] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.435] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.435] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[11:05:08.435] 
[11:05:08.435] ./components/map/FleetOverviewMap.tsx
[11:05:08.435] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.435] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.435] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.436] 
[11:05:08.436] ./components/map/ShipmentSnapshotMapView.tsx
[11:05:08.436] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.436] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.436] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.436] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.436] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.436] 
[11:05:08.436] ./components/map/SimulationMap.tsx
[11:05:08.436] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.436] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.437] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.437] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.437] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.437] 
[11:05:08.437] ./components/map/StaticRouteMap.tsx
[11:05:08.437] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 68:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 
[11:05:08.437] ./components/map/TrackingControls.tsx
[11:05:08.437] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 
[11:05:08.437] ./components/map/TrackingMap.tsx
[11:05:08.437] 11:3  Warning: 'Marker' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 18:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 21:10  Warning: 'Home' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 21:16  Warning: 'Flag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 23:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 82:10  Warning: 'isStale' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 164:7  Warning: React Hook useImperativeHandle has an unnecessary dependency: 'setFollowingVehicle'. Either exclude it or remove the dependency array.  react-hooks/exhaustive-deps
[11:05:08.437] 237:11  Warning: 'svgString' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.437] 
[11:05:08.437] ./components/sentry-provider.tsx
[11:05:08.437] 29:11  Warning: Unexpected console statement.  no-console
[11:05:08.437] 
[11:05:08.437] ./components/shared/Avatar.tsx
[11:05:08.437] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[11:05:08.438] 
[11:05:08.438] ./components/shipment-detail-page.tsx
[11:05:08.439] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.439] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.439] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.439] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.439] 131:5  Warning: Unexpected console statement.  no-console
[11:05:08.439] 137:6  Warning: Unexpected console statement.  no-console
[11:05:08.440] 
[11:05:08.440] ./components/shipments/ShipmentCard.tsx
[11:05:08.441] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.441] 
[11:05:08.442] ./components/shipments/ShipmentHistory.tsx
[11:05:08.442] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.442] 
[11:05:08.443] ./components/shipments/ShipmentStatusTimeline.tsx
[11:05:08.443] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.443] 
[11:05:08.443] ./components/shipments/ShipmentsTable.tsx
[11:05:08.443] 129:5  Warning: Unexpected console statement.  no-console
[11:05:08.443] 
[11:05:08.444] ./components/simulation/ScenarioSelector.tsx
[11:05:08.444] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.444] 
[11:05:08.444] ./components/simulation/SimulationControls.tsx
[11:05:08.444] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.444] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.444] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.445] 
[11:05:08.445] ./components/ui/custom-select.tsx
[11:05:08.445] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.445] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.445] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.445] 
[11:05:08.445] ./components/ui/dialog.tsx
[11:05:08.446] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.446] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.446] 
[11:05:08.446] ./components/ui/dropdown.tsx
[11:05:08.446] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.446] 
[11:05:08.446] ./components/ui/enhanced-file-upload.tsx
[11:05:08.447] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.447] 
[11:05:08.447] ./components/users/UserManagement.tsx
[11:05:08.447] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.447] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.450] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.450] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.450] 
[11:05:08.450] ./lib/actions/auth.ts
[11:05:08.451] 20:5  Warning: Unexpected console statement.  no-console
[11:05:08.451] 27:5  Warning: Unexpected console statement.  no-console
[11:05:08.451] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.451] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.451] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.451] 61:5  Warning: Unexpected console statement.  no-console
[11:05:08.451] 
[11:05:08.451] ./lib/actions/shipmentActions.ts
[11:05:08.451] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.451] 
[11:05:08.451] ./lib/actions/shipmentUpdateActions.ts
[11:05:08.451] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.451] 
[11:05:08.452] ./lib/actions/simulationActions.ts
[11:05:08.452] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 506:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.452] 
[11:05:08.452] ./lib/actions/trackingActions.ts
[11:05:08.452] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 34:34  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.452] 69:9  Error: 'notes' is never reassigned. Use 'const' instead.  prefer-const
[11:05:08.452] 392:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 464:13  Error: 'plannedRouteGeometry' is never reassigned. Use 'const' instead.  prefer-const
[11:05:08.453] 510:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 
[11:05:08.453] ./lib/api.ts
[11:05:08.453] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.453] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.454] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.454] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.454] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[11:05:08.454] 
[11:05:08.454] ./lib/auth-client.ts
[11:05:08.454] 16:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 20:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 34:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 43:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 47:7  Warning: Unexpected console statement.  no-console
[11:05:08.454] 67:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 83:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 92:5  Warning: Unexpected console statement.  no-console
[11:05:08.454] 96:7  Warning: Unexpected console statement.  no-console
[11:05:08.455] 
[11:05:08.455] ./lib/auth.ts
[11:05:08.455] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.455] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.455] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 49:9  Warning: Unexpected console statement.  no-console
[11:05:08.455] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.455] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 54:9  Warning: Unexpected console statement.  no-console
[11:05:08.455] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.455] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.455] 
[11:05:08.455] ./lib/context/SimulationStoreContext.tsx
[11:05:08.456] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 
[11:05:08.456] ./lib/database/schema.ts
[11:05:08.456] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:05:08.456] 
[11:05:08.456] ./lib/document-processing.ts
[11:05:08.456] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.456] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.457] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.457] 
[11:05:08.457] ./lib/excel-helper.ts
[11:05:08.458] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.458] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.458] 
[11:05:08.458] ./lib/firebase/clientApp.ts
[11:05:08.458] 31:1  Warning: Unexpected console statement.  no-console
[11:05:08.458] 
[11:05:08.458] ./lib/simple-auth.ts
[11:05:08.458] 16:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 19:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 30:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 34:7  Warning: Unexpected console statement.  no-console
[11:05:08.458] 44:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 67:3  Warning: Unexpected console statement.  no-console
[11:05:08.458] 71:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 83:9  Warning: Unexpected console statement.  no-console
[11:05:08.458] 91:9  Warning: Unexpected console statement.  no-console
[11:05:08.458] 111:5  Warning: Unexpected console statement.  no-console
[11:05:08.458] 122:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 131:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 149:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 160:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 164:9  Warning: Unexpected console statement.  no-console
[11:05:08.459] 174:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 
[11:05:08.459] ./lib/store/SimulationStoreContext.tsx
[11:05:08.459] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.459] 
[11:05:08.459] ./lib/store/documentStore.ts
[11:05:08.459] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.459] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.459] 
[11:05:08.459] ./lib/store/useLiveTrackingStore.ts
[11:05:08.459] 81:5  Warning: Unexpected console statement.  no-console
[11:05:08.459] 103:7  Warning: Unexpected console statement.  no-console
[11:05:08.460] 114:5  Warning: Unexpected console statement.  no-console
[11:05:08.460] 119:9  Warning: Unexpected console statement.  no-console
[11:05:08.460] 127:5  Warning: Unexpected console statement.  no-console
[11:05:08.460] 144:9  Warning: Unexpected console statement.  no-console
[11:05:08.460] 180:5  Warning: Unexpected console statement.  no-console
[11:05:08.460] 190:5  Warning: Unexpected console statement.  no-console
[11:05:08.460] 203:1  Warning: Unexpected console statement.  no-console
[11:05:08.460] 
[11:05:08.460] ./lib/store/useSimulationStore.ts
[11:05:08.460] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.460] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.460] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:05:08.460] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:05:08.460] 
[11:05:08.460] ./lib/store/useSimulationStoreContext.ts
[11:05:08.460] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.461] 
[11:05:08.461] ./lib/validations.ts
[11:05:08.461] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:05:08.461] 
[11:05:08.468] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[11:05:08.485] Error: Command "npm run build" exited with 1
[11:05:09.209] 