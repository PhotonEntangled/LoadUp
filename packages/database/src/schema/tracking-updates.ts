import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';
import { shipments } from './shipments.js';

export const trackingUpdates = pgTable('tracking_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').notNull(),
  status: text('status', {
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
  }).notNull(),
  location: text('location'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: jsonb('details')
});

export const trackingUpdatesRelations = relations(trackingUpdates, ({ one }) => ({
  shipment: one(shipments, {
    fields: [trackingUpdates.shipmentId],
    references: [shipments.id],
  })
}));

export type TrackingUpdate = InferModel<typeof trackingUpdates>; 