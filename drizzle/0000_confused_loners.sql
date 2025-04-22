CREATE TYPE "public"."document_source" AS ENUM('OCR_IMAGE', 'EXCEL_TXT', 'MANUAL_ENTRY', 'API');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('UPLOADED', 'PROCESSING', 'PROCESSED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'ERROR');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street1" text,
	"street2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"raw_input" text,
	"resolution_method" text,
	"resolution_confidence" numeric(4, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"booking_description" text,
	"modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "cargo_descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "cargo_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"quantity_of_damaged_items" integer,
	"quantity_of_lost_items" integer
);
--> statement-breakpoint
CREATE TABLE "cargo_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text,
	"cargo_description_id" uuid
);
--> statement-breakpoint
CREATE TABLE "custom_booking_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"shipment_id" uuid,
	"booking_id" uuid,
	"sovylnvoice_number" text,
	"loadup_job_number" text,
	"planned_pickup_date" timestamp,
	"planned_delivery_date" timestamp,
	"modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "custom_shipment_detail_document_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"custom_shipment_detail_id" uuid NOT NULL,
	"document_requirement_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_shipment_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"custom_booking_details_id" uuid,
	"shipment_id" uuid,
	"customer_document_number" text,
	"customer_shipment_number" text,
	"sovy_job_no" text,
	"total_transporter_rate" numeric,
	"total_transporter_man_power_rate" numeric,
	"total_transporter_drop_point_rate" numeric,
	"total_transporter_staging_rate" numeric,
	"total_transporter_ph_rate" numeric,
	"total_transporter_waiting_rate" numeric,
	"total_shipper_staging_rate" numeric,
	"total_shipper_ph_rate" numeric,
	"total_shipper_man_power_rate" numeric,
	"total_shipper_waiting_rate" numeric,
	"total_shipper_rate" numeric,
	"total_transporter_additional_rate" numeric,
	"stackable" boolean,
	"hazardous_id" uuid,
	"manpower" integer,
	"special_requirement" text,
	"master_transporter_id" uuid,
	"cargo_value_id" uuid,
	"pod_status" text,
	"remarks" text,
	"total_shipper_additional_rate" numeric,
	"total_shipper_drop_point_rate" numeric,
	"trip_id" uuid,
	"early_inbound_date" timestamp,
	"late_inbound_date" timestamp,
	"early_outbound_date" timestamp,
	"late_outbound_date" timestamp,
	"total_transport_cost" numeric,
	"total_transport_distance" numeric,
	"total_transport_duration" numeric,
	"total_transport_segments" integer,
	"total_transport_weight" numeric,
	"total_transport_volume" numeric,
	"total_hazardous" boolean,
	"profitability" numeric,
	"total_insight" text,
	"total_hazardous_add_on_profile" numeric,
	"total_insight2" numeric,
	"trip_rate" numeric,
	"drop_charge" numeric,
	"manpower_charge" numeric,
	"total_charge" numeric,
	"misc_trip_rate" numeric,
	"misc_drop" numeric,
	"misc_manpower" numeric,
	"misc_total" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_trip_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"type_of_goods" text,
	"track_and_trace_url" text,
	"shipper_additional_rate" numeric,
	"shipper_drop_point_rate" numeric,
	"shipper_man_power_rate" numeric,
	"shipper_ph_rate" numeric,
	"shipper_rate" numeric,
	"shipper_staging_rate" numeric,
	"shipper_waiting_rate" numeric,
	"transporter_additional_rate" numeric,
	"transporter_drop_point_rate" numeric,
	"transporter_man_power_rate" numeric,
	"transporter_ph_rate" numeric,
	"transporter_rate" numeric,
	"transporter_staging_rate" numeric,
	"transporter_waiting_rate" numeric,
	"trip_id" uuid
);
--> statement-breakpoint
CREATE TABLE "document_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"source" "document_source",
	"file_count" integer,
	"processed_count" integer DEFAULT 0,
	"status" "processing_status" DEFAULT 'PENDING' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"description" text,
	"observation" text
);
--> statement-breakpoint
CREATE TABLE "document_shipment_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar(25) NOT NULL,
	"shipment_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_path" text,
	"file_type" varchar(100),
	"file_size" integer,
	"status" "document_status" DEFAULT 'UPLOADED' NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"parsed_date" timestamp,
	"shipment_count" integer,
	"error_message" text,
	"uploaded_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"batch_id" uuid
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dropoff_config_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"trip_config_id" uuid
);
--> statement-breakpoint
CREATE TABLE "dropoff_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dropoff_config_group_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"dropoff_config_position" integer,
	"created_by" uuid,
	"modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "dropoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dropoff_config_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"address_id" uuid,
	"cargo_status_id" uuid,
	"dropoff_position" integer,
	"shipment_weight" numeric,
	"shipment_volume" numeric,
	"quantity_of_items" integer,
	"total_palettes" integer,
	"activity_status" text,
	"customer_delivery_number" text,
	"item_unit_id" uuid,
	"map_to_pickup_position" integer,
	"actual_date_time_of_arrival" timestamp,
	"actual_date_time_of_departure" timestamp,
	"dropoff_date" timestamp,
	"estimated_date_time_of_arrival" timestamp,
	"estimated_date_time_of_departure" timestamp,
	"customer_po_numbers" text,
	"recipient_contact_name" text,
	"recipient_contact_phone" text,
	"created_by" uuid,
	"modified_by" uuid,
	"shipment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "epods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" uuid,
	"modified_by_id" uuid,
	"dropoff_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"description" varchar(200),
	"blob_name" varchar(500),
	"resource_type" varchar(100),
	"pod_returned" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "equipment_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"custom_shipment_detail_id" uuid,
	"lease_or_non_lease" boolean,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"liftgate" boolean,
	"liftgate_quantity" integer,
	"pallet_jack" boolean,
	"pallet_jack_quantity" integer,
	CONSTRAINT "equipment_requirements_custom_shipment_detail_id_unique" UNIQUE("custom_shipment_detail_id")
);
--> statement-breakpoint
CREATE TABLE "hazardous" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "item_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"item_number" text,
	"description" text,
	"lot_serial_number" text,
	"quantity" numeric,
	"uom" text,
	"weight" numeric,
	"bin" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pickup_config_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"trip_config_id" uuid
);
--> statement-breakpoint
CREATE TABLE "pickup_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pickup_config_group_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"pickup_config_position" integer,
	"created_by" uuid,
	"modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "pickups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pickup_config_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"address_id" uuid,
	"cargo_status_id" uuid,
	"pickup_position" integer,
	"pickup_date" timestamp,
	"shipment_weight" numeric,
	"shipment_volume" numeric,
	"quantity_of_items" integer,
	"total_palettes" integer,
	"activity_status" text,
	"item_unit_id" uuid,
	"actual_date_time_of_arrival" timestamp,
	"actual_date_time_of_departure" timestamp,
	"estimated_date_time_of_arrival" timestamp,
	"estimated_date_time_of_departure" timestamp,
	"created_by" uuid,
	"modified_by" uuid,
	"shipment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "shipments_erd" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"shipment_date_created" timestamp DEFAULT now(),
	"shipment_date_modified" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"shipment_description" text,
	"shipment_document_number" text,
	"modified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "trailer_sizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "trailer_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "trailers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transporter_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"trailer_size_id" uuid,
	"trailer_type_id" uuid,
	"weight" numeric,
	"dimension" text,
	"registration_number" text,
	"permit_number" text,
	"permit_expiry_date" timestamp,
	"inspection_expiry_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "transporters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trip_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trip_pods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dropoff_id" uuid,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"resource_url_string" text,
	"pod_returned" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"trip_config_id" uuid,
	"material" text,
	"material_type" text,
	"material_transporter" uuid,
	"sealed" boolean,
	"trip_status" text,
	"truck_id" uuid,
	"driver_id" uuid,
	"driver_name" text,
	"resource_track_ids" text,
	"remarks" text,
	"total_insured" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "truck_brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "truck_lengths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "truck_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "truck_payloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "truck_sizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "truck_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plate_number" text NOT NULL,
	"status" text NOT NULL,
	"date_created" timestamp DEFAULT now(),
	"date_modified" timestamp DEFAULT now(),
	"truck_length_id" uuid,
	"truck_size_id" uuid,
	"truck_type_id" uuid,
	"truck_brand_id" uuid,
	"truck_model_id" uuid,
	"truck_payload_id" uuid,
	"is_bonded" boolean,
	"registration_number" text,
	"weight" numeric,
	"dimension" text,
	"road_tax_expiry_date" timestamp,
	"inspection_expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cargo_values" ADD CONSTRAINT "cargo_values_cargo_description_id_cargo_descriptions_id_fk" FOREIGN KEY ("cargo_description_id") REFERENCES "public"."cargo_descriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_booking_details" ADD CONSTRAINT "custom_booking_details_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_booking_details" ADD CONSTRAINT "custom_booking_details_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_booking_details" ADD CONSTRAINT "custom_booking_details_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_detail_document_requirements" ADD CONSTRAINT "custom_shipment_detail_document_requirements_custom_shipment_detail_id_custom_shipment_details_id_fk" FOREIGN KEY ("custom_shipment_detail_id") REFERENCES "public"."custom_shipment_details"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_detail_document_requirements" ADD CONSTRAINT "custom_shipment_detail_document_requirements_document_requirement_id_document_requirements_id_fk" FOREIGN KEY ("document_requirement_id") REFERENCES "public"."document_requirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_custom_booking_details_id_custom_booking_details_id_fk" FOREIGN KEY ("custom_booking_details_id") REFERENCES "public"."custom_booking_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_hazardous_id_hazardous_id_fk" FOREIGN KEY ("hazardous_id") REFERENCES "public"."hazardous"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_master_transporter_id_transporters_id_fk" FOREIGN KEY ("master_transporter_id") REFERENCES "public"."transporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_cargo_value_id_cargo_values_id_fk" FOREIGN KEY ("cargo_value_id") REFERENCES "public"."cargo_values"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_shipment_details" ADD CONSTRAINT "custom_shipment_details_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_trip_details" ADD CONSTRAINT "custom_trip_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_trip_details" ADD CONSTRAINT "custom_trip_details_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_batches" ADD CONSTRAINT "document_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shipment_map" ADD CONSTRAINT "document_shipment_map_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shipment_map" ADD CONSTRAINT "document_shipment_map_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_batch_id_document_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."document_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_config_groups" ADD CONSTRAINT "dropoff_config_groups_trip_config_id_trip_configs_id_fk" FOREIGN KEY ("trip_config_id") REFERENCES "public"."trip_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_configs" ADD CONSTRAINT "dropoff_configs_dropoff_config_group_id_dropoff_config_groups_id_fk" FOREIGN KEY ("dropoff_config_group_id") REFERENCES "public"."dropoff_config_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_configs" ADD CONSTRAINT "dropoff_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_configs" ADD CONSTRAINT "dropoff_configs_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_dropoff_config_id_dropoff_configs_id_fk" FOREIGN KEY ("dropoff_config_id") REFERENCES "public"."dropoff_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_cargo_status_id_cargo_statuses_id_fk" FOREIGN KEY ("cargo_status_id") REFERENCES "public"."cargo_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_item_unit_id_item_units_id_fk" FOREIGN KEY ("item_unit_id") REFERENCES "public"."item_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoffs" ADD CONSTRAINT "dropoffs_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epods" ADD CONSTRAINT "epods_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epods" ADD CONSTRAINT "epods_modified_by_id_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epods" ADD CONSTRAINT "epods_dropoff_id_dropoffs_id_fk" FOREIGN KEY ("dropoff_id") REFERENCES "public"."dropoffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_requirements" ADD CONSTRAINT "equipment_requirements_custom_shipment_detail_id_custom_shipment_details_id_fk" FOREIGN KEY ("custom_shipment_detail_id") REFERENCES "public"."custom_shipment_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_config_groups" ADD CONSTRAINT "pickup_config_groups_trip_config_id_trip_configs_id_fk" FOREIGN KEY ("trip_config_id") REFERENCES "public"."trip_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_configs" ADD CONSTRAINT "pickup_configs_pickup_config_group_id_pickup_config_groups_id_fk" FOREIGN KEY ("pickup_config_group_id") REFERENCES "public"."pickup_config_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_configs" ADD CONSTRAINT "pickup_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_configs" ADD CONSTRAINT "pickup_configs_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_pickup_config_id_pickup_configs_id_fk" FOREIGN KEY ("pickup_config_id") REFERENCES "public"."pickup_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_cargo_status_id_cargo_statuses_id_fk" FOREIGN KEY ("cargo_status_id") REFERENCES "public"."cargo_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_item_unit_id_item_units_id_fk" FOREIGN KEY ("item_unit_id") REFERENCES "public"."item_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_shipment_id_shipments_erd_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments_erd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD CONSTRAINT "shipments_erd_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments_erd" ADD CONSTRAINT "shipments_erd_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_transporter_id_transporters_id_fk" FOREIGN KEY ("transporter_id") REFERENCES "public"."transporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_trailer_size_id_trailer_sizes_id_fk" FOREIGN KEY ("trailer_size_id") REFERENCES "public"."trailer_sizes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_trailer_type_id_trailer_types_id_fk" FOREIGN KEY ("trailer_type_id") REFERENCES "public"."trailer_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_pods" ADD CONSTRAINT "trip_pods_dropoff_id_dropoffs_id_fk" FOREIGN KEY ("dropoff_id") REFERENCES "public"."dropoffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_trip_config_id_trip_configs_id_fk" FOREIGN KEY ("trip_config_id") REFERENCES "public"."trip_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_material_transporter_transporters_id_fk" FOREIGN KEY ("material_transporter") REFERENCES "public"."transporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_truck_id_vehicles_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_length_id_truck_lengths_id_fk" FOREIGN KEY ("truck_length_id") REFERENCES "public"."truck_lengths"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_size_id_truck_sizes_id_fk" FOREIGN KEY ("truck_size_id") REFERENCES "public"."truck_sizes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_type_id_truck_types_id_fk" FOREIGN KEY ("truck_type_id") REFERENCES "public"."truck_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_brand_id_truck_brands_id_fk" FOREIGN KEY ("truck_brand_id") REFERENCES "public"."truck_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_model_id_truck_models_id_fk" FOREIGN KEY ("truck_model_id") REFERENCES "public"."truck_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_truck_payload_id_truck_payloads_id_fk" FOREIGN KEY ("truck_payload_id") REFERENCES "public"."truck_payloads"("id") ON DELETE no action ON UPDATE no action;