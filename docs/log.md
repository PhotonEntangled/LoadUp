[05:21:13.188] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 2e44776)
[05:21:13.919] Warning: Failed to fetch one or more git submodules
[05:21:13.920] Cloning completed: 731.000ms
[05:21:19.521] Restored build cache from previous deployment (HJJHfqNSujjNEwj3qFpRRbtQzsQh)
[05:21:19.628] Running build in Washington, D.C., USA (East) – iad1
[05:21:20.447] Running "vercel build"
[05:21:21.240] Vercel CLI 41.6.2
[05:21:21.588] Running "install" command: `npm install`...
[05:21:25.420] 
[05:21:25.421] up to date, audited 1409 packages in 3s
[05:21:25.421] 
[05:21:25.421] 343 packages are looking for funding
[05:21:25.421]   run `npm fund` for details
[05:21:25.445] 
[05:21:25.445] 5 vulnerabilities (4 moderate, 1 high)
[05:21:25.445] 
[05:21:25.446] To address all issues possible (including breaking changes), run:
[05:21:25.446]   npm audit fix --force
[05:21:25.446] 
[05:21:25.446] Some issues need review, and may require choosing
[05:21:25.447] a different dependency.
[05:21:25.447] 
[05:21:25.447] Run `npm audit` for details.
[05:21:25.478] Detected Next.js version: 14.2.28
[05:21:25.479] Running "npm run build"
[05:21:25.602] 
[05:21:25.604] > loadup-admin-dashboard@0.1.0 prebuild
[05:21:25.605] > echo 'Starting build process'
[05:21:25.605] 
[05:21:25.609] Starting build process
[05:21:25.609] 
[05:21:25.610] > loadup-admin-dashboard@0.1.0 build
[05:21:25.610] > next build
[05:21:25.610] 
[05:21:26.303]   ▲ Next.js 14.2.28
[05:21:26.303] 
[05:21:26.331]    Creating an optimized production build ...
[05:21:36.691]  ⚠ Compiled with warnings
[05:21:36.692] 
[05:21:36.692] ./node_modules/keyv/src/index.js
[05:21:36.692] Critical dependency: the request of a dependency is an expression
[05:21:36.693] 
[05:21:36.693] Import trace for requested module:
[05:21:36.693] ./node_modules/keyv/src/index.js
[05:21:36.693] ./node_modules/cacheable-request/src/index.js
[05:21:36.693] ./node_modules/got/dist/source/core/index.js
[05:21:36.693] ./node_modules/got/dist/source/create.js
[05:21:36.693] ./node_modules/got/dist/source/index.js
[05:21:36.693] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[05:21:36.693] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[05:21:36.694] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[05:21:36.694] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[05:21:36.694] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[05:21:36.694] ./app/api/directions/route.ts
[05:21:36.694] 
[05:21:43.487]  ✓ Compiled successfully
[05:21:43.488]    Linting and checking validity of types ...
[05:21:55.486] 
[05:21:55.487] Failed to compile.
[05:21:55.487] 
[05:21:55.487] ./app/api/ai/document-processing/route.ts
[05:21:55.487] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.487] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.488] 42:3  Warning: Unexpected console statement.  no-console
[05:21:55.488] 63:5  Warning: Unexpected console statement.  no-console
[05:21:55.488] 67:7  Warning: Unexpected console statement.  no-console
[05:21:55.488] 250:5  Warning: Unexpected console statement.  no-console
[05:21:55.488] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.488] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.488] 349:7  Warning: Unexpected console statement.  no-console
[05:21:55.488] 357:7  Warning: Unexpected console statement.  no-console
[05:21:55.488] 
[05:21:55.488] ./app/api/ai/field-mapping/route.ts
[05:21:55.488] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.488] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.488] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.489] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.489] 
[05:21:55.490] ./app/api/ai/image-extraction/route.ts
[05:21:55.490] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.490] 
[05:21:55.490] ./app/api/ai/test-connection/route.ts
[05:21:55.491] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.491] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.491] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.491] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.498] 
[05:21:55.499] ./app/api/auth/[...nextauth]/options.ts
[05:21:55.499] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.499] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.499] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.500] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.500] 103:11  Warning: Unexpected console statement.  no-console
[05:21:55.500] 113:12  Warning: Unexpected console statement.  no-console
[05:21:55.500] 117:9  Warning: Unexpected console statement.  no-console
[05:21:55.500] 148:9  Warning: Unexpected console statement.  no-console
[05:21:55.501] 
[05:21:55.501] ./app/api/auth/login/route.ts
[05:21:55.501] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.501] 34:5  Warning: Unexpected console statement.  no-console
[05:21:55.501] 59:5  Warning: Unexpected console statement.  no-console
[05:21:55.502] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.502] 90:5  Warning: Unexpected console statement.  no-console
[05:21:55.502] 
[05:21:55.502] ./app/api/auth/logout/route.ts
[05:21:55.502] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.503] 6:5  Warning: Unexpected console statement.  no-console
[05:21:55.503] 12:5  Warning: Unexpected console statement.  no-console
[05:21:55.503] 
[05:21:55.503] ./app/api/auth/route.ts
[05:21:55.503] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.504] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.504] 
[05:21:55.504] ./app/api/auth/signout/route.ts
[05:21:55.504] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.504] 
[05:21:55.505] ./app/api/auth/user/route.ts
[05:21:55.505] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.506] 7:5  Warning: Unexpected console statement.  no-console
[05:21:55.506] 14:7  Warning: Unexpected console statement.  no-console
[05:21:55.506] 23:7  Warning: Unexpected console statement.  no-console
[05:21:55.506] 
[05:21:55.507] ./app/api/directions/route.ts
[05:21:55.507] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.507] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.507] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.508] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.508] 
[05:21:55.508] ./app/api/documents/[id]/route.ts
[05:21:55.508] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.509] 
[05:21:55.509] ./app/api/documents/route.ts
[05:21:55.509] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.509] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.509] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.510] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.510] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.510] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.510] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.510] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.511] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.511] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.511] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.511] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.511] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.512] 
[05:21:55.512] ./app/api/documents/upload/route.ts
[05:21:55.512] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.512] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.512] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.512] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.512] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.513] 
[05:21:55.513] ./app/api/etl/process-shipment-slips/route.ts
[05:21:55.513] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.513] 
[05:21:55.514] ./app/api/shipments/[id]/route.ts
[05:21:55.521] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.522] 10:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.522] 
[05:21:55.522] ./app/api/shipments/route.ts
[05:21:55.522] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.522] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.523] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.523] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.523] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.523] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.523] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.524] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.525] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.525] 394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.526] 
[05:21:55.527] ./app/api/simulation/enqueue-ticks/route.ts
[05:21:55.527] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.527] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.527] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.527] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.527] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.528] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.528] 
[05:21:55.528] ./app/api/simulation/route.ts
[05:21:55.528] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.528] 
[05:21:55.528] ./app/api/simulation/shipments/[documentId]/route.ts
[05:21:55.528] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.529] 
[05:21:55.529] ./app/api/simulation/tick-worker/route.ts
[05:21:55.529] 143:92  Error: Empty block statement.  no-empty
[05:21:55.529] 
[05:21:55.529] ./app/api/users/route.ts
[05:21:55.530] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.530] 
[05:21:55.530] ./app/auth/_components/AuthForm.tsx
[05:21:55.530] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.530] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.530] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.531] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.531] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.531] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.531] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.531] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.531] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.531] 66:9  Warning: Unexpected console statement.  no-console
[05:21:55.532] 71:9  Warning: Unexpected console statement.  no-console
[05:21:55.532] 77:11  Warning: Unexpected console statement.  no-console
[05:21:55.532] 81:9  Warning: Unexpected console statement.  no-console
[05:21:55.532] 83:11  Warning: Unexpected console statement.  no-console
[05:21:55.532] 85:13  Warning: Unexpected console statement.  no-console
[05:21:55.532] 91:13  Warning: Unexpected console statement.  no-console
[05:21:55.532] 94:13  Warning: Unexpected console statement.  no-console
[05:21:55.533] 98:9  Warning: Unexpected console statement.  no-console
[05:21:55.533] 110:9  Warning: Unexpected console statement.  no-console
[05:21:55.533] 115:9  Warning: Unexpected console statement.  no-console
[05:21:55.533] 
[05:21:55.533] ./app/auth/sign-in/page.tsx
[05:21:55.534] 13:5  Warning: Unexpected console statement.  no-console
[05:21:55.534] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.534] 24:5  Warning: Unexpected console statement.  no-console
[05:21:55.534] 
[05:21:55.534] ./app/auth/sign-up/page.tsx
[05:21:55.534] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.535] 
[05:21:55.535] ./app/dashboard/customer/success/page.tsx
[05:21:55.535] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.535] 
[05:21:55.535] ./app/dashboard/driver/success/page.tsx
[05:21:55.536] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.536] 
[05:21:55.536] ./app/dashboard/map/page.tsx
[05:21:55.536] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.536] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.536] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.536] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.537] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.546] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.546] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.546] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.546] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.547] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.547] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.547] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.548] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.548] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.548] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.548] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.548] 
[05:21:55.549] ./app/dashboard/shipments/create/page.tsx
[05:21:55.549] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.549] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.549] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.549] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.549] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.549] 
[05:21:55.550] ./app/dashboard/shipments/page.tsx
[05:21:55.550] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.550] 
[05:21:55.550] ./app/debug/page.tsx
[05:21:55.550] 22:5  Warning: Unexpected console statement.  no-console
[05:21:55.550] 
[05:21:55.550] ./app/documents/page.tsx
[05:21:55.550] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.550] 11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.551] 12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.551] 13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.551] 82:5  Warning: Unexpected console statement.  no-console
[05:21:55.551] 90:7  Warning: Unexpected console statement.  no-console
[05:21:55.551] 109:5  Warning: Unexpected console statement.  no-console
[05:21:55.551] 116:7  Warning: Unexpected console statement.  no-console
[05:21:55.552] 124:5  Warning: Unexpected console statement.  no-console
[05:21:55.552] 138:5  Warning: Unexpected console statement.  no-console
[05:21:55.552] 
[05:21:55.552] ./app/documents/scan/page.tsx
[05:21:55.552] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.552] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.553] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.553] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.553] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.553] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.553] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.553] 77:5  Warning: Unexpected console statement.  no-console
[05:21:55.554] 88:5  Warning: Unexpected console statement.  no-console
[05:21:55.554] 
[05:21:55.554] ./app/documents/view/[id]/page.tsx
[05:21:55.554] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.554] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.554] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.554] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.555] 
[05:21:55.555] ./app/page.tsx
[05:21:55.555] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 
[05:21:55.556] ./app/shipments/[documentid]/page.tsx
[05:21:55.556] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.556] 27:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.556] 50:12  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 260:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.556] 284:9  Warning: Unexpected console statement.  no-console
[05:21:55.556] 288:11  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 409:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 410:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 574:45  Warning: Unexpected console statement.  no-console
[05:21:55.556] 
[05:21:55.556] ./app/simulation/[documentId]/page.tsx
[05:21:55.556] 3:46  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 13:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 35:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.556] 96:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.557] 170:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.557] 239:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.558] 297:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.558] 
[05:21:55.558] ./app/simulation/page.tsx
[05:21:55.558] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.558] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.558] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.559] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.559] 
[05:21:55.559] ./app/tracking/test-combined/_page.tsx
[05:21:55.559] 81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.559] 83:3  Warning: Unexpected console statement.  no-console
[05:21:55.560] 100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.560] 104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.560] 106:3  Warning: Unexpected console statement.  no-console
[05:21:55.560] 132:3  Warning: Unexpected console statement.  no-console
[05:21:55.560] 137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.560] 140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.561] 145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.561] 146:5  Warning: Unexpected console statement.  no-console
[05:21:55.561] 
[05:21:55.561] ./app/tracking/test-new-map/_page.tsx
[05:21:55.561] 9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.562] 69:3  Warning: Unexpected console statement.  no-console
[05:21:55.562] 92:3  Warning: Unexpected console statement.  no-console
[05:21:55.562] 99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.562] 
[05:21:55.562] ./app/tracking/test-vehicle-list/_page.tsx
[05:21:55.562] 69:3  Warning: Unexpected console statement.  no-console
[05:21:55.563] 73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.563] 77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.563] 82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.563] 83:5  Warning: Unexpected console statement.  no-console
[05:21:55.564] 
[05:21:55.564] ./app/tracking-stabilized/page.tsx
[05:21:55.564] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.564] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.564] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.564] 3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.565] 4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.565] 9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.565] 202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.573] 
[05:21:55.573] ./components/AuthForm.tsx
[05:21:55.573] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.573] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.574] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.574] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.575] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.575] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.575] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.575] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.575] 68:9  Warning: Unexpected console statement.  no-console
[05:21:55.576] 76:9  Warning: Unexpected console statement.  no-console
[05:21:55.576] 87:11  Warning: Unexpected console statement.  no-console
[05:21:55.576] 94:9  Warning: Unexpected console statement.  no-console
[05:21:55.576] 96:11  Warning: Unexpected console statement.  no-console
[05:21:55.576] 99:13  Warning: Unexpected console statement.  no-console
[05:21:55.576] 107:13  Warning: Unexpected console statement.  no-console
[05:21:55.577] 111:13  Warning: Unexpected console statement.  no-console
[05:21:55.577] 116:9  Warning: Unexpected console statement.  no-console
[05:21:55.577] 
[05:21:55.577] ./components/VehicleMarker.tsx
[05:21:55.577] 22:3  Warning: 'isHovered' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.577] 27:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.578] 58:9  Warning: 'handleMouseEnter' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.578] 59:9  Warning: 'handleMouseLeave' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.578] 62:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.578] 
[05:21:55.578] ./components/document-page.tsx
[05:21:55.579] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.579] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.579] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.579] 75:5  Warning: Unexpected console statement.  no-console
[05:21:55.579] 85:7  Warning: Unexpected console statement.  no-console
[05:21:55.579] 110:5  Warning: Unexpected console statement.  no-console
[05:21:55.580] 124:9  Warning: Unexpected console statement.  no-console
[05:21:55.580] 135:5  Warning: Unexpected console statement.  no-console
[05:21:55.580] 151:5  Warning: Unexpected console statement.  no-console
[05:21:55.580] 
[05:21:55.580] ./components/drivers/DriverManagement.tsx
[05:21:55.580] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.581] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.581] 
[05:21:55.581] ./components/logistics/DocumentScanner.tsx
[05:21:55.581] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.581] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.583] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.583] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.583] 
[05:21:55.584] ./components/logistics/LogisticsDocumentUploader.tsx
[05:21:55.584] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.584] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.584] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.584] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.584] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.584] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.585] 87:7  Warning: Unexpected console statement.  no-console
[05:21:55.585] 93:7  Warning: Unexpected console statement.  no-console
[05:21:55.585] 109:7  Warning: Unexpected console statement.  no-console
[05:21:55.585] 
[05:21:55.585] ./components/logistics/ShipmentDataDisplay.tsx
[05:21:55.585] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.586] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.587] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.587] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.587] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.587] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.587] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.587] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.588] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.588] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.588] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.588] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.588] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.588] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.589] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.589] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.589] 
[05:21:55.589] ./components/logistics/shipments/ShipmentCardView.tsx
[05:21:55.589] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.589] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.590] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.590] 40:39  Warning: Unexpected console statement.  no-console
[05:21:55.590] 
[05:21:55.590] ./components/logistics/shipments/ShipmentDetailsView.tsx
[05:21:55.590] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.590] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.591] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.592] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.592] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.592] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.592] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.592] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.593] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.594] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.595] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.595] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.595] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.595] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.595] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.596] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.597] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.598] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.599] 58:5  Warning: Unexpected console statement.  no-console
[05:21:55.599] 62:5  Warning: Unexpected console statement.  no-console
[05:21:55.599] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.599] 
[05:21:55.599] ./components/logistics/shipments/ShipmentField.tsx
[05:21:55.599] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.600] 
[05:21:55.600] ./components/logistics/shipments/ShipmentItemsTable.tsx
[05:21:55.600] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.600] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.600] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.600] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.600] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.601] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.601] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.601] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.601] 
[05:21:55.601] ./components/logistics/shipments/ShipmentTableView.tsx
[05:21:55.602] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.602] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.602] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.602] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.602] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.602] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.603] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.604] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.604] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.604] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.604] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.604] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.605] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.605] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.606] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.606] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.606] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.606] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.607] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.607] 
[05:21:55.607] ./components/main-layout.tsx
[05:21:55.607] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.608] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.608] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.608] 110:21  Warning: Unexpected console statement.  no-console
[05:21:55.608] 117:21  Warning: Unexpected console statement.  no-console
[05:21:55.608] 124:21  Warning: Unexpected console statement.  no-console
[05:21:55.608] 
[05:21:55.608] ./components/map/BasicMapComponent.tsx
[05:21:55.608] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.608] 
[05:21:55.608] ./components/map/DriverInterface.tsx
[05:21:55.608] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.608] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.608] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.608] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.609] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.609] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[05:21:55.610] 
[05:21:55.610] ./components/map/FleetOverviewMap.tsx
[05:21:55.610] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.610] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.610] 
[05:21:55.610] ./components/map/ShipmentSnapshotMapView.tsx
[05:21:55.610] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.611] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.611] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.611] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.611] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.611] 
[05:21:55.611] ./components/map/SimulationMap.tsx
[05:21:55.611] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.611] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.612] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.612] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.612] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.612] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[05:21:55.612] 
[05:21:55.612] ./components/map/StaticRouteMap.tsx
[05:21:55.612] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.612] 20:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.612] 
[05:21:55.612] ./components/sentry-provider.tsx
[05:21:55.612] 29:11  Warning: Unexpected console statement.  no-console
[05:21:55.612] 
[05:21:55.612] ./components/shared/Avatar.tsx
[05:21:55.612] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[05:21:55.613] 
[05:21:55.613] ./components/shipment-detail-page.tsx
[05:21:55.613] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.613] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 131:5  Warning: Unexpected console statement.  no-console
[05:21:55.613] 137:6  Warning: Unexpected console statement.  no-console
[05:21:55.613] 
[05:21:55.613] ./components/shipments/ShipmentCard.tsx
[05:21:55.613] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.613] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.614] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 42:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 45:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 
[05:21:55.615] ./components/shipments/ShipmentHistory.tsx
[05:21:55.615] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.615] 
[05:21:55.615] ./components/shipments/ShipmentStatusTimeline.tsx
[05:21:55.615] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.615] 
[05:21:55.615] ./components/shipments/ShipmentsTable.tsx
[05:21:55.615] 129:5  Warning: Unexpected console statement.  no-console
[05:21:55.616] 
[05:21:55.616] ./components/simulation/ScenarioSelector.tsx
[05:21:55.616] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 
[05:21:55.616] ./components/simulation/SimulationControls.tsx
[05:21:55.616] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 
[05:21:55.616] ./components/ui/custom-select.tsx
[05:21:55.616] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 
[05:21:55.616] ./components/ui/dialog.tsx
[05:21:55.616] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.616] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.616] 
[05:21:55.616] ./components/ui/dropdown.tsx
[05:21:55.616] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.617] 
[05:21:55.617] ./components/ui/enhanced-file-upload.tsx
[05:21:55.617] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 
[05:21:55.618] ./components/users/UserManagement.tsx
[05:21:55.618] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.618] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.618] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.618] 
[05:21:55.618] ./lib/actions/auth.ts
[05:21:55.618] 20:5  Warning: Unexpected console statement.  no-console
[05:21:55.618] 27:5  Warning: Unexpected console statement.  no-console
[05:21:55.618] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 61:5  Warning: Unexpected console statement.  no-console
[05:21:55.618] 
[05:21:55.618] ./lib/actions/shipmentActions.ts
[05:21:55.618] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.618] 
[05:21:55.619] ./lib/actions/shipmentUpdateActions.ts
[05:21:55.619] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.619] 
[05:21:55.619] ./lib/actions/simulationActions.ts
[05:21:55.619] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.619] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.619] 
[05:21:55.619] ./lib/api.ts
[05:21:55.619] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.619] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[05:21:55.620] 
[05:21:55.620] ./lib/auth-client.ts
[05:21:55.620] 16:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 20:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 34:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 43:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 47:7  Warning: Unexpected console statement.  no-console
[05:21:55.620] 67:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 83:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 92:5  Warning: Unexpected console statement.  no-console
[05:21:55.620] 96:7  Warning: Unexpected console statement.  no-console
[05:21:55.625] 
[05:21:55.625] ./lib/auth.ts
[05:21:55.626] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.626] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.626] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 49:9  Warning: Unexpected console statement.  no-console
[05:21:55.626] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.626] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 54:9  Warning: Unexpected console statement.  no-console
[05:21:55.626] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.626] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.627] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 
[05:21:55.627] ./lib/context/SimulationStoreContext.tsx
[05:21:55.627] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 
[05:21:55.627] ./lib/database/schema.ts
[05:21:55.627] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.627] 
[05:21:55.627] ./lib/document-processing.ts
[05:21:55.627] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.627] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.628] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.628] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.629] 
[05:21:55.629] ./lib/excel-helper.ts
[05:21:55.629] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.629] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.629] 
[05:21:55.629] ./lib/simple-auth.ts
[05:21:55.629] 16:5  Warning: Unexpected console statement.  no-console
[05:21:55.630] 19:5  Warning: Unexpected console statement.  no-console
[05:21:55.630] 30:5  Warning: Unexpected console statement.  no-console
[05:21:55.630] 34:7  Warning: Unexpected console statement.  no-console
[05:21:55.630] 44:5  Warning: Unexpected console statement.  no-console
[05:21:55.630] 67:3  Warning: Unexpected console statement.  no-console
[05:21:55.630] 71:5  Warning: Unexpected console statement.  no-console
[05:21:55.630] 83:9  Warning: Unexpected console statement.  no-console
[05:21:55.630] 91:9  Warning: Unexpected console statement.  no-console
[05:21:55.630] 111:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 122:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 131:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 149:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 160:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 164:9  Warning: Unexpected console statement.  no-console
[05:21:55.632] 174:5  Warning: Unexpected console statement.  no-console
[05:21:55.632] 
[05:21:55.632] ./lib/store/SimulationStoreContext.tsx
[05:21:55.632] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.632] 
[05:21:55.632] ./lib/store/documentStore.ts
[05:21:55.632] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.633] 
[05:21:55.633] ./lib/store/useSimulationStore.ts
[05:21:55.633] 7:10  Warning: 'updateShipmentLastPosition' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 103:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 109:46  Warning: 'removed' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[05:21:55.633] 189:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 189:103  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 465:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[05:21:55.633] 
[05:21:55.633] ./lib/store/useSimulationStoreContext.ts
[05:21:55.633] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.633] 
[05:21:55.634] ./lib/validations.ts
[05:21:55.634] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[05:21:55.634] 
[05:21:55.634] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[05:21:55.648] Error: Command "npm run build" exited with 1
[05:21:56.224] 