-- Manually edited migration to make document_shipment_map FK deferrable
-- Drop the existing foreign key constraint (assuming default Drizzle naming)
ALTER TABLE "document_shipment_map" DROP CONSTRAINT IF EXISTS "document_shipment_map_shipment_id_fkey";

-- Add the foreign key constraint back, making it DEFERRABLE
ALTER TABLE "document_shipment_map" ADD CONSTRAINT "document_shipment_map_shipment_id_fkey"
FOREIGN KEY ("shipment_id") REFERENCES "shipments_erd"("id")
ON DELETE cascade ON UPDATE no action
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "dropoffs" DROP CONSTRAINT "dropoffs_shipment_id_shipments_erd_id_fk";
--> statement-breakpoint
ALTER TABLE "pickups" DROP CONSTRAINT "pickups_shipment_id_shipments_erd_id_fk";
--> statement-breakpoint
ALTER TABLE "shipments_erd" DROP CONSTRAINT "shipments_erd_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "shipments_erd" DROP CONSTRAINT "shipments_erd_pickup_id_pickups_id_fk";
--> statement-breakpoint
ALTER TABLE "shipments_erd" DROP CONSTRAINT "shipments_erd_dropoff_id_dropoffs_id_fk";
