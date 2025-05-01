// Drizzle Schema - Aligned with Full ERD (Source: ERD Images via GPT)
import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, varchar, pgEnum, decimal, real, primaryKey } from 'drizzle-orm/pg-core';
import { relations, sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// --- Existing Enums (Retain if still relevant) ---
// export const shipmentStatusEnum = pgEnum('shipment_status', ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'EXCEPTION']); // Keep if status logic remains
export const documentSourceEnum = pgEnum('document_source', ['OCR_IMAGE', 'EXCEL_TXT', 'MANUAL_ENTRY', 'API']);
export const processingStatusEnum = pgEnum('processing_status', ['PENDING', 'PROCESSING', 'PROCESSED', 'ERROR']);
export const documentStatusEnum = pgEnum('document_status', ['UPLOADED', 'PROCESSING', 'PROCESSED', 'ERROR']);
// TODO: Add new enums if needed based on text fields like trip_status, activity_status, pod_status etc.

// Define the shipment status enum
export const shipmentStatusEnum = pgEnum('shipment_status', [
    'PLANNED', // Shipment created, resources not yet assigned
    'BOOKED', // Resources assigned, ready for execution
    'IN_TRANSIT', // Shipment pickup confirmed, en route
    'AT_PICKUP', // Vehicle arrived at pickup location
    'AT_DROPOFF', // Vehicle arrived at dropoff location
    'COMPLETED', // Dropoff confirmed, shipment finished
    'CANCELLED', // Shipment cancelled
    'EXCEPTION', // An issue occurred (e.g., delay, damage)
    'AWAITING_STATUS' // Added: Waiting for initial status from external source
]);

// --- Lookup/Reference Tables (from ERD Image 1 & 2) ---

export const itemUnits = pgTable('item_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const cargoStatuses = pgTable('cargo_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  dateCreated: timestamp('date_created').defaultNow(),
  dateModified: timestamp('date_modified').defaultNow(),
  // pickUpDropOffId: uuid('pickup_dropoff_id'), // FK target unclear in ERD, link in relations if needed
  quantityOfDamagedItems: integer('quantity_of_damaged_items'),
  quantityOfLostItems: integer('quantity_of_lost_items'),
});

export const hazardous = pgTable('hazardous', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const cargoDescriptions = pgTable('cargo_descriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const cargoValues = pgTable('cargo_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
  cargoDescriptionId: uuid('cargo_description_id').references(() => cargoDescriptions.id),
});

export const documentRequirements = pgTable('document_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  dateCreated: timestamp('date_created').defaultNow(),
  dateModified: timestamp('date_modified').defaultNow(),
  description: text('description'),
  observation: text('observation'),
});

// --- Truck/Trailer Related Lookups ---

