import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  varchar,
  pgEnum,
  jsonb,
  decimal,
  integer,
  boolean
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { drivers } from './users';
import { customers } from './users';

// Enums
export const SHIPMENT_STATUS_ENUM = pgEnum("shipment_status", [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "CANCELLED"
]);

export const PAYMENT_STATUS_ENUM = pgEnum("payment_status", [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED"
]);

export const DOCUMENT_TYPE_ENUM = pgEnum("document_type", [
  "BILL_OF_LADING",
  "PROOF_OF_DELIVERY",
  "INVOICE",
  "CUSTOMS_DECLARATION",
  "INSURANCE_CERTIFICATE",
  "DAMAGE_REPORT",
  "OTHER"
]);

// Define shipment priority enum
export const shipmentPriorityEnum = pgEnum('shipment_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

// New enum for document source
export const DOCUMENT_SOURCE_ENUM = pgEnum("document_source", [
  "OCR_IMAGE",
  "EXCEL_TXT"
]);

// New enum for processing status
export const PROCESSING_STATUS_ENUM = pgEnum("processing_status", [
  "PENDING",
  "PROCESSING",
  "PROCESSED",
  "VALIDATED",
  "REJECTED"
]);

// Define address type for shipment locations
export type AddressType = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

// Define contact type for shipment contacts
export type ContactType = {
  name: string;
  email: string;
  phone: string;
  company?: string;
};

// Shipments table
export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackingNumber: varchar('tracking_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id')
    .references(() => customers.id)
    .notNull(),
  driverId: uuid('driver_id')
    .references(() => drivers.id),
  status: SHIPMENT_STATUS_ENUM('status').default('PENDING'),
  priority: shipmentPriorityEnum('priority').notNull().default('medium'),
  pickupAddress: jsonb('pickup_address').notNull(), // { address, lat, lng, instructions }
  deliveryAddress: jsonb('delivery_address').notNull(), // { address, lat, lng, instructions }
  packageDetails: jsonb('package_details').notNull(), // { weight, dimensions, type, fragile }
  scheduledPickupTime: timestamp('scheduled_pickup_time', { withTimezone: true }),
  actualPickupTime: timestamp('actual_pickup_time', { withTimezone: true }),
  estimatedDeliveryTime: timestamp('estimated_delivery_time', { withTimezone: true }),
  actualDeliveryTime: timestamp('actual_delivery_time', { withTimezone: true }),
  paymentStatus: PAYMENT_STATUS_ENUM('payment_status').default('PENDING'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  distance: decimal('distance', { precision: 10, scale: 2 }), // In miles
  route: jsonb('route'), // Mapbox route data
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // New fields for document processing integration
  sourceDocumentId: uuid('source_document_id'),
  sourceType: DOCUMENT_SOURCE_ENUM('source_type'),
  batchId: uuid('batch_id'),
  needsReview: boolean('needs_review').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

// Shipment history for tracking all status changes
export const shipmentHistory = pgTable('shipment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .references(() => shipments.id)
    .notNull(),
  status: SHIPMENT_STATUS_ENUM('status').notNull(),
  location: jsonb('location'), // { lat, lng, address }
  notes: text('notes'),
  updatedById: uuid('updated_by_id')
    .references(() => users.id)
    .notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});

// Real-time tracking updates
export const trackingUpdates = pgTable('tracking_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .references(() => shipments.id)
    .notNull(),
  driverId: uuid('driver_id')
    .references(() => drivers.id)
    .notNull(),
  location: jsonb('location').notNull(), // { lat, lng, address, speed, heading }
  eventType: varchar('event_type', { length: 50 }), // LOCATION_UPDATE, STOP, START, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Documents for OCR processing and storage
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .references(() => shipments.id),
  driverId: uuid('driver_id')
    .references(() => drivers.id),
  type: DOCUMENT_TYPE_ENUM('type').notNull(),
  url: text('url').notNull(),
  processedData: jsonb('processed_data'), // OCR results
  verified: boolean('verified').default(false),
  verifiedBy: uuid('verified_by')
    .references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Payment records
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .references(() => shipments.id)
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => customers.id)
    .notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: PAYMENT_STATUS_ENUM('status').default('PENDING'),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  stripeRefundId: varchar('stripe_refund_id', { length: 255 }),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundReason: text('refund_reason'),
  metadata: jsonb('metadata'), // Additional Stripe metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Define shipment events table for tracking history
export const shipmentEvents = pgTable('shipment_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
  status: SHIPMENT_STATUS_ENUM('status').notNull(),
  location: jsonb('location').$type<Partial<AddressType>>(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define shipment documents table
export const shipmentDocuments = pgTable('shipment_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// New table for processed documents from OCR and Excel
export const processedDocuments = pgTable('processed_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: DOCUMENT_SOURCE_ENUM('source').notNull(),
  status: PROCESSING_STATUS_ENUM('status').default('PENDING'),
  originalFileUrl: text('original_file_url').notNull(),
  rawData: jsonb('raw_data'), // Raw extracted data
  processedData: jsonb('processed_data'), // Structured shipment data
  confidence: decimal('confidence', { precision: 5, scale: 2 }),
  needsReview: boolean('needs_review').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  batchId: uuid('batch_id').references(() => documentBatches.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// New table for document batches (primarily for Excel files)
export const documentBatches = pgTable('document_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  source: DOCUMENT_SOURCE_ENUM('source').notNull(),
  status: PROCESSING_STATUS_ENUM('status').default('PENDING'),
  fileCount: integer('file_count').default(0),
  processedCount: integer('processed_count').default(0),
  validatedCount: integer('validated_count').default(0),
  rejectedCount: integer('rejected_count').default(0),
  metadata: jsonb('metadata'), // Additional batch metadata
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// New table for mapping processed documents to shipments
export const documentShipmentMap = pgTable('document_shipment_map', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => processedDocuments.id).notNull(),
  shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 