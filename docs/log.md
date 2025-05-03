[20:47:50.270] Running build in Washington, D.C., USA (East) – iad1
[20:47:50.320] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 7ff259c)
[20:47:51.478] Warning: Failed to fetch one or more git submodules
[20:47:51.479] Cloning completed: 1.144s
[20:47:56.624] Restored build cache from previous deployment (Hcnzt6qc1W49GsSMy3iB1A2aivLf)
[20:47:57.624] Running "vercel build"
[20:47:58.020] Vercel CLI 41.7.0
[20:47:58.367] Running "install" command: `npm install`...
[20:48:02.345] 
[20:48:02.346] added 1 package, removed 7 packages, changed 3 packages, and audited 1469 packages in 3s
[20:48:02.346] 
[20:48:02.346] 341 packages are looking for funding
[20:48:02.347]   run `npm fund` for details
[20:48:02.376] 
[20:48:02.378] 6 vulnerabilities (5 moderate, 1 high)
[20:48:02.379] 
[20:48:02.380] To address issues that do not require attention, run:
[20:48:02.381]   npm audit fix
[20:48:02.381] 
[20:48:02.381] To address all issues possible (including breaking changes), run:
[20:48:02.381]   npm audit fix --force
[20:48:02.382] 
[20:48:02.382] Some issues need review, and may require choosing
[20:48:02.382] a different dependency.
[20:48:02.382] 
[20:48:02.382] Run `npm audit` for details.
[20:48:02.417] Detected Next.js version: 14.2.28
[20:48:02.418] Running "npm run build"
[20:48:02.538] 
[20:48:02.538] > loadup-admin-dashboard@0.1.0 prebuild
[20:48:02.539] > echo 'Starting build process'
[20:48:02.539] 
[20:48:02.544] Starting build process
[20:48:02.545] 
[20:48:02.545] > loadup-admin-dashboard@0.1.0 build
[20:48:02.545] > next build
[20:48:02.545] 
[20:48:03.275]   ▲ Next.js 14.2.28
[20:48:03.276] 
[20:48:03.306]    Creating an optimized production build ...
[20:48:19.877]  ⚠ Compiled with warnings
[20:48:19.878] 
[20:48:19.878] ./node_modules/keyv/src/index.js
[20:48:19.879] Critical dependency: the request of a dependency is an expression
[20:48:19.879] 
[20:48:19.879] Import trace for requested module:
[20:48:19.879] ./node_modules/keyv/src/index.js
[20:48:19.883] ./node_modules/cacheable-request/src/index.js
[20:48:19.883] ./node_modules/got/dist/source/core/index.js
[20:48:19.883] ./node_modules/got/dist/source/create.js
[20:48:19.883] ./node_modules/got/dist/source/index.js
[20:48:19.884] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[20:48:19.884] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[20:48:19.884] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[20:48:19.884] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[20:48:19.884] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[20:48:19.884] ./app/api/directions/route.ts
[20:48:19.884] 
[20:48:35.671]  ✓ Compiled successfully
[20:48:35.672]    Linting and checking validity of types ...
[20:48:48.092] 
[20:48:48.093] ./app/api/ai/document-processing/route.ts
[20:48:48.093] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.093] 42:3  Warning: Unexpected console statement.  no-console
[20:48:48.094] 63:5  Warning: Unexpected console statement.  no-console
[20:48:48.094] 67:7  Warning: Unexpected console statement.  no-console
[20:48:48.094] 250:5  Warning: Unexpected console statement.  no-console
[20:48:48.094] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.094] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.094] 349:7  Warning: Unexpected console statement.  no-console
[20:48:48.094] 357:7  Warning: Unexpected console statement.  no-console
[20:48:48.094] 
[20:48:48.094] ./app/api/ai/field-mapping/route.ts
[20:48:48.094] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.094] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.094] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.094] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.094] 
[20:48:48.094] ./app/api/ai/image-extraction/route.ts
[20:48:48.098] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.098] 
[20:48:48.099] ./app/api/ai/test-connection/route.ts
[20:48:48.099] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.099] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.102] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.102] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.102] 
[20:48:48.102] ./app/api/auth/[...nextauth]/options.ts
[20:48:48.102] 6:8  Warning: 'bcrypt' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.107] 7:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 58:7  Warning: 'mockUserData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 
[20:48:48.108] ./app/api/auth/route.ts
[20:48:48.108] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.108] 9:3  Warning: Unexpected console statement.  no-console
[20:48:48.108] 
[20:48:48.108] ./app/api/auth/user/route.ts
[20:48:48.108] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.108] 7:5  Warning: Unexpected console statement.  no-console
[20:48:48.108] 14:7  Warning: Unexpected console statement.  no-console
[20:48:48.108] 23:7  Warning: Unexpected console statement.  no-console
[20:48:48.108] 
[20:48:48.108] ./app/api/directions/route.ts
[20:48:48.108] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 
[20:48:48.108] ./app/api/documents/[id]/route.ts
[20:48:48.108] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 
[20:48:48.108] ./app/api/documents/alt-upload/route.ts
[20:48:48.108] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 107:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 149:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 163:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.108] 
[20:48:48.108] ./app/api/documents/route.ts
[20:48:48.108] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 9:5  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:10  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:16  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:20  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:29  Warning: 'like' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.108] 17:35  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.109] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.109] 17:45  Warning: 'inArray' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.109] 21:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.109] 23:10  Warning: 'insertShipmentBundle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 29:10  Warning: 'neon' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 29:16  Warning: 'NeonQueryFunction' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 42:6  Warning: 'SelectedDocument' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 53:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 64:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 76:10  Warning: 'mapDbShipmentStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 109:10  Warning: 'calculateAggregateStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 180:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.111] 402:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 427:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 433:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 536:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 
[20:48:48.111] ./app/api/documents/upload/route.ts
[20:48:48.111] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 
[20:48:48.111] ./app/api/etl/process-shipment-slips/route.ts
[20:48:48.111] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.111] 
[20:48:48.111] ./app/api/shipments/[id]/route.ts
[20:48:48.111] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.111] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.111] 
[20:48:48.111] ./app/api/shipments/route.ts
[20:48:48.112] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.112] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 395:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 
[20:48:48.112] ./app/api/simulation/enqueue-ticks/route.ts
[20:48:48.112] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.112] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.113] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.113] 
[20:48:48.113] ./app/api/simulation/route.ts
[20:48:48.113] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.113] 
[20:48:48.113] ./app/api/simulation/shipments/[documentId]/route.ts
[20:48:48.113] 328:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.113] 
[20:48:48.113] ./app/api/simulation/tick-worker/route.ts
[20:48:48.113] 136:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 
[20:48:48.113] ./app/api/users/route.ts
[20:48:48.113] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 
[20:48:48.113] ./app/auth/forgot-password/page.tsx
[20:48:48.113] 5:10  Warning: 'forgotPasswordSchema' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 
[20:48:48.113] ./app/dashboard/map/page.tsx
[20:48:48.113] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.113] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.113] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 
[20:48:48.113] ./app/dashboard/shipments/create/page.tsx
[20:48:48.113] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.113] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 
[20:48:48.114] ./app/dashboard/shipments/page.tsx
[20:48:48.114] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 17:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 18:3  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.114] 20:3  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.116] 21:3  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.116] 22:3  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.116] 23:3  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.116] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.116] 35:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 37:10  Warning: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 38:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 45:7  Warning: 'statusColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 57:7  Warning: 'priorityColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 197:9  Warning: 'handleViewShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.117] 213:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.117] 
[20:48:48.117] ./app/debug/page.tsx
[20:48:48.117] 22:5  Warning: Unexpected console statement.  no-console
[20:48:48.117] 
[20:48:48.117] ./app/documents/page.tsx
[20:48:48.117] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.118] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.118] 82:5  Warning: Unexpected console statement.  no-console
[20:48:48.118] 90:7  Warning: Unexpected console statement.  no-console
[20:48:48.118] 109:5  Warning: Unexpected console statement.  no-console
[20:48:48.118] 116:7  Warning: Unexpected console statement.  no-console
[20:48:48.118] 124:5  Warning: Unexpected console statement.  no-console
[20:48:48.118] 138:5  Warning: Unexpected console statement.  no-console
[20:48:48.118] 
[20:48:48.118] ./app/documents/scan/page.tsx
[20:48:48.118] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.118] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.118] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.119] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.119] 77:5  Warning: Unexpected console statement.  no-console
[20:48:48.119] 88:5  Warning: Unexpected console statement.  no-console
[20:48:48.119] 
[20:48:48.119] ./app/documents/view/[id]/page.tsx
[20:48:48.119] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.119] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 
[20:48:48.120] ./app/page.tsx
[20:48:48.120] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 
[20:48:48.120] ./app/shipments/[documentid]/page.tsx
[20:48:48.120] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.120] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 24:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.121] 28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.121] 281:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.121] 422:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 423:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 
[20:48:48.121] ./app/simulation/[documentId]/page.tsx
[20:48:48.121] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.121] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.121] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.122] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.122] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.122] 
[20:48:48.122] ./app/simulation/page.tsx
[20:48:48.122] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.122] 
[20:48:48.122] ./app/tracking/[documentId]/_components/TrackingPageView.tsx
[20:48:48.122] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 6:15  Warning: 'StaticTrackingDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.122] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.123] 118:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.123] 127:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.123] 170:90  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.123] 207:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.123] 233:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.123] 
[20:48:48.123] ./app/tracking/[documentId]/page.tsx
[20:48:48.123] 13:48  Warning: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.123] 
[20:48:48.123] ./components/document-page.tsx
[20:48:48.123] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.123] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.123] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.123] 75:5  Warning: Unexpected console statement.  no-console
[20:48:48.124] 85:7  Warning: Unexpected console statement.  no-console
[20:48:48.124] 110:5  Warning: Unexpected console statement.  no-console
[20:48:48.124] 124:9  Warning: Unexpected console statement.  no-console
[20:48:48.124] 135:5  Warning: Unexpected console statement.  no-console
[20:48:48.131] 151:5  Warning: Unexpected console statement.  no-console
[20:48:48.131] 
[20:48:48.131] ./components/drivers/DriverManagement.tsx
[20:48:48.131] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.131] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.131] 
[20:48:48.131] ./components/logistics/DocumentScanner.tsx
[20:48:48.131] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.131] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.131] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.131] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.131] 
[20:48:48.132] ./components/logistics/LogisticsDocumentUploader.tsx
[20:48:48.132] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.132] 95:7  Warning: Unexpected console statement.  no-console
[20:48:48.132] 101:7  Warning: Unexpected console statement.  no-console
[20:48:48.132] 117:7  Warning: Unexpected console statement.  no-console
[20:48:48.132] 
[20:48:48.132] ./components/logistics/ShipmentDataDisplay.tsx
[20:48:48.133] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.133] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.133] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.133] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.133] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.133] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.133] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.134] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.134] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.134] 
[20:48:48.134] ./components/logistics/shipments/ShipmentCardView.tsx
[20:48:48.134] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.134] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.135] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.136] 40:39  Warning: Unexpected console statement.  no-console
[20:48:48.136] 
[20:48:48.136] ./components/logistics/shipments/ShipmentDetailsView.tsx
[20:48:48.136] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.136] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.137] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.138] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 58:5  Warning: Unexpected console statement.  no-console
[20:48:48.139] 62:5  Warning: Unexpected console statement.  no-console
[20:48:48.139] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.139] 
[20:48:48.139] ./components/logistics/shipments/ShipmentField.tsx
[20:48:48.139] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 
[20:48:48.139] ./components/logistics/shipments/ShipmentItemsTable.tsx
[20:48:48.139] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.139] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 
[20:48:48.140] ./components/logistics/shipments/ShipmentTableView.tsx
[20:48:48.140] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.140] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.141] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.142] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.142] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.143] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.143] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.143] 
[20:48:48.143] ./components/main-layout.tsx
[20:48:48.143] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.143] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.144] 110:21  Warning: Unexpected console statement.  no-console
[20:48:48.144] 117:21  Warning: Unexpected console statement.  no-console
[20:48:48.144] 124:21  Warning: Unexpected console statement.  no-console
[20:48:48.144] 
[20:48:48.144] ./components/map/BasicMapComponent.tsx
[20:48:48.144] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.144] 
[20:48:48.144] ./components/map/DriverInterface.tsx
[20:48:48.144] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.144] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.144] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.144] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[20:48:48.145] 
[20:48:48.145] ./components/map/FleetOverviewMap.tsx
[20:48:48.145] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.145] 
[20:48:48.145] ./components/map/ShipmentSnapshotMapView.tsx
[20:48:48.145] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.145] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 
[20:48:48.146] ./components/map/SimulationMap.tsx
[20:48:48.146] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.146] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.146] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.146] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.146] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.147] 
[20:48:48.147] ./components/map/StaticRouteMap.tsx
[20:48:48.147] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 70:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 
[20:48:48.147] ./components/map/TrackingControls.tsx
[20:48:48.147] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 
[20:48:48.147] ./components/map/TrackingMap.tsx
[20:48:48.147] 8:3  Warning: 'ViewStateChangeEvent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 17:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.147] 19:42  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.148] 20:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.148] 25:10  Warning: 'GeoJSONSource' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.148] 26:10  Warning: 'LngLatBounds' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.148] 82:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.149] 89:10  Warning: 'viewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.149] 89:21  Warning: 'setViewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.149] 97:5  Warning: 'trackedShipmentId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.149] 242:6  Warning: React Hook useCallback has missing dependencies: 'addRouteSourceAndLayer' and 'updateOriginDestinationMarkers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:48:48.149] 245:9  Warning: 'addVehicleSourceAndLayer' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.149] 429:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.150] 
[20:48:48.150] ./components/sentry-provider.tsx
[20:48:48.150] 29:11  Warning: Unexpected console statement.  no-console
[20:48:48.150] 
[20:48:48.150] ./components/shared/Avatar.tsx
[20:48:48.150] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[20:48:48.150] 
[20:48:48.150] ./components/shared/FileUploader.tsx
[20:48:48.150] 14:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.150] 108:7  Warning: Unexpected console statement.  no-console
[20:48:48.150] 119:7  Warning: Unexpected console statement.  no-console
[20:48:48.151] 124:9  Warning: Unexpected console statement.  no-console
[20:48:48.151] 
[20:48:48.151] ./components/shipment-detail-page.tsx
[20:48:48.151] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.151] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.151] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.151] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.151] 131:5  Warning: Unexpected console statement.  no-console
[20:48:48.151] 137:6  Warning: Unexpected console statement.  no-console
[20:48:48.151] 
[20:48:48.151] ./components/shipments/ShipmentCard.tsx
[20:48:48.152] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.152] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.153] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.154] 
[20:48:48.154] ./components/shipments/ShipmentHistory.tsx
[20:48:48.154] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.154] 
[20:48:48.154] ./components/shipments/ShipmentStatusTimeline.tsx
[20:48:48.154] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.154] 
[20:48:48.154] ./components/shipments/ShipmentsTable.tsx
[20:48:48.154] 129:5  Warning: Unexpected console statement.  no-console
[20:48:48.154] 
[20:48:48.154] ./components/simulation/ScenarioSelector.tsx
[20:48:48.154] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.154] 
[20:48:48.154] ./components/simulation/SimulationControls.tsx
[20:48:48.154] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.154] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 
[20:48:48.155] ./components/ui/custom-select.tsx
[20:48:48.155] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 
[20:48:48.155] ./components/ui/dialog.tsx
[20:48:48.155] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.155] 
[20:48:48.155] ./components/ui/dropdown.tsx
[20:48:48.155] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 
[20:48:48.155] ./components/ui/enhanced-file-upload.tsx
[20:48:48.155] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.155] 
[20:48:48.155] ./components/users/UserManagement.tsx
[20:48:48.155] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.156] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.156] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.156] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.156] 
[20:48:48.156] ./lib/actions/auth.ts
[20:48:48.156] 20:5  Warning: Unexpected console statement.  no-console
[20:48:48.156] 27:5  Warning: Unexpected console statement.  no-console
[20:48:48.159] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.160] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.160] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.160] 61:5  Warning: Unexpected console statement.  no-console
[20:48:48.160] 
[20:48:48.160] ./lib/actions/shipmentActions.ts
[20:48:48.160] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.160] 
[20:48:48.160] ./lib/actions/shipmentUpdateActions.ts
[20:48:48.160] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.161] 
[20:48:48.161] ./lib/actions/simulationActions.ts
[20:48:48.161] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.161] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.161] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.161] 522:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.161] 
[20:48:48.161] ./lib/actions/trackingActions.ts
[20:48:48.162] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.162] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.162] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.163] 446:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.163] 564:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.163] 
[20:48:48.163] ./lib/api.ts
[20:48:48.163] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.163] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.164] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[20:48:48.165] 
[20:48:48.165] ./lib/auth-client.ts
[20:48:48.165] 16:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 20:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 34:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 43:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 47:7  Warning: Unexpected console statement.  no-console
[20:48:48.165] 67:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 83:5  Warning: Unexpected console statement.  no-console
[20:48:48.165] 92:5  Warning: Unexpected console statement.  no-console
[20:48:48.166] 96:7  Warning: Unexpected console statement.  no-console
[20:48:48.166] 
[20:48:48.166] ./lib/auth.ts
[20:48:48.166] 48:77  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.166] 49:59  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.167] 88:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.167] 110:7  Warning: 'createBypassAuth' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.167] 126:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.167] 128:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.167] 128:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.168] 128:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.168] 128:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.168] 129:9  Warning: Unexpected console statement.  no-console
[20:48:48.168] 133:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.168] 133:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.169] 133:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.169] 134:9  Warning: Unexpected console statement.  no-console
[20:48:48.169] 
[20:48:48.169] ./lib/context/SimulationStoreContext.tsx
[20:48:48.169] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.170] 
[20:48:48.170] ./lib/database/schema.ts
[20:48:48.170] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.170] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.171] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.171] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.171] 590:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:48:48.171] 
[20:48:48.172] ./lib/document-processing.ts
[20:48:48.172] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.173] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.173] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.173] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.173] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.174] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.174] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.174] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.174] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.175] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.175] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.176] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.176] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.177] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.177] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.177] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.177] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.177] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.178] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.178] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.178] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.178] 
[20:48:48.178] ./lib/excel-helper.ts
[20:48:48.179] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.179] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.179] 
[20:48:48.179] ./lib/firebase/clientApp.ts
[20:48:48.179] 31:1  Warning: Unexpected console statement.  no-console
[20:48:48.179] 
[20:48:48.180] ./lib/store/SimulationStoreContext.tsx
[20:48:48.180] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.180] 
[20:48:48.180] ./lib/store/documentStore.ts
[20:48:48.180] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.181] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.181] 
[20:48:48.181] ./lib/store/useLiveTrackingStore.ts
[20:48:48.181] 5:22  Warning: 'MapboxMap' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.181] 
[20:48:48.182] ./lib/store/useSimulationStore.ts
[20:48:48.182] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.182] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.182] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:48:48.182] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:48:48.183] 
[20:48:48.183] ./lib/store/useSimulationStoreContext.ts
[20:48:48.183] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.183] 
[20:48:48.183] ./lib/validations.ts
[20:48:48.183] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:48:48.184] 
[20:48:48.184] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[20:49:00.033] Failed to compile.
[20:49:00.033] 
[20:49:00.034] ./lib/actions/auth.ts:7:27
[20:49:00.034] Type error: Cannot find module '@auth/core/errors' or its corresponding type declarations.
[20:49:00.034] 
[20:49:00.034] [0m [90m  5 |[39m [90m// TODO: Re-enable when Supabase integration is complete[39m[0m
[20:49:00.034] [0m [90m  6 |[39m [90m// import { signUpUser } from "@/lib/supabase";[39m[0m
[20:49:00.034] [0m[31m[1m>[22m[39m[90m  7 |[39m [36mimport[39m { [33mAuthError[39m } [36mfrom[39m [32m'@auth/core/errors'[39m[33m;[39m[0m
[20:49:00.034] [0m [90m    |[39m                           [31m[1m^[22m[39m[0m
[20:49:00.034] [0m [90m  8 |[39m [36mimport[39m { z } [36mfrom[39m [32m"zod"[39m[33m;[39m[0m
[20:49:00.035] [0m [90m  9 |[39m[0m
[20:49:00.036] [0m [90m 10 |[39m [36mexport[39m [36masync[39m [36mfunction[39m signInWithCredentials(formData[33m:[39m z[33m.[39minfer[33m<[39m[36mtypeof[39m signInSchema[33m>[39m) {[0m
[20:49:00.076] Next.js build worker exited with code: 1 and signal: null
[20:49:00.097] Error: Command "npm run build" exited with 1
[20:49:00.699] 
[20:49:04.073] Exiting build container