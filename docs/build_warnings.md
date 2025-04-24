# Build Warnings Log (as of commit 3c0417f)

This document lists the warnings encountered during the `npm run build` process after fixing critical build errors. These should be addressed eventually but are not currently blocking the build.

```
./app/api/ai/document-processing/route.ts
4:10  Warning: 'shipmentsErd' is defined but never used.  @typescript-eslint/no-unused-vars
5:14  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
11:15  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
11:34  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
19:7  Warning: 'openAiService' is assigned a value but never used.  @typescript-eslint/no-unused-vars
26:10  Warning: 'bufferToArrayBuffer' is defined but never used.  @typescript-eslint/no-unused-vars
41:80  Warning: 'options' is assigned a value but never used.  @typescript-eslint/no-unused-vars
42:3  Warning: Unexpected console statement.  no-console
63:5  Warning: Unexpected console statement.  no-console
67:7  Warning: Unexpected console statement.  no-console
250:5  Warning: Unexpected console statement.  no-console
273:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
279:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
349:7  Warning: Unexpected console statement.  no-console
357:7  Warning: Unexpected console statement.  no-console

./app/api/ai/field-mapping/route.ts
7:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'ERD_SCHEMA_FIELDS' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Warning: 'FieldMappingResult' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/ai/image-extraction/route.ts
3:10  Warning: 'openAIService' is defined but never used.  @typescript-eslint/no-unused-vars

./app/api/ai/test-connection/route.ts
3:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
5:27  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
56:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
60:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/auth/login/route.ts
3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
34:5  Warning: Unexpected console statement.  no-console
59:5  Warning: Unexpected console statement.  no-console
77:23  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
90:5  Warning: Unexpected console statement.  no-console

./app/api/auth/logout/route.ts
4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
6:5  Warning: Unexpected console statement.  no-console
12:5  Warning: Unexpected console statement.  no-console

./app/api/auth/route.ts
1:10  Warning: 'getServerSession' is defined but never used.  @typescript-eslint/no-unused-vars
6:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./app/api/auth/signout/route.ts
4:28  Warning: 'req' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./app/api/auth/user/route.ts
5:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
7:5  Warning: Unexpected console statement.  no-console
14:7  Warning: Unexpected console statement.  no-console
23:7  Warning: Unexpected console statement.  no-console

./app/api/auth/[...nextauth]/options.ts
9:15  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
29:7  Warning: 'hasAccess' is assigned a value but never used.  @typescript-eslint/no-unused-vars
70:7  Warning: 'loginSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars
77:11  Warning: 'CustomUser' is defined but never used.  @typescript-eslint/no-unused-vars
103:11  Warning: Unexpected console statement.  no-console
113:12  Warning: Unexpected console statement.  no-console
117:9  Warning: Unexpected console statement.  no-console
148:9  Warning: Unexpected console statement.  no-console

./app/api/directions/route.ts
33:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
34:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
81:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/documents/route.ts
7:5  Warning: 'addresses' is defined but never used.  @typescript-eslint/no-unused-vars
17:25  Warning: 'or' is defined but never used.  @typescript-eslint/no-unused-vars
17:40  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
24:29  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
28:15  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
63:10  Warning: 'mapDbStatusToSummary' is defined but never used.  @typescript-eslint/no-unused-vars
192:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
301:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
418:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
443:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
449:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
497:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
546:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/documents/upload/route.ts
46:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
61:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
82:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
106:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
141:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/documents/[id]/route.ts
27:11  Warning: 'deleteResult' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/api/etl/process-shipment-slips/route.ts
4:28  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./app/api/shipments/route.ts
3:41  Warning: 'asc' is defined but never used.  @typescript-eslint/no-unused-vars
3:51  Warning: 'SQL' is defined but never used.  @typescript-eslint/no-unused-vars
3:56  Warning: 'desc' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'documents' is defined but never used.  @typescript-eslint/no-unused-vars
4:126  Warning: 'users' is defined but never used.  @typescript-eslint/no-unused-vars
5:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Warning: 'ApiTransporterInfo' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Warning: 'ApiTripRate' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'ApiBillingInfo' is defined but never used.  @typescript-eslint/no-unused-vars
18:3  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
20:3  Warning: 'ApiShipmentItemDimension' is defined but never used.  @typescript-eslint/no-unused-vars
23:3  Warning: 'ApiPickupDropoffInfo' is defined but never used.  @typescript-eslint/no-unused-vars
26:10  Warning: 'sql' is defined but never used.  @typescript-eslint/no-unused-vars
37:6  Warning: 'ShipmentLink' is defined but never used.  @typescript-eslint/no-unused-vars
40:6  Warning: 'FetchedShipment' is defined but never used.  @typescript-eslint/no-unused-vars
40:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:6  Warning: 'FetchedShipmentWithDetails' is defined but never used.  @typescript-eslint/no-unused-vars
72:6  Warning: 'Trip' is defined but never used.  @typescript-eslint/no-unused-vars
113:11  Warning: 'relatedBooking' is assigned a value but never used.  @typescript-eslint/no-unused-vars
394:9  Warning: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/api/shipments/[id]/route.ts
3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
10:7  Warning: 'updateShipmentSchema' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/api/simulation/enqueue-ticks/route.ts
1:10  Warning: 'NextRequest' is defined but never used.  @typescript-eslint/no-unused-vars
2:10  Warning: 'Client' is defined but never used.  @typescript-eslint/no-unused-vars
5:15  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Warning: 'qstashClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars
23:6  Warning: 'ProcessingOutcome' is defined but never used.  @typescript-eslint/no-unused-vars
32:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
57:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/simulation/route.ts
31:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/simulation/shipments/[documentId]/route.ts
323:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/api/users/route.ts
4:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars

./app/auth/sign-in/page.tsx
13:5  Warning: Unexpected console statement.  no-console
14:6  Warning: React Hook useEffect has a missing dependency: 'userType'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
24:5  Warning: Unexpected console statement.  no-console

./app/auth/sign-up/page.tsx
5:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars

./app/auth/_components/AuthForm.tsx
5:10  Warning: 'zodResolver' is defined but never used.  @typescript-eslint/no-unused-vars
6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
20:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
21:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:27  Warning: 'data' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
26:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:3  Warning: 'schema' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
49:15  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
60:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
66:9  Warning: Unexpected console statement.  no-console
71:9  Warning: Unexpected console statement.  no-console
77:11  Warning: Unexpected console statement.  no-console
81:9  Warning: Unexpected console statement.  no-console
83:11  Warning: Unexpected console statement.  no-console
85:13  Warning: Unexpected console statement.  no-console
91:13  Warning: Unexpected console statement.  no-console
94:13  Warning: Unexpected console statement.  no-console
98:9  Warning: Unexpected console statement.  no-console
110:9  Warning: Unexpected console statement.  no-console
115:9  Warning: Unexpected console statement.  no-console

./app/dashboard/customer/success/page.tsx
10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/dashboard/driver/success/page.tsx
10:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/dashboard/map/page.tsx
3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
5:8  Warning: 'mapboxgl' is defined but never used.  @typescript-eslint/no-unused-vars
14:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
15:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
16:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
16:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
16:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
16:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
19:6  Warning: 'VehicleType' is defined but never used.  @typescript-eslint/no-unused-vars
39:7  Warning: 'VehicleStatusSummary' is assigned a value but never used.  @typescript-eslint/no-unused-vars
107:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
116:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
123:9  Warning: 'handleMapError' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/dashboard/shipments/create/page.tsx
2:10  Warning: 'useForm' is defined but never used.  @typescript-eslint/no-unused-vars
2:19  Warning: 'Controller' is defined but never used.  @typescript-eslint/no-unused-vars
2:31  Warning: 'SubmitHandler' is defined but never used.  @typescript-eslint/no-unused-vars
3:10  Warning: 'auth' is defined but never used.  @typescript-eslint/no-unused-vars
3:16  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars

./app/dashboard/shipments/page.tsx
5:31  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
19:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
31:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
36:33  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
39:10  Warning: 'ShipmentTableView' is defined but never used.  @typescript-eslint/no-unused-vars
40:10  Warning: 'ShipmentCardView' is defined but never used.  @typescript-eslint/no-unused-vars
41:10  Warning: 'ShipmentData' is defined but never used.  @typescript-eslint/no-unused-vars
42:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
42:16  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
42:26  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
42:39  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
211:6  Warning: React Hook useEffect has a missing dependency: 'fetchShipments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./app/debug/page.tsx
22:5  Warning: Unexpected console statement.  no-console

./app/documents/page.tsx
3:38  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
5:3  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
9:3  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
10:3  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
11:3  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
12:3  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
13:3  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
82:5  Warning: Unexpected console statement.  no-console
90:7  Warning: Unexpected console statement.  no-console
109:5  Warning: Unexpected console statement.  no-console
116:7  Warning: Unexpected console statement.  no-console
124:5  Warning: Unexpected console statement.  no-console
138:5  Warning: Unexpected console statement.  no-console

./app/documents/scan/page.tsx
3:20  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
11:8  Warning: 'DocumentScanner' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'LogisticsDocumentUploaderRef' is defined but never used.  @typescript-eslint/no-unused-vars
20:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
25:9  Warning: 'handleScanComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
25:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
77:5  Warning: Unexpected console statement.  no-console
88:5  Warning: Unexpected console statement.  no-console

./app/documents/view/[id]/page.tsx
7:40  Warning: 'Share2' is defined but never used.  @typescript-eslint/no-unused-vars
7:48  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
7:62  Warning: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
13:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
14:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
75:11  Warning: 'csvData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
92:11  Warning: 'headers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
128:11  Warning: 'jsonUri' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/page.tsx
6:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars

./app/shipments/[documentid]/page.tsx
10:10  Warning: 'notFound' is defined but never used.  @typescript-eslint/no-unused-vars
16:15  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars
23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
50:12  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
260:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
284:9  Warning: Unexpected console statement.  no-console
288:11  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
409:11  Warning: 'originCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
410:11  Warning: 'destinationCoords' is assigned a value but never used.  @typescript-eslint/no-unused-vars
574:45  Warning: Unexpected console statement.  no-console

./app/simulation/page.tsx
3:35  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
3:48  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'SimulatedVehicle' is defined but never used.  @typescript-eslint/no-unused-vars
85:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/simulation/[documentId]/page.tsx
3:46  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
13:8  Warning: 'ShipmentCard' is defined but never used.  @typescript-eslint/no-unused-vars
35:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
96:6  Warning: React Hook useEffect has missing dependencies: 'selectedVehicle' and 'startGlobalSimulation'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
170:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
239:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
297:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/tracking/test-combined/_page.tsx
81:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:3  Warning: Unexpected console statement.  no-console
100:3  Warning: 'selectedVehicleId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
104:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
106:3  Warning: Unexpected console statement.  no-console
132:3  Warning: Unexpected console statement.  no-console
137:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
140:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
145:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
146:5  Warning: Unexpected console statement.  no-console

./app/tracking/test-new-map/_page.tsx
9:10  Warning: 'StabilizedVehicleTrackingProvider' is defined but never used.  @typescript-eslint/no-unused-vars
69:3  Warning: Unexpected console statement.  no-console
92:3  Warning: Unexpected console statement.  no-console
99:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/tracking/test-vehicle-list/_page.tsx
69:3  Warning: Unexpected console statement.  no-console
73:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
77:9  Warning: 'handleError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
82:53  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
83:5  Warning: Unexpected console statement.  no-console

./app/tracking-stabilized/page.tsx
3:27  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
3:38  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
3:51  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars
3:59  Warning: 'useLayoutEffect' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'Metadata' is defined but never used.  @typescript-eslint/no-unused-vars
9:8  Warning: 'dynamic' is defined but never used.  @typescript-eslint/no-unused-vars
202:24  Warning: 'setNotification' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/AuthForm.tsx
11:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars
13:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
14:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
15:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
16:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
18:7  Warning: 'FIELD_NAMES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
26:7  Warning: 'FIELD_TYPES' is assigned a value but never used.  @typescript-eslint/no-unused-vars
59:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
68:9  Warning: Unexpected console statement.  no-console
76:9  Warning: Unexpected console statement.  no-console
87:11  Warning: Unexpected console statement.  no-console
94:9  Warning: Unexpected console statement.  no-console
96:11  Warning: Unexpected console statement.  no-console
99:13  Warning: Unexpected console statement.  no-console
107:13  Warning: Unexpected console statement.  no-console
111:13  Warning: Unexpected console statement.  no-console
116:9  Warning: Unexpected console statement.  no-console

./components/document-page.tsx
17:3  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
71:10  Warning: 'documentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
71:28  Warning: 'setDocumentToDelete' is assigned a value but never used.  @typescript-eslint/no-unused-vars
75:5  Warning: Unexpected console statement.  no-console
85:7  Warning: Unexpected console statement.  no-console
110:5  Warning: Unexpected console statement.  no-console
124:9  Warning: Unexpected console statement.  no-console
135:5  Warning: Unexpected console statement.  no-console
151:5  Warning: Unexpected console statement.  no-console

./components/drivers/DriverManagement.tsx
53:19  Warning: 'setDrivers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
55:11  Warning: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/logistics/DocumentScanner.tsx
12:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
245:84  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/logistics/LogisticsDocumentUploader.tsx
4:15  Warning: 'ForwardedRef' is defined but never used.  @typescript-eslint/no-unused-vars
11:29  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
11:43  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
11:59  Warning: 'SourceInfo' is defined but never used.  @typescript-eslint/no-unused-vars
11:71  Warning: 'ParsingMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
11:88  Warning: 'AIMappedField' is defined but never used.  @typescript-eslint/no-unused-vars
87:7  Warning: Unexpected console statement.  no-console
93:7  Warning: Unexpected console statement.  no-console
109:7  Warning: Unexpected console statement.  no-console

./components/logistics/ShipmentDataDisplay.tsx
5:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
24:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
26:3  Warning: 'PlusSquare' is defined but never used.  @typescript-eslint/no-unused-vars
31:3  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
36:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
36:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
57:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
58:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:3  Warning: 'onCreateShipment' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
68:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
77:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
241:43  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
252:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
275:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
281:9  Warning: 'getEstimatedDeliveryTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
281:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
311:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
367:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
393:48  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
459:9  Warning: 'formatTimestamp' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/logistics/shipments/ShipmentCardView.tsx
17:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
19:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
38:35  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
40:39  Warning: Unexpected console statement.  no-console

./components/logistics/shipments/ShipmentDetailsView.tsx
4:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
4:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
4:46  Warning: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
4:58  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
4:70  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
5:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
6:10  Warning: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
7:10  Warning: 'Label' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
8:18  Warning: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
8:33  Warning: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
8:45  Warning: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
8:60  Warning: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
13:10  Warning: 'Tooltip' is defined but never used.  @typescript-eslint/no-unused-vars
13:19  Warning: 'TooltipContent' is defined but never used.  @typescript-eslint/no-unused-vars
13:35  Warning: 'TooltipProvider' is defined but never used.  @typescript-eslint/no-unused-vars
13:52  Warning: 'TooltipTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
14:39  Warning: 'ShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
15:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
16:10  Warning: 'ShipmentItemsTable' is defined but never used.  @typescript-eslint/no-unused-vars
17:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
19:10  Warning: 'formatDate' is defined but never used.  @typescript-eslint/no-unused-vars
21:3  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
23:3  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
24:3  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
25:3  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
26:3  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
27:3  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
28:3  Warning: 'Hash' is defined but never used.  @typescript-eslint/no-unused-vars
29:3  Warning: 'Tag' is defined but never used.  @typescript-eslint/no-unused-vars
30:3  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
31:3  Warning: 'Mail' is defined but never used.  @typescript-eslint/no-unused-vars
32:3  Warning: 'Globe' is defined but never used.  @typescript-eslint/no-unused-vars
33:3  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
34:3  Warning: 'Ruler' is defined but never used.  @typescript-eslint/no-unused-vars
35:3  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
47:10  Warning: 'isExpanded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
49:9  Warning: 'getAIMappedField' is assigned a value but never used.  @typescript-eslint/no-unused-vars
53:9  Warning: 'handleToggleExpand' is assigned a value but never used.  @typescript-eslint/no-unused-vars
58:5  Warning: Unexpected console statement.  no-console
62:5  Warning: Unexpected console statement.  no-console
69:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/logistics/shipments/ShipmentField.tsx
28:3  Warning: 'showAIIndicator' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/logistics/shipments/ShipmentItemsTable.tsx
5:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
5:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
5:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
5:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
5:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
5:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars

./components/logistics/shipments/ShipmentTableView.tsx
3:27  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
3:36  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
5:3  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
6:3  Warning: 'TableCaption' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Warning: 'Checkbox' is defined but never used.  @typescript-eslint/no-unused-vars
10:33  Warning: 'ChevronRight' is defined but never used.  @typescript-eslint/no-unused-vars
10:53  Warning: 'FileCheck' is defined but never used.  @typescript-eslint/no-unused-vars
10:64  Warning: 'ArrowUpToLine' is defined but never used.  @typescript-eslint/no-unused-vars
10:90  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
10:124  Warning: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
10:137  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
25:44  Warning: 'LocationDetail' is defined but never used.  @typescript-eslint/no-unused-vars
26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
27:10  Warning: 'AIMappingLabel' is defined but never used.  @typescript-eslint/no-unused-vars
28:10  Warning: 'useQueryClient' is defined but never used.  @typescript-eslint/no-unused-vars
29:10  Warning: 'Dialog' is defined but never used.  @typescript-eslint/no-unused-vars
29:18  Warning: 'DialogContent' is defined but never used.  @typescript-eslint/no-unused-vars
29:33  Warning: 'DialogHeader' is defined but never used.  @typescript-eslint/no-unused-vars
29:47  Warning: 'DialogTitle' is defined but never used.  @typescript-eslint/no-unused-vars
29:60  Warning: 'DialogDescription' is defined but never used.  @typescript-eslint/no-unused-vars
29:79  Warning: 'DialogFooter' is defined but never used.  @typescript-eslint/no-unused-vars
72:3  Warning: 'onSelectItem' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
79:10  Warning: 'isDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
79:29  Warning: 'setIsDetailModalOpen' is assigned a value but never used.  @typescript-eslint/no-unused-vars
98:9  Warning: 'toggleItems' is assigned a value but never used.  @typescript-eslint/no-unused-vars
122:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
135:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
211:9  Warning: 'isSelected' is assigned a value but never used.  @typescript-eslint/no-unused-vars
363:53  Warning: 'fieldIndex' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./components/main-layout.tsx
12:10  Warning: 'SheetTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
12:24  Warning: 'SheetContent' is defined but never used.  @typescript-eslint/no-unused-vars
12:38  Warning: 'Sheet' is defined but never used.  @typescript-eslint/no-unused-vars
110:21  Warning: Unexpected console statement.  no-console
117:21  Warning: Unexpected console statement.  no-console
124:21  Warning: Unexpected console statement.  no-console

./components/map/BasicMapComponent.tsx
1:17  Warning: 'useRef' is defined but never used.  @typescript-eslint/no-unused-vars

./components/map/DriverInterface.tsx
6:8  Warning: 'MapboxMarker' is defined but never used.  @typescript-eslint/no-unused-vars
95:3  Warning: 'driverId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
96:3  Warning: 'shipmentId' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
113:35  Warning: 'setCurrentLocationOverride' is assigned a value but never used.  @typescript-eslint/no-unused-vars
121:10  Warning: 'routeSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
127:21  Warning: 'storeSelectedStopId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
129:5  Warning: 'storeRouteStops' is assigned a value but never used.  @typescript-eslint/no-unused-vars
131:20  Warning: 'storeRouteSegments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
135:5  Warning: 'activeShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
136:5  Warning: 'setActiveShipment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
226:6  Warning: React Hook useEffect has a missing dependency: 'onError'. Either include it or remove the dependency array. If 'onError' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps

./components/map/FleetOverviewMap.tsx
6:28  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars
54:3  Warning: 'showFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars
88:9  Warning: 'selectedVehicle' is assigned a value but never used.  @typescript-eslint/no-unused-vars
183:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicleId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/map/ShipmentSnapshotMapView.tsx
3:19  Warning: 'ShipmentStop' is defined but never used.  @typescript-eslint/no-unused-vars
53:10  Warning: 'isMapLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
55:22  Warning: 'setCurrentEta' is assigned a value but never used.  @typescript-eslint/no-unused-vars
89:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
137:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
291:29  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
304:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
306:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/map/SimulationMap.tsx
4:20  Warning: 'LngLatBoundsLike' is defined but never used.  @typescript-eslint/no-unused-vars
12:3  Warning: 'Source' is defined but never used.  @typescript-eslint/no-unused-vars
13:3  Warning: 'Layer' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Warning: 'Popup' is defined but never used.  @typescript-eslint/no-unused-vars
24:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars
123:9  Warning: 'STROBE_COLOR' is assigned a value but never used.  @typescript-eslint/no-unused-vars
186:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
260:81  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
265:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
279:6  Warning: React Hook useEffect has a missing dependency: 'selectedVehicle.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/map/StaticRouteMap.tsx
3:46  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
20:10  Warning: 'cn' is defined but never used.  @typescript-eslint/no-unused-vars

./components/sentry-provider.tsx
29:11  Warning: Unexpected console statement.  no-console

./components/shared/Avatar.tsx
49:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/shipment-detail-page.tsx
4:10  Warning: 'useParams' is defined but never used.  @typescript-eslint/no-unused-vars
24:10  Warning: 'expandedCards' is assigned a value but never used.  @typescript-eslint/no-unused-vars
86:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
122:9  Warning: 'toggleCardExpansion' is assigned a value but never used.  @typescript-eslint/no-unused-vars
131:5  Warning: Unexpected console statement.  no-console
137:6  Warning: Unexpected console statement.  no-console

./components/shipments/ShipmentCard.tsx
2:84  Warning: 'Package' is defined but never used.  @typescript-eslint/no-unused-vars
2:93  Warning: 'Truck' is defined but never used.  @typescript-eslint/no-unused-vars
2:100  Warning: 'MoreHorizontal' is defined but never used.  @typescript-eslint/no-unused-vars
2:116  Warning: 'Info' is defined but never used.  @typescript-eslint/no-unused-vars
2:122  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
2:135  Warning: 'ChevronUp' is defined but never used.  @typescript-eslint/no-unused-vars
2:146  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
2:152  Warning: 'Phone' is defined but never used.  @typescript-eslint/no-unused-vars
4:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
4:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
4:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
4:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
11:10  Warning: 'Table' is defined but never used.  @typescript-eslint/no-unused-vars
11:17  Warning: 'TableBody' is defined but never used.  @typescript-eslint/no-unused-vars
11:28  Warning: 'TableCell' is defined but never used.  @typescript-eslint/no-unused-vars
11:39  Warning: 'TableHead' is defined but never used.  @typescript-eslint/no-unused-vars
11:50  Warning: 'TableHeader' is defined but never used.  @typescript-eslint/no-unused-vars
11:63  Warning: 'TableRow' is defined but never used.  @typescript-eslint/no-unused-vars
14:52  Warning: 'ApiShipmentItem' is defined but never used.  @typescript-eslint/no-unused-vars
14:69  Warning: 'ApiOtherCharge' is defined but never used.  @typescript-eslint/no-unused-vars
15:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
16:10  Warning: 'ShipmentField' is defined but never used.  @typescript-eslint/no-unused-vars
24:3  Warning: 'Accordion' is defined but never used.  @typescript-eslint/no-unused-vars
42:6  Warning: 'ResolutionMethodType' is defined but never used.  @typescript-eslint/no-unused-vars
45:7  Warning: 'ResolutionIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/shipments/ShipmentHistory.tsx
21:17  Warning: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/shipments/ShipmentsTable.tsx
129:5  Warning: Unexpected console statement.  no-console

./components/shipments/ShipmentStatusTimeline.tsx
27:31  Warning: 'index' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./components/simulation/ScenarioSelector.tsx
4:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars

./components/simulation/SimulationControls.tsx
15:10  Warning: 'VehicleStatus' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/custom-select.tsx
4:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
12:3  Warning: 'SelectGroup' is defined but never used.  @typescript-eslint/no-unused-vars
13:3  Warning: 'SelectLabel' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/dialog.tsx
12:6  Warning: 'ComponentWithDisplayName' is defined but never used.  @typescript-eslint/no-unused-vars
12:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./components/ui/dropdown.tsx
3:17  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars

./components/ui/enhanced-file-upload.tsx
5:52  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars

./components/users/UserManagement.tsx
9:10  Warning: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
18:29  Warning: 'open' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
18:35  Warning: 'onOpenChange' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
22:26  Warning: 'asChild' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./components/VehicleMarker.tsx
22:3  Warning: 'isHovered' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
27:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
58:9  Warning: 'handleMouseEnter' is assigned a value but never used.  @typescript-eslint/no-unused-vars
59:9  Warning: 'handleMouseLeave' is assigned a value but never used.  @typescript-eslint/no-unused-vars
62:40  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/actions/auth.ts
20:5  Warning: Unexpected console statement.  no-console
27:5  Warning: Unexpected console statement.  no-console
57:18  Warning: 'password' is assigned a value but never used.  @typescript-eslint/no-unused-vars
57:28  Warning: 'name' is assigned a value but never used.  @typescript-eslint/no-unused-vars
57:34  Warning: 'companyId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
61:5  Warning: Unexpected console statement.  no-console

./lib/actions/shipmentActions.ts
13:11  Warning: 'LastKnownLocation' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/actions/shipmentUpdateActions.ts
32:11  Warning: 'result' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/actions/simulationActions.ts
4:14  Warning: 'and' is defined but never used.  @typescript-eslint/no-unused-vars
21:10  Warning: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/api.ts
39:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
41:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
43:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
44:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
50:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
65:34  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
67:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
69:30  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
70:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
80:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
94:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export

./lib/auth-client.ts
16:5  Warning: Unexpected console statement.  no-console
20:5  Warning: Unexpected console statement.  no-console
34:5  Warning: Unexpected console statement.  no-console
43:5  Warning: Unexpected console statement.  no-console
47:7  Warning: Unexpected console statement.  no-console
67:5  Warning: Unexpected console statement.  no-console
83:5  Warning: Unexpected console statement.  no-console
92:5  Warning: Unexpected console statement.  no-console
96:7  Warning: Unexpected console statement.  no-console

./lib/auth.ts
48:20  Warning: 'provider' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
48:39  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
48:49  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
48:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
49:9  Warning: Unexpected console statement.  no-console
53:21  Warning: 'options' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
53:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
53:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
54:9  Warning: Unexpected console statement.  no-console
63:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
63:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
64:24  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
64:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
69:13  Warning: 'handlers' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/context/SimulationStoreContext.tsx
3:40  Warning: 'useContext' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/database/schema.ts
2:51  Warning: 'jsonb' is defined but never used.  @typescript-eslint/no-unused-vars
2:93  Warning: 'real' is defined but never used.  @typescript-eslint/no-unused-vars
3:31  Warning: 'InferSelectModel' is defined but never used.  @typescript-eslint/no-unused-vars
3:54  Warning: 'InferInsertModel' is defined but never used.  @typescript-eslint/no-unused-vars
589:55  Warning: 'one' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

./lib/document-processing.ts
8:13  Warning: 'fs' is defined but never used.  @typescript-eslint/no-unused-vars
9:13  Warning: 'path' is defined but never used.  @typescript-eslint/no-unused-vars
10:13  Warning: 'XLSX' is defined but never used.  @typescript-eslint/no-unused-vars
33:10  Warning: 'OpenAIService' is defined but never used.  @typescript-eslint/no-unused-vars
99:10  Warning: 'processETDFormat' is defined but never used.  @typescript-eslint/no-unused-vars
127:10  Warning: 'processOutstationRatesFormat' is defined but never used.  @typescript-eslint/no-unused-vars
156:10  Warning: 'convertServerToClientFormat' is defined but never used.  @typescript-eslint/no-unused-vars
156:50  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
177:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
292:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
309:82  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
324:63  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
326:89  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
330:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
360:11  Warning: 'totalFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
385:10  Warning: 'calculateConfidenceForShipment' is defined but never used.  @typescript-eslint/no-unused-vars
444:10  Warning: 'validateShipment' is defined but never used.  @typescript-eslint/no-unused-vars
458:9  Warning: 'validFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
482:9  Warning: 'requiredFields' is assigned a value but never used.  @typescript-eslint/no-unused-vars
496:10  Warning: 'someFunctionUsingAIMappedFields' is defined but never used.  @typescript-eslint/no-unused-vars
498:11  Warning: 'aiFieldsObject' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./lib/excel-helper.ts
63:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
70:32  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/simple-auth.ts
16:5  Warning: Unexpected console statement.  no-console
19:5  Warning: Unexpected console statement.  no-console
30:5  Warning: Unexpected console statement.  no-console
34:7  Warning: Unexpected console statement.  no-console
44:5  Warning: Unexpected console statement.  no-console
67:3  Warning: Unexpected console statement.  no-console
71:5  Warning: Unexpected console statement.  no-console
83:9  Warning: Unexpected console statement.  no-console
91:9  Warning: Unexpected console statement.  no-console
111:5  Warning: Unexpected console statement.  no-console
122:5  Warning: Unexpected console statement.  no-console
131:5  Warning: Unexpected console statement.  no-console
149:5  Warning: Unexpected console statement.  no-console
160:5  Warning: Unexpected console statement.  no-console
164:9  Warning: Unexpected console statement.  no-console
174:5  Warning: Unexpected console statement.  no-console

./lib/store/documentStore.ts
72:33  Warning: 'documents' is assigned a value but never used.  @typescript-eslint/no-unused-vars
120:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/store/SimulationStoreContext.tsx
6:38  Warning: 'SimulationStoreApi' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/store/useSimulationStore.ts
7:10  Warning: 'updateShipmentLastPosition' is defined but never used.  @typescript-eslint/no-unused-vars
103:30  Warning: '_' is assigned a value but never used.  @typescript-eslint/no-unused-vars
109:46  Warning: 'removed' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars
189:73  Warning: 'updateVehicleState' is assigned a value but never used.  @typescript-eslint/no-unused-vars
189:103  Warning: 'lastDbUpdateTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
465:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./lib/store/useSimulationStoreContext.ts
4:39  Warning: 'SimulationStoreContextValue' is defined but never used.  @typescript-eslint/no-unused-vars

./lib/validations.ts
2:10  Warning: 'UserRole' is defined but never used.  @typescript-eslint/no-unused-vars


info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules