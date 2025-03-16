# Test Coverage Improvement Report

Generated on: 2025-03-16

## Summary

- Untested files identified: 145
- Test templates generated: 10

## Untested Files by Priority

### Priority 1: service
- packages/api/src/services/auth/auth-service.ts

### Priority 1: service
- packages/api/src/services/drivers/location-service.ts

### Priority 1: service
- packages/api/src/services/etl/shipments-processor.ts

### Priority 1: service
- packages/database/services/shipmentService.ts

### Priority 1: service
- services/data/ShipmentDataProcessor.ts

### Priority 1: service
- services/db/ProcessedDocumentService.ts

### Priority 1: service
- services/db/ShipmentService.ts

### Priority 1: service
- services/db/index.ts

### Priority 1: service
- services/excel/ExcelParserService.ts

### Priority 1: service
- services/ocr/DocumentParser.ts

### Priority 1: service
- services/ocr/GoogleVisionService.ts

### Priority 1: service
- services/parsers/ShipmentParser.ts

### Priority 2: utility
- apps/driver-app/src/utils/api.ts

### Priority 2: utility
- packages/api/src/utils/healthCheck.ts

### Priority 2: utility
- packages/database/utils/tracking.ts

### Priority 2: utility
- packages/shared/src/utils/auth.ts

### Priority 2: utility
- packages/shared/src/utils/map.ts

### Priority 2: utility
- packages/shared/src/utils/utils.ts

### Priority 3: hook
- apps/admin-dashboard/lib/hooks/useApi.ts

### Priority 3: hook
- apps/admin-dashboard/lib/hooks/useAuth.ts

### Priority 3: hook
- apps/driver-app/src/hooks/useApi.ts

### Priority 3: hook
- apps/driver-app/src/hooks/useAuth.ts

### Priority 3: hook
- packages/shared/src/hooks/useAuth.ts

### Priority 4: component
- apps/admin-dashboard/components/AuthForm.tsx

### Priority 4: component
- apps/admin-dashboard/components/Sidebar.tsx

### Priority 4: component
- apps/admin-dashboard/components/drivers/DriverCard.tsx

### Priority 4: component
- apps/admin-dashboard/components/drivers/DriverManagement.tsx

### Priority 4: component
- apps/admin-dashboard/components/map/MapView.tsx

### Priority 4: component
- apps/admin-dashboard/components/shared/Avatar.tsx

### Priority 4: component
- apps/admin-dashboard/components/shared/Card.tsx

### Priority 4: component
- apps/admin-dashboard/components/shipments/ShipmentCard.tsx

### Priority 4: component
- apps/admin-dashboard/components/shipments/ShipmentHistory.tsx

### Priority 4: component
- apps/admin-dashboard/components/shipments/ShipmentStatusTimeline.tsx

### Priority 4: component
- apps/admin-dashboard/components/shipments/ShipmentsTable.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/badge.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/button.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/card.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/data-table.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/dropdown.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/input.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/modal.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/skeleton.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/table.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/tabs.tsx

### Priority 4: component
- apps/admin-dashboard/components/ui/toast.tsx

### Priority 4: component
- apps/admin-dashboard/components/users/UserManagement.tsx

### Priority 4: component
- apps/driver-app/src/components/Scanner.tsx

### Priority 4: component
- components/document/DocumentScanner.tsx

### Priority 4: component
- components/document/ExcelUploader.tsx

### Priority 4: component
- components/document/FileUploader.tsx

### Priority 4: component
- components/document/ValidationInterface.tsx

### Priority 4: component
- packages/shared/src/components/AddressInput.tsx

### Priority 4: component
- packages/shared/src/components/DriverCard.tsx

### Priority 4: component
- packages/shared/src/components/Map.tsx

### Priority 6: api
- apps/admin-dashboard/app/api/auth/[...nextauth]/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/auth/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/drivers/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/etl/process-shipment-slips/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/shipments/[id]/documents/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/shipments/[id]/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/shipments/[shipmentId]/history/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/shipments/[shipmentId]/status/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/shipments/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/tracking/route.ts

### Priority 6: api
- apps/admin-dashboard/app/api/users/route.ts

### Priority 6: api
- packages/api/src/config/env.ts

### Priority 6: api
- packages/api/src/config/features.ts

### Priority 6: api
- packages/api/src/config/security.ts

### Priority 6: api
- packages/api/src/index.ts

### Priority 6: api
- packages/api/src/middleware/auth.ts

### Priority 6: api
- packages/api/src/middleware/errorHandler.ts

### Priority 6: api
- packages/api/src/middleware/validate.ts

### Priority 6: api
- packages/api/src/server-beta.ts

### Priority 6: api
- packages/api/src/server.ts

### Priority 999: other
- apps/admin-dashboard/app/(auth)/layout.tsx

### Priority 999: other
- apps/admin-dashboard/app/(auth)/sign-in/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/(auth)/sign-up/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/auth/[...nextauth]/route.ts

