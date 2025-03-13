# Schema Validation Report

## 🔍 Overview
This report compares the current Drizzle ORM schema with ETL requirements to ensure data integrity and proper transformation support.

## ✅ Matching Requirements

### 1. Core Tables Present
- ✅ Users table
- ✅ Drivers table
- ✅ Shipments table
- ✅ Tracking updates table
- ✅ Documents table
- ✅ Payments table

### 2. Data Types & Constraints
- ✅ UUID primary keys for all tables
- ✅ Proper timestamps with timezone
- ✅ Decimal precision for monetary values
- ✅ Proper enum types for statuses

### 3. Relationships
- ✅ User to Driver (1:1)
- ✅ User to Shipments (1:M)
- ✅ Driver to Shipments (1:M)
- ✅ Shipment to Documents (1:M)
- ✅ Shipment to Payments (1:M)
- ✅ Shipment to Tracking Updates (1:M)

## 🚨 Missing Requirements

### 1. ETL Support Tables
- ❌ `staging_shipments` table for raw data
- ❌ `etl_audit_log` table for process tracking

### 2. Address Normalization
- ❌ Current schema stores addresses as JSONB
- ❌ ETL requires normalized address table with:
  - Unit number
  - Building name
  - Street
  - Area
  - Postal code
  - City
  - State

### 3. Contact Management
- ❌ Missing contacts table for multiple contacts per shipment
- ❌ Current schema lacks support for primary/secondary contacts

## 🔄 Required Changes

### 1. Add ETL Support Tables
```typescript
export const stagingShipments = pgTable("staging_shipments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  lineNumber: integer("line_number").notNull(),
  rawData: jsonb("raw_data").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default("PENDING"),
  errorDetails: text("error_details"),
});

export const etlAuditLog = pgTable("etl_audit_log", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  recordsProcessed: integer("records_processed").notNull(),
  successCount: integer("success_count").notNull(),
  errorCount: integer("error_count").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  errorDetails: text("error_details"),
});
```

### 2. Add Normalized Address Table
```typescript
export const addresses = pgTable("addresses", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipments.id)
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "PICKUP" or "DELIVERY"
  unit: varchar("unit", { length: 20 }),
  building: varchar("building", { length: 100 }),
  street: varchar("street", { length: 200 }).notNull(),
  area: varchar("area", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### 3. Add Contacts Table
```typescript
export const contacts = pgTable("contacts", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipments.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: varchar("role", { length: 50 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### 4. Modify Shipments Table
- Remove `pickupAddress` and `deliveryAddress` JSONB fields
- Add references to normalized address records

## 📝 Migration Plan

1. **Create New Tables**
   - Add ETL support tables
   - Add addresses table
   - Add contacts table

2. **Data Migration**
   - Extract address data from JSONB
   - Create normalized address records
   - Update shipment references

3. **Schema Updates**
   - Remove JSONB address fields
   - Add foreign key constraints

4. **Validation**
   - Verify data integrity
   - Test ETL process
   - Update application code

## 🎯 Next Steps

1. Create migration files for new tables
2. Implement data migration scripts
3. Update ETL pipeline to use new schema
4. Update application code to handle normalized data
5. Add validation rules for new fields 