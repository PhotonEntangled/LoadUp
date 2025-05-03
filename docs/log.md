[21:26:42.554] Running build in Washington, D.C., USA (East) – iad1
[21:26:42.570] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: c9f50b0)
[21:26:43.126] Warning: Failed to fetch one or more git submodules
[21:26:43.126] Cloning completed: 556.000ms
[21:26:48.130] Restored build cache from previous deployment (CGoh5H1NDDjVqBbJWukQNajFS5QX)
[21:26:49.109] Running "vercel build"
[21:26:49.484] Vercel CLI 41.7.0
[21:26:50.699] Running "install" command: `npm install`...
[21:26:54.246] 
[21:26:54.247] added 6 packages, and audited 1475 packages in 3s
[21:26:54.247] 
[21:26:54.248] 344 packages are looking for funding
[21:26:54.248]   run `npm fund` for details
[21:26:54.278] 
[21:26:54.279] 6 vulnerabilities (5 moderate, 1 high)
[21:26:54.279] 
[21:26:54.279] To address issues that do not require attention, run:
[21:26:54.279]   npm audit fix
[21:26:54.279] 
[21:26:54.279] To address all issues possible (including breaking changes), run:
[21:26:54.280]   npm audit fix --force
[21:26:54.280] 
[21:26:54.280] Some issues need review, and may require choosing
[21:26:54.280] a different dependency.
[21:26:54.280] 
[21:26:54.280] Run `npm audit` for details.
[21:26:54.314] Detected Next.js version: 14.2.28
[21:26:54.315] Running "npm run build"
[21:26:54.429] 
[21:26:54.430] > loadup-admin-dashboard@0.1.0 prebuild
[21:26:54.430] > echo 'Starting build process'
[21:26:54.430] 
[21:26:54.435] Starting build process
[21:26:54.435] 
[21:26:54.436] > loadup-admin-dashboard@0.1.0 build
[21:26:54.436] > next build
[21:26:54.436] 
[21:26:55.138]   ▲ Next.js 14.2.28
[21:26:55.139] 
[21:26:55.168]    Creating an optimized production build ...
[21:27:14.777]  ⚠ Compiled with warnings
[21:27:14.778] 
[21:27:14.778] ./node_modules/keyv/src/index.js
[21:27:14.779] Critical dependency: the request of a dependency is an expression
[21:27:14.779] 
[21:27:14.779] Import trace for requested module:
[21:27:14.779] ./node_modules/keyv/src/index.js
[21:27:14.779] ./node_modules/cacheable-request/src/index.js
[21:27:14.779] ./node_modules/got/dist/source/core/index.js
[21:27:14.780] ./node_modules/got/dist/source/create.js
[21:27:14.780] ./node_modules/got/dist/source/index.js
[21:27:14.780] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[21:27:14.780] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[21:27:14.780] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[21:27:14.780] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[21:27:14.781] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[21:27:14.781] ./app/api/directions/route.ts
[21:27:14.781] 
[21:27:28.403]  ✓ Compiled successfully
[21:27:28.404]    Linting and checking validity of types ...
[21:27:40.362] 
[21:27:40.363] ./app/api/ai/document-processing/route.ts
[21:27:40.363] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.363] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.364] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.364] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.364] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.364] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.364] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.365] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.365] 42:3  Warning: Unexpected console statement.  no-console
[21:27:40.365] 63:5  Warning: Unexpected console statement.  no-console
[21:27:40.365] 67:7  Warning: Unexpected console statement.  no-console
[21:27:40.365] 250:5  Warning: Unexpected console statement.  no-console
[21:27:40.365] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.366] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.366] 349:7  Warning: Unexpected console statement.  no-console
[21:27:40.366] 357:7  Warning: Unexpected console statement.  no-console
[21:27:40.366] 
[21:27:40.366] ./app/api/ai/field-mapping/route.ts
[21:27:40.367] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.367] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.367] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.367] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.367] 
[21:27:40.368] ./app/api/ai/image-extraction/route.ts
[21:27:40.369] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.370] 
[21:27:40.370] ./app/api/ai/test-connection/route.ts
[21:27:40.370] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.371] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.371] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.371] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.372] 
[21:27:40.372] ./app/api/auth/[...nextauth]/options.ts
[21:27:40.372] 6:8  Warning: 'bcrypt' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.372] 7:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.375] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.375] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.376] 58:7  Warning: 'mockUserData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.376] 
[21:27:40.377] ./app/api/auth/route.ts
[21:27:40.377] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.377] 9:3  Warning: Unexpected console statement.  no-console
[21:27:40.377] 
[21:27:40.377] ./app/api/auth/user/route.ts
[21:27:40.378] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.378] 7:5  Warning: Unexpected console statement.  no-console
[21:27:40.378] 14:7  Warning: Unexpected console statement.  no-console
[21:27:40.380] 23:7  Warning: Unexpected console statement.  no-console
[21:27:40.380] 
[21:27:40.380] ./app/api/directions/route.ts
[21:27:40.381] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.381] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.391] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.391] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.391] 
[21:27:40.392] ./app/api/documents/[id]/route.ts
[21:27:40.392] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.392] 
[21:27:40.392] ./app/api/documents/alt-upload/route.ts
[21:27:40.392] 105:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.393] 147:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.393] 161:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.393] 
[21:27:40.393] ./app/api/documents/route.ts
[21:27:40.393] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.393] 9:5  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:10  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:16  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:20  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:29  Warning: 'like' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.394] 17:35  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.395] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.395] 17:45  Warning: 'inArray' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.395] 23:10  Warning: 'insertShipmentBundle' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.395] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.396] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.396] 29:10  Warning: 'neon' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.396] 29:16  Warning: 'NeonQueryFunction' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.396] 42:6  Warning: 'SelectedDocument' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.396] 53:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.397] 64:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.397] 76:10  Warning: 'mapDbShipmentStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.397] 109:10  Warning: 'calculateAggregateStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.397] 180:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.397] 402:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.397] 427:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.397] 433:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.398] 536:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.398] 
[21:27:40.398] ./app/api/documents/upload/route.ts
[21:27:40.398] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.398] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.398] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.398] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.399] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.399] 
[21:27:40.399] ./app/api/etl/process-shipment-slips/route.ts
[21:27:40.399] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.399] 
[21:27:40.399] ./app/api/shipments/[id]/route.ts
[21:27:40.399] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.400] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.400] 
[21:27:40.400] ./app/api/shipments/route.ts
[21:27:40.400] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.400] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.400] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.400] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.401] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.402] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.403] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.403] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.403] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.403] 395:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.403] 
[21:27:40.403] ./app/api/simulation/enqueue-ticks/route.ts
[21:27:40.403] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.404] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.404] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.404] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.404] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.404] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.404] 
[21:27:40.404] ./app/api/simulation/route.ts
[21:27:40.405] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.405] 
[21:27:40.405] ./app/api/simulation/shipments/[documentId]/route.ts
[21:27:40.405] 328:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.405] 
[21:27:40.405] ./app/api/simulation/tick-worker/route.ts
[21:27:40.406] 136:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.406] 
[21:27:40.406] ./app/api/users/route.ts
[21:27:40.406] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.406] 
[21:27:40.406] ./app/auth/forgot-password/page.tsx
[21:27:40.407] 5:10  Warning: 'forgotPasswordSchema' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.407] 
[21:27:40.407] ./app/dashboard/map/page.tsx
[21:27:40.407] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.407] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.407] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.408] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.409] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.409] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.409] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.409] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.409] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.411] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.411] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.411] 
[21:27:40.411] ./app/dashboard/shipments/create/page.tsx
[21:27:40.411] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.411] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.412] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.412] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.412] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.412] 
[21:27:40.412] ./app/dashboard/shipments/page.tsx
[21:27:40.412] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.412] 17:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.413] 18:3  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.413] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.413] 20:3  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.413] 21:3  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.413] 22:3  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.414] 23:3  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.416] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.416] 35:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 37:10  Warning: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 38:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.417] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 45:7  Warning: 'statusColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 57:7  Warning: 'priorityColors' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.418] 197:9  Warning: 'handleViewShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.419] 213:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.419] 
[21:27:40.419] ./app/debug/page.tsx
[21:27:40.419] 22:5  Warning: Unexpected console statement.  no-console
[21:27:40.419] 
[21:27:40.419] ./app/documents/page.tsx
[21:27:40.420] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.420] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.420] 82:5  Warning: Unexpected console statement.  no-console
[21:27:40.420] 90:7  Warning: Unexpected console statement.  no-console
[21:27:40.420] 109:5  Warning: Unexpected console statement.  no-console
[21:27:40.428] 116:7  Warning: Unexpected console statement.  no-console
[21:27:40.428] 124:5  Warning: Unexpected console statement.  no-console
[21:27:40.428] 138:5  Warning: Unexpected console statement.  no-console
[21:27:40.428] 
[21:27:40.429] ./app/documents/scan/page.tsx
[21:27:40.429] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.429] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.429] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.429] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.429] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.430] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.430] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.430] 77:5  Warning: Unexpected console statement.  no-console
[21:27:40.430] 88:5  Warning: Unexpected console statement.  no-console
[21:27:40.430] 
[21:27:40.430] ./app/documents/view/[id]/page.tsx
[21:27:40.431] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.431] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.431] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.431] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.431] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.431] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.432] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.432] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.432] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.432] 
[21:27:40.432] ./app/page.tsx
[21:27:40.433] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.433] 
[21:27:40.433] ./app/shipments/[documentid]/page.tsx
[21:27:40.433] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.433] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.433] 24:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.434] 28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.434] 281:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.434] 422:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.434] 423:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.435] 
[21:27:40.435] ./app/simulation/[documentId]/page.tsx
[21:27:40.435] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.435] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.435] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.435] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.436] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.436] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.436] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.436] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.436] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.437] 
[21:27:40.437] ./app/simulation/page.tsx
[21:27:40.437] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.437] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.437] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.438] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.438] 
[21:27:40.438] ./app/tracking/[documentId]/_components/TrackingPageView.tsx
[21:27:40.438] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.438] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.439] 6:15  Warning: 'StaticTrackingDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.439] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.439] 118:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.439] 127:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.439] 170:90  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.440] 207:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.440] 233:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.440] 
[21:27:40.440] ./app/tracking/[documentId]/page.tsx
[21:27:40.440] 13:48  Warning: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.441] 
[21:27:40.441] ./components/document-page.tsx
[21:27:40.441] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.441] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.441] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.441] 75:5  Warning: Unexpected console statement.  no-console
[21:27:40.442] 85:7  Warning: Unexpected console statement.  no-console
[21:27:40.442] 110:5  Warning: Unexpected console statement.  no-console
[21:27:40.448] 124:9  Warning: Unexpected console statement.  no-console
[21:27:40.448] 135:5  Warning: Unexpected console statement.  no-console
[21:27:40.449] 151:5  Warning: Unexpected console statement.  no-console
[21:27:40.449] 
[21:27:40.449] ./components/drivers/DriverManagement.tsx
[21:27:40.449] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.449] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.458] 
[21:27:40.459] ./components/logistics/DocumentScanner.tsx
[21:27:40.459] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.459] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.459] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.459] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.460] 
[21:27:40.460] ./components/logistics/LogisticsDocumentUploader.tsx
[21:27:40.460] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.460] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.460] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.460] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.460] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.461] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.461] 95:7  Warning: Unexpected console statement.  no-console
[21:27:40.461] 101:7  Warning: Unexpected console statement.  no-console
[21:27:40.461] 117:7  Warning: Unexpected console statement.  no-console
[21:27:40.461] 
[21:27:40.461] ./components/logistics/ShipmentDataDisplay.tsx
[21:27:40.462] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.462] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.462] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.462] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.462] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.463] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.463] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.463] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.463] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.463] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.463] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.464] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.464] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.464] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.464] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.464] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.465] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.465] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.465] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.465] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.465] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.466] 
[21:27:40.466] ./components/logistics/shipments/ShipmentCardView.tsx
[21:27:40.466] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.466] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.466] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.467] 40:39  Warning: Unexpected console statement.  no-console
[21:27:40.467] 
[21:27:40.467] ./components/logistics/shipments/ShipmentDetailsView.tsx
[21:27:40.467] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.467] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.468] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.468] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.468] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.468] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.468] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.469] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.469] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.469] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.469] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.470] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.470] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.470] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.470] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.472] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.472] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.472] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.472] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.473] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.473] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.473] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.473] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.474] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.475] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.475] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.475] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.475] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.475] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.476] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.476] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.477] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.477] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.477] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.478] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.478] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.478] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.478] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.479] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.479] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.480] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.480] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.480] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.480] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.481] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.482] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.482] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.482] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.483] 58:5  Warning: Unexpected console statement.  no-console
[21:27:40.483] 62:5  Warning: Unexpected console statement.  no-console
[21:27:40.483] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.483] 
[21:27:40.483] ./components/logistics/shipments/ShipmentField.tsx
[21:27:40.484] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.484] 
[21:27:40.484] ./components/logistics/shipments/ShipmentItemsTable.tsx
[21:27:40.484] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.484] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.485] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.485] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.485] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.485] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.485] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.486] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.486] 
[21:27:40.486] ./components/logistics/shipments/ShipmentTableView.tsx
[21:27:40.486] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.486] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.487] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.487] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.487] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.487] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.487] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.488] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.488] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.488] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.488] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.488] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.489] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.490] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.490] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.490] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.490] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.490] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.491] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.491] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.491] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.491] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.491] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.492] 
[21:27:40.492] ./components/main-layout.tsx
[21:27:40.492] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.492] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.492] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.493] 110:21  Warning: Unexpected console statement.  no-console
[21:27:40.493] 117:21  Warning: Unexpected console statement.  no-console
[21:27:40.493] 124:21  Warning: Unexpected console statement.  no-console
[21:27:40.493] 
[21:27:40.493] ./components/map/BasicMapComponent.tsx
[21:27:40.494] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.494] 
[21:27:40.494] ./components/map/DriverInterface.tsx
[21:27:40.494] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.494] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.495] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.495] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.495] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.495] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.495] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.496] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.496] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.496] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.496] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[21:27:40.497] 
[21:27:40.497] ./components/map/FleetOverviewMap.tsx
[21:27:40.497] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.497] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.497] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.497] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.498] 
[21:27:40.498] ./components/map/ShipmentSnapshotMapView.tsx
[21:27:40.498] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.498] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.499] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.499] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.499] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.499] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.499] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.500] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.500] 
[21:27:40.500] ./components/map/SimulationMap.tsx
[21:27:40.500] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.500] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.500] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.501] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.501] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.501] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.501] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.501] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.502] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.502] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.502] 
[21:27:40.502] ./components/map/StaticRouteMap.tsx
[21:27:40.502] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.502] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.503] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.503] 70:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.503] 
[21:27:40.503] ./components/map/TrackingControls.tsx
[21:27:40.503] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.503] 
[21:27:40.503] ./components/map/TrackingMap.tsx
[21:27:40.504] 8:3  Warning: 'ViewStateChangeEvent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.504] 17:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.504] 19:42  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.504] 20:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.504] 25:10  Warning: 'GeoJSONSource' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.505] 26:10  Warning: 'LngLatBounds' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.505] 82:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.505] 89:10  Warning: 'viewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.505] 89:21  Warning: 'setViewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.505] 97:5  Warning: 'trackedShipmentId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.506] 242:6  Warning: React Hook useCallback has missing dependencies: 'addRouteSourceAndLayer' and 'updateOriginDestinationMarkers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[21:27:40.506] 245:9  Warning: 'addVehicleSourceAndLayer' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.506] 429:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.506] 
[21:27:40.506] ./components/sentry-provider.tsx
[21:27:40.507] 29:11  Warning: Unexpected console statement.  no-console
[21:27:40.507] 
[21:27:40.507] ./components/shared/Avatar.tsx
[21:27:40.507] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[21:27:40.507] 
[21:27:40.507] ./components/shared/FileUploader.tsx
[21:27:40.508] 14:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.508] 108:7  Warning: Unexpected console statement.  no-console
[21:27:40.508] 119:7  Warning: Unexpected console statement.  no-console
[21:27:40.508] 124:9  Warning: Unexpected console statement.  no-console
[21:27:40.508] 
[21:27:40.509] ./components/shipment-detail-page.tsx
[21:27:40.509] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.509] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.509] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.509] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.510] 131:5  Warning: Unexpected console statement.  no-console
[21:27:40.510] 137:6  Warning: Unexpected console statement.  no-console
[21:27:40.510] 
[21:27:40.510] ./components/shipments/ShipmentCard.tsx
[21:27:40.510] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.511] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.511] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.511] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.511] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.511] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.512] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.512] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.512] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.512] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.512] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.513] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.513] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.513] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.513] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.514] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.514] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.514] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.514] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.515] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.516] 
[21:27:40.516] ./components/shipments/ShipmentHistory.tsx
[21:27:40.516] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.516] 
[21:27:40.516] ./components/shipments/ShipmentStatusTimeline.tsx
[21:27:40.517] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.517] 
[21:27:40.517] ./components/shipments/ShipmentsTable.tsx
[21:27:40.517] 129:5  Warning: Unexpected console statement.  no-console
[21:27:40.517] 
[21:27:40.517] ./components/simulation/ScenarioSelector.tsx
[21:27:40.519] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.519] 
[21:27:40.519] ./components/simulation/SimulationControls.tsx
[21:27:40.519] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.519] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.520] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.520] 
[21:27:40.520] ./components/ui/custom-select.tsx
[21:27:40.520] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.520] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.521] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.522] 
[21:27:40.522] ./components/ui/dialog.tsx
[21:27:40.522] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.523] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.523] 
[21:27:40.523] ./components/ui/dropdown.tsx
[21:27:40.523] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.523] 
[21:27:40.523] ./components/ui/enhanced-file-upload.tsx
[21:27:40.524] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.524] 
[21:27:40.524] ./components/users/UserManagement.tsx
[21:27:40.524] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.524] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.525] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.525] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.525] 
[21:27:40.525] ./lib/actions/auth.ts
[21:27:40.525] 19:5  Warning: Unexpected console statement.  no-console
[21:27:40.526] 26:5  Warning: Unexpected console statement.  no-console
[21:27:40.526] 60:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.526] 60:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.526] 60:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.526] 64:5  Warning: Unexpected console statement.  no-console
[21:27:40.526] 
[21:27:40.527] ./lib/actions/shipmentActions.ts
[21:27:40.527] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.527] 
[21:27:40.527] ./lib/actions/shipmentUpdateActions.ts
[21:27:40.527] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.527] 
[21:27:40.528] ./lib/actions/simulationActions.ts
[21:27:40.528] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.528] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.528] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.528] 522:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.528] 
[21:27:40.528] ./lib/actions/trackingActions.ts
[21:27:40.529] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.529] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.529] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.529] 446:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.529] 564:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.530] 
[21:27:40.530] ./lib/api.ts
[21:27:40.530] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.530] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.530] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.531] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.532] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.532] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.532] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[21:27:40.532] 
[21:27:40.532] ./lib/auth-client.ts
[21:27:40.533] 16:5  Warning: Unexpected console statement.  no-console
[21:27:40.533] 20:5  Warning: Unexpected console statement.  no-console
[21:27:40.533] 34:5  Warning: Unexpected console statement.  no-console
[21:27:40.533] 43:5  Warning: Unexpected console statement.  no-console
[21:27:40.533] 47:7  Warning: Unexpected console statement.  no-console
[21:27:40.533] 67:5  Warning: Unexpected console statement.  no-console
[21:27:40.534] 83:5  Warning: Unexpected console statement.  no-console
[21:27:40.534] 92:5  Warning: Unexpected console statement.  no-console
[21:27:40.534] 96:7  Warning: Unexpected console statement.  no-console
[21:27:40.534] 
[21:27:40.534] ./lib/auth.ts
[21:27:40.535] 52:11  Warning: Unexpected console statement.  no-console
[21:27:40.535] 58:14  Warning: Unexpected console statement.  no-console
[21:27:40.535] 72:13  Warning: Unexpected console statement.  no-console
[21:27:40.535] 77:9  Warning: Unexpected console statement.  no-console
[21:27:40.535] 107:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.535] 181:7  Warning: 'createBypassAuth' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.536] 195:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.536] 196:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.536] 196:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.536] 196:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.536] 196:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.537] 197:9  Warning: Unexpected console statement.  no-console
[21:27:40.537] 200:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.537] 200:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.537] 200:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.537] 201:9  Warning: Unexpected console statement.  no-console
[21:27:40.538] 
[21:27:40.538] ./lib/context/SimulationStoreContext.tsx
[21:27:40.538] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.538] 
[21:27:40.538] ./lib/database/schema.ts
[21:27:40.539] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.539] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.539] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.539] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.539] 590:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[21:27:40.539] 
[21:27:40.540] ./lib/document-processing.ts
[21:27:40.540] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.540] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.540] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.540] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.541] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.541] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.541] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.541] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.541] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.542] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.542] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.542] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.542] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.543] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.543] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.543] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.543] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.543] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.543] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.544] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.544] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.544] 
[21:27:40.544] ./lib/excel-helper.ts
[21:27:40.544] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.545] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.545] 
[21:27:40.545] ./lib/firebase/clientApp.ts
[21:27:40.545] 31:1  Warning: Unexpected console statement.  no-console
[21:27:40.545] 
[21:27:40.546] ./lib/store/SimulationStoreContext.tsx
[21:27:40.546] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.546] 
[21:27:40.546] ./lib/store/documentStore.ts
[21:27:40.546] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.547] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.547] 
[21:27:40.547] ./lib/store/useLiveTrackingStore.ts
[21:27:40.547] 5:22  Warning: 'MapboxMap' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.547] 
[21:27:40.548] ./lib/store/useSimulationStore.ts
[21:27:40.548] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.548] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.548] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:27:40.548] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:27:40.549] 
[21:27:40.549] ./lib/store/useSimulationStoreContext.ts
[21:27:40.549] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.549] 
[21:27:40.549] ./lib/validations.ts
[21:27:40.550] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[21:27:40.550] 
[21:27:40.550] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[21:27:52.017] Failed to compile.
[21:27:52.018] 
[21:27:52.018] ./lib/hooks/useAuth.ts:76:11
[21:27:52.018] Type error: Type 'import("/vercel/path0/lib/auth").UserRole | null' is not assignable to type 'string'.
[21:27:52.019]   Type 'null' is not assignable to type 'string'.
[21:27:52.019] 
[21:27:52.019] [0m [90m 74 |[39m           id[33m:[39m session[33m.[39muser[33m.[39mid[33m,[39m[0m
[21:27:52.019] [0m [90m 75 |[39m           email[33m:[39m session[33m.[39muser[33m.[39memail[33m,[39m[0m
[21:27:52.019] [0m[31m[1m>[22m[39m[90m 76 |[39m           role[33m:[39m session[33m.[39muser[33m.[39mrole[33m,[39m[0m
[21:27:52.019] [0m [90m    |[39m           [31m[1m^[22m[39m[0m
[21:27:52.019] [0m [90m 77 |[39m           name[33m:[39m session[33m.[39muser[33m.[39mname[0m
[21:27:52.019] [0m [90m 78 |[39m         })[33m;[39m[0m
[21:27:52.019] [0m [90m 79 |[39m       } [36melse[39m {[0m
[21:27:52.057] Next.js build worker exited with code: 1 and signal: null
[21:27:52.075] Error: Command "npm run build" exited with 1
[21:27:52.699] 
[21:27:55.793] Exiting build container