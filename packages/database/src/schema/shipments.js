import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { drivers } from './drivers';
import { vehicles } from './vehicles';
export const shipments = pgTable('shipments', {
    id: uuid('id').primaryKey().defaultRandom(),
    trackingNumber: text('tracking_number').notNull().unique(),
    status: text('status', {
        enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
    }).notNull().default('PENDING'),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone'),
    pickupAddress: jsonb('pickup_address').notNull(),
    deliveryAddress: jsonb('delivery_address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    location: text('location'),
    estimatedDelivery: timestamp('estimated_delivery'),
    actualDelivery: timestamp('actual_delivery'),
    driverId: uuid('driver_id'),
    vehicleId: uuid('vehicle_id'),
    paymentStatus: text('payment_status', {
        enum: ['PENDING', 'PAID', 'FAILED']
    }).default('PENDING').notNull(),
    paymentReference: text('payment_reference'),
    amountPaid: text('amount_paid'),
    paymentDate: timestamp('payment_date')
});
export const shipmentsRelations = relations(shipments, ({ one }) => ({
    driver: one(drivers, {
        fields: [shipments.driverId],
        references: [drivers.id],
    }),
    vehicle: one(vehicles, {
        fields: [shipments.vehicleId],
        references: [vehicles.id],
    })
}));
