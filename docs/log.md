[18:11:27.470] Running build in Washington, D.C., USA (East) – iad1
[18:11:27.556] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 38880d4)
[18:11:29.107] Warning: Failed to fetch one or more git submodules
[18:11:29.107] Cloning completed: 1.550s
[18:11:35.857] Restored build cache from previous deployment (3D6e1KQFc3pf77ZqcaSKojSb2Ssm)
[18:11:36.891] Running "vercel build"
[18:11:37.277] Vercel CLI 41.6.2
[18:11:37.682] Running "install" command: `npm install`...
[18:11:41.499] 
[18:11:41.500] up to date, audited 1475 packages in 4s
[18:11:41.500] 
[18:11:41.500] 343 packages are looking for funding
[18:11:41.501]   run `npm fund` for details
[18:11:41.523] 
[18:11:41.523] 5 vulnerabilities (4 moderate, 1 high)
[18:11:41.523] 
[18:11:41.524] To address all issues possible (including breaking changes), run:
[18:11:41.524]   npm audit fix --force
[18:11:41.524] 
[18:11:41.525] Some issues need review, and may require choosing
[18:11:41.525] a different dependency.
[18:11:41.525] 
[18:11:41.525] Run `npm audit` for details.
[18:11:41.556] Detected Next.js version: 14.2.28
[18:11:41.557] Running "npm run build"
[18:11:41.678] 
[18:11:41.678] > loadup-admin-dashboard@0.1.0 prebuild
[18:11:41.678] > echo 'Starting build process'
[18:11:41.679] 
[18:11:41.684] Starting build process
[18:11:41.685] 
[18:11:41.685] > loadup-admin-dashboard@0.1.0 build
[18:11:41.685] > next build
[18:11:41.685] 
[18:11:42.423]   ▲ Next.js 14.2.28
[18:11:42.423] 
[18:11:42.454]    Creating an optimized production build ...
[18:11:55.069]  ⚠ Compiled with warnings
[18:11:55.070] 
[18:11:55.070] ./node_modules/keyv/src/index.js
[18:11:55.070] Critical dependency: the request of a dependency is an expression
[18:11:55.070] 
[18:11:55.070] Import trace for requested module:
[18:11:55.071] ./node_modules/keyv/src/index.js
[18:11:55.071] ./node_modules/cacheable-request/src/index.js
[18:11:55.071] ./node_modules/got/dist/source/core/index.js
[18:11:55.071] ./node_modules/got/dist/source/create.js
[18:11:55.072] ./node_modules/got/dist/source/index.js
[18:11:55.072] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[18:11:55.072] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[18:11:55.072] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[18:11:55.072] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[18:11:55.072] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[18:11:55.073] ./app/api/directions/route.ts
[18:11:55.073] 
[18:12:03.276]  ✓ Compiled successfully
[18:12:03.277]    Linting and checking validity of types ...
[18:12:16.605] 
[18:12:16.606] ./app/api/ai/document-processing/route.ts
[18:12:16.612] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.619] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.619] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.620] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.620] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.620] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.620] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.621] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.621] 42:3  Warning: Unexpected console statement.  no-console
[18:12:16.621] 63:5  Warning: Unexpected console statement.  no-console
[18:12:16.621] 67:7  Warning: Unexpected console statement.  no-console
[18:12:16.623] 250:5  Warning: Unexpected console statement.  no-console
[18:12:16.623] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.623] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.623] 349:7  Warning: Unexpected console statement.  no-console
[18:12:16.624] 357:7  Warning: Unexpected console statement.  no-console
[18:12:16.625] 
[18:12:16.625] ./app/api/ai/field-mapping/route.ts
[18:12:16.625] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.626] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.626] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.626] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.626] 
[18:12:16.627] ./app/api/ai/image-extraction/route.ts
[18:12:16.627] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.627] 
[18:12:16.627] ./app/api/ai/test-connection/route.ts
[18:12:16.628] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.628] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.629] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.629] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.629] 
[18:12:16.630] ./app/api/auth/[...nextauth]/options.ts
[18:12:16.631] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.631] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.632] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.634] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.636] 103:11  Warning: Unexpected console statement.  no-console
[18:12:16.637] 113:12  Warning: Unexpected console statement.  no-console
[18:12:16.637] 117:9  Warning: Unexpected console statement.  no-console
[18:12:16.637] 148:9  Warning: Unexpected console statement.  no-console
[18:12:16.637] 
[18:12:16.637] ./app/api/auth/login/route.ts
[18:12:16.637] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.637] 34:5  Warning: Unexpected console statement.  no-console
[18:12:16.637] 59:5  Warning: Unexpected console statement.  no-console
[18:12:16.637] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.637] 90:5  Warning: Unexpected console statement.  no-console
[18:12:16.637] 
[18:12:16.637] ./app/api/auth/logout/route.ts
[18:12:16.637] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.637] 6:5  Warning: Unexpected console statement.  no-console
[18:12:16.637] 12:5  Warning: Unexpected console statement.  no-console
[18:12:16.637] 
[18:12:16.637] ./app/api/auth/route.ts
[18:12:16.637] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.637] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.638] 
[18:12:16.638] ./app/api/auth/signout/route.ts
[18:12:16.638] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.638] 
[18:12:16.638] ./app/api/auth/user/route.ts
[18:12:16.638] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.638] 7:5  Warning: Unexpected console statement.  no-console
[18:12:16.638] 14:7  Warning: Unexpected console statement.  no-console
[18:12:16.638] 23:7  Warning: Unexpected console statement.  no-console
[18:12:16.638] 
[18:12:16.638] ./app/api/directions/route.ts
[18:12:16.638] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.638] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.638] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.638] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.638] 
[18:12:16.638] ./app/api/documents/[id]/route.ts
[18:12:16.638] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.638] 
[18:12:16.639] ./app/api/documents/route.ts
[18:12:16.639] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.639] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.639] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.639] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 
[18:12:16.640] ./app/api/documents/upload/route.ts
[18:12:16.640] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.640] 
[18:12:16.658] ./app/api/etl/process-shipment-slips/route.ts
[18:12:16.658] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.659] 
[18:12:16.659] ./app/api/shipments/[id]/route.ts
[18:12:16.659] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.659] 
[18:12:16.659] ./app/api/shipments/route.ts
[18:12:16.659] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.659] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.660] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 395:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.660] 
[18:12:16.660] ./app/api/simulation/enqueue-ticks/route.ts
[18:12:16.661] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.661] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.661] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.661] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.661] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.661] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.661] 
[18:12:16.661] ./app/api/simulation/route.ts
[18:12:16.661] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.661] 
[18:12:16.661] ./app/api/simulation/shipments/[documentId]/route.ts
[18:12:16.661] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.661] 
[18:12:16.661] ./app/api/simulation/tick-worker/route.ts
[18:12:16.661] 136:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.661] 
[18:12:16.661] ./app/api/users/route.ts
[18:12:16.661] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.662] 
[18:12:16.662] ./app/auth/_components/AuthForm.tsx
[18:12:16.662] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.662] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.662] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.662] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.662] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.662] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.662] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.662] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.662] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.662] 66:9  Warning: Unexpected console statement.  no-console
[18:12:16.662] 71:9  Warning: Unexpected console statement.  no-console
[18:12:16.662] 77:11  Warning: Unexpected console statement.  no-console
[18:12:16.662] 81:9  Warning: Unexpected console statement.  no-console
[18:12:16.662] 83:11  Warning: Unexpected console statement.  no-console
[18:12:16.662] 85:13  Warning: Unexpected console statement.  no-console
[18:12:16.663] 91:13  Warning: Unexpected console statement.  no-console
[18:12:16.664] 94:13  Warning: Unexpected console statement.  no-console
[18:12:16.664] 98:9  Warning: Unexpected console statement.  no-console
[18:12:16.664] 110:9  Warning: Unexpected console statement.  no-console
[18:12:16.664] 115:9  Warning: Unexpected console statement.  no-console
[18:12:16.664] 
[18:12:16.664] ./app/auth/sign-in/page.tsx
[18:12:16.664] 13:5  Warning: Unexpected console statement.  no-console
[18:12:16.664] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.664] 24:5  Warning: Unexpected console statement.  no-console
[18:12:16.664] 
[18:12:16.664] ./app/auth/sign-up/page.tsx
[18:12:16.664] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.664] 
[18:12:16.665] ./app/dashboard/customer/success/page.tsx
[18:12:16.665] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.665] 
[18:12:16.665] ./app/dashboard/driver/success/page.tsx
[18:12:16.665] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.665] 
[18:12:16.665] ./app/dashboard/map/page.tsx
[18:12:16.665] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.665] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.671] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.671] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.672] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.672] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.672] 
[18:12:16.672] ./app/dashboard/shipments/create/page.tsx
[18:12:16.673] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 
[18:12:16.673] ./app/dashboard/shipments/page.tsx
[18:12:16.673] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.673] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.674] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.675] 
[18:12:16.675] ./app/debug/page.tsx
[18:12:16.675] 22:5  Warning: Unexpected console statement.  no-console
[18:12:16.675] 
[18:12:16.675] ./app/documents/page.tsx
[18:12:16.675] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.675] 82:5  Warning: Unexpected console statement.  no-console
[18:12:16.675] 90:7  Warning: Unexpected console statement.  no-console
[18:12:16.676] 109:5  Warning: Unexpected console statement.  no-console
[18:12:16.676] 116:7  Warning: Unexpected console statement.  no-console
[18:12:16.676] 124:5  Warning: Unexpected console statement.  no-console
[18:12:16.676] 138:5  Warning: Unexpected console statement.  no-console
[18:12:16.676] 
[18:12:16.676] ./app/documents/scan/page.tsx
[18:12:16.676] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.676] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.676] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.676] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.676] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.676] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.676] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.677] 77:5  Warning: Unexpected console statement.  no-console
[18:12:16.677] 88:5  Warning: Unexpected console statement.  no-console
[18:12:16.677] 
[18:12:16.677] ./app/documents/view/[id]/page.tsx
[18:12:16.677] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.677] 
[18:12:16.677] ./app/page.tsx
[18:12:16.677] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 
[18:12:16.678] ./app/shipments/[documentid]/page.tsx
[18:12:16.678] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 24:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.678] 28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.678] 281:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.678] 422:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 423:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 
[18:12:16.678] ./app/simulation/[documentId]/page.tsx
[18:12:16.678] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.678] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.679] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.679] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.679] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.679] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.679] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.679] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.679] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.679] 
[18:12:16.679] ./app/simulation/page.tsx
[18:12:16.679] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.680] 
[18:12:16.680] ./app/tracking/[documentId]/_components/TrackingPageView.tsx
[18:12:16.680] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 6:15  Warning: 'StaticTrackingDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.680] 118:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.681] 127:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.681] 170:90  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.681] 207:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.681] 233:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.681] 
[18:12:16.681] ./app/tracking/[documentId]/page.tsx
[18:12:16.681] 13:48  Warning: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.681] 
[18:12:16.681] ./components/AuthForm.tsx
[18:12:16.681] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.681] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.682] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.682] 68:9  Warning: Unexpected console statement.  no-console
[18:12:16.683] 76:9  Warning: Unexpected console statement.  no-console
[18:12:16.683] 87:11  Warning: Unexpected console statement.  no-console
[18:12:16.684] 94:9  Warning: Unexpected console statement.  no-console
[18:12:16.684] 96:11  Warning: Unexpected console statement.  no-console
[18:12:16.684] 99:13  Warning: Unexpected console statement.  no-console
[18:12:16.684] 107:13  Warning: Unexpected console statement.  no-console
[18:12:16.684] 111:13  Warning: Unexpected console statement.  no-console
[18:12:16.684] 116:9  Warning: Unexpected console statement.  no-console
[18:12:16.684] 
[18:12:16.684] ./components/document-page.tsx
[18:12:16.684] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.685] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.685] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.685] 75:5  Warning: Unexpected console statement.  no-console
[18:12:16.685] 85:7  Warning: Unexpected console statement.  no-console
[18:12:16.685] 110:5  Warning: Unexpected console statement.  no-console
[18:12:16.685] 124:9  Warning: Unexpected console statement.  no-console
[18:12:16.685] 135:5  Warning: Unexpected console statement.  no-console
[18:12:16.685] 151:5  Warning: Unexpected console statement.  no-console
[18:12:16.686] 
[18:12:16.686] ./components/drivers/DriverManagement.tsx
[18:12:16.686] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.686] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.686] 
[18:12:16.686] ./components/logistics/DocumentScanner.tsx
[18:12:16.686] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.686] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.686] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.686] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.687] 
[18:12:16.687] ./components/logistics/LogisticsDocumentUploader.tsx
[18:12:16.687] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 87:7  Warning: Unexpected console statement.  no-console
[18:12:16.687] 93:7  Warning: Unexpected console statement.  no-console
[18:12:16.687] 109:7  Warning: Unexpected console statement.  no-console
[18:12:16.687] 
[18:12:16.687] ./components/logistics/ShipmentDataDisplay.tsx
[18:12:16.687] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.687] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.688] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.688] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.688] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.688] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.688] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.688] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.688] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.688] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.688] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.688] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.688] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.689] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.689] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.689] 
[18:12:16.689] ./components/logistics/shipments/ShipmentCardView.tsx
[18:12:16.689] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.689] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.690] 40:39  Warning: Unexpected console statement.  no-console
[18:12:16.690] 
[18:12:16.690] ./components/logistics/shipments/ShipmentDetailsView.tsx
[18:12:16.690] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.690] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.691] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.692] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.693] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.694] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.695] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.695] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.696] 58:5  Warning: Unexpected console statement.  no-console
[18:12:16.696] 62:5  Warning: Unexpected console statement.  no-console
[18:12:16.696] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.696] 
[18:12:16.696] ./components/logistics/shipments/ShipmentField.tsx
[18:12:16.696] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.696] 
[18:12:16.696] ./components/logistics/shipments/ShipmentItemsTable.tsx
[18:12:16.696] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.696] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 
[18:12:16.697] ./components/logistics/shipments/ShipmentTableView.tsx
[18:12:16.697] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.697] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.698] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.699] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.699] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.699] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.700] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.700] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.700] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.700] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.700] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.701] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.701] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.701] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.714] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.715] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.717] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.717] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.717] 
[18:12:16.717] ./components/main-layout.tsx
[18:12:16.717] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 110:21  Warning: Unexpected console statement.  no-console
[18:12:16.717] 117:21  Warning: Unexpected console statement.  no-console
[18:12:16.717] 124:21  Warning: Unexpected console statement.  no-console
[18:12:16.717] 
[18:12:16.717] ./components/map/BasicMapComponent.tsx
[18:12:16.717] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 
[18:12:16.717] ./components/map/DriverInterface.tsx
[18:12:16.717] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.717] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.717] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.718] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[18:12:16.718] 
[18:12:16.718] ./components/map/FleetOverviewMap.tsx
[18:12:16.718] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.718] 
[18:12:16.718] ./components/map/ShipmentSnapshotMapView.tsx
[18:12:16.718] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 
[18:12:16.718] ./components/map/SimulationMap.tsx
[18:12:16.718] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.718] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.718] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.718] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.719] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.719] 
[18:12:16.727] ./components/map/StaticRouteMap.tsx
[18:12:16.727] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 70:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 
[18:12:16.727] ./components/map/TrackingControls.tsx
[18:12:16.727] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 
[18:12:16.727] ./components/map/TrackingMap.tsx
[18:12:16.727] 8:3  Warning: 'ViewStateChangeEvent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 17:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 19:42  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 20:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 25:10  Warning: 'GeoJSONSource' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.727] 26:10  Warning: 'LngLatBounds' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 82:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.728] 89:10  Warning: 'viewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 89:21  Warning: 'setViewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 97:5  Warning: 'trackedShipmentId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 263:6  Warning: React Hook useCallback has missing dependencies: 'addRouteSourceAndLayer' and 'updateOriginDestinationMarkers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[18:12:16.728] 266:9  Warning: 'addVehicleSourceAndLayer' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 450:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.728] 
[18:12:16.728] ./components/sentry-provider.tsx
[18:12:16.728] 29:11  Warning: Unexpected console statement.  no-console
[18:12:16.728] 
[18:12:16.728] ./components/shared/Avatar.tsx
[18:12:16.728] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[18:12:16.728] 
[18:12:16.728] ./components/shipment-detail-page.tsx
[18:12:16.728] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.728] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.728] 131:5  Warning: Unexpected console statement.  no-console
[18:12:16.728] 137:6  Warning: Unexpected console statement.  no-console
[18:12:16.729] 
[18:12:16.729] ./components/shipments/ShipmentCard.tsx
[18:12:16.729] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.729] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 
[18:12:16.730] ./components/shipments/ShipmentHistory.tsx
[18:12:16.730] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 
[18:12:16.730] ./components/shipments/ShipmentStatusTimeline.tsx
[18:12:16.730] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.730] 
[18:12:16.730] ./components/shipments/ShipmentsTable.tsx
[18:12:16.730] 129:5  Warning: Unexpected console statement.  no-console
[18:12:16.730] 
[18:12:16.730] ./components/simulation/ScenarioSelector.tsx
[18:12:16.730] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.730] 
[18:12:16.730] ./components/simulation/SimulationControls.tsx
[18:12:16.730] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 
[18:12:16.731] ./components/ui/custom-select.tsx
[18:12:16.731] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 
[18:12:16.731] ./components/ui/dialog.tsx
[18:12:16.731] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.731] 
[18:12:16.731] ./components/ui/dropdown.tsx
[18:12:16.731] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 
[18:12:16.731] ./components/ui/enhanced-file-upload.tsx
[18:12:16.731] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 
[18:12:16.731] ./components/users/UserManagement.tsx
[18:12:16.731] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.731] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.731] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.732] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.735] 
[18:12:16.735] ./lib/actions/auth.ts
[18:12:16.735] 20:5  Warning: Unexpected console statement.  no-console
[18:12:16.735] 27:5  Warning: Unexpected console statement.  no-console
[18:12:16.735] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 61:5  Warning: Unexpected console statement.  no-console
[18:12:16.735] 
[18:12:16.735] ./lib/actions/shipmentActions.ts
[18:12:16.735] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 
[18:12:16.735] ./lib/actions/shipmentUpdateActions.ts
[18:12:16.735] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 
[18:12:16.735] ./lib/actions/simulationActions.ts
[18:12:16.735] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.735] 522:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 
[18:12:16.736] ./lib/actions/trackingActions.ts
[18:12:16.736] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.736] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.736] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.736] 446:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 564:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 
[18:12:16.736] ./lib/api.ts
[18:12:16.736] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.736] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[18:12:16.737] 
[18:12:16.737] ./lib/auth-client.ts
[18:12:16.737] 16:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 20:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 34:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 43:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 47:7  Warning: Unexpected console statement.  no-console
[18:12:16.737] 67:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 83:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 92:5  Warning: Unexpected console statement.  no-console
[18:12:16.737] 96:7  Warning: Unexpected console statement.  no-console
[18:12:16.737] 
[18:12:16.737] ./lib/auth.ts
[18:12:16.737] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.737] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.737] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 49:9  Warning: Unexpected console statement.  no-console
[18:12:16.737] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.737] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 54:9  Warning: Unexpected console statement.  no-console
[18:12:16.737] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.737] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.738] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.738] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.738] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 
[18:12:16.738] ./lib/context/SimulationStoreContext.tsx
[18:12:16.738] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 
[18:12:16.738] ./lib/database/schema.ts
[18:12:16.738] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 590:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:12:16.738] 
[18:12:16.738] ./lib/document-processing.ts
[18:12:16.738] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.738] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.739] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.739] 
[18:12:16.739] ./lib/excel-helper.ts
[18:12:16.739] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.740] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.740] 
[18:12:16.740] ./lib/firebase/clientApp.ts
[18:12:16.740] 31:1  Warning: Unexpected console statement.  no-console
[18:12:16.740] 
[18:12:16.740] ./lib/simple-auth.ts
[18:12:16.740] 16:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 19:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 30:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 34:7  Warning: Unexpected console statement.  no-console
[18:12:16.740] 44:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 67:3  Warning: Unexpected console statement.  no-console
[18:12:16.740] 71:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 83:9  Warning: Unexpected console statement.  no-console
[18:12:16.740] 91:9  Warning: Unexpected console statement.  no-console
[18:12:16.740] 111:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 122:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 131:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 149:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 160:5  Warning: Unexpected console statement.  no-console
[18:12:16.740] 164:9  Warning: Unexpected console statement.  no-console
[18:12:16.741] 174:5  Warning: Unexpected console statement.  no-console
[18:12:16.742] 
[18:12:16.742] ./lib/store/SimulationStoreContext.tsx
[18:12:16.742] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.742] 
[18:12:16.742] ./lib/store/documentStore.ts
[18:12:16.742] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.742] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.742] 
[18:12:16.742] ./lib/store/useLiveTrackingStore.ts
[18:12:16.749] 5:22  Warning: 'MapboxMap' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.749] 
[18:12:16.749] ./lib/store/useSimulationStore.ts
[18:12:16.755] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.755] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.755] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:12:16.755] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:12:16.755] 
[18:12:16.755] ./lib/store/useSimulationStoreContext.ts
[18:12:16.755] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.755] 
[18:12:16.755] ./lib/validations.ts
[18:12:16.755] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:12:16.755] 
[18:12:16.755] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[18:12:29.340] Failed to compile.
[18:12:29.341] 
[18:12:29.342] ./app/api/shipments/[id]/route.ts:152:9
[18:12:29.342] Type error: Property 'lastKnownBearing' is missing in type '{ id: string; documentId: string; status: "PLANNED" | "BOOKED" | "IN_TRANSIT" | "AT_PICKUP" | "AT_DROPOFF" | "COMPLETED" | "CANCELLED" | "EXCEPTION" | "AWAITING_STATUS" | null; loadNumber: string | null; ... 15 more ...; lastKnownTimestamp: string | null; }' but required in type 'ApiShipmentCoreInfo'.
[18:12:29.342] 
[18:12:29.342] [0m [90m 150 |[39m[0m
[18:12:29.342] [0m [90m 151 |[39m     [36mconst[39m apiShipmentDetail[33m:[39m [33mApiShipmentDetail[39m [33m=[39m {[0m
[18:12:29.342] [0m[31m[1m>[22m[39m[90m 152 |[39m         coreInfo[33m:[39m {[0m
[18:12:29.342] [0m [90m     |[39m         [31m[1m^[22m[39m[0m
[18:12:29.343] [0m [90m 153 |[39m             id[33m:[39m coreShipment[33m.[39mid[33m,[39m[0m
[18:12:29.343] [0m [90m 154 |[39m             documentId[33m:[39m coreShipment[33m.[39msourceDocumentId [33m?[39m[33m?[39m [32m''[39m[33m,[39m [90m// Use empty string if null to satisfy string type[39m[0m
[18:12:29.343] [0m [90m 155 |[39m             status[33m:[39m coreShipment[33m.[39mstatus[33m,[39m[0m
[18:12:29.387] Next.js build worker exited with code: 1 and signal: null
[18:12:29.408] Error: Command "npm run build" exited with 1
[18:12:30.039] 