[20:15:04.515] Running build in Washington, D.C., USA (East) – iad1
[20:15:04.531] Cloning github.com/PhotonEntangled/LoadUp (Branch: test/simulation-env-check, Commit: 594c10c)
[20:15:05.031] Warning: Failed to fetch one or more git submodules
[20:15:05.031] Cloning completed: 500.000ms
[20:15:07.713] Restored build cache from previous deployment (5ivbc8H4GygxxcKtZxdNBFKXC5pW)
[20:15:08.574] Running "vercel build"
[20:15:08.953] Vercel CLI 41.6.2
[20:15:09.328] Running "install" command: `npm install`...
[20:15:12.175] 
[20:15:12.176] up to date, audited 1409 packages in 3s
[20:15:12.176] 
[20:15:12.176] 343 packages are looking for funding
[20:15:12.176]   run `npm fund` for details
[20:15:12.201] 
[20:15:12.201] 5 vulnerabilities (4 moderate, 1 high)
[20:15:12.202] 
[20:15:12.202] To address all issues possible (including breaking changes), run:
[20:15:12.202]   npm audit fix --force
[20:15:12.202] 
[20:15:12.202] Some issues need review, and may require choosing
[20:15:12.203] a different dependency.
[20:15:12.203] 
[20:15:12.203] Run `npm audit` for details.
[20:15:12.232] Detected Next.js version: 14.2.28
[20:15:12.233] Running "npm run build"
[20:15:12.348] 
[20:15:12.349] > loadup-admin-dashboard@0.1.0 prebuild
[20:15:12.349] > echo 'Starting build process'
[20:15:12.349] 
[20:15:12.355] Starting build process
[20:15:12.356] 
[20:15:12.356] > loadup-admin-dashboard@0.1.0 build
[20:15:12.357] > next build
[20:15:12.357] 
[20:15:13.068]   ▲ Next.js 14.2.28
[20:15:13.069] 
[20:15:13.099]    Creating an optimized production build ...
[20:15:30.926]  ⚠ Compiled with warnings
[20:15:30.926] 
[20:15:30.926] ./node_modules/keyv/src/index.js
[20:15:30.927] Critical dependency: the request of a dependency is an expression
[20:15:30.927] 
[20:15:30.927] Import trace for requested module:
[20:15:30.927] ./node_modules/keyv/src/index.js
[20:15:30.927] ./node_modules/cacheable-request/src/index.js
[20:15:30.927] ./node_modules/got/dist/source/core/index.js
[20:15:30.928] ./node_modules/got/dist/source/as-promise/index.js
[20:15:30.928] ./node_modules/got/dist/source/index.js
[20:15:30.928] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[20:15:30.928] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[20:15:30.928] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[20:15:30.928] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[20:15:30.928] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[20:15:30.928] ./app/api/directions/route.ts
[20:15:30.928] 
[20:15:44.864]  ✓ Compiled successfully
[20:15:44.866]    Linting and checking validity of types ...
[20:15:57.529] 
[20:15:57.529] ./app/api/ai/document-processing/route.ts
[20:15:57.530] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.530] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.530] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.531] 42:3  Warning: Unexpected console statement.  no-console
[20:15:57.532] 63:5  Warning: Unexpected console statement.  no-console
[20:15:57.532] 67:7  Warning: Unexpected console statement.  no-console
[20:15:57.532] 250:5  Warning: Unexpected console statement.  no-console
[20:15:57.532] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.532] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.532] 349:7  Warning: Unexpected console statement.  no-console
[20:15:57.532] 357:7  Warning: Unexpected console statement.  no-console
[20:15:57.533] 
[20:15:57.533] ./app/api/ai/field-mapping/route.ts
[20:15:57.533] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.533] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.533] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.534] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.534] 
[20:15:57.534] ./app/api/ai/image-extraction/route.ts
[20:15:57.534] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.534] 
[20:15:57.534] ./app/api/ai/test-connection/route.ts
[20:15:57.535] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.535] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.535] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.535] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.535] 
[20:15:57.535] ./app/api/auth/[...nextauth]/options.ts
[20:15:57.535] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.536] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.536] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.537] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.537] 103:11  Warning: Unexpected console statement.  no-console
[20:15:57.538] 113:12  Warning: Unexpected console statement.  no-console
[20:15:57.538] 117:9  Warning: Unexpected console statement.  no-console
[20:15:57.538] 148:9  Warning: Unexpected console statement.  no-console
[20:15:57.538] 
[20:15:57.538] ./app/api/auth/login/route.ts
[20:15:57.538] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.538] 34:5  Warning: Unexpected console statement.  no-console
[20:15:57.538] 59:5  Warning: Unexpected console statement.  no-console
[20:15:57.539] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.539] 90:5  Warning: Unexpected console statement.  no-console
[20:15:57.539] 
[20:15:57.539] ./app/api/auth/logout/route.ts
[20:15:57.539] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.539] 6:5  Warning: Unexpected console statement.  no-console
[20:15:57.539] 12:5  Warning: Unexpected console statement.  no-console
[20:15:57.539] 
[20:15:57.540] ./app/api/auth/route.ts
[20:15:57.540] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.540] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.540] 
[20:15:57.543] ./app/api/auth/signout/route.ts
[20:15:57.543] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.543] 
[20:15:57.543] ./app/api/auth/user/route.ts
[20:15:57.543] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.544] 7:5  Warning: Unexpected console statement.  no-console
[20:15:57.544] 14:7  Warning: Unexpected console statement.  no-console
[20:15:57.544] 23:7  Warning: Unexpected console statement.  no-console
[20:15:57.557] 
[20:15:57.557] ./app/api/directions/route.ts
[20:15:57.557] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.557] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.557] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.557] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.558] 
[20:15:57.558] ./app/api/documents/[id]/route.ts
[20:15:57.558] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 
[20:15:57.558] ./app/api/documents/route.ts
[20:15:57.558] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.558] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.559] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.559] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 
[20:15:57.559] ./app/api/documents/upload/route.ts
[20:15:57.559] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.559] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.560] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.560] 
[20:15:57.560] ./app/api/etl/process-shipment-slips/route.ts
[20:15:57.560] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.560] 
[20:15:57.560] ./app/api/shipments/[id]/route.ts
[20:15:57.560] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.560] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.560] 
[20:15:57.560] ./app/api/shipments/route.ts
[20:15:57.560] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.560] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.560] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.560] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.560] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.561] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.562] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.562] 
[20:15:57.565] ./app/api/simulation/enqueue-ticks/route.ts
[20:15:57.566] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.566] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.566] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.566] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.566] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.566] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.567] 
[20:15:57.567] ./app/api/simulation/route.ts
[20:15:57.567] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.567] 
[20:15:57.576] ./app/api/simulation/shipments/[documentId]/route.ts
[20:15:57.576] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.576] 
[20:15:57.577] ./app/api/users/route.ts
[20:15:57.577] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.577] 
[20:15:57.577] ./app/auth/_components/AuthForm.tsx
[20:15:57.577] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.577] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.578] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.578] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.578] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.578] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.578] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.578] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.579] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.579] 66:9  Warning: Unexpected console statement.  no-console
[20:15:57.579] 71:9  Warning: Unexpected console statement.  no-console
[20:15:57.579] 77:11  Warning: Unexpected console statement.  no-console
[20:15:57.579] 81:9  Warning: Unexpected console statement.  no-console
[20:15:57.579] 83:11  Warning: Unexpected console statement.  no-console
[20:15:57.580] 85:13  Warning: Unexpected console statement.  no-console
[20:15:57.580] 91:13  Warning: Unexpected console statement.  no-console
[20:15:57.580] 94:13  Warning: Unexpected console statement.  no-console
[20:15:57.580] 98:9  Warning: Unexpected console statement.  no-console
[20:15:57.580] 110:9  Warning: Unexpected console statement.  no-console
[20:15:57.580] 115:9  Warning: Unexpected console statement.  no-console
[20:15:57.581] 
[20:15:57.581] ./app/auth/sign-in/page.tsx
[20:15:57.581] 13:5  Warning: Unexpected console statement.  no-console
[20:15:57.581] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.581] 24:5  Warning: Unexpected console statement.  no-console
[20:15:57.581] 
[20:15:57.582] ./app/auth/sign-up/page.tsx
[20:15:57.582] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.582] 
[20:15:57.582] ./app/dashboard/customer/success/page.tsx
[20:15:57.582] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.583] 
[20:15:57.583] ./app/dashboard/driver/success/page.tsx
[20:15:57.583] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.583] 
[20:15:57.583] ./app/dashboard/map/page.tsx
[20:15:57.583] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.584] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.585] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.585] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.585] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.585] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.585] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.586] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.586] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.586] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.586] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.586] 
[20:15:57.586] ./app/dashboard/shipments/create/page.tsx
[20:15:57.587] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.587] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.587] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.587] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.587] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.587] 
[20:15:57.588] ./app/dashboard/shipments/page.tsx
[20:15:57.591] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.591] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.591] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.591] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.592] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.593] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.593] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.593] 
[20:15:57.593] ./app/debug/page.tsx
[20:15:57.593] 22:5  Warning: Unexpected console statement.  no-console
[20:15:57.593] 
[20:15:57.594] ./app/documents/page.tsx
[20:15:57.594] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.594] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.594] 9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.594] 10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.595] 11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.595] 12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.595] 13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.595] 82:5  Warning: Unexpected console statement.  no-console
[20:15:57.595] 90:7  Warning: Unexpected console statement.  no-console
[20:15:57.596] 109:5  Warning: Unexpected console statement.  no-console
[20:15:57.596] 116:7  Warning: Unexpected console statement.  no-console
[20:15:57.596] 124:5  Warning: Unexpected console statement.  no-console
[20:15:57.596] 138:5  Warning: Unexpected console statement.  no-console
[20:15:57.596] 
[20:15:57.596] ./app/documents/scan/page.tsx
[20:15:57.597] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.597] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.597] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.597] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.598] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.598] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.599] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.599] 77:5  Warning: Unexpected console statement.  no-console
[20:15:57.599] 88:5  Warning: Unexpected console statement.  no-console
[20:15:57.599] 
[20:15:57.606] ./app/documents/view/[id]/page.tsx
[20:15:57.607] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.607] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.608] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.608] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.609] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.609] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.609] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.609] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.609] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.610] 
[20:15:57.610] ./app/page.tsx
[20:15:57.610] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.610] 
[20:15:57.610] ./app/shipments/[documentid]/page.tsx
[20:15:57.611] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.611] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.611] 23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.611] 27:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.611] 270:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.612] 409:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.612] 410:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.612] 
[20:15:57.612] ./app/simulation/[documentId]/page.tsx
[20:15:57.612] 3:46  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.613] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.613] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.613] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.613] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.614] 105:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.614] 179:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.614] 264:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.614] 326:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.614] 
[20:15:57.615] ./app/simulation/page.tsx
[20:15:57.615] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.615] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.615] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.616] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.616] 
[20:15:57.616] ./app/tracking/test-combined/_page.tsx
[20:15:57.616] 81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.616] 83:3  Warning: Unexpected console statement.  no-console
[20:15:57.617] 100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.617] 104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.617] 106:3  Warning: Unexpected console statement.  no-console
[20:15:57.617] 132:3  Warning: Unexpected console statement.  no-console
[20:15:57.618] 137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.618] 140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.618] 145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.618] 146:5  Warning: Unexpected console statement.  no-console
[20:15:57.618] 
[20:15:57.619] ./app/tracking/test-new-map/_page.tsx
[20:15:57.625] 9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.628] 69:3  Warning: Unexpected console statement.  no-console
[20:15:57.628] 92:3  Warning: Unexpected console statement.  no-console
[20:15:57.628] 99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.629] 
[20:15:57.629] ./app/tracking/test-vehicle-list/_page.tsx
[20:15:57.630] 69:3  Warning: Unexpected console statement.  no-console
[20:15:57.630] 73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.631] 77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.631] 82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.631] 83:5  Warning: Unexpected console statement.  no-console
[20:15:57.631] 
[20:15:57.631] ./app/tracking-stabilized/page.tsx
[20:15:57.632] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.632] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.632] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.634] 3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.634] 4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.634] 9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.634] 202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.635] 
[20:15:57.635] ./components/AuthForm.tsx
[20:15:57.635] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.635] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.636] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.636] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.636] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.637] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.637] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.638] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.638] 68:9  Warning: Unexpected console statement.  no-console
[20:15:57.639] 76:9  Warning: Unexpected console statement.  no-console
[20:15:57.639] 87:11  Warning: Unexpected console statement.  no-console
[20:15:57.639] 94:9  Warning: Unexpected console statement.  no-console
[20:15:57.639] 96:11  Warning: Unexpected console statement.  no-console
[20:15:57.639] 99:13  Warning: Unexpected console statement.  no-console
[20:15:57.640] 107:13  Warning: Unexpected console statement.  no-console
[20:15:57.640] 111:13  Warning: Unexpected console statement.  no-console
[20:15:57.640] 116:9  Warning: Unexpected console statement.  no-console
[20:15:57.640] 
[20:15:57.641] ./components/document-page.tsx
[20:15:57.641] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.641] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.641] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.641] 75:5  Warning: Unexpected console statement.  no-console
[20:15:57.641] 85:7  Warning: Unexpected console statement.  no-console
[20:15:57.642] 110:5  Warning: Unexpected console statement.  no-console
[20:15:57.642] 124:9  Warning: Unexpected console statement.  no-console
[20:15:57.642] 135:5  Warning: Unexpected console statement.  no-console
[20:15:57.642] 151:5  Warning: Unexpected console statement.  no-console
[20:15:57.643] 
[20:15:57.643] ./components/drivers/DriverManagement.tsx
[20:15:57.643] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.643] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.644] 
[20:15:57.644] ./components/logistics/DocumentScanner.tsx
[20:15:57.644] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.644] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.644] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.645] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.645] 
[20:15:57.645] ./components/logistics/LogisticsDocumentUploader.tsx
[20:15:57.645] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.645] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.646] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.646] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.646] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.646] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.646] 87:7  Warning: Unexpected console statement.  no-console
[20:15:57.647] 93:7  Warning: Unexpected console statement.  no-console
[20:15:57.647] 109:7  Warning: Unexpected console statement.  no-console
[20:15:57.647] 
[20:15:57.647] ./components/logistics/ShipmentDataDisplay.tsx
[20:15:57.647] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.648] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.648] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.648] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.648] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.649] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.649] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.649] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.649] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.649] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.650] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.650] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.650] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.651] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.651] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.651] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.652] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.652] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.652] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.652] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.653] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.653] 
[20:15:57.653] ./components/logistics/shipments/ShipmentCardView.tsx
[20:15:57.653] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.653] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.654] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.654] 40:39  Warning: Unexpected console statement.  no-console
[20:15:57.654] 
[20:15:57.654] ./components/logistics/shipments/ShipmentDetailsView.tsx
[20:15:57.654] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.655] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.655] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.655] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.655] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.656] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.656] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.656] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.656] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.656] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.657] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.657] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.657] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.657] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.657] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.658] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.658] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.658] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.658] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.659] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.659] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.659] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.659] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.659] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.660] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.660] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.660] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.660] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.660] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.661] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.661] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.661] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.661] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.661] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.662] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.662] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.662] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.662] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.663] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.663] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.663] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.663] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.663] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.664] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.664] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.664] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.664] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.664] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.665] 58:5  Warning: Unexpected console statement.  no-console
[20:15:57.665] 62:5  Warning: Unexpected console statement.  no-console
[20:15:57.665] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.665] 
[20:15:57.665] ./components/logistics/shipments/ShipmentField.tsx
[20:15:57.666] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.666] 
[20:15:57.666] ./components/logistics/shipments/ShipmentItemsTable.tsx
[20:15:57.666] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.667] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.667] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.667] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.667] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.667] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.668] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.668] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.668] 
[20:15:57.668] ./components/logistics/shipments/ShipmentTableView.tsx
[20:15:57.668] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.669] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.669] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.669] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.669] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.670] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.670] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.670] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.670] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.670] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.671] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.671] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.671] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.671] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.672] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.672] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.672] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.672] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.672] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.673] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.673] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.673] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.673] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.673] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.674] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.674] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.674] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.674] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.674] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.675] 
[20:15:57.675] ./components/main-layout.tsx
[20:15:57.675] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.675] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.676] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.676] 110:21  Warning: Unexpected console statement.  no-console
[20:15:57.676] 117:21  Warning: Unexpected console statement.  no-console
[20:15:57.676] 124:21  Warning: Unexpected console statement.  no-console
[20:15:57.676] 
[20:15:57.677] ./components/map/BasicMapComponent.tsx
[20:15:57.677] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.677] 
[20:15:57.677] ./components/map/DriverInterface.tsx
[20:15:57.677] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.678] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.678] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.678] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.682] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.682] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.683] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.683] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.683] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.683] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.684] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[20:15:57.684] 
[20:15:57.684] ./components/map/FleetOverviewMap.tsx
[20:15:57.684] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.684] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.685] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.685] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.685] 
[20:15:57.685] ./components/map/ShipmentSnapshotMapView.tsx
[20:15:57.686] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.686] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.686] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.686] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.686] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.687] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.687] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.687] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.687] 
[20:15:57.687] ./components/map/SimulationMap.tsx
[20:15:57.688] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.688] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.689] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.689] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.689] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.690] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.690] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.690] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.690] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.690] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:15:57.691] 
[20:15:57.692] ./components/map/StaticRouteMap.tsx
[20:15:57.692] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.692] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.692] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.692] 68:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.694] 
[20:15:57.694] ./components/sentry-provider.tsx
[20:15:57.695] 29:11  Warning: Unexpected console statement.  no-console
[20:15:57.695] 
[20:15:57.695] ./components/shared/Avatar.tsx
[20:15:57.695] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[20:15:57.695] 
[20:15:57.696] ./components/shipment-detail-page.tsx
[20:15:57.696] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.696] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.696] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.696] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.697] 131:5  Warning: Unexpected console statement.  no-console
[20:15:57.697] 137:6  Warning: Unexpected console statement.  no-console
[20:15:57.698] 
[20:15:57.698] ./components/shipments/ShipmentCard.tsx
[20:15:57.699] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.699] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.699] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.700] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.700] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.700] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.700] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.702] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.702] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.703] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.703] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.703] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.703] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.704] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.704] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.704] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.704] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.704] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.705] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.705] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.706] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.706] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.707] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.707] 42:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.707] 45:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.707] 
[20:15:57.707] ./components/shipments/ShipmentHistory.tsx
[20:15:57.708] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.708] 
[20:15:57.708] ./components/shipments/ShipmentStatusTimeline.tsx
[20:15:57.708] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.708] 
[20:15:57.709] ./components/shipments/ShipmentsTable.tsx
[20:15:57.709] 129:5  Warning: Unexpected console statement.  no-console
[20:15:57.709] 
[20:15:57.709] ./components/simulation/ScenarioSelector.tsx
[20:15:57.710] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.710] 
[20:15:57.710] ./components/simulation/SimulationControls.tsx
[20:15:57.710] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.710] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.711] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.711] 
[20:15:57.711] ./components/ui/custom-select.tsx
[20:15:57.711] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.711] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.712] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.712] 
[20:15:57.712] ./components/ui/dialog.tsx
[20:15:57.712] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.712] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.713] 
[20:15:57.713] ./components/ui/dropdown.tsx
[20:15:57.713] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.713] 
[20:15:57.713] ./components/ui/enhanced-file-upload.tsx
[20:15:57.714] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.714] 
[20:15:57.714] ./components/users/UserManagement.tsx
[20:15:57.714] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.714] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.715] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.715] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.715] 
[20:15:57.715] ./lib/actions/auth.ts
[20:15:57.715] 20:5  Warning: Unexpected console statement.  no-console
[20:15:57.716] 27:5  Warning: Unexpected console statement.  no-console
[20:15:57.716] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.716] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.716] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.717] 61:5  Warning: Unexpected console statement.  no-console
[20:15:57.717] 
[20:15:57.717] ./lib/actions/shipmentActions.ts
[20:15:57.717] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.717] 
[20:15:57.717] ./lib/actions/shipmentUpdateActions.ts
[20:15:57.718] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.718] 
[20:15:57.718] ./lib/actions/simulationActions.ts
[20:15:57.718] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.718] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.719] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.719] 506:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.719] 
[20:15:57.719] ./lib/api.ts
[20:15:57.719] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.720] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.720] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.720] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.720] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.721] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.721] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.721] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.721] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.721] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.722] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.722] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[20:15:57.722] 
[20:15:57.722] ./lib/auth-client.ts
[20:15:57.722] 16:5  Warning: Unexpected console statement.  no-console
[20:15:57.723] 20:5  Warning: Unexpected console statement.  no-console
[20:15:57.723] 34:5  Warning: Unexpected console statement.  no-console
[20:15:57.723] 43:5  Warning: Unexpected console statement.  no-console
[20:15:57.723] 47:7  Warning: Unexpected console statement.  no-console
[20:15:57.723] 67:5  Warning: Unexpected console statement.  no-console
[20:15:57.724] 83:5  Warning: Unexpected console statement.  no-console
[20:15:57.724] 92:5  Warning: Unexpected console statement.  no-console
[20:15:57.724] 96:7  Warning: Unexpected console statement.  no-console
[20:15:57.724] 
[20:15:57.724] ./lib/auth.ts
[20:15:57.725] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.726] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.726] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.726] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.726] 49:9  Warning: Unexpected console statement.  no-console
[20:15:57.726] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.727] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.727] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.727] 54:9  Warning: Unexpected console statement.  no-console
[20:15:57.727] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.727] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.728] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.728] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.728] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.728] 
[20:15:57.728] ./lib/context/SimulationStoreContext.tsx
[20:15:57.729] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.729] 
[20:15:57.729] ./lib/database/schema.ts
[20:15:57.729] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.729] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.730] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.730] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.730] 589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.730] 
[20:15:57.731] ./lib/document-processing.ts
[20:15:57.731] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.731] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.731] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.732] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.732] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.732] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.732] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.732] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.733] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.733] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.733] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.733] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.733] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.734] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.734] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.734] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.734] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.735] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.735] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.735] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.735] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.736] 
[20:15:57.736] ./lib/excel-helper.ts
[20:15:57.736] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.736] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.736] 
[20:15:57.736] ./lib/simple-auth.ts
[20:15:57.737] 16:5  Warning: Unexpected console statement.  no-console
[20:15:57.737] 19:5  Warning: Unexpected console statement.  no-console
[20:15:57.737] 30:5  Warning: Unexpected console statement.  no-console
[20:15:57.737] 34:7  Warning: Unexpected console statement.  no-console
[20:15:57.737] 44:5  Warning: Unexpected console statement.  no-console
[20:15:57.738] 67:3  Warning: Unexpected console statement.  no-console
[20:15:57.738] 71:5  Warning: Unexpected console statement.  no-console
[20:15:57.738] 83:9  Warning: Unexpected console statement.  no-console
[20:15:57.738] 91:9  Warning: Unexpected console statement.  no-console
[20:15:57.738] 111:5  Warning: Unexpected console statement.  no-console
[20:15:57.739] 122:5  Warning: Unexpected console statement.  no-console
[20:15:57.739] 131:5  Warning: Unexpected console statement.  no-console
[20:15:57.739] 149:5  Warning: Unexpected console statement.  no-console
[20:15:57.739] 160:5  Warning: Unexpected console statement.  no-console
[20:15:57.739] 164:9  Warning: Unexpected console statement.  no-console
[20:15:57.740] 174:5  Warning: Unexpected console statement.  no-console
[20:15:57.740] 
[20:15:57.740] ./lib/store/SimulationStoreContext.tsx
[20:15:57.740] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.741] 
[20:15:57.741] ./lib/store/documentStore.ts
[20:15:57.741] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.741] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.741] 
[20:15:57.742] ./lib/store/useSimulationStore.ts
[20:15:57.742] 94:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.742] 109:46  Warning: 'removed' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[20:15:57.742] 227:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.742] 227:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:15:57.743] 494:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:15:57.743] 
[20:15:57.743] ./lib/store/useSimulationStoreContext.ts
[20:15:57.743] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.744] 
[20:15:57.744] ./lib/validations.ts
[20:15:57.744] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[20:15:57.744] 
[20:15:57.744] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[20:16:09.451]    Collecting page data ...
[20:16:10.026] [ERROR] DATABASE_URL environment variable is not set.
[20:16:10.027] Error: DATABASE_URL environment variable is not set.
[20:16:10.028]     at 93747 (/vercel/path0/.next/server/chunks/3747.js:1:256)
[20:16:10.029]     at t (/vercel/path0/.next/server/webpack-runtime.js:1:143)
[20:16:10.029]     at 38545 (/vercel/path0/.next/server/app/api/ai/document-processing/route.js:1:1199)
[20:16:10.029]     at t (/vercel/path0/.next/server/webpack-runtime.js:1:143)
[20:16:10.029]     at t (/vercel/path0/.next/server/app/api/ai/document-processing/route.js:1:7181)
[20:16:10.029]     at /vercel/path0/.next/server/app/api/ai/document-processing/route.js:1:7239
[20:16:10.030]     at t.X (/vercel/path0/.next/server/webpack-runtime.js:1:1285)
[20:16:10.030]     at /vercel/path0/.next/server/app/api/ai/document-processing/route.js:1:7194
[20:16:10.030]     at Object.<anonymous> (/vercel/path0/.next/server/app/api/ai/document-processing/route.js:1:7267)
[20:16:10.031]     at Module._compile (node:internal/modules/cjs/loader:1554:14)
[20:16:10.031] 
[20:16:10.032] > Build error occurred
[20:16:10.035] Error: Failed to collect page data for /api/ai/document-processing
[20:16:10.036]     at /vercel/path0/node_modules/next/dist/build/utils.js:1269:15
[20:16:10.036]     at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
[20:16:10.036]   type: 'Error'
[20:16:10.036] }
[20:16:10.068] Error: Command "npm run build" exited with 1
[20:16:10.660] 