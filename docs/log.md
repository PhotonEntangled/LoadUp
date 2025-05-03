[18:45:10.031] Running build in Washington, D.C., USA (East) – iad1
[18:45:10.066] Cloning github.com/PhotonEntangled/LoadUp (Branch: main, Commit: 6d5c795)
[18:45:10.556] Warning: Failed to fetch one or more git submodules
[18:45:10.557] Cloning completed: 491.000ms
[18:45:14.859] Restored build cache from previous deployment (4u36VtaszwG7hWPdCeorH6RT9NDM)
[18:45:15.807] Running "vercel build"
[18:45:16.207] Vercel CLI 41.7.0
[18:45:16.560] Running "install" command: `npm install`...
[18:45:19.534] 
[18:45:19.535] up to date, audited 1463 packages in 3s
[18:45:19.536] 
[18:45:19.536] 342 packages are looking for funding
[18:45:19.536]   run `npm fund` for details
[18:45:19.568] 
[18:45:19.569] 6 vulnerabilities (5 moderate, 1 high)
[18:45:19.569] 
[18:45:19.569] To address issues that do not require attention, run:
[18:45:19.570]   npm audit fix
[18:45:19.570] 
[18:45:19.570] To address all issues possible (including breaking changes), run:
[18:45:19.570]   npm audit fix --force
[18:45:19.570] 
[18:45:19.571] Some issues need review, and may require choosing
[18:45:19.571] a different dependency.
[18:45:19.571] 
[18:45:19.571] Run `npm audit` for details.
[18:45:19.606] Detected Next.js version: 14.2.28
[18:45:19.607] Running "npm run build"
[18:45:19.722] 
[18:45:19.723] > loadup-admin-dashboard@0.1.0 prebuild
[18:45:19.723] > echo 'Starting build process'
[18:45:19.723] 
[18:45:19.728] Starting build process
[18:45:19.729] 
[18:45:19.729] > loadup-admin-dashboard@0.1.0 build
[18:45:19.729] > next build
[18:45:19.729] 
[18:45:20.497]   ▲ Next.js 14.2.28
[18:45:20.498] 
[18:45:20.528]    Creating an optimized production build ...
[18:45:29.977]  ⚠ Compiled with warnings
[18:45:29.982] 
[18:45:29.983] ./node_modules/keyv/src/index.js
[18:45:29.983] Critical dependency: the request of a dependency is an expression
[18:45:29.983] 
[18:45:29.983] Import trace for requested module:
[18:45:29.983] ./node_modules/keyv/src/index.js
[18:45:29.983] ./node_modules/cacheable-request/src/index.js
[18:45:29.983] ./node_modules/got/dist/source/core/index.js
[18:45:29.983] ./node_modules/got/dist/source/create.js
[18:45:29.983] ./node_modules/got/dist/source/index.js
[18:45:29.983] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-layer.js
[18:45:29.983] ./node_modules/@mapbox/mapbox-sdk/lib/node/node-client.js
[18:45:29.983] ./node_modules/@mapbox/mapbox-sdk/lib/client.js
[18:45:29.983] ./node_modules/@mapbox/mapbox-sdk/services/service-helpers/create-service-factory.js
[18:45:29.983] ./node_modules/@mapbox/mapbox-sdk/services/directions.js
[18:45:29.983] ./app/api/directions/route.ts
[18:45:29.983] 
[18:45:36.676]  ✓ Compiled successfully
[18:45:36.677]    Linting and checking validity of types ...
[18:45:48.366] 
[18:45:48.366] Failed to compile.
[18:45:48.367] 
[18:45:48.367] ./app/api/ai/document-processing/route.ts
[18:45:48.367] 4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.367] 5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.367] 9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.367] 11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.368] 11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.377] 19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.377] 26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.377] 41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.377] 42:3  Warning: Unexpected console statement.  no-console
[18:45:48.377] 63:5  Warning: Unexpected console statement.  no-console
[18:45:48.377] 67:7  Warning: Unexpected console statement.  no-console
[18:45:48.377] 250:5  Warning: Unexpected console statement.  no-console
[18:45:48.377] 273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.378] 279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.378] 349:7  Warning: Unexpected console statement.  no-console
[18:45:48.378] 357:7  Warning: Unexpected console statement.  no-console
[18:45:48.378] 
[18:45:48.378] ./app/api/ai/field-mapping/route.ts
[18:45:48.378] 7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.378] 8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.378] 9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.385] 10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.385] 
[18:45:48.385] ./app/api/ai/image-extraction/route.ts
[18:45:48.385] 3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.385] 
[18:45:48.385] ./app/api/ai/test-connection/route.ts
[18:45:48.385] 3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.385] 5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.385] 56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.386] 60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.386] 
[18:45:48.386] ./app/api/auth/[...nextauth]/options.ts
[18:45:48.386] 1:15  Warning: 'Session' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.386] 8:15  Warning: 'JWT' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.386] 9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.389] 29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.389] 80:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.390] 87:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.390] 98:1  Warning: Unexpected console statement.  no-console
[18:45:48.390] 123:11  Warning: Unexpected console statement.  no-console
[18:45:48.390] 128:9  Warning: Unexpected console statement.  no-console
[18:45:48.390] 129:9  Warning: Unexpected console statement.  no-console
[18:45:48.390] 134:12  Warning: Unexpected console statement.  no-console
[18:45:48.390] 152:12  Warning: Unexpected console statement.  no-console
[18:45:48.390] 156:9  Warning: Unexpected console statement.  no-console
[18:45:48.390] 195:24  Warning: 'user' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.393] 195:30  Warning: 'account' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.396] 195:39  Warning: 'profile' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.396] 195:48  Warning: 'isNewUser' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.397] 196:7  Warning: Unexpected console statement.  no-console
[18:45:48.397] 199:7  Warning: Unexpected console statement.  no-console
[18:45:48.397] 213:7  Warning: Unexpected console statement.  no-console
[18:45:48.397] 218:37  Warning: 'user' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.397] 219:8  Warning: Unexpected console statement.  no-console
[18:45:48.397] 220:8  Warning: Unexpected console statement.  no-console
[18:45:48.397] 222:8  Warning: Unexpected console statement.  no-console
[18:45:48.397] 229:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.397] 230:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.397] 234:11  Warning: Unexpected console statement.  no-console
[18:45:48.397] 234:101  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.397] 234:160  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.397] 236:10  Warning: Unexpected console statement.  no-console
[18:45:48.397] 237:22  Warning: Unexpected console statement.  no-console
[18:45:48.397] 238:29  Warning: Unexpected console statement.  no-console
[18:45:48.397] 
[18:45:48.397] ./app/api/auth/route.ts
[18:45:48.397] 1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.397] 6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.397] 
[18:45:48.398] ./app/api/auth/user/route.ts
[18:45:48.398] 5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.398] 7:5  Warning: Unexpected console statement.  no-console
[18:45:48.398] 14:7  Warning: Unexpected console statement.  no-console
[18:45:48.398] 23:7  Warning: Unexpected console statement.  no-console
[18:45:48.398] 
[18:45:48.398] ./app/api/directions/route.ts
[18:45:48.398] 33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.398] 34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.398] 80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.398] 81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.398] 
[18:45:48.398] ./app/api/documents/[id]/route.ts
[18:45:48.398] 27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.398] 
[18:45:48.399] ./app/api/documents/route.ts
[18:45:48.399] 7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 9:5  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:10  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:16  Warning: 'eq' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:20  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:29  Warning: 'like' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:35  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 17:45  Warning: 'inArray' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 23:10  Warning: 'insertShipmentBundle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 41:6  Warning: 'SelectedDocument' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 52:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.399] 63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.400] 75:10  Warning: 'mapDbShipmentStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.400] 108:10  Warning: 'calculateAggregateStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.400] 179:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.400] 327:7  Error: 'docId' is never reassigned. Use 'const' instead.  prefer-const
[18:45:48.400] 397:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 422:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 428:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 531:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 
[18:45:48.400] ./app/api/documents/upload/route.ts
[18:45:48.400] 46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.400] 106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.401] 141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.401] 
[18:45:48.401] ./app/api/etl/process-shipment-slips/route.ts
[18:45:48.401] 4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.401] 
[18:45:48.401] ./app/api/shipments/[id]/route.ts
[18:45:48.401] 28:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.401] 51:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.401] 
[18:45:48.401] ./app/api/shipments/route.ts
[18:45:48.401] 3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.401] 3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.401] 3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.402] 26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.407] 37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.407] 40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.407] 40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.408] 51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 395:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 
[18:45:48.408] ./app/api/simulation/enqueue-ticks/route.ts
[18:45:48.408] 1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.408] 14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.409] 23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.410] 32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.410] 57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.410] 
[18:45:48.410] ./app/api/simulation/route.ts
[18:45:48.410] 31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.410] 
[18:45:48.410] ./app/api/simulation/shipments/[documentId]/route.ts
[18:45:48.410] 328:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.410] 
[18:45:48.410] ./app/api/simulation/tick-worker/route.ts
[18:45:48.410] 136:21  Warning: 'success' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.410] 
[18:45:48.410] ./app/api/users/route.ts
[18:45:48.410] 4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.410] 
[18:45:48.410] ./app/auth/forgot-password/page.tsx
[18:45:48.411] 5:10  Warning: 'forgotPasswordSchema' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 
[18:45:48.411] ./app/dashboard/map/page.tsx
[18:45:48.411] 3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.411] 107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.412] 116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.412] 123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 
[18:45:48.412] ./app/dashboard/shipments/create/page.tsx
[18:45:48.412] 2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 
[18:45:48.412] ./app/dashboard/shipments/page.tsx
[18:45:48.412] 5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.412] 39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.413] 211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.413] 
[18:45:48.413] ./app/debug/page.tsx
[18:45:48.413] 22:5  Warning: Unexpected console statement.  no-console
[18:45:48.413] 
[18:45:48.413] ./app/documents/page.tsx
[18:45:48.413] 3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 82:5  Warning: Unexpected console statement.  no-console
[18:45:48.414] 90:7  Warning: Unexpected console statement.  no-console
[18:45:48.414] 109:5  Warning: Unexpected console statement.  no-console
[18:45:48.414] 116:7  Warning: Unexpected console statement.  no-console
[18:45:48.414] 124:5  Warning: Unexpected console statement.  no-console
[18:45:48.414] 138:5  Warning: Unexpected console statement.  no-console
[18:45:48.414] 
[18:45:48.414] ./app/documents/scan/page.tsx
[18:45:48.414] 3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.414] 20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.415] 25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.415] 25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.415] 77:5  Warning: Unexpected console statement.  no-console
[18:45:48.415] 88:5  Warning: Unexpected console statement.  no-console
[18:45:48.415] 
[18:45:48.415] ./app/documents/view/[id]/page.tsx
[18:45:48.415] 7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.415] 7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.415] 7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.415] 12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.415] 13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.416] 14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.416] 75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.416] 92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.416] 128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.416] 
[18:45:48.418] ./app/page.tsx
[18:45:48.418] 6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.419] 
[18:45:48.419] ./app/shipments/[documentid]/page.tsx
[18:45:48.419] 10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.428] 16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.429] 24:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.429] 28:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.429] 281:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.429] 422:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.429] 423:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.429] 
[18:45:48.429] ./app/simulation/[documentId]/page.tsx
[18:45:48.429] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.429] 13:10  Warning: 'useSimulationStoreContext' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.429] 15:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 16:58  Warning: 'stopSimulation' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 24:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 106:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.430] 180:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.430] 271:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.430] 341:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.430] 
[18:45:48.430] ./app/simulation/page.tsx
[18:45:48.430] 3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.430] 85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.430] 
[18:45:48.431] ./app/tracking/[documentId]/_components/TrackingPageView.tsx
[18:45:48.431] 5:34  Warning: 'ApiAddressDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.431] 5:52  Warning: 'ApiShipmentCoreInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.431] 6:15  Warning: 'StaticTrackingDetails' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.431] 7:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.431] 118:127  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.431] 127:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.431] 170:90  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.431] 207:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.431] 233:92  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.431] 
[18:45:48.431] ./app/tracking/[documentId]/page.tsx
[18:45:48.431] 13:48  Warning: 'searchParams' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.432] 
[18:45:48.432] ./components/document-page.tsx
[18:45:48.432] 17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.432] 71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.432] 71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.432] 75:5  Warning: Unexpected console statement.  no-console
[18:45:48.432] 85:7  Warning: Unexpected console statement.  no-console
[18:45:48.432] 110:5  Warning: Unexpected console statement.  no-console
[18:45:48.432] 124:9  Warning: Unexpected console statement.  no-console
[18:45:48.432] 135:5  Warning: Unexpected console statement.  no-console
[18:45:48.432] 151:5  Warning: Unexpected console statement.  no-console
[18:45:48.432] 
[18:45:48.433] ./components/drivers/DriverManagement.tsx
[18:45:48.433] 53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.433] 55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.433] 
[18:45:48.433] ./components/logistics/DocumentScanner.tsx
[18:45:48.433] 12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.433] 26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.433] 94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.433] 245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.433] 
[18:45:48.433] ./components/logistics/LogisticsDocumentUploader.tsx
[18:45:48.434] 4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 87:7  Warning: Unexpected console statement.  no-console
[18:45:48.434] 93:7  Warning: Unexpected console statement.  no-console
[18:45:48.434] 109:7  Warning: Unexpected console statement.  no-console
[18:45:48.434] 
[18:45:48.434] ./components/logistics/ShipmentDataDisplay.tsx
[18:45:48.434] 5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.434] 22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.435] 57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.435] 58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.435] 63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.435] 68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.435] 77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.435] 241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.435] 252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.436] 281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.436] 
[18:45:48.436] ./components/logistics/shipments/ShipmentCardView.tsx
[18:45:48.436] 17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.436] 19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.436] 38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.436] 40:39  Warning: Unexpected console statement.  no-console
[18:45:48.437] 
[18:45:48.438] ./components/logistics/shipments/ShipmentDetailsView.tsx
[18:45:48.438] 4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.438] 8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.439] 13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.440] 26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.441] 58:5  Warning: Unexpected console statement.  no-console
[18:45:48.441] 62:5  Warning: Unexpected console statement.  no-console
[18:45:48.442] 69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.442] 
[18:45:48.442] ./components/logistics/shipments/ShipmentField.tsx
[18:45:48.442] 28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.442] 
[18:45:48.442] ./components/logistics/shipments/ShipmentItemsTable.tsx
[18:45:48.442] 5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.442] 5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.442] 5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.442] 5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.442] 5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.452] 5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.452] 9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.452] 10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.452] 
[18:45:48.452] ./components/logistics/shipments/ShipmentTableView.tsx
[18:45:48.452] 3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.452] 3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.453] 28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.454] 79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.454] 122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.455] 135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.455] 211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.455] 363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.455] 
[18:45:48.455] ./components/main-layout.tsx
[18:45:48.455] 12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.455] 12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.455] 12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.455] 110:21  Warning: Unexpected console statement.  no-console
[18:45:48.455] 117:21  Warning: Unexpected console statement.  no-console
[18:45:48.456] 124:21  Warning: Unexpected console statement.  no-console
[18:45:48.456] 
[18:45:48.456] ./components/map/BasicMapComponent.tsx
[18:45:48.456] 1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.456] 
[18:45:48.456] ./components/map/DriverInterface.tsx
[18:45:48.456] 6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.456] 95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.456] 96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.456] 113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[18:45:48.457] 
[18:45:48.457] ./components/map/FleetOverviewMap.tsx
[18:45:48.457] 6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.457] 54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.458] 88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.458] 183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.458] 
[18:45:48.458] ./components/map/ShipmentSnapshotMapView.tsx
[18:45:48.458] 3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.458] 53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.458] 55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.458] 89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.458] 137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.458] 291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.459] 304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.459] 306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.459] 
[18:45:48.459] ./components/map/SimulationMap.tsx
[18:45:48.459] 4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.459] 186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.459] 260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.459] 265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.459] 279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.459] 
[18:45:48.460] ./components/map/StaticRouteMap.tsx
[18:45:48.460] 3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 21:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 22:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 70:20  Warning: 'map' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 
[18:45:48.460] ./components/map/TrackingControls.tsx
[18:45:48.460] 4:10  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 
[18:45:48.460] ./components/map/TrackingMap.tsx
[18:45:48.460] 8:3  Warning: 'ViewStateChangeEvent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 17:10  Warning: 'LiveVehicleUpdate' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.460] 19:42  Warning: 'LineString' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 20:22  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 25:10  Warning: 'GeoJSONSource' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 26:10  Warning: 'LngLatBounds' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 82:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.461] 89:10  Warning: 'viewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 89:21  Warning: 'setViewState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 97:5  Warning: 'trackedShipmentId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 242:6  Warning: React Hook useCallback has missing dependencies: 'addRouteSourceAndLayer' and 'updateOriginDestinationMarkers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[18:45:48.461] 245:9  Warning: 'addVehicleSourceAndLayer' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.461] 429:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.461] 
[18:45:48.462] ./components/sentry-provider.tsx
[18:45:48.462] 29:11  Warning: Unexpected console statement.  no-console
[18:45:48.462] 
[18:45:48.462] ./components/shared/Avatar.tsx
[18:45:48.462] 49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[18:45:48.462] 
[18:45:48.462] ./components/shipment-detail-page.tsx
[18:45:48.462] 4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.462] 24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.462] 86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.463] 122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 131:5  Warning: Unexpected console statement.  no-console
[18:45:48.463] 137:6  Warning: Unexpected console statement.  no-console
[18:45:48.463] 
[18:45:48.463] ./components/shipments/ShipmentCard.tsx
[18:45:48.463] 2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.463] 2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.464] 11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.465] 11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.465] 11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.465] 11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.465] 14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 43:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 46:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 
[18:45:48.466] ./components/shipments/ShipmentHistory.tsx
[18:45:48.466] 21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.466] 
[18:45:48.466] ./components/shipments/ShipmentStatusTimeline.tsx
[18:45:48.466] 27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.467] 
[18:45:48.467] ./components/shipments/ShipmentsTable.tsx
[18:45:48.467] 129:5  Warning: Unexpected console statement.  no-console
[18:45:48.467] 
[18:45:48.467] ./components/simulation/ScenarioSelector.tsx
[18:45:48.467] 4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.467] 
[18:45:48.467] ./components/simulation/SimulationControls.tsx
[18:45:48.467] 9:48  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.467] 9:55  Warning: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.467] 15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.467] 
[18:45:48.467] ./components/ui/custom-select.tsx
[18:45:48.468] 4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.468] 12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.468] 13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.468] 
[18:45:48.468] ./components/ui/dialog.tsx
[18:45:48.468] 12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.468] 12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.468] 
[18:45:48.468] ./components/ui/dropdown.tsx
[18:45:48.472] 3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.472] 
[18:45:48.472] ./components/ui/enhanced-file-upload.tsx
[18:45:48.472] 5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.472] 
[18:45:48.473] ./components/users/UserManagement.tsx
[18:45:48.473] 9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.473] 18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.473] 18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.473] 22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.473] 
[18:45:48.473] ./lib/actions/auth.ts
[18:45:48.473] 20:5  Warning: Unexpected console statement.  no-console
[18:45:48.473] 27:5  Warning: Unexpected console statement.  no-console
[18:45:48.473] 57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 61:5  Warning: Unexpected console statement.  no-console
[18:45:48.474] 
[18:45:48.474] ./lib/actions/shipmentActions.ts
[18:45:48.474] 13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 
[18:45:48.474] ./lib/actions/shipmentUpdateActions.ts
[18:45:48.474] 32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 
[18:45:48.474] ./lib/actions/simulationActions.ts
[18:45:48.474] 4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.474] 20:33  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.475] 21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.475] 522:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.475] 
[18:45:48.475] ./lib/actions/trackingActions.ts
[18:45:48.475] 6:3  Warning: 'shipmentStatusEnum' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.475] 20:5  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.475] 34:39  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.475] 446:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.475] 564:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.475] 
[18:45:48.475] ./lib/api.ts
[18:45:48.475] 39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.476] 94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export
[18:45:48.476] 
[18:45:48.477] ./lib/auth-client.ts
[18:45:48.477] 16:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 20:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 34:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 43:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 47:7  Warning: Unexpected console statement.  no-console
[18:45:48.477] 67:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 83:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 92:5  Warning: Unexpected console statement.  no-console
[18:45:48.477] 96:7  Warning: Unexpected console statement.  no-console
[18:45:48.477] 
[18:45:48.477] ./lib/auth.ts
[18:45:48.477] 48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.478] 48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.478] 48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 49:9  Warning: Unexpected console statement.  no-console
[18:45:48.478] 53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.478] 53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 54:9  Warning: Unexpected console statement.  no-console
[18:45:48.478] 63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.478] 64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.479] 69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 
[18:45:48.479] ./lib/context/SimulationStoreContext.tsx
[18:45:48.479] 3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 
[18:45:48.479] ./lib/database/schema.ts
[18:45:48.479] 2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.479] 590:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
[18:45:48.479] 
[18:45:48.480] ./lib/document-processing.ts
[18:45:48.480] 8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.480] 156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.480] 177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.480] 292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.480] 309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.481] 324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.481] 326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.481] 330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.481] 360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.481] 
[18:45:48.481] ./lib/excel-helper.ts
[18:45:48.481] 63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.482] 70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.482] 
[18:45:48.482] ./lib/firebase/clientApp.ts
[18:45:48.482] 31:1  Warning: Unexpected console statement.  no-console
[18:45:48.482] 
[18:45:48.482] ./lib/store/SimulationStoreContext.tsx
[18:45:48.482] 6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.482] 
[18:45:48.482] ./lib/store/documentStore.ts
[18:45:48.482] 72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.482] 120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.482] 
[18:45:48.482] ./lib/store/useLiveTrackingStore.ts
[18:45:48.482] 5:22  Warning: 'MapboxMap' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.483] 
[18:45:48.483] ./lib/store/useSimulationStore.ts
[18:45:48.483] 92:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.483] 226:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.483] 226:93  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[18:45:48.483] 507:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[18:45:48.483] 
[18:45:48.483] ./lib/store/useSimulationStoreContext.ts
[18:45:48.484] 4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.484] 
[18:45:48.484] ./lib/validations.ts
[18:45:48.485] 2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
[18:45:48.485] 
[18:45:48.485] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
[18:45:48.497] Error: Command "npm run build" exited with 1
[18:45:49.138] 
[18:45:52.266] Exiting build container