export const truckTypes = pgTable('truck_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const truckPayloads = pgTable('truck_payloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const truckModels = pgTable('truck_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const truckLengths = pgTable('truck_lengths', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const truckBrands = pgTable('truck_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const truckSizes = pgTable('truck_sizes', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const trailerTypes = pgTable('trailer_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

export const trailerSizes = pgTable('trailer_sizes', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description'),
});

// --- Existing Core Tables (Retained/Verified) ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Hashing handled elsewhere
  name: text('name').notNull(),
  role: text('role', { enum: ['ADMIN', 'DRIVER', 'CUSTOMER', 'SYSTEM'] }).notNull().default('CUSTOMER'), // Added SYSTEM?
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const drivers = pgTable('drivers', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull().unique(),
    status: text('status').notNull(), // TODO: Enum?
    // location: text('location'), // Geo type might be better, e.g., PostGIS point
    // currentVehicleId: uuid('current_vehicle_id').references(() => vehicles.id), // Relationship managed via relations
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    // Add potentially missing FK to users table? Required?
    // userId: uuid('user_id').references(() => users.id),
});

export const vehicles = pgTable('vehicles', { // Corresponds to ERD 'Trucks' table
    id: uuid('id').primaryKey().defaultRandom(),
    // type: text('type').notNull(), // Replaced by truckTypeId
    plateNumber: text('plate_number').notNull().unique(),
    status: text('status').notNull(), // TODO: Enum?
    // capacity: integer('capacity').notNull(), // Covered by payload/size?
    // currentDriverId: uuid('current_driver_id'), // Relationship managed via relations
    dateCreated: timestamp('date_created').defaultNow(), // ERD has dateCreated/Modified
    dateModified: timestamp('date_modified').defaultNow(),
    truckLengthId: uuid('truck_length_id').references(() => truckLengths.id),
    truckSizeId: uuid('truck_size_id').references(() => truckSizes.id),
    truckTypeId: uuid('truck_type_id').references(() => truckTypes.id),
    truckBrandId: uuid('truck_brand_id').references(() => truckBrands.id),
    truckModelId: uuid('truck_model_id').references(() => truckModels.id),
    truckPayloadId: uuid('truck_payload_id').references(() => truckPayloads.id),
    isBonded: boolean('is_bonded'),
    registrationNumber: text('registration_number'), // Possibly same as plateNumber?
    weight: decimal('weight'), // Use decimal for precision
    dimension: text('dimension'), // Store as text e.g., "LxWxH"
    roadTaxExpiryDate: timestamp('road_tax_expiry_date'),
    inspectionExpiryDate: timestamp('inspection_expiry_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(), // Keep original audit fields?
    updatedAt: timestamp('updated_at').defaultNow().notNull(), // Keep original audit fields?
});

export const documentBatches = pgTable('document_batches', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    source: documentSourceEnum('source'),
    fileCount: integer('file_count'),
    processedCount: integer('processed_count').default(0),
    // validatedCount: integer('validated_count').default(0), // Removed? Not in ERD
    // rejectedCount: integer('rejected_count').default(0), // Removed? Not in ERD
    status: processingStatusEnum('status').notNull().default('PENDING'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`), // CORRECTED: Use template literal for sql()
    filename: varchar('filename', { length: 255 }).notNull(),
    filePath: text('file_path'), // URL/Path in storage (e.g., S3, Azure Blob)
    fileType: varchar('file_type', { length: 100 }),
    fileSize: integer('file_size'),
    // shipmentId: uuid('shipment_id').references(() => shipmentsErd.id, { onDelete: 'set null' }), // Replaced by mapping table
    status: documentStatusEnum('status').notNull().default('UPLOADED'),
    uploadDate: timestamp('upload_date').defaultNow().notNull(),
    parsedDate: timestamp('parsed_date'),
    shipmentCount: integer('shipment_count'), // Derived? Store?
    errorMessage: text('error_message'),
    uploadedById: uuid('uploaded_by_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    batchId: uuid('batch_id').references(() => documentBatches.id, { onDelete: 'set null' }),
});

// --- New Tables based on Full ERD ---

// Assumed Address table based on need in PickUps/DropOffs
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  street1: text('street1'),
  street2: text('street2'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country'),
  latitude: decimal('latitude', { precision: 9, scale: 6 }), // Precision for lat/lon
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  rawInput: text('raw_input'), // NEW: Store the original address string
  resolutionMethod: text('resolution_method'), // NEW: e.g., 'geocoded', 'lookup', 'manual', 'estimated'
  resolutionConfidence: decimal('resolution_confidence', { precision: 4, scale: 3 }), // NEW: Confidence score (0.0 to 1.0)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tripConfigs = pgTable('trip_configs', {
    id: uuid('id').primaryKey().defaultRandom(),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    // tripId: uuid('trip_id').references(() => trips.id), // Defined in relations, check ERD for cardinality (1:1?)
});

export const pickupConfigGroups = pgTable('pickup_config_groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    tripConfigId: uuid('trip_config_id').references(() => tripConfigs.id),
});

export const dropoffConfigGroups = pgTable('dropoff_config_groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    tripConfigId: uuid('trip_config_id').references(() => tripConfigs.id),
});

export const pickupConfigs = pgTable('pickup_configs', {
    id: uuid('id').primaryKey().defaultRandom(),
    pickupConfigGroupId: uuid('pickup_config_group_id').references(() => pickupConfigGroups.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    pickupConfigPosition: integer('pickup_config_position'),
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
});

export const dropoffConfigs = pgTable('dropoff_configs', {
    id: uuid('id').primaryKey().defaultRandom(),
    dropoffConfigGroupId: uuid('dropoff_config_group_id').references(() => dropoffConfigGroups.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    dropoffConfigPosition: integer('dropoff_config_position'),
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
});

export const bookings = pgTable('bookings', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    // tenantId: uuid('tenant_id'), // TODO: Define tenants table if multi-tenancy needed
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    bookingDescription: text('booking_description'),
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
});

// --- NEW Shipment Table (ERD Version) ---
export const shipmentsErd = pgTable('shipments_erd', { // Use distinct name for clarity
    id: uuid('id').primaryKey().defaultRandom(),
    // tenantId: uuid('tenant_id'), // TODO: Define tenants table if needed
    bookingId: uuid('booking_id').references(() => bookings.id),
    sourceDocumentId: uuid('source_document_id').references(() => documents.id), // Target state: uuid
    status: shipmentStatusEnum('status'), // Use the enum here
    shipmentDateCreated: timestamp('shipment_date_created').defaultNow(),
    shipmentDateModified: timestamp('shipment_date_modified').defaultNow(),
    isActive: boolean('is_active').default(true),
    shipmentDescription: text('shipment_description'),
    shipmentDocumentNumber: text('shipment_document_number'),
    modifiedBy: uuid('modified_by').references(() => users.id),
    // ADDED Missing Foreign Keys - REMOVED inline references
    tripId: uuid('trip_id'), // Removed .references(() => trips.id)
    pickupId: uuid('pickup_id'), // Removed .references(() => pickups.id)
    dropoffId: uuid('dropoff_id'), // Removed .references(() => dropoffs.id)
    // ADDED for Last Known Position (Phase 5.2)
    lastKnownLatitude: decimal('last_known_latitude', { precision: 9, scale: 6 }),
    lastKnownLongitude: decimal('last_known_longitude', { precision: 9, scale: 6 }),
    lastKnownTimestamp: timestamp('last_known_timestamp'),
    lastKnownBearing: decimal('last_known_bearing', { precision: 9, scale: 6 }).default('0'), // Added Bearing
});

export const customBookingDetails = pgTable('custom_booking_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    // shipperId: uuid('shipper_id'), // TODO: Define shippers table if needed
    shipmentId: uuid('shipment_id').references(() => shipmentsErd.id), // Link to NEW Shipments table
    bookingId: uuid('booking_id').references(() => bookings.id),
    sovylnvoiceNumber: text('sovylnvoice_number'), // Typo in ERD? Should be SovylInvoiceNumber?
    loadUpJobNumber: text('loadup_job_number'),
    plannedPickupDate: timestamp('planned_pickup_date'),
    plannedDeliveryDate: timestamp('planned_delivery_date'),
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
});

export const trips = pgTable('trips', {
    id: uuid('id').primaryKey().defaultRandom(),
    // tenantId: uuid('tenant_id'), // TODO: Define tenants table if needed
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    // FK to tripConfigs (nullable)
    tripConfigId: uuid('trip_config_id').references(() => tripConfigs.id),
    material: text('material'),
    materialType: text('material_type'),
    // FK to transporters (nullable)
    materialTransporter: uuid('material_transporter').references(() => transporters.id),
    sealed: boolean('sealed'),
    tripStatus: text('trip_status'), // TODO: Define Enum?
    truckId: uuid('truck_id').references(() => vehicles.id), // Link to looked-up vehicle
    driverId: uuid('driver_id').references(() => drivers.id), // Link to looked-up driver
    // Store direct parsed info for this trip instance
    driverName: text('driver_name'), // Parsed name (already exists)
    driverPhone: text('driver_phone'), // ADDED: Parsed phone
    driverIcNumber: text('driver_ic_number'), // CORRECTED: Match actual DB column name (was driverIc)
    truckPlate: text('truck_plate'), // ADDED: Parsed plate number
    // -- End direct parsed info --
    resourceTrackIds: text('resource_track_ids'),
    remarks: text('remarks'),
    totalInsured: text('total_insured'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const customTripDetails = pgTable('custom_trip_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    typeOfGoods: text('type_of_goods'),
    trackAndTraceUrl: text('track_and_trace_url'),
    shipperAdditionalRate: decimal('shipper_additional_rate'), // Use decimal for currency
    shipperDropPointRate: decimal('shipper_drop_point_rate'),
    shipperManPowerRate: decimal('shipper_man_power_rate'),
    shipperPhRate: decimal('shipper_ph_rate'),
    shipperRate: decimal('shipper_rate'),
    shipperStagingRate: decimal('shipper_staging_rate'),
    shipperWaitingRate: decimal('shipper_waiting_rate'),
    transporterAdditionalRate: decimal('transporter_additional_rate'),
    transporterDropPointRate: decimal('transporter_drop_point_rate'),
    transporterManPowerRate: decimal('transporter_man_power_rate'),
    transporterPhRate: decimal('transporter_ph_rate'),
    transporterRate: decimal('transporter_rate'),
    transporterStagingRate: decimal('transporter_staging_rate'),
    transporterWaitingRate: decimal('transporter_waiting_rate'),
    tripId: uuid('trip_id').references(() => trips.id), // Add FK to Trips
});

export const customShipmentDetails = pgTable('custom_shipment_details', {
    id: uuid('id').primaryKey().defaultRandom(),
    customBookingDetailsId: uuid('custom_booking_details_id').references(() => customBookingDetails.id),
    shipmentId: uuid('shipment_id').references(() => shipmentsErd.id), // Link to new shipments table
    customerDocumentNumber: text('customer_document_number'), // e.g., Order Number, BOL
    customerShipmentNumber: text('customer_shipment_number'),
    sovyJobNo: text('sovy_job_no'),
    totalTransporterRate: decimal('total_transporter_rate'),
    totalTransporterManPowerRate: decimal('total_transporter_man_power_rate'),
    totalTransporterDropPointRate: decimal('total_transporter_drop_point_rate'),
    totalTransporterStagingRate: decimal('total_transporter_staging_rate'),
    totalTransporterPhRate: decimal('total_transporter_ph_rate'),
    totalTransporterWaitingRate: decimal('total_transporter_waiting_rate'),
    totalShipperStagingRate: decimal('total_shipper_staging_rate'),
    totalShipperPhRate: decimal('total_shipper_ph_rate'),
    totalShipperManPowerRate: decimal('total_shipper_man_power_rate'),
    totalShipperWaitingRate: decimal('total_shipper_waiting_rate'),
    totalShipperRate: decimal('total_shipper_rate'),
    totalTransporterAdditionalRate: decimal('total_transporter_additional_rate'),
    stackable: boolean('stackable'),
    hazardousId: uuid('hazardous_id').references(() => hazardous.id),
    manpower: integer('manpower'),
    specialRequirement: text('special_requirement'),
    masterTransporterId: uuid('master_transporter_id').references(() => transporters.id), // MODIFIED: FK to new transporters table
    cargoValueId: uuid('cargo_value_id').references(() => cargoValues.id),
    podStatus: text('pod_status'), // Changed type from timestamp based on ERD, TODO: maybe enum?
    remarks: text('remarks'),
    totalShipperAdditionalRate: decimal('total_shipper_additional_rate'),
    totalShipperDropPointRate: decimal('total_shipper_drop_point_rate'),
    tripId: uuid('trip_id').references(() => trips.id),
    earlyInboundDate: timestamp('early_inbound_date'),
    lateInboundDate: timestamp('late_inbound_date'),
    earlyOutboundDate: timestamp('early_outbound_date'),
    lateOutboundDate: timestamp('late_outbound_date'),
    totalTransportCost: decimal('total_transport_cost'),
    totalTransportDistance: decimal('total_transport_distance'), // Use decimal for precision
    totalTransportDuration: decimal('total_transport_duration'), // Store duration (e.g., seconds, minutes)?
    totalTransportSegments: integer('total_transport_segments'),
    totalTransportWeight: decimal('total_transport_weight'),
    totalTransportVolume: decimal('total_transport_volume'),
    totalHazardous: boolean('total_hazardous'),
    profitability: decimal('profitability'),
    totalInsight: text('total_insight'),
    totalHazardousAddOnProfile: decimal('total_hazardous_add_on_profile'),
    totalInsight2: decimal('total_insight2'), // Data type? Using decimal as seems related to profile
    tripRate: decimal('trip_rate'),
    dropCharge: decimal('drop_charge'),
    manpowerCharge: decimal('manpower_charge'),
    totalCharge: decimal('total_charge'),
    miscTripRate: decimal('misc_trip_rate'), // Added for unstructured Trip Rates
    miscDrop: decimal('misc_drop'),       // Added for unstructured Drop
    miscManpower: decimal('misc_manpower'), // Added for unstructured Manpower
    miscTotal: decimal('misc_total'),       // Added for unstructured Total
    carrierName: text('carrier_name'),
    carrierPhone: text('carrier_phone'),
    truckId: text('truck_id'),
    rawTripRateInput: text('raw_trip_rate_input'),
    rawDropChargeInput: text('raw_drop_charge_input'),
    rawManpowerChargeInput: text('raw_manpower_charge_input'),
    rawTotalChargeInput: text('raw_total_charge_input'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const equipmentRequirements = pgTable('equipment_requirements', {
    id: uuid('id').primaryKey().defaultRandom(),
    customShipmentDetailId: uuid('custom_shipment_detail_id').references(() => customShipmentDetails.id).unique(), // Unique implies 1:1
    leaseOrNonLease: boolean('lease_or_non_lease'),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    liftgate: boolean('liftgate'),
    liftgateQuantity: integer('liftgate_quantity'),
    palletJack: boolean('pallet_jack'),
    palletJackQuantity: integer('pallet_jack_quantity'),
});

export const pickups = pgTable('pickups', {
    id: uuid('id').primaryKey().defaultRandom(),
    pickupConfigId: uuid('pickup_config_id').references(() => pickupConfigs.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    addressId: uuid('address_id').references(() => addresses.id), // Link to new addresses table
    cargoStatusId: uuid('cargo_status_id').references(() => cargoStatuses.id),
    pickup_position: integer('pickup_position'),
    pickup_date: timestamp('pickup_date'),
    shipmentWeight: decimal('shipment_weight'),
    shipmentVolume: decimal('shipment_volume'),
    quantityOfItems: integer('quantity_of_items'),
    totalPalettes: integer('total_palettes'),
    activityStatus: text('activity_status'), // Changed type from integer, TODO: Define Enum?
    itemUnitId: uuid('item_unit_id').references(() => itemUnits.id),
    actualDateTimeOfArrival: timestamp('actual_date_time_of_arrival'),
    actualDateTimeOfDeparture: timestamp('actual_date_time_of_departure'),
    estimatedDateTimeOfArrival: timestamp('estimated_date_time_of_arrival'),
    estimatedDateTimeOfDeparture: timestamp('estimated_date_time_of_departure'),
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
    shipmentId: uuid('shipment_id').notNull(), // REMOVED .references(() => shipmentsErd.id)
});

export const dropoffs = pgTable('dropoffs', {
    id: uuid('id').primaryKey().defaultRandom(),
    dropoffConfigId: uuid('dropoff_config_id').references(() => dropoffConfigs.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    addressId: uuid('address_id').references(() => addresses.id), // Link to new addresses table
    cargoStatusId: uuid('cargo_status_id').references(() => cargoStatuses.id),
    dropoff_position: integer('dropoff_position'),
    shipmentWeight: decimal('shipment_weight'),
    shipmentVolume: decimal('shipment_volume'),
    quantityOfItems: integer('quantity_of_items'),
    totalPalettes: integer('total_palettes'),
    activityStatus: text('activity_status'), // Changed type from integer, TODO: Define Enum?
    customerDeliveryNumber: text('customer_delivery_number'),
    itemUnitId: uuid('item_unit_id').references(() => itemUnits.id),
    mapToPickUpPosition: integer('map_to_pickup_position'), // To link delivery items back to picked up items?
    actualDateTimeOfArrival: timestamp('actual_date_time_of_arrival'),
    actualDateTimeOfDeparture: timestamp('actual_date_time_of_departure'),
    dropoff_date: timestamp('dropoff_date'),
    estimatedDateTimeOfArrival: timestamp('estimated_date_time_of_arrival'),
    estimatedDateTimeOfDeparture: timestamp('estimated_date_time_of_departure'),
    customerPoNumbers: text('customer_po_numbers'), // Comma-separated or JSONB array?
    recipientContactName: text('recipient_contact_name'), // NEW: Store contact name
    recipientContactPhone: text('recipient_contact_phone'), // NEW: Store contact phone
    createdBy: uuid('created_by').references(() => users.id), // Assuming FK to users
    modifiedBy: uuid('modified_by').references(() => users.id), // Assuming FK to users
    shipmentId: uuid('shipment_id').notNull(), // REMOVED .references(() => shipmentsErd.id)
});

export const tripPods = pgTable('trip_pods', {
    id: uuid('id').primaryKey().defaultRandom(),
    dropoffId: uuid('dropoff_id').references(() => dropoffs.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    resourceUrlString: text('resource_url_string'), // URL to POD document/image
    podReturned: boolean('pod_returned').default(false),
});

export const epods = pgTable('epods', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdById: uuid('created_by_id').references(() => users.id), // Assuming FK to users
    modifiedById: uuid('modified_by_id').references(() => users.id), // Assuming FK to users
    dropoffId: uuid('dropoff_id').references(() => dropoffs.id),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    description: varchar('description', { length: 200 }),
    blobName: varchar('blob_name', { length: 500 }), // Storage identifier
    resourceType: varchar('resource_type', { length: 100 }), // e.g., 'signature', 'photo'
    podReturned: boolean('pod_returned').default(false),
});

// Junction table for many-to-many between CustomShipmentDetails and DocumentRequirements
export const customShipmentDetailDocumentRequirements = pgTable('custom_shipment_detail_document_requirements', {
    id: uuid('id').primaryKey().defaultRandom(),
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    customShipmentDetailId: uuid('custom_shipment_detail_id').notNull().references(() => customShipmentDetails.id, { onDelete: 'cascade' }),
    documentRequirementId: uuid('document_requirement_id').notNull().references(() => documentRequirements.id, { onDelete: 'cascade' }),
});

export const trailers = pgTable('trailers', {
    id: uuid('id').primaryKey().defaultRandom(),
    transporterId: uuid('transporter_id').references(() => transporters.id), // MODIFIED: FK to new transporters table
    dateCreated: timestamp('date_created').defaultNow(),
    dateModified: timestamp('date_modified').defaultNow(),
    trailerSizeId: uuid('trailer_size_id').references(() => trailerSizes.id),
    trailerTypeId: uuid('trailer_type_id').references(() => trailerTypes.id),
    weight: decimal('weight'),
    dimension: text('dimension'), // Changed type from float based on ERD
    registrationNumber: text('registration_number'),
    permitNumber: text('permit_number'),
    permitExpiryDate: timestamp('permit_expiry_date'),
    inspectionExpiryDate: timestamp('inspection_expiry_date'),
});

// --- NEW: Transporters Table ---
export const transporters = pgTable('transporters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // Add other relevant transporter fields if needed (e.g., contact info, address)
});

// --- NEW: Items Table ---
export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').notNull().references(() => shipmentsErd.id, { onDelete: 'cascade' }),
  itemNumber: text('item_number'), // Primary item number (implicitly nullable)
  secondaryItemNumber: text('secondary_item_number'), // ADDED: From "2nd Item Number" (implicitly nullable)
  description: text('description'), // From "Description 1" (implicitly nullable)
  lotSerialNumber: text('lot_serial_number'), // From "Lot Serial Number" (implicitly nullable)
  quantity: decimal('quantity'), // From "Quantity Ordered" (implicitly nullable)
  uom: text('uom'), // From "UOM", consider FK to itemUnits? (implicitly nullable)
  weight: decimal('weight'), // From "Weight (KG)" (implicitly nullable)
  bin: text('bin'), // From "Bin" (implicitly nullable)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Junction Table (Re-added) ---

// Links documents (varchar ID) to new shipments_erd (uuid ID)
export const documentShipmentMap = pgTable('document_shipment_map', {
    documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
    shipmentId: uuid('shipment_id').notNull().references(() => shipmentsErd.id, { onDelete: 'cascade' }), // References NEW shipments_erd table
},
(table) => {
    return {
        pk: primaryKey({ columns: [table.documentId, table.shipmentId] }),
    };
});


// --- RELATIONS ---
// Define relationships based on Full ERD structure and table definitions

export const usersRelations = relations(users, ({ many }) => ({
  createdBookings: many(bookings, { relationName: 'CreatedBookings' }),
  modifiedBookings: many(bookings, { relationName: 'ModifiedBookings' }),
  createdPickupConfigs: many(pickupConfigs, { relationName: 'CreatedPickupConfigs' }),
  modifiedPickupConfigs: many(pickupConfigs, { relationName: 'ModifiedPickupConfigs' }),
  createdDropoffConfigs: many(dropoffConfigs, { relationName: 'CreatedDropoffConfigs' }),
  modifiedDropoffConfigs: many(dropoffConfigs, { relationName: 'ModifiedDropoffConfigs' }),
  createdPickups: many(pickups, { relationName: 'CreatedPickups' }),
  modifiedPickups: many(pickups, { relationName: 'ModifiedPickups' }),
  createdDropoffs: many(dropoffs, { relationName: 'CreatedDropoffs' }),
  modifiedDropoffs: many(dropoffs, { relationName: 'ModifiedDropoffs' }),
  createdEpods: many(epods, { relationName: 'CreatedEpods' }),
  modifiedEpods: many(epods, { relationName: 'ModifiedEpods' }),
  createdCustomBookingDetails: many(customBookingDetails, { relationName: 'CreatedCustomBookingDetails' }),
  modifiedCustomBookingDetails: many(customBookingDetails, { relationName: 'ModifiedCustomBookingDetails' }),
  createdShipmentsErd: many(shipmentsErd, { relationName: 'CreatedShipmentsErd' }),
  modifiedShipmentsErd: many(shipmentsErd, { relationName: 'ModifiedShipmentsErd' }),
  createdCustomTripDetails: many(customTripDetails, { relationName: 'CreatedCustomTripDetails' }),
  uploadedDocuments: many(documents),
  createdDocumentBatches: many(documentBatches),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  trips: many(trips), // A driver can have many trips
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  trips: many(trips), // A vehicle (truck) can be used for many trips
  truckLength: one(truckLengths, { fields: [vehicles.truckLengthId], references: [truckLengths.id] }),
  truckSize: one(truckSizes, { fields: [vehicles.truckSizeId], references: [truckSizes.id] }),
  truckType: one(truckTypes, { fields: [vehicles.truckTypeId], references: [truckTypes.id] }),
  truckBrand: one(truckBrands, { fields: [vehicles.truckBrandId], references: [truckBrands.id] }),
  truckModel: one(truckModels, { fields: [vehicles.truckModelId], references: [truckModels.id] }),
  truckPayload: one(truckPayloads, { fields: [vehicles.truckPayloadId], references: [truckPayloads.id] }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  uploader: one(users, { fields: [documents.uploadedById], references: [users.id] }),
  batch: one(documentBatches, { fields: [documents.batchId], references: [documentBatches.id] }),
  documentShipmentMaps: many(documentShipmentMap), // Link to shipments via junction table
}));

export const documentBatchesRelations = relations(documentBatches, ({ one, many }) => ({
  creator: one(users, { fields: [documentBatches.createdBy], references: [users.id] }),
  documents: many(documents), // A batch contains many documents
}));

// --- Relations for ERD Image 1 Tables ---

export const tripConfigsRelations = relations(tripConfigs, ({ one, many }) => ({
  trip: one(trips, { fields: [tripConfigs.id], references: [trips.tripConfigId] }), // Assumes 1:1 link via trips.tripConfigId
  pickupConfigGroups: many(pickupConfigGroups), // One TripConfig has many PickupGroups
  dropoffConfigGroups: many(dropoffConfigGroups), // One TripConfig has many DropoffGroups
}));

export const pickupConfigGroupsRelations = relations(pickupConfigGroups, ({ one, many }) => ({
  tripConfig: one(tripConfigs, { fields: [pickupConfigGroups.tripConfigId], references: [tripConfigs.id] }),
  pickupConfigs: many(pickupConfigs), // One Group has many specific Pickup Configs
}));

export const dropoffConfigGroupsRelations = relations(dropoffConfigGroups, ({ one, many }) => ({
  tripConfig: one(tripConfigs, { fields: [dropoffConfigGroups.tripConfigId], references: [tripConfigs.id] }),
  dropoffConfigs: many(dropoffConfigs), // One Group has many specific Dropoff Configs
}));

export const pickupConfigsRelations = relations(pickupConfigs, ({ one, many }) => ({
  pickupConfigGroup: one(pickupConfigGroups, { fields: [pickupConfigs.pickupConfigGroupId], references: [pickupConfigGroups.id] }),
  creator: one(users, { fields: [pickupConfigs.createdBy], references: [users.id], relationName: 'CreatedPickupConfigs' }),
  modifier: one(users, { fields: [pickupConfigs.modifiedBy], references: [users.id], relationName: 'ModifiedPickupConfigs' }),
  pickups: many(pickups), // One Config can apply to many actual Pickup events
}));

export const dropoffConfigsRelations = relations(dropoffConfigs, ({ one, many }) => ({
  dropoffConfigGroup: one(dropoffConfigGroups, { fields: [dropoffConfigs.dropoffConfigGroupId], references: [dropoffConfigGroups.id] }),
  creator: one(users, { fields: [dropoffConfigs.createdBy], references: [users.id], relationName: 'CreatedDropoffConfigs' }),
  modifier: one(users, { fields: [dropoffConfigs.modifiedBy], references: [users.id], relationName: 'ModifiedDropoffConfigs' }),
  dropoffs: many(dropoffs), // One Config can apply to many actual Dropoff events
}));

export const itemUnitsRelations = relations(itemUnits, ({ many }) => ({
  pickups: many(pickups), // Unit used in many Pickups
  dropoffs: many(dropoffs), // Unit used in many Dropoffs
}));

export const cargoStatusesRelations = relations(cargoStatuses, ({ many }) => ({
  pickups: many(pickups), // A status can apply to many pickups
  dropoffs: many(dropoffs), // A status can apply to many dropoffs
}));

export const addressesRelations = relations(addresses, ({ many }) => ({
  pickups: many(pickups), // An address can be used for many pickups
  dropoffs: many(dropoffs), // An address can be used for many dropoffs
}));

export const pickupsRelations = relations(pickups, ({ one }) => ({
  pickupConfig: one(pickupConfigs, { fields: [pickups.pickupConfigId], references: [pickupConfigs.id] }),
  address: one(addresses, { fields: [pickups.addressId], references: [addresses.id] }),
  cargoStatus: one(cargoStatuses, { fields: [pickups.cargoStatusId], references: [cargoStatuses.id] }),
  itemUnit: one(itemUnits, { fields: [pickups.itemUnitId], references: [itemUnits.id] }),
  creator: one(users, { fields: [pickups.createdBy], references: [users.id], relationName: 'CreatedPickups' }),
  modifier: one(users, { fields: [pickups.modifiedBy], references: [users.id], relationName: 'ModifiedPickups' }),
  shipment: one(shipmentsErd, { fields: [pickups.shipmentId], references: [shipmentsErd.id] }), // Link pickup to its shipment
}));

export const dropoffsRelations = relations(dropoffs, ({ one, many }) => ({
  dropoffConfig: one(dropoffConfigs, { fields: [dropoffs.dropoffConfigId], references: [dropoffConfigs.id] }),
  address: one(addresses, { fields: [dropoffs.addressId], references: [addresses.id] }),
  cargoStatus: one(cargoStatuses, { fields: [dropoffs.cargoStatusId], references: [cargoStatuses.id] }),
  itemUnit: one(itemUnits, { fields: [dropoffs.itemUnitId], references: [itemUnits.id] }),
  creator: one(users, { fields: [dropoffs.createdBy], references: [users.id], relationName: 'CreatedDropoffs' }),
  modifier: one(users, { fields: [dropoffs.modifiedBy], references: [users.id], relationName: 'ModifiedDropoffs' }),
  tripPods: many(tripPods), // A dropoff can have multiple PODs
  epods: many(epods), // A dropoff can have multiple ePODs
  shipment: one(shipmentsErd, { fields: [dropoffs.shipmentId], references: [shipmentsErd.id] }), // Link dropoff to its shipment
}));

export const tripPodsRelations = relations(tripPods, ({ one }) => ({
  dropoff: one(dropoffs, { fields: [tripPods.dropoffId], references: [dropoffs.id] }), // Each POD belongs to one Dropoff
}));

export const epodsRelations = relations(epods, ({ one }) => ({
  creator: one(users, { fields: [epods.createdById], references: [users.id], relationName: 'CreatedEpods' }),
  modifier: one(users, { fields: [epods.modifiedById], references: [users.id], relationName: 'ModifiedEpods' }),
  dropoff: one(dropoffs, { fields: [epods.dropoffId], references: [dropoffs.id] }), // Each ePOD belongs to one Dropoff
}));

// --- Relations for ERD Image 2 Tables ---

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  creator: one(users, { fields: [bookings.createdBy], references: [users.id], relationName: 'CreatedBookings' }),
  modifier: one(users, { fields: [bookings.modifiedBy], references: [users.id], relationName: 'ModifiedBookings' }),
  customBookingDetails: many(customBookingDetails), // A booking can have multiple custom details
  shipments: many(shipmentsErd), // A booking can result in multiple shipments
}));

export const shipmentsErdRelations = relations(shipmentsErd, ({ one, many }) => ({ // Use distinct name
  booking: one(bookings, { fields: [shipmentsErd.bookingId], references: [bookings.id] }),
  modifier: one(users, { fields: [shipmentsErd.modifiedBy], references: [users.id], relationName: 'ModifiedShipmentsErd' }),
  customShipmentDetails: many(customShipmentDetails), // A shipment can have multiple custom details
  documentShipmentMaps: many(documentShipmentMap), // Link to documents via junction table
  pickups: many(pickups), // A shipment involves multiple pickups
  dropoffs: many(dropoffs), // A shipment involves multiple dropoffs
}));

export const customBookingDetailsRelations = relations(customBookingDetails, ({ one, many }) => ({
  booking: one(bookings, { fields: [customBookingDetails.bookingId], references: [bookings.id] }),
  shipment: one(shipmentsErd, { fields: [customBookingDetails.shipmentId], references: [shipmentsErd.id] }), // Link to new shipments table
  modifier: one(users, { fields: [customBookingDetails.modifiedBy], references: [users.id], relationName: 'ModifiedCustomBookingDetails' }),
  customShipmentDetails: many(customShipmentDetails), // Link to the detailed shipment info
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  tripConfig: one(tripConfigs, { fields: [trips.tripConfigId], references: [tripConfigs.id] }),
  truck: one(vehicles, { fields: [trips.truckId], references: [vehicles.id] }), // Link to vehicles table
  driver: one(drivers, { fields: [trips.driverId], references: [drivers.id] }), // Link to drivers table
  customTripDetails: one(customTripDetails, { fields: [trips.id], references: [customTripDetails.tripId]}), // Each Trip has one CustomTripDetails
  shipments: many(shipmentsErd), // ADDED: A trip can have multiple shipments
}));

export const customTripDetailsRelations = relations(customTripDetails, ({ one }) => ({
  creator: one(users, { fields: [customTripDetails.createdBy], references: [users.id], relationName: 'CreatedCustomTripDetails' }),
  trip: one(trips, { fields: [customTripDetails.tripId], references: [trips.id] }), // Relation back to Trip (1:1)
}));

export const customShipmentDetailsRelations = relations(customShipmentDetails, ({ one, many }) => ({
  customBookingDetail: one(customBookingDetails, { fields: [customShipmentDetails.customBookingDetailsId], references: [customBookingDetails.id] }),
  shipment: one(shipmentsErd, { fields: [customShipmentDetails.shipmentId], references: [shipmentsErd.id] }), // Link to new shipments table
  hazardous: one(hazardous, { fields: [customShipmentDetails.hazardousId], references: [hazardous.id] }),
  cargoValue: one(cargoValues, { fields: [customShipmentDetails.cargoValueId], references: [cargoValues.id] }),
  trip: one(trips, { fields: [customShipmentDetails.tripId], references: [trips.id] }), // Link to the trip that executes this shipment detail
  equipmentRequirements: one(equipmentRequirements, { fields: [customShipmentDetails.id], references: [equipmentRequirements.customShipmentDetailId] }), // Link to equipment (1:1 via unique FK)
  documentRequirementsMap: many(customShipmentDetailDocumentRequirements), // Link to required docs via junction
}));

export const hazardousRelations = relations(hazardous, ({ many }) => ({
  customShipmentDetails: many(customShipmentDetails), // Used in many shipment details
}));

export const cargoDescriptionsRelations = relations(cargoDescriptions, ({ many }) => ({
  cargoValues: many(cargoValues), // A description can have multiple value tiers
}));

export const cargoValuesRelations = relations(cargoValues, ({ one, many }) => ({
  cargoDescription: one(cargoDescriptions, { fields: [cargoValues.cargoDescriptionId], references: [cargoDescriptions.id] }),
  customShipmentDetails: many(customShipmentDetails), // Used in many shipment details
}));

export const documentRequirementsRelations = relations(documentRequirements, ({ many }) => ({
  customShipmentDetailsMap: many(customShipmentDetailDocumentRequirements), // Link via junction
}));

export const equipmentRequirementsRelations = relations(equipmentRequirements, ({ one }) => ({
  customShipmentDetail: one(customShipmentDetails, { fields: [equipmentRequirements.customShipmentDetailId], references: [customShipmentDetails.id] }),
}));

export const customShipmentDetailDocumentRequirementsRelations = relations(customShipmentDetailDocumentRequirements, ({ one }) => ({
  customShipmentDetail: one(customShipmentDetails, { fields: [customShipmentDetailDocumentRequirements.customShipmentDetailId], references: [customShipmentDetails.id] }),
  documentRequirement: one(documentRequirements, { fields: [customShipmentDetailDocumentRequirements.documentRequirementId], references: [documentRequirements.id] }),
}));

export const trailersRelations = relations(trailers, ({ one }) => ({
  trailerSize: one(trailerSizes, { fields: [trailers.trailerSizeId], references: [trailerSizes.id] }),
  trailerType: one(trailerTypes, { fields: [trailers.trailerTypeId], references: [trailerTypes.id] }),
}));

// --- Lookup Table Relations ---
export const truckTypesRelations = relations(truckTypes, ({ many }) => ({ vehicles: many(vehicles) }));
export const truckPayloadsRelations = relations(truckPayloads, ({ many }) => ({ vehicles: many(vehicles) }));
export const truckModelsRelations = relations(truckModels, ({ many }) => ({ vehicles: many(vehicles) }));
export const truckLengthsRelations = relations(truckLengths, ({ many }) => ({ vehicles: many(vehicles) }));
export const truckBrandsRelations = relations(truckBrands, ({ many }) => ({ vehicles: many(vehicles) }));
export const truckSizesRelations = relations(truckSizes, ({ many }) => ({ vehicles: many(vehicles) }));
export const trailerTypesRelations = relations(trailerTypes, ({ many }) => ({ trailers: many(trailers) }));
export const trailerSizesRelations = relations(trailerSizes, ({ many }) => ({ trailers: many(trailers) }));

// --- RELATION DEFINITIONS (Core for Shipment Details) ---

export const shipmentRelations = relations(shipmentsErd, ({ one, many }) => ({ // Renamed for consistency & Corrected Relations
  booking: one(bookings, {
    fields: [shipmentsErd.bookingId],
    references: [bookings.id],
  }),
  customDetails: one(customShipmentDetails, { // Assuming one custom detail per shipment
    fields: [shipmentsErd.id],
    references: [customShipmentDetails.shipmentId],
  }),
  // Corrected to one-to-one/many for FKs on shipmentsErd
  pickup: one(pickups, { 
    fields: [shipmentsErd.pickupId], 
    references: [pickups.id] 
  }),
  dropoff: one(dropoffs, { 
    fields: [shipmentsErd.dropoffId], 
    references: [dropoffs.id] 
  }),
  trip: one(trips, { // Added trip relation
      fields: [shipmentsErd.tripId],
      references: [trips.id],
  }),
  documentMappings: many(documentShipmentMap),
  items: many(items), // Added relation to items
}));

export const customShipmentDetailRelations = relations(customShipmentDetails, ({ one }) => ({
  shipment: one(shipmentsErd, {
    fields: [customShipmentDetails.shipmentId],
    references: [shipmentsErd.id],
  }),
  customBookingDetails: one(customBookingDetails, {
     fields: [customShipmentDetails.customBookingDetailsId],
     references: [customBookingDetails.id],
  }),
}));

export const pickupRelations = relations(pickups, ({ one }) => ({ // Renamed for consistency
  shipment: one(shipmentsErd, {
    fields: [pickups.shipmentId], // This correctly references the column
    references: [shipmentsErd.id], // This establishes the FK relation for ORM use
  }),
  address: one(addresses, {
    fields: [pickups.addressId],
    references: [addresses.id],
  }),
  pickupConfig: one(pickupConfigs, {
    fields: [pickups.pickupConfigId],
    references: [pickupConfigs.id],
  }),
}));

export const dropoffRelations = relations(dropoffs, ({ one }) => ({ // Renamed for consistency
  shipment: one(shipmentsErd, {
     fields: [dropoffs.shipmentId], // This correctly references the column
     references: [shipmentsErd.id], // This establishes the FK relation for ORM use
  }),
  address: one(addresses, {
    fields: [dropoffs.addressId],
    references: [addresses.id],
  }),
  dropoffConfig: one(dropoffConfigs, {
    fields: [dropoffs.dropoffConfigId],
    references: [dropoffConfigs.id],
  }),
}));

export const addressRelations = relations(addresses, ({ many }) => ({
  pickups: many(pickups),
  dropoffs: many(dropoffs),
}));

export const itemsRelations = relations(items, ({ one }) => ({ // ADDED Items relation
  shipment: one(shipmentsErd, { 
    fields: [items.shipmentId], 
    references: [shipmentsErd.id] 
  }), 
}));
