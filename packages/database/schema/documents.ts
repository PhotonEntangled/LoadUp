import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { shipments } from './shipments';
import { users } from './users';

export const documentTypeEnum = pgEnum('document_type', [
  'BILL_OF_LADING',
  'PROOF_OF_DELIVERY',
  'INVOICE',
  'CUSTOMS_DECLARATION',
  'INSURANCE_CERTIFICATE',
  'DAMAGE_REPORT',
  'OTHER'
]);

export const documentsTable = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').references(() => shipments.id),
  uploadedById: uuid('uploaded_by_id').references(() => users.id),
  documentType: documentTypeEnum('document_type').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  ocrProcessed: text('ocr_processed').default('false'),
  ocrData: text('ocr_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}); 