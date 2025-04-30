[11:10:48.438] Running build in Washington, D.C., USA (East) – iad1
[11:10:48.454] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 3173136)
[11:10:48.992] Warning: Failed to fetch one or more git submodules
[11:10:48.992] Cloning completed: 538.000ms
[11:10:55.303] Restored build cache from previous deployment (5QXqUqQLFUpNnZ44hiYwa9aC2nNz)
[11:10:56.198] Running "vercel build"
[11:10:56.577] Vercel CLI 41.6.2
[11:10:56.940] Running "install" command: `npm install`...
[11:11:04.222] 
[11:11:04.223] added 66 packages, and audited 1475 packages in 7s
[11:11:04.223] 
[11:11:04.224] 343 packages are looking for funding
[11:11:04.224]   run `npm fund` for details
[11:11:04.244] 
[11:11:04.245] 5 vulnerabilities (4 moderate, 1 high)
[11:11:04.245] 
[11:11:04.245] To address all issues possible (including breaking changes), run:
[11:11:04.245]   npm audit fix --force
[11:11:04.246] 
[11:11:04.246] Some issues need review, and may require choosing
[11:11:04.246] a different dependency.
[11:11:04.246] 
[11:11:04.248] Run `npm audit` for details.
[11:11:04.287] Detected Next.js version: 14.2.28
[11:11:04.288] Running "npm run build"
[11:11:04.409] 
[11:11:04.410] > loadup-admin-dashboard@0.1.0 prebuild
[11:11:04.410] > echo 'Starting build process'
[11:11:04.410] 
[11:11:04.415] Starting build process
[11:11:04.416] 
[11:11:04.417] > loadup-admin-dashboard@0.1.0 build
[11:11:04.417] > next build
[11:11:04.417] 
[11:11:05.187]   ▲ Next.js 14.2.28
[11:11:05.188] 
[11:11:05.219]    Creating an optimized production build ...
[11:11:19.809]  ⚠ Compiled with warnings
[11:11:19.812] 
[11:11:19.812] ./node_modules/keyv/src/index.js
[11:11:19.812] Critical dependency: the request of a dependency is an expression
[11:11:19.813] 
[11:11:19.813] Import trace for requested module:
[11:11:19.813] ./node_modules/keyv/src/index.js
[11:11:19.814] ./node_modules/cacheable-request/src/index.js
[11:11:19.814] ./node_modules/got/dist/source/core/index.js
[11:11:19.814] ./node_modules/got/dist/source/create.js
[11:11:19.814] ./node_modules/got/dist/source/index.js
[11:11:19.814] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[11:11:19.815] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[11:11:19.815] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[11:11:19.815] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[11:11:19.815] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[11:11:19.815] ./app/api/directions/route.ts
[11:11:19.816] 
[11:11:31.580]  ✓ Compiled successfully
[11:11:31.581]    Linting and checking validity of types ...
[11:11:44.071] 
[11:11:44.072] ./app/api/ai/document-processing/route.ts
[11:11:44.072] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.072] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.072] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.072] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.072] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.072] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.073] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.073] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.073] 42:3  Warning: Unexpected console statement.  no-console
[11:11:44.073] 63:5  Warning: Unexpected console statement.  no-console
[11:11:44.073] 67:7  Warning: Unexpected console statement.  no-console
[11:11:44.073] 250:5  Warning: Unexpected console statement.  no-console
[11:11:44.073] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.073] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.073] 349:7  Warning: Unexpected console statement.  no-console
[11:11:44.073] 357:7  Warning: Unexpected console statement.  no-console
[11:11:44.073] 
[11:11:44.074] ./app/api/ai/field-mapping/route.ts
[11:11:44.074] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.074] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.074] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.074] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.074] 
[11:11:44.074] ./app/api/ai/image-extraction/route.ts
[11:11:44.074] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.076] 
[11:11:44.076] ./app/api/ai/test-connection/route.ts
[11:11:44.077] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.077] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.077] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.078] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.078] 
[11:11:44.078] ./app/api/auth/[...nextauth]/options.ts
[11:11:44.078] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.078] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.078] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.080] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.080] 103:11  Warning: Unexpected console statement.  no-console
[11:11:44.080] 113:12  Warning: Unexpected console statement.  no-console
[11:11:44.080] 117:9  Warning: Unexpected console statement.  no-console
[11:11:44.080] 148:9  Warning: Unexpected console statement.  no-console
[11:11:44.081] 
[11:11:44.081] ./app/api/auth/login/route.ts
[11:11:44.081] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.081] 34:5  Warning: Unexpected console statement.  no-console
[11:11:44.081] 59:5  Warning: Unexpected console statement.  no-console
[11:11:44.081] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.081] 90:5  Warning: Unexpected console statement.  no-console
[11:11:44.082] 
[11:11:44.082] ./app/api/auth/logout/route.ts
[11:11:44.082] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.082] 6:5  Warning: Unexpected console statement.  no-console
[11:11:44.086] 12:5  Warning: Unexpected console statement.  no-console
[11:11:44.086] 
[11:11:44.087] ./app/api/auth/route.ts
[11:11:44.088] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.089] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.089] 
[11:11:44.089] ./app/api/auth/signout/route.ts
[11:11:44.089] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.089] 
[11:11:44.089] ./app/api/auth/user/route.ts
[11:11:44.089] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.089] 7:5  Warning: Unexpected console statement.  no-console
[11:11:44.089] 14:7  Warning: Unexpected console statement.  no-console
[11:11:44.089] 23:7  Warning: Unexpected console statement.  no-console
[11:11:44.089] 
[11:11:44.089] ./app/api/directions/route.ts
[11:11:44.089] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.089] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.089] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 
[11:11:44.090] ./app/api/documents/[id]/route.ts
[11:11:44.090] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 
[11:11:44.090] ./app/api/documents/route.ts
[11:11:44.090] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 
[11:11:44.090] ./app/api/documents/upload/route.ts
[11:11:44.090] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 
[11:11:44.090] ./app/api/etl/process-shipment-slips/route.ts
[11:11:44.090] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.090] 
[11:11:44.090] ./app/api/shipments/[id]/route.ts
[11:11:44.090] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.090] 
[11:11:44.090] ./app/api/shipments/route.ts
[11:11:44.090] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.090] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.091] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.093] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.093] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.093] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.094] 394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.094] 
[11:11:44.094] ./app/api/simulation/enqueue-ticks/route.ts
[11:11:44.094] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.094] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.094] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.095] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.095] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.095] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.095] 
[11:11:44.100] ./app/api/simulation/route.ts
[11:11:44.100] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.100] 
[11:11:44.100] ./app/api/simulation/shipments/[documentId]/route.ts
[11:11:44.100] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.100] 
[11:11:44.100] ./app/api/simulation/tick-worker/route.ts
[11:11:44.100] 135:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.100] 
[11:11:44.100] ./app/api/users/route.ts
[11:11:44.100] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.100] 
[11:11:44.107] ./app/auth/_components/AuthForm.tsx
[11:11:44.108] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.108] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.108] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.108] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.108] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.108] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.108] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.108] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.108] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.108] 66:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 71:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 77:11  Warning: Unexpected console statement.  no-console
[11:11:44.108] 81:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 83:11  Warning: Unexpected console statement.  no-console
[11:11:44.108] 85:13  Warning: Unexpected console statement.  no-console
[11:11:44.108] 91:13  Warning: Unexpected console statement.  no-console
[11:11:44.108] 94:13  Warning: Unexpected console statement.  no-console
[11:11:44.108] 98:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 110:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 115:9  Warning: Unexpected console statement.  no-console
[11:11:44.108] 
[11:11:44.108] ./app/auth/sign-in/page.tsx
[11:11:44.108] 13:5  Warning: Unexpected console statement.  no-console
[11:11:44.108] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.108] 24:5  Warning: Unexpected console statement.  no-console
[11:11:44.108] 
[11:11:44.108] ./app/auth/sign-up/page.tsx
[11:11:44.108] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.108] 
[11:11:44.109] ./app/dashboard/customer/success/page.tsx
[11:11:44.109] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.109] 
[11:11:44.109] ./app/dashboard/driver/success/page.tsx
[11:11:44.109] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.109] 
[11:11:44.109] ./app/dashboard/map/page.tsx
[11:11:44.109] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.109] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.109] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.109] 
[11:11:44.110] ./app/dashboard/shipments/create/page.tsx
[11:11:44.110] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 
[11:11:44.110] ./app/dashboard/shipments/page.tsx
[11:11:44.110] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.110] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.111] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.111] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.111] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.111] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.111] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.112] 
[11:11:44.112] ./app/debug/page.tsx
[11:11:44.112] 22:5  Warning: Unexpected console statement.  no-console
[11:11:44.112] 
[11:11:44.112] ./app/documents/page.tsx
[11:11:44.112] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.112] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.112] 9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 82:5  Warning: Unexpected console statement.  no-console
[11:11:44.113] 90:7  Warning: Unexpected console statement.  no-console
[11:11:44.113] 109:5  Warning: Unexpected console statement.  no-console
[11:11:44.113] 116:7  Warning: Unexpected console statement.  no-console
[11:11:44.113] 124:5  Warning: Unexpected console statement.  no-console
[11:11:44.113] 138:5  Warning: Unexpected console statement.  no-console
[11:11:44.113] 
[11:11:44.113] ./app/documents/scan/page.tsx
[11:11:44.113] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.113] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.114] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.114] 77:5  Warning: Unexpected console statement.  no-console
[11:11:44.114] 88:5  Warning: Unexpected console statement.  no-console
[11:11:44.114] 
[11:11:44.114] ./app/documents/view/[id]/page.tsx
[11:11:44.114] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.114] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 
[11:11:44.115] ./app/page.tsx
[11:11:44.115] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 
[11:11:44.115] ./app/shipments/[documentid]/page.tsx
[11:11:44.115] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.115] 23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.115] 27:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.115] 270:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.116] 409:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 410:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 
[11:11:44.116] ./app/simulation/[documentId]/page.tsx
[11:11:44.116] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.116] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.117] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.117] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.117] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.117] 
[11:11:44.117] ./app/simulation/page.tsx
[11:11:44.118] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.118] 
[11:11:44.118] ./app/tracking/[shipmentId]/_components/TrackingPageView.tsx
[11:11:44.118] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 14:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 35:10  Warning: 'staticDetails' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.118] 108:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.118] 147:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.118] 
[11:11:44.119] ./app/tracking/test-combined/_page.tsx
[11:11:44.119] 81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.119] 83:3  Warning: Unexpected console statement.  no-console
[11:11:44.119] 100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.119] 104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.119] 106:3  Warning: Unexpected console statement.  no-console
[11:11:44.119] 132:3  Warning: Unexpected console statement.  no-console
[11:11:44.119] 137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.119] 140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.120] 145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.120] 146:5  Warning: Unexpected console statement.  no-console
[11:11:44.120] 
[11:11:44.120] ./app/tracking/test-new-map/_page.tsx
[11:11:44.120] 9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.120] 69:3  Warning: Unexpected console statement.  no-console
[11:11:44.120] 92:3  Warning: Unexpected console statement.  no-console
[11:11:44.120] 99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.120] 
[11:11:44.121] ./app/tracking/test-vehicle-list/_page.tsx
[11:11:44.121] 69:3  Warning: Unexpected console statement.  no-console
[11:11:44.121] 73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.121] 77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.121] 82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.121] 83:5  Warning: Unexpected console statement.  no-console
[11:11:44.121] 
[11:11:44.121] ./app/tracking-stabilized/page.tsx
[11:11:44.121] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.121] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.122] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.122] 3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.122] 4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.123] 9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.123] 202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.123] 
[11:11:44.123] ./components/AuthForm.tsx
[11:11:44.123] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.123] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.123] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.124] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.124] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.124] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.124] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.124] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.124] 68:9  Warning: Unexpected console statement.  no-console
[11:11:44.124] 76:9  Warning: Unexpected console statement.  no-console
[11:11:44.124] 87:11  Warning: Unexpected console statement.  no-console
[11:11:44.124] 94:9  Warning: Unexpected console statement.  no-console
[11:11:44.125] 96:11  Warning: Unexpected console statement.  no-console
[11:11:44.125] 99:13  Warning: Unexpected console statement.  no-console
[11:11:44.126] 107:13  Warning: Unexpected console statement.  no-console
[11:11:44.126] 111:13  Warning: Unexpected console statement.  no-console
[11:11:44.126] 116:9  Warning: Unexpected console statement.  no-console
[11:11:44.126] 
[11:11:44.126] ./components/document-page.tsx
[11:11:44.126] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.126] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.126] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.126] 75:5  Warning: Unexpected console statement.  no-console
[11:11:44.126] 85:7  Warning: Unexpected console statement.  no-console
[11:11:44.129] 110:5  Warning: Unexpected console statement.  no-console
[11:11:44.129] 124:9  Warning: Unexpected console statement.  no-console
[11:11:44.129] 135:5  Warning: Unexpected console statement.  no-console
[11:11:44.129] 151:5  Warning: Unexpected console statement.  no-console
[11:11:44.129] 
[11:11:44.129] ./components/drivers/DriverManagement.tsx
[11:11:44.129] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.130] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.130] 
[11:11:44.130] ./components/logistics/DocumentScanner.tsx
[11:11:44.130] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.130] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.130] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.130] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.130] 
[11:11:44.130] ./components/logistics/LogisticsDocumentUploader.tsx
[11:11:44.130] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.130] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.131] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.131] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.131] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.131] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.131] 87:7  Warning: Unexpected console statement.  no-console
[11:11:44.131] 93:7  Warning: Unexpected console statement.  no-console
[11:11:44.133] 109:7  Warning: Unexpected console statement.  no-console
[11:11:44.133] 
[11:11:44.133] ./components/logistics/ShipmentDataDisplay.tsx
[11:11:44.133] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.133] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.133] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.133] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.133] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.134] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.136] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.136] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.137] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.137] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.137] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 
[11:11:44.138] ./components/logistics/shipments/ShipmentCardView.tsx
[11:11:44.138] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.138] 40:39  Warning: Unexpected console statement.  no-console
[11:11:44.138] 
[11:11:44.138] ./components/logistics/shipments/ShipmentDetailsView.tsx
[11:11:44.138] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.138] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.139] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.140] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.143] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.144] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 58:5  Warning: Unexpected console statement.  no-console
[11:11:44.145] 62:5  Warning: Unexpected console statement.  no-console
[11:11:44.145] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.145] 
[11:11:44.145] ./components/logistics/shipments/ShipmentField.tsx
[11:11:44.145] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 
[11:11:44.145] ./components/logistics/shipments/ShipmentItemsTable.tsx
[11:11:44.145] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.145] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 
[11:11:44.146] ./components/logistics/shipments/ShipmentTableView.tsx
[11:11:44.146] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.146] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.147] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.147] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.147] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.147] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.148] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.150] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.150] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.151] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.151] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.151] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.151] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.151] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.151] 
[11:11:44.151] ./components/main-layout.tsx
[11:11:44.151] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.151] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.152] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.152] 110:21  Warning: Unexpected console statement.  no-console
[11:11:44.152] 117:21  Warning: Unexpected console statement.  no-console
[11:11:44.152] 124:21  Warning: Unexpected console statement.  no-console
[11:11:44.152] 
[11:11:44.152] ./components/map/BasicMapComponent.tsx
[11:11:44.152] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.152] 
[11:11:44.152] ./components/map/DriverInterface.tsx
[11:11:44.152] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.153] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.153] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.153] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.154] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[11:11:44.154] 
[11:11:44.154] ./components/map/FleetOverviewMap.tsx
[11:11:44.154] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.154] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.154] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.154] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.154] 
[11:11:44.154] ./components/map/ShipmentSnapshotMapView.tsx
[11:11:44.155] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.155] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.155] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.155] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.155] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.155] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.155] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.155] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.155] 
[11:11:44.155] ./components/map/SimulationMap.tsx
[11:11:44.156] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.156] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.156] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.156] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.157] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.157] 
[11:11:44.157] ./components/map/StaticRouteMap.tsx
[11:11:44.157] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.157] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.157] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.157] 68:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.157] 
[11:11:44.158] ./components/map/TrackingControls.tsx
[11:11:44.158] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.158] 
[11:11:44.158] ./components/map/TrackingMap.tsx
[11:11:44.158] 11:3  Warning: 'Marker' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.158] 18:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.158] 21:10  Warning: 'Home' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.158] 21:16  Warning: 'Flag' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.158] 23:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.159] 82:10  Warning: 'isStale' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.159] 164:7  Warning: React Hook useImperativeHandle has an unnecessary dependency: 'setFollowingVehicle'. Either exclude it or remove the dependency array.  react-hooks/exhaustive-deps
[11:11:44.159] 237:11  Warning: 'svgString' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.159] 
[11:11:44.159] ./components/sentry-provider.tsx
[11:11:44.159] 29:11  Warning: Unexpected console statement.  no-console
[11:11:44.159] 
[11:11:44.159] ./components/shared/Avatar.tsx
[11:11:44.159] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[11:11:44.160] 
[11:11:44.160] ./components/shipment-detail-page.tsx
[11:11:44.160] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.160] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.160] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.160] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.160] 131:5  Warning: Unexpected console statement.  no-console
[11:11:44.161] 137:6  Warning: Unexpected console statement.  no-console
[11:11:44.161] 
[11:11:44.161] ./components/shipments/ShipmentCard.tsx
[11:11:44.162] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.162] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.163] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.163] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.163] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.163] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.164] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 
[11:11:44.165] ./components/shipments/ShipmentHistory.tsx
[11:11:44.165] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.165] 
[11:11:44.166] ./components/shipments/ShipmentStatusTimeline.tsx
[11:11:44.166] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.166] 
[11:11:44.166] ./components/shipments/ShipmentsTable.tsx
[11:11:44.166] 129:5  Warning: Unexpected console statement.  no-console
[11:11:44.166] 
[11:11:44.166] ./components/simulation/ScenarioSelector.tsx
[11:11:44.166] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.166] 
[11:11:44.166] ./components/simulation/SimulationControls.tsx
[11:11:44.166] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.166] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.167] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.167] 
[11:11:44.167] ./components/ui/custom-select.tsx
[11:11:44.167] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.167] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.167] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.167] 
[11:11:44.168] ./components/ui/dialog.tsx
[11:11:44.168] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.168] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.169] 
[11:11:44.169] ./components/ui/dropdown.tsx
[11:11:44.169] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.169] 
[11:11:44.169] ./components/ui/enhanced-file-upload.tsx
[11:11:44.169] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.169] 
[11:11:44.169] ./components/users/UserManagement.tsx
[11:11:44.169] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.170] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.170] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.170] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.170] 
[11:11:44.170] ./lib/actions/auth.ts
[11:11:44.170] 20:5  Warning: Unexpected console statement.  no-console
[11:11:44.170] 27:5  Warning: Unexpected console statement.  no-console
[11:11:44.170] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.170] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.170] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.171] 61:5  Warning: Unexpected console statement.  no-console
[11:11:44.171] 
[11:11:44.171] ./lib/actions/shipmentActions.ts
[11:11:44.171] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.171] 
[11:11:44.171] ./lib/actions/shipmentUpdateActions.ts
[11:11:44.171] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.171] 
[11:11:44.171] ./lib/actions/simulationActions.ts
[11:11:44.171] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.171] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.172] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.181] 506:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.181] 
[11:11:44.181] ./lib/actions/trackingActions.ts
[11:11:44.181] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.181] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.181] 34:34  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.181] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.182] 35:15  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.182] 392:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 510:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 
[11:11:44.182] ./lib/api.ts
[11:11:44.182] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.182] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.183] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[11:11:44.183] 
[11:11:44.183] ./lib/auth-client.ts
[11:11:44.183] 16:5  Warning: Unexpected console statement.  no-console
[11:11:44.183] 20:5  Warning: Unexpected console statement.  no-console
[11:11:44.183] 34:5  Warning: Unexpected console statement.  no-console
[11:11:44.183] 43:5  Warning: Unexpected console statement.  no-console
[11:11:44.183] 47:7  Warning: Unexpected console statement.  no-console
[11:11:44.184] 67:5  Warning: Unexpected console statement.  no-console
[11:11:44.184] 83:5  Warning: Unexpected console statement.  no-console
[11:11:44.184] 92:5  Warning: Unexpected console statement.  no-console
[11:11:44.184] 96:7  Warning: Unexpected console statement.  no-console
[11:11:44.184] 
[11:11:44.184] ./lib/auth.ts
[11:11:44.184] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.184] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.184] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.184] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.184] 49:9  Warning: Unexpected console statement.  no-console
[11:11:44.185] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.185] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.185] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.185] 54:9  Warning: Unexpected console statement.  no-console
[11:11:44.188] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.188] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.188] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.188] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.189] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.189] 
[11:11:44.189] ./lib/context/SimulationStoreContext.tsx
[11:11:44.189] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.189] 
[11:11:44.189] ./lib/database/schema.ts
[11:11:44.189] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.189] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.189] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.189] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[11:11:44.190] 
[11:11:44.190] ./lib/document-processing.ts
[11:11:44.190] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.190] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.198] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.199] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.200] 
[11:11:44.200] ./lib/excel-helper.ts
[11:11:44.200] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.200] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.201] 
[11:11:44.201] ./lib/firebase/clientApp.ts
[11:11:44.201] 31:1  Warning: Unexpected console statement.  no-console
[11:11:44.201] 
[11:11:44.201] ./lib/simple-auth.ts
[11:11:44.201] 16:5  Warning: Unexpected console statement.  no-console
[11:11:44.201] 19:5  Warning: Unexpected console statement.  no-console
[11:11:44.202] 30:5  Warning: Unexpected console statement.  no-console
[11:11:44.202] 34:7  Warning: Unexpected console statement.  no-console
[11:11:44.202] 44:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 67:3  Warning: Unexpected console statement.  no-console
[11:11:44.203] 71:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 83:9  Warning: Unexpected console statement.  no-console
[11:11:44.203] 91:9  Warning: Unexpected console statement.  no-console
[11:11:44.203] 111:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 122:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 131:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 149:5  Warning: Unexpected console statement.  no-console
[11:11:44.203] 160:5  Warning: Unexpected console statement.  no-console
[11:11:44.204] 164:9  Warning: Unexpected console statement.  no-console
[11:11:44.204] 174:5  Warning: Unexpected console statement.  no-console
[11:11:44.204] 
[11:11:44.204] ./lib/store/SimulationStoreContext.tsx
[11:11:44.204] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.204] 
[11:11:44.204] ./lib/store/documentStore.ts
[11:11:44.204] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.204] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.205] 
[11:11:44.205] ./lib/store/useLiveTrackingStore.ts
[11:11:44.205] 81:5  Warning: Unexpected console statement.  no-console
[11:11:44.205] 103:7  Warning: Unexpected console statement.  no-console
[11:11:44.205] 114:5  Warning: Unexpected console statement.  no-console
[11:11:44.205] 119:9  Warning: Unexpected console statement.  no-console
[11:11:44.213] 127:5  Warning: Unexpected console statement.  no-console
[11:11:44.213] 144:9  Warning: Unexpected console statement.  no-console
[11:11:44.213] 180:5  Warning: Unexpected console statement.  no-console
[11:11:44.213] 190:5  Warning: Unexpected console statement.  no-console
[11:11:44.213] 203:1  Warning: Unexpected console statement.  no-console
[11:11:44.213] 
[11:11:44.213] ./lib/store/useSimulationStore.ts
[11:11:44.213] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.214] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.214] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[11:11:44.214] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[11:11:44.214] 
[11:11:44.214] ./lib/store/useSimulationStoreContext.ts
[11:11:44.214] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.215] 
[11:11:44.215] ./lib/validations.ts
[11:11:44.215] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[11:11:44.215] 
[11:11:44.215] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[11:11:57.454] Failed to compile.
[11:11:57.454] 
[11:11:57.456] ./app/simulation/page.tsx:22:96
[11:11:57.456] Type error: Property 'error' does not exist on type 'SimulationStoreApi'.
[11:11:57.456] 
[11:11:57.456] [0m [90m 20 |[39m   [90m// --- Access store state via context hook selectors ---[39m[0m
[11:11:57.456] [0m [90m 21 |[39m   [36mconst[39m isSimulationRunning [33m=[39m useSimulationStoreContext((state[33m:[39m [33mSimulationStoreApi[39m) [33m=>[39m state[33m.[39misSimulationRunning)[33m;[39m[0m
[11:11:57.456] [0m[31m[1m>[22m[39m[90m 22 |[39m   [36mconst[39m globalSimulationError [33m=[39m useSimulationStoreContext((state[33m:[39m [33mSimulationStoreApi[39m) [33m=>[39m state[33m.[39merror)[33m;[39m[0m
[11:11:57.456] [0m [90m    |[39m                                                                                                [31m[1m^[22m[39m[0m
[11:11:57.456] [0m [90m 23 |[39m   [36mconst[39m loadSimulationFromInput [33m=[39m useSimulationStoreContext((state[33m:[39m [33mSimulationStoreApi[39m) [33m=>[39m state[33m.[39mloadSimulationFromInput)[33m;[39m[0m
[11:11:57.457] [0m [90m 24 |[39m[0m
[11:11:57.457] [0m [90m 25 |[39m   [36mconst[39m handleLoadScenario [33m=[39m [36masync[39m (scenarioId[33m:[39m string) [33m=>[39m {[0m
[11:11:57.496] Next.js build worker exited with code: 1 and signal: null
[11:11:57.519] Error: Command "npm run build" exited with 1
[11:11:58.206] 