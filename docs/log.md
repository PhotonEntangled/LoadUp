[00:55:53.850] Running build in Washington, D.C., USA (East) – iad1
[00:55:53.866] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 4a053bc)
[00:55:54.411] Warning: Failed to fetch one or more git submodules
[00:55:54.411] Cloning completed: 545.000ms
[00:56:01.041] Restored build cache from previous deployment (3D6e1KQFc3pf77ZqcaSKojSb2Ssm)
[00:56:01.963] Running "vercel build"
[00:56:02.322] Vercel CLI 41.6.2
[00:56:02.669] Running "install" command: `npm install`...
[00:56:05.577] 
[00:56:05.578] up to date, audited 1475 packages in 3s
[00:56:05.579] 
[00:56:05.579] 343 packages are looking for funding
[00:56:05.579]   run `npm fund` for details
[00:56:05.598] 
[00:56:05.599] 5 vulnerabilities (4 moderate, 1 high)
[00:56:05.599] 
[00:56:05.599] To address all issues possible (including breaking changes), run:
[00:56:05.599]   npm audit fix --force
[00:56:05.600] 
[00:56:05.600] Some issues need review, and may require choosing
[00:56:05.600] a different dependency.
[00:56:05.600] 
[00:56:05.600] Run `npm audit` for details.
[00:56:05.631] Detected Next.js version: 14.2.28
[00:56:05.632] Running "npm run build"
[00:56:05.739] 
[00:56:05.740] > loadup-admin-dashboard@0.1.0 prebuild
[00:56:05.740] > echo 'Starting build process'
[00:56:05.740] 
[00:56:05.744] Starting build process
[00:56:05.745] 
[00:56:05.745] > loadup-admin-dashboard@0.1.0 build
[00:56:05.745] > next build
[00:56:05.745] 
[00:56:06.423]   ▲ Next.js 14.2.28
[00:56:06.423] 
[00:56:06.450]    Creating an optimized production build ...
[00:56:18.018]  ⚠ Compiled with warnings
[00:56:18.020] 
[00:56:18.020] ./node_modules/keyv/src/index.js
[00:56:18.020] Critical dependency: the request of a dependency is an expression
[00:56:18.020] 
[00:56:18.020] Import trace for requested module:
[00:56:18.021] ./node_modules/keyv/src/index.js
[00:56:18.021] ./node_modules/cacheable-request/src/index.js
[00:56:18.021] ./node_modules/got/dist/source/core/index.js
[00:56:18.021] ./node_modules/got/dist/source/create.js
[00:56:18.022] ./node_modules/got/dist/source/index.js
[00:56:18.022] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[00:56:18.024] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[00:56:18.024] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[00:56:18.024] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[00:56:18.024] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[00:56:18.024] ./app/api/directions/route.ts
[00:56:18.024] 
[00:56:25.532]  ✓ Compiled successfully
[00:56:25.533]    Linting and checking validity of types ...
[00:56:37.220] 
[00:56:37.221] ./app/api/ai/document-processing/route.ts
[00:56:37.221] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.222] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.222] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.222] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.223] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.223] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.223] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.223] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.224] 42:3  Warning: Unexpected console statement.  no-console
[00:56:37.224] 63:5  Warning: Unexpected console statement.  no-console
[00:56:37.225] 67:7  Warning: Unexpected console statement.  no-console
[00:56:37.225] 250:5  Warning: Unexpected console statement.  no-console
[00:56:37.225] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.225] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.225] 349:7  Warning: Unexpected console statement.  no-console
[00:56:37.226] 357:7  Warning: Unexpected console statement.  no-console
[00:56:37.226] 
[00:56:37.226] ./app/api/ai/field-mapping/route.ts
[00:56:37.227] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.227] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.236] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.236] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.236] 
[00:56:37.236] ./app/api/ai/image-extraction/route.ts
[00:56:37.236] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.237] 
[00:56:37.237] ./app/api/ai/test-connection/route.ts
[00:56:37.237] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.237] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.238] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.238] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.238] 
[00:56:37.239] ./app/api/auth/[...nextauth]/options.ts
[00:56:37.239] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.240] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.240] 70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.242] 77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.243] 103:11  Warning: Unexpected console statement.  no-console
[00:56:37.244] 113:12  Warning: Unexpected console statement.  no-console
[00:56:37.245] 117:9  Warning: Unexpected console statement.  no-console
[00:56:37.245] 148:9  Warning: Unexpected console statement.  no-console
[00:56:37.245] 
[00:56:37.245] ./app/api/auth/login/route.ts
[00:56:37.245] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.246] 34:5  Warning: Unexpected console statement.  no-console
[00:56:37.246] 59:5  Warning: Unexpected console statement.  no-console
[00:56:37.246] 77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.246] 90:5  Warning: Unexpected console statement.  no-console
[00:56:37.246] 
[00:56:37.246] ./app/api/auth/logout/route.ts
[00:56:37.247] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.247] 6:5  Warning: Unexpected console statement.  no-console
[00:56:37.247] 12:5  Warning: Unexpected console statement.  no-console
[00:56:37.247] 
[00:56:37.247] ./app/api/auth/route.ts
[00:56:37.248] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.248] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.248] 
[00:56:37.248] ./app/api/auth/signout/route.ts
[00:56:37.248] 4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.249] 
[00:56:37.249] ./app/api/auth/user/route.ts
[00:56:37.249] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.249] 7:5  Warning: Unexpected console statement.  no-console
[00:56:37.249] 14:7  Warning: Unexpected console statement.  no-console
[00:56:37.250] 23:7  Warning: Unexpected console statement.  no-console
[00:56:37.250] 
[00:56:37.250] ./app/api/directions/route.ts
[00:56:37.264] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.264] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.265] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.265] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.265] 
[00:56:37.265] ./app/api/documents/[id]/route.ts
[00:56:37.265] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.266] 
[00:56:37.266] ./app/api/documents/route.ts
[00:56:37.266] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.266] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.267] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.267] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.267] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.267] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.267] 192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.268] 301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.268] 418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.268] 443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.268] 449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.268] 497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.269] 546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.269] 
[00:56:37.269] ./app/api/documents/upload/route.ts
[00:56:37.269] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.269] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.269] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.270] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.270] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.270] 
[00:56:37.270] ./app/api/etl/process-shipment-slips/route.ts
[00:56:37.270] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.270] 
[00:56:37.271] ./app/api/shipments/[id]/route.ts
[00:56:37.271] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.271] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.271] 
[00:56:37.271] ./app/api/shipments/route.ts
[00:56:37.271] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.272] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.272] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.272] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.272] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.272] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.273] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.274] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.274] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.274] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.274] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.274] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.275] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.275] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.275] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.275] 395:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.275] 
[00:56:37.276] ./app/api/simulation/enqueue-ticks/route.ts
[00:56:37.276] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.276] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.276] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.276] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.277] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.277] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.284] 
[00:56:37.285] ./app/api/simulation/route.ts
[00:56:37.285] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.285] 
[00:56:37.285] ./app/api/simulation/shipments/[documentId]/route.ts
[00:56:37.285] 323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.286] 
[00:56:37.286] ./app/api/simulation/tick-worker/route.ts
[00:56:37.286] 136:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.286] 
[00:56:37.286] ./app/api/users/route.ts
[00:56:37.287] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.287] 
[00:56:37.287] ./app/auth/_components/AuthForm.tsx
[00:56:37.287] 5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.287] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.288] 20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.288] 21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.288] 26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.289] 26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.289] 33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.289] 49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.289] 60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.290] 66:9  Warning: Unexpected console statement.  no-console
[00:56:37.290] 71:9  Warning: Unexpected console statement.  no-console
[00:56:37.290] 77:11  Warning: Unexpected console statement.  no-console
[00:56:37.290] 81:9  Warning: Unexpected console statement.  no-console
[00:56:37.290] 83:11  Warning: Unexpected console statement.  no-console
[00:56:37.290] 85:13  Warning: Unexpected console statement.  no-console
[00:56:37.291] 91:13  Warning: Unexpected console statement.  no-console
[00:56:37.291] 94:13  Warning: Unexpected console statement.  no-console
[00:56:37.291] 98:9  Warning: Unexpected console statement.  no-console
[00:56:37.291] 110:9  Warning: Unexpected console statement.  no-console
[00:56:37.291] 115:9  Warning: Unexpected console statement.  no-console
[00:56:37.291] 
[00:56:37.291] ./app/auth/sign-in/page.tsx
[00:56:37.292] 13:5  Warning: Unexpected console statement.  no-console
[00:56:37.292] 14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.292] 24:5  Warning: Unexpected console statement.  no-console
[00:56:37.292] 
[00:56:37.292] ./app/auth/sign-up/page.tsx
[00:56:37.292] 5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.293] 
[00:56:37.293] ./app/dashboard/customer/success/page.tsx
[00:56:37.293] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.293] 
[00:56:37.293] ./app/dashboard/driver/success/page.tsx
[00:56:37.294] 10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.296] 
[00:56:37.296] ./app/dashboard/map/page.tsx
[00:56:37.296] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.297] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.298] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.298] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.298] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.298] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.298] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.299] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.299] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.299] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.299] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.299] 
[00:56:37.300] ./app/dashboard/shipments/create/page.tsx
[00:56:37.300] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.300] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.300] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.300] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.301] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.301] 
[00:56:37.301] ./app/dashboard/shipments/page.tsx
[00:56:37.301] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.301] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.301] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.302] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.302] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.302] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.302] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.303] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.303] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.305] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.306] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.306] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.306] 
[00:56:37.306] ./app/debug/page.tsx
[00:56:37.306] 22:5  Warning: Unexpected console statement.  no-console
[00:56:37.306] 
[00:56:37.306] ./app/documents/page.tsx
[00:56:37.307] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.307] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.307] 82:5  Warning: Unexpected console statement.  no-console
[00:56:37.307] 90:7  Warning: Unexpected console statement.  no-console
[00:56:37.307] 109:5  Warning: Unexpected console statement.  no-console
[00:56:37.307] 116:7  Warning: Unexpected console statement.  no-console
[00:56:37.307] 124:5  Warning: Unexpected console statement.  no-console
[00:56:37.308] 138:5  Warning: Unexpected console statement.  no-console
[00:56:37.308] 
[00:56:37.308] ./app/documents/scan/page.tsx
[00:56:37.308] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.311] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.311] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.311] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.311] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.311] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.311] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.312] 77:5  Warning: Unexpected console statement.  no-console
[00:56:37.312] 88:5  Warning: Unexpected console statement.  no-console
[00:56:37.312] 
[00:56:37.312] ./app/documents/view/[id]/page.tsx
[00:56:37.312] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.313] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.313] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.313] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.313] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.314] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.314] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.314] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.314] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.314] 
[00:56:37.315] ./app/page.tsx
[00:56:37.315] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.315] 
[00:56:37.316] ./app/shipments/[documentid]/page.tsx
[00:56:37.316] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.317] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.317] 24:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.317] 28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.317] 281:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.317] 422:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.318] 423:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.318] 
[00:56:37.318] ./app/simulation/[documentId]/page.tsx
[00:56:37.318] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.318] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.319] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.321] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.321] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.321] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.321] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.322] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.322] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.322] 
[00:56:37.322] ./app/simulation/page.tsx
[00:56:37.322] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.323] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.323] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.323] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.323] 
[00:56:37.323] ./app/tracking/[documentId]/_components/TrackingPageView.tsx
[00:56:37.324] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.325] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.325] 6:15  Warning: 'StaticTrackingDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.325] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.325] 118:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.325] 127:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.326] 170:90  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.326] 207:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.326] 233:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.326] 
[00:56:37.326] ./app/tracking/[documentId]/page.tsx
[00:56:37.327] 13:48  Warning: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.327] 
[00:56:37.327] ./components/AuthForm.tsx
[00:56:37.327] 11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.327] 13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.327] 14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.328] 15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.328] 16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.328] 18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.328] 26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.328] 59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.329] 68:9  Warning: Unexpected console statement.  no-console
[00:56:37.329] 76:9  Warning: Unexpected console statement.  no-console
[00:56:37.329] 87:11  Warning: Unexpected console statement.  no-console
[00:56:37.329] 94:9  Warning: Unexpected console statement.  no-console
[00:56:37.329] 96:11  Warning: Unexpected console statement.  no-console
[00:56:37.330] 99:13  Warning: Unexpected console statement.  no-console
[00:56:37.330] 107:13  Warning: Unexpected console statement.  no-console
[00:56:37.330] 111:13  Warning: Unexpected console statement.  no-console
[00:56:37.330] 116:9  Warning: Unexpected console statement.  no-console
[00:56:37.330] 
[00:56:37.331] ./components/document-page.tsx
[00:56:37.331] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.331] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.331] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.331] 75:5  Warning: Unexpected console statement.  no-console
[00:56:37.332] 85:7  Warning: Unexpected console statement.  no-console
[00:56:37.332] 110:5  Warning: Unexpected console statement.  no-console
[00:56:37.332] 124:9  Warning: Unexpected console statement.  no-console
[00:56:37.332] 135:5  Warning: Unexpected console statement.  no-console
[00:56:37.332] 151:5  Warning: Unexpected console statement.  no-console
[00:56:37.333] 
[00:56:37.333] ./components/drivers/DriverManagement.tsx
[00:56:37.333] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.333] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.333] 
[00:56:37.333] ./components/logistics/DocumentScanner.tsx
[00:56:37.334] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.334] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.334] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.334] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.334] 
[00:56:37.334] ./components/logistics/LogisticsDocumentUploader.tsx
[00:56:37.335] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.335] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.335] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.335] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.335] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.335] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.336] 87:7  Warning: Unexpected console statement.  no-console
[00:56:37.336] 93:7  Warning: Unexpected console statement.  no-console
[00:56:37.336] 109:7  Warning: Unexpected console statement.  no-console
[00:56:37.336] 
[00:56:37.336] ./components/logistics/ShipmentDataDisplay.tsx
[00:56:37.337] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.337] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.337] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.337] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.338] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.338] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.339] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.339] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.339] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.339] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.340] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.340] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.340] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.340] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.340] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.341] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.341] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.342] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.343] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.343] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.343] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.343] 
[00:56:37.343] ./components/logistics/shipments/ShipmentCardView.tsx
[00:56:37.344] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.345] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.345] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.345] 40:39  Warning: Unexpected console statement.  no-console
[00:56:37.345] 
[00:56:37.345] ./components/logistics/shipments/ShipmentDetailsView.tsx
[00:56:37.346] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.346] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.346] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.346] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.348] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.348] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.348] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.348] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.349] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.349] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.349] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.349] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.350] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.350] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.350] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.350] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.350] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.351] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.351] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.351] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.351] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.351] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.352] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.352] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.352] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.352] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.352] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.353] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.353] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.353] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.353] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.353] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.354] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.354] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.354] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.354] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.354] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.355] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.355] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.355] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.355] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.355] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.356] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.356] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.356] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.356] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.356] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.357] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.358] 58:5  Warning: Unexpected console statement.  no-console
[00:56:37.358] 62:5  Warning: Unexpected console statement.  no-console
[00:56:37.358] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.358] 
[00:56:37.358] ./components/logistics/shipments/ShipmentField.tsx
[00:56:37.358] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.359] 
[00:56:37.359] ./components/logistics/shipments/ShipmentItemsTable.tsx
[00:56:37.359] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.359] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.359] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.360] 
[00:56:37.361] ./components/logistics/shipments/ShipmentTableView.tsx
[00:56:37.361] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.361] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.361] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.361] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.361] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.362] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.362] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.362] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.362] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.362] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.363] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.364] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.364] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.364] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.364] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.365] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.365] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.365] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.365] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.365] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.365] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.366] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.366] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.366] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.366] 
[00:56:37.366] ./components/main-layout.tsx
[00:56:37.366] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.367] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.367] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.367] 110:21  Warning: Unexpected console statement.  no-console
[00:56:37.367] 117:21  Warning: Unexpected console statement.  no-console
[00:56:37.367] 124:21  Warning: Unexpected console statement.  no-console
[00:56:37.368] 
[00:56:37.368] ./components/map/BasicMapComponent.tsx
[00:56:37.368] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.368] 
[00:56:37.368] ./components/map/DriverInterface.tsx
[00:56:37.368] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.369] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.369] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.369] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.369] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.369] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.370] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.370] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.370] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.371] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.371] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[00:56:37.371] 
[00:56:37.371] ./components/map/FleetOverviewMap.tsx
[00:56:37.371] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.372] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.372] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.372] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.372] 
[00:56:37.372] ./components/map/ShipmentSnapshotMapView.tsx
[00:56:37.373] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.373] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.373] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.373] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.374] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.374] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.376] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.376] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.376] 
[00:56:37.376] ./components/map/SimulationMap.tsx
[00:56:37.377] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.377] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.377] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.377] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.377] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.378] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.378] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.378] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.378] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.378] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.379] 
[00:56:37.379] ./components/map/StaticRouteMap.tsx
[00:56:37.379] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.379] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.379] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.379] 70:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.380] 
[00:56:37.380] ./components/map/TrackingControls.tsx
[00:56:37.380] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.380] 
[00:56:37.380] ./components/map/TrackingMap.tsx
[00:56:37.380] 8:3  Warning: 'ViewStateChangeEvent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.381] 17:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.381] 19:42  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.381] 20:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.381] 25:10  Warning: 'GeoJSONSource' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.381] 26:10  Warning: 'LngLatBounds' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.382] 82:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.382] 89:10  Warning: 'viewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.382] 89:21  Warning: 'setViewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.382] 97:5  Warning: 'trackedShipmentId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.382] 263:6  Warning: React Hook useCallback has missing dependencies: 'addRouteSourceAndLayer' and 'updateOriginDestinationMarkers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[00:56:37.383] 266:9  Warning: 'addVehicleSourceAndLayer' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.383] 450:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.383] 
[00:56:37.383] ./components/sentry-provider.tsx
[00:56:37.383] 29:11  Warning: Unexpected console statement.  no-console
[00:56:37.383] 
[00:56:37.384] ./components/shared/Avatar.tsx
[00:56:37.384] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[00:56:37.384] 
[00:56:37.384] ./components/shipment-detail-page.tsx
[00:56:37.384] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.385] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.385] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.385] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.385] 131:5  Warning: Unexpected console statement.  no-console
[00:56:37.385] 137:6  Warning: Unexpected console statement.  no-console
[00:56:37.386] 
[00:56:37.386] ./components/shipments/ShipmentCard.tsx
[00:56:37.386] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.386] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.388] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.392] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.392] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.392] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.396] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.396] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.396] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.396] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.396] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.397] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.397] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.397] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.397] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.397] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.398] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.399] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.399] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.399] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.399] 
[00:56:37.399] ./components/shipments/ShipmentHistory.tsx
[00:56:37.399] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.400] 
[00:56:37.400] ./components/shipments/ShipmentStatusTimeline.tsx
[00:56:37.400] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.400] 
[00:56:37.400] ./components/shipments/ShipmentsTable.tsx
[00:56:37.401] 129:5  Warning: Unexpected console statement.  no-console
[00:56:37.401] 
[00:56:37.401] ./components/simulation/ScenarioSelector.tsx
[00:56:37.401] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.401] 
[00:56:37.401] ./components/simulation/SimulationControls.tsx
[00:56:37.402] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.402] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.402] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.402] 
[00:56:37.402] ./components/ui/custom-select.tsx
[00:56:37.403] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.403] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.403] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.403] 
[00:56:37.403] ./components/ui/dialog.tsx
[00:56:37.403] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.404] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.404] 
[00:56:37.404] ./components/ui/dropdown.tsx
[00:56:37.404] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.405] 
[00:56:37.405] ./components/ui/enhanced-file-upload.tsx
[00:56:37.405] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.405] 
[00:56:37.405] ./components/users/UserManagement.tsx
[00:56:37.405] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.406] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.406] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.406] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.406] 
[00:56:37.406] ./lib/actions/auth.ts
[00:56:37.407] 20:5  Warning: Unexpected console statement.  no-console
[00:56:37.407] 27:5  Warning: Unexpected console statement.  no-console
[00:56:37.407] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.407] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.407] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.408] 61:5  Warning: Unexpected console statement.  no-console
[00:56:37.408] 
[00:56:37.408] ./lib/actions/shipmentActions.ts
[00:56:37.408] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.408] 
[00:56:37.408] ./lib/actions/shipmentUpdateActions.ts
[00:56:37.409] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.409] 
[00:56:37.409] ./lib/actions/simulationActions.ts
[00:56:37.409] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.409] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.409] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.410] 522:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.410] 
[00:56:37.410] ./lib/actions/trackingActions.ts
[00:56:37.410] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.410] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.410] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.411] 446:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.411] 564:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.411] 
[00:56:37.411] ./lib/api.ts
[00:56:37.411] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.411] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.412] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.412] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.412] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.412] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.412] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.413] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.413] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.413] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.413] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.413] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[00:56:37.414] 
[00:56:37.414] ./lib/auth-client.ts
[00:56:37.414] 16:5  Warning: Unexpected console statement.  no-console
[00:56:37.414] 20:5  Warning: Unexpected console statement.  no-console
[00:56:37.414] 34:5  Warning: Unexpected console statement.  no-console
[00:56:37.415] 43:5  Warning: Unexpected console statement.  no-console
[00:56:37.415] 47:7  Warning: Unexpected console statement.  no-console
[00:56:37.415] 67:5  Warning: Unexpected console statement.  no-console
[00:56:37.415] 83:5  Warning: Unexpected console statement.  no-console
[00:56:37.415] 92:5  Warning: Unexpected console statement.  no-console
[00:56:37.415] 96:7  Warning: Unexpected console statement.  no-console
[00:56:37.416] 
[00:56:37.416] ./lib/auth.ts
[00:56:37.416] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.416] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.416] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.416] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.417] 49:9  Warning: Unexpected console statement.  no-console
[00:56:37.417] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.417] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.417] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.417] 54:9  Warning: Unexpected console statement.  no-console
[00:56:37.418] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.418] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.418] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.418] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.418] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.418] 
[00:56:37.418] ./lib/context/SimulationStoreContext.tsx
[00:56:37.419] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.419] 
[00:56:37.419] ./lib/database/schema.ts
[00:56:37.419] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.419] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.420] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.420] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.420] 590:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[00:56:37.420] 
[00:56:37.420] ./lib/document-processing.ts
[00:56:37.421] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.421] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.421] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.421] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.421] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.422] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.422] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.422] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.422] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.422] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.422] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.423] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.423] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.423] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.423] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.423] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.424] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.424] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.424] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.424] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.424] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.425] 
[00:56:37.425] ./lib/excel-helper.ts
[00:56:37.425] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.425] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.425] 
[00:56:37.425] ./lib/firebase/clientApp.ts
[00:56:37.426] 31:1  Warning: Unexpected console statement.  no-console
[00:56:37.426] 
[00:56:37.426] ./lib/simple-auth.ts
[00:56:37.426] 16:5  Warning: Unexpected console statement.  no-console
[00:56:37.426] 19:5  Warning: Unexpected console statement.  no-console
[00:56:37.427] 30:5  Warning: Unexpected console statement.  no-console
[00:56:37.427] 34:7  Warning: Unexpected console statement.  no-console
[00:56:37.427] 44:5  Warning: Unexpected console statement.  no-console
[00:56:37.427] 67:3  Warning: Unexpected console statement.  no-console
[00:56:37.427] 71:5  Warning: Unexpected console statement.  no-console
[00:56:37.428] 83:9  Warning: Unexpected console statement.  no-console
[00:56:37.428] 91:9  Warning: Unexpected console statement.  no-console
[00:56:37.428] 111:5  Warning: Unexpected console statement.  no-console
[00:56:37.429] 122:5  Warning: Unexpected console statement.  no-console
[00:56:37.429] 131:5  Warning: Unexpected console statement.  no-console
[00:56:37.429] 149:5  Warning: Unexpected console statement.  no-console
[00:56:37.430] 160:5  Warning: Unexpected console statement.  no-console
[00:56:37.430] 164:9  Warning: Unexpected console statement.  no-console
[00:56:37.430] 174:5  Warning: Unexpected console statement.  no-console
[00:56:37.430] 
[00:56:37.430] ./lib/store/SimulationStoreContext.tsx
[00:56:37.431] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.431] 
[00:56:37.431] ./lib/store/documentStore.ts
[00:56:37.431] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.431] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.432] 
[00:56:37.432] ./lib/store/useLiveTrackingStore.ts
[00:56:37.432] 5:22  Warning: 'MapboxMap' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.432] 
[00:56:37.432] ./lib/store/useSimulationStore.ts
[00:56:37.432] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.433] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.433] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[00:56:37.433] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:56:37.433] 
[00:56:37.433] ./lib/store/useSimulationStoreContext.ts
[00:56:37.434] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.434] 
[00:56:37.434] ./lib/validations.ts
[00:56:37.434] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[00:56:37.434] 
[00:56:37.434] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[00:56:48.232] Failed to compile.
[00:56:48.232] 
[00:56:48.232] ./app/api/simulation/shipments/[documentId]/route.ts:74:11
[00:56:48.232] Type error: Property 'lastKnownBearing' is missing in type '{ id: string; documentId: string; loadNumber: string | null; orderNumber: string | null; poNumber: string | null; status: string; totalWeight: null; totalWeightUnit: null; totalVolume: null; ... 10 more ...; lastKnownTimestamp: string | null; }' but required in type 'ApiShipmentCoreInfo'.
[00:56:48.232] 
[00:56:48.232] [0m [90m 72 |[39m     }[0m
[00:56:48.232] [0m [90m 73 |[39m[0m
[00:56:48.232] [0m[31m[1m>[22m[39m[90m 74 |[39m     [36mconst[39m coreInfo[33m:[39m [33mApiShipmentCoreInfo[39m [33m=[39m {[0m
[00:56:48.232] [0m [90m    |[39m           [31m[1m^[22m[39m[0m
[00:56:48.232] [0m [90m 75 |[39m         id[33m:[39m dbShipment[33m.[39mid[33m,[39m[0m
[00:56:48.233] [0m [90m 76 |[39m         documentId[33m:[39m coreDocumentId [33m?[39m[33m?[39m [32m'MISSING_DOC_ID'[39m[33m,[39m[0m
[00:56:48.233] [0m [90m 77 |[39m         [90m// --- CORRECTED Load Number Logic --- [39m[0m
[00:56:48.272] Next.js build worker exited with code: 1 and signal: null
[00:56:48.289] Error: Command "npm run build" exited with 1
[00:56:48.880] 
[00:56:52.439] Exiting build container