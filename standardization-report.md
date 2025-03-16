# Codebase Standardization Report

Generated on: 2025-03-16

## Summary

- Removed deprecated files: 5
- Standardized files: 64

## Removed Deprecated Files

- docs/CLERK_REFERENCES.md
- docs/MIGRATION_CLERK_TO_NEXTAUTH.md
- scripts/find-clerk-references.js
- scripts/migrate-clerk-to-nextauth.js
- scripts/update-auth-deps.js

## Standardized Files

- __tests__/api/auth.test.ts
- __tests__/api/documents.test.ts
- __tests__/components/DocumentProcessing.test.tsx
- __tests__/components/DriverDashboard.test.tsx
- __tests__/components/MapPage.test.tsx
- __tests__/integration/auth/nextauth.integration.ts
- __tests__/integration/auth/setup.ts
- apps/admin-dashboard/__tests__/middleware.test.ts
- apps/admin-dashboard/app/api/drivers/route.ts
- apps/admin-dashboard/components/__tests__/AuthForm.test.tsx
- apps/admin-dashboard/components/shipments/ShipmentsTable.tsx
- apps/admin-dashboard/jest.config.js
- apps/admin-dashboard/lib/auth.config.ts
- apps/admin-dashboard/lib/hooks/useApi.ts
- apps/admin-dashboard/lib/hooks/useAuth.ts
- apps/admin-dashboard/next.config.js
- apps/admin-dashboard/postcss.config.js
- apps/admin-dashboard/tailwind.config.js
- apps/driver-app/App.tsx
- apps/driver-app/index.js
- apps/driver-app/src/hooks/useApi.ts
- apps/driver-app/src/hooks/useAuth.ts
- components/document/ExcelUploader.tsx
- components/document/FileUploader.test.tsx
- components/document/FileUploader.tsx
- components/document/ValidationInterface.tsx
- packages/api/server.cjs
- packages/api/src/__tests__/security.test.ts
- packages/api/src/__tests__/shipments-processor.test.ts
- packages/api/src/__tests__/shipments.test.ts
- packages/api/src/server-beta-cjs.cjs
- packages/api/src/server-beta-cjs.js
- packages/database/db.ts
- packages/database/schema/documents.ts
- packages/database/schema/index.ts
- packages/database/schema/shipments.ts
- packages/database/services/shipmentService.ts
- packages/database/src/__tests__/database.test.ts
- packages/database/src/__tests__/drizzle.test.ts
- packages/database/src/__tests__/etl.test.ts
- packages/database/src/drizzle.js
- packages/database/src/index.js
- packages/database/src/schema/shipments.js
- packages/shared/src/__tests__/logger.test.ts
- packages/shared/src/enums/index.ts
- packages/shared/src/types/next-auth.d.ts
- packages/shared/src/utils/utils.test.ts
- scripts/deploy.ts
- scripts/verify-migrations.ts
- services/data/ShipmentDataProcessor.ts
- services/db/ProcessedDocumentService.ts
- services/db/ShipmentService.ts
- services/db/index.ts
- services/excel/ExcelParserService.ts
- services/parsers/ShipmentParser.test.ts
- services/parsers/ShipmentParser.ts
- tests/__mocks__/styleMock.js
- tests/components/DocumentScanner.test.tsx
- tests/components/ExcelUploader.test.tsx
- tests/components/ValidationInterface.test.tsx
- tests/services/ExcelParserService.test.ts
- tests/services/ShipmentDataProcessor.test.ts
- tests/services/ocr/DocumentParser.test.ts
- tests/services/ocr/GoogleVisionService.test.ts

## Next Steps

1. Review the changes to ensure they don't break functionality
2. Run tests to verify everything still works
3. Consider adding more standardization rules as needed
