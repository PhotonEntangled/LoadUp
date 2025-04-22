ALTER TABLE "shipments_erd" ALTER COLUMN "source_document_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD COLUMN "trip_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD COLUMN "pickup_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD COLUMN "dropoff_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD CONSTRAINT "shipments_erd_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD CONSTRAINT "shipments_erd_pickup_id_pickups_id_fk" FOREIGN KEY ("pickup_id") REFERENCES "public"."pickups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD CONSTRAINT "shipments_erd_dropoff_id_dropoffs_id_fk" FOREIGN KEY ("dropoff_id") REFERENCES "public"."dropoffs"("id") ON DELETE no action ON UPDATE no action;