### Priority 999: other
- apps/admin-dashboard/app/dashboard/driver/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/dashboard/layout.tsx

### Priority 999: other
- apps/admin-dashboard/app/dashboard/map/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/dashboard/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/dashboard/shipments/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/documents/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/drivers/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/layout.tsx

### Priority 999: other
- apps/admin-dashboard/app/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/shipments/[id]/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/shipments/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/sign-in/[[...sign-in]]/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/sign-up/[[...sign-up]]/page.tsx

### Priority 999: other
- apps/admin-dashboard/app/tracking/page.tsx

### Priority 999: other
- apps/admin-dashboard/lib/actions/auth.ts

### Priority 999: other
- apps/admin-dashboard/lib/api.ts

### Priority 999: other
- apps/admin-dashboard/lib/auth.config.ts

### Priority 999: other
- apps/admin-dashboard/lib/auth.ts

### Priority 999: other
- apps/admin-dashboard/lib/supabase.ts

### Priority 999: other
- apps/admin-dashboard/lib/utils.ts

### Priority 999: other
- apps/admin-dashboard/lib/validations.ts

### Priority 999: other
- apps/admin-dashboard/middleware.ts

### Priority 999: other
- apps/driver-app/App.tsx

### Priority 999: other
- apps/driver-app/app.config.ts

### Priority 999: other
- apps/driver-app/context/auth.tsx

### Priority 999: other
- apps/driver-app/src/screens/ShipmentTrackingScreen.tsx

### Priority 999: other
- apps/driver-app/src/store/driverStore.ts

### Priority 999: other
- packages/database/db.ts

### Priority 999: other
- packages/database/drizzle.config.ts

### Priority 999: other
- packages/database/drizzle.ts

### Priority 999: other
- packages/database/index.ts

### Priority 999: other
- packages/database/schema.ts

### Priority 999: other
- packages/database/schema/auth.ts

### Priority 999: other
- packages/database/schema/documents.ts

### Priority 999: other
- packages/database/schema/drivers.ts

### Priority 999: other
- packages/database/schema/index.ts

### Priority 999: other
- packages/database/schema/shipments-staging.ts

### Priority 999: other
- packages/database/schema/shipments.ts

### Priority 999: other
- packages/database/schema/users.ts

### Priority 999: other
- packages/database/scripts/migrate.ts

### Priority 999: other
- packages/database/scripts/setup-test-db.ts

### Priority 999: other
- packages/database/src/connection.ts

### Priority 999: other
- packages/database/src/drizzle.ts

### Priority 999: other
- packages/database/src/etl/transform.ts

### Priority 999: other
- packages/database/src/facades/driverFacade.ts

### Priority 999: other
- packages/database/src/facades/index.ts

### Priority 999: other
- packages/database/src/facades/shipmentFacade.ts

### Priority 999: other
- packages/database/src/facades/vehicleFacade.ts

### Priority 999: other
- packages/database/src/index.ts

### Priority 999: other
- packages/database/src/schema.ts

### Priority 999: other
- packages/database/src/schema/drivers.ts

### Priority 999: other
- packages/database/src/schema/shipments.ts

### Priority 999: other
- packages/database/src/schema/tracking-updates.ts

### Priority 999: other
- packages/database/src/schema/types.ts

### Priority 999: other
- packages/database/src/schema/users.ts

### Priority 999: other
- packages/database/src/schema/validation.ts

### Priority 999: other
- packages/database/src/schema/vehicles.ts

### Priority 999: other
- packages/shared/src/enums/index.ts

### Priority 999: other
- packages/shared/src/index.ts

### Priority 999: other
- packages/shared/src/logger.ts

### Priority 999: other
- packages/shared/src/store/authStore.ts

### Priority 999: other
- packages/shared/src/types/index.ts

### Priority 999: other
- packages/shared/types/index.ts

### Priority 999: other
- scripts/deploy.ts

### Priority 999: other
- scripts/monitor-health.ts

### Priority 999: other
- scripts/monitor-metrics.ts

### Priority 999: other
- scripts/verify-migrations.ts

## Generated Test Templates

- \src\__tests__\services\auth\auth-service.test.ts
- \src\__tests__\services\drivers\location-service.test.ts
- \src\__tests__\services\etl\shipments-processor.test.ts
- \packages\database\services\shipmentService.test.ts
- \services\data\ShipmentDataProcessor.test.ts
- \services\db\ProcessedDocumentService.test.ts
- \services\db\ShipmentService.test.ts
- \services\db\index.test.ts
- \services\excel\ExcelParserService.test.ts
- \services\ocr\DocumentParser.test.ts

## Next Steps

1. Review and complete the generated test templates
2. Focus on high-priority files first (services, utilities)
3. Run `npm run test:coverage` again to see improved coverage
4. Continue adding tests until you reach your coverage goals
