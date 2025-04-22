// types/shipment.ts

// Based on usage in ShipmentCard.tsx and ShipmentDetailPage.tsx

export interface LocationDetail {
  rawInput?: string | null;
  resolvedAddress?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolutionMethod?: string | null;
  resolutionConfidence?: number | null;
  name?: string | null; // For warehouse/customer name at location
}

export interface ShipmentItem {
  itemNumber?: string | null;
  secondaryItemNumber?: string | null;
  description?: string | null;
  lotSerialNumber?: string | null;
  quantity?: number | null;
  uom?: string | null;
  weight?: number | null;
  bin?: string | null;
  itemUnitId?: string | null;
  shipmentVolume?: number | null;
}

export interface SourceInfo {
  sheetName?: string | null;
  rowIndex?: number | null;
  fileName?: string | null;
  groupOriginRawInput?: string | null;
}

// Define and Export ParsingMetadata type
export interface ParsingMetadata {
  originalHeaders: string[];
  fieldMappingsUsed: FieldMappingResult[];
  aiMappedFields: AIMappedField[];
  needsReview: boolean;
  parserVersion: string;
}

// Define and Export ShipmentConfidenceScore type (based on ShipmentData.confidenceScore)
export interface ShipmentConfidenceScore {
  confidence: number;
  needsReview: boolean;
  message: string;
}

// ADDED: Enum for Document Types (based on parserRefs/lib/document-processing.ts usage)
export enum DocumentType {
  ETD_REPORT = 'ETD_REPORT',
  OUTSTATION_RATES = 'OUTSTATION_RATES',
  MOCK_STATUS_TEST = 'MOCK_STATUS_TEST',
  UNKNOWN = 'UNKNOWN'
}

// ADDED: Raw Row Data Type (based on parser usage)
export type RawRowData = Record<string, any>;

// ADDED: AI Mapped Field Type (based on parser usage and existing ParsingMetadata)
export interface AIMappedField {
  originalField: string;
  field: string; // Standardized field name
  confidence: number;
}

// ADDED: Field Mapping Result Type (based on parser usage)
export interface FieldMappingResult {
  fieldName: string;
  confidence: number;
  aiMapped: boolean;
  originalField?: string;
  isMiscellaneous?: boolean;
  needsReview?: boolean;
}

// Main Shipment Data Structure
export interface ShipmentData {
  // Identifiers
  loadNumber?: string | null;
  orderNumber?: string | null;
  poNumber?: string | null;
  customerShipmentNumber?: string | null;
  tripId?: string | null;
  
  // Status & Review
  status?: string | null;
  activityStatus?: string | null;
  podStatus?: string | null;
  tripStatus?: string | null;
  needsReview?: boolean | null;
  confidenceScore?: ShipmentConfidenceScore | null;

  // Locations
  origin?: LocationDetail | null;
  destination?: LocationDetail | null;
  shipToCustomer?: string | null;
  shipToArea?: string | null;
  
  // Dates (Using fields observed in components)
  promisedShipDate?: string | number | Date | null;
  requestDate?: string | number | Date | null;
  plannedPickupDate?: string | number | Date | null;
  plannedDeliveryDate?: string | number | Date | null;
  receivingDate?: string | number | Date | null;
  actualPickupArrival?: string | number | Date | null;
  actualPickupDeparture?: string | number | Date | null;
  actualDeliveryArrival?: string | number | Date | null;
  actualDeliveryDeparture?: string | number | Date | null;
  estimatedPickupArrival?: string | number | Date | null;
  estimatedPickupDeparture?: string | number | Date | null;
  estimatedDeliveryArrival?: string | number | Date | null;
  estimatedDeliveryDeparture?: string | number | Date | null;
  
  // Contact
  contactName?: string | null;
  contactNumber?: string | null;

  // Items
  items?: ShipmentItem[] | null;
  totalWeight?: number | null;
  shipmentVolume?: number | null;
  totalPalettes?: number | null;
  orderType?: string | null;
  material?: string | null;
  materialType?: string | null;
  cargoValue?: number | string | null;

  // Requirements & Characteristics
  stackable?: boolean | null;
  hazardous?: string | null;
  equipmentRequirements?: string | null;
  specialRequirements?: string | null;
  manpowerRequired?: number | null;
  sealed?: boolean | null;

  // Trip / Vehicle / Driver
  carrierName?: string | null;
  truckId?: string | null;
  driverName?: string | null;
  driverId?: string | null;
  driverPhone?: string | null;

  // Financials
  tripRate?: number | null;
  dropCharge?: number | null;
  manpowerCharge?: number | null;
  totalCharge?: number | null;

  // Notes & Fields
  remarks?: string | null;
  customerDeliveryNumber?: string | null;
  miscellaneousFields?: Record<string, any> | null;

  // Metadata
  documentType?: DocumentType | null;
  sourceInfo?: SourceInfo | null;
  parsingMetadata?: ParsingMetadata | null;
  processingErrors?: string[] | null;
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
}

// --- BEGIN: Parser Output Structures (Phase 3.6a) ---

// Represents data specifically for the 'addresses' table
export interface AddressInsertData {
  rawInput: string | null;
  name: string | null;
  street: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string | null;
  fullAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  resolutionMethod: 'direct' | 'geocode' | 'manual' | 'failed' | 'partial' | 'none' | null;
  resolutionConfidence: number | null;
  resolvedTimestamp?: string | null; // Optional, set during geocoding maybe
}

// Represents data specifically for the 'items' table
export interface ItemInsertData {
  // shipmentId will be linked during transaction
  itemNumber: string | null; // Primary Item Number
  description: string | null;
  quantity: number | null;
  sku: string | null; // Mapped from itemNumber or secondaryItemNumber?
  secondaryItemNumber: string | null; // ENSURE THIS IS PRESENT
  weight: number | null;
  weightUnit: string | null;
  length: number | null; // Assuming dimensions flattened
  width: number | null;
  height: number | null;
  dimensionUnit: string | null;
  hsCode: string | null;
  lotSerialNumber: string | null;
  uom: string | null;
  bin: string | null;
  itemUnitId?: string | null; // Link if applicable
}

// Represents data specifically for the 'custom_shipment_details' table
export interface CustomDetailsInsertData {
  // shipmentId will be linked during transaction
  // tripId, hazardousId, cargoValueId, etc. might be linked later or derived
  stackable: boolean | null;
  manpower: number | null;
  manpowerCharge: number | null;
  totalCharge: number | null;
  tripRate: number | null;
  dropCharge: number | null;
  customerDocumentNumber: string | null; // e.g., Order# from source
  customerShipmentNumber: string | null; // e.g., Load# from source
  sovyJobNo: string | null;
  remarks: string | null;
  specialRequirement: string | null;
  podStatus: string | null; // Or enum?
  // Add other rate fields confirmed in schema check if needed
  totalTransporterRate?: number | null;
  totalTransporterManPowerRate?: number | null;
  totalTransporterDropPointRate?: number | null;
  // ... include others as necessary ...
}

// Represents data specifically for the 'pickups' table
export interface PickupInsertData {
  // shipmentId and originAddressId linked during transaction
  scheduledDate: string | null; // ISO date string or Date
  actualArrival?: string | null; // ISO date string or Date
  actualDeparture?: string | null; // ISO date string or Date
  // Any other pickup-specific fields
}

// Represents data specifically for the 'dropoffs' table
export interface DropoffInsertData {
  // shipmentId and destinationAddressId linked during transaction
  scheduledDate: string | null; // ISO date string or Date
  actualArrival?: string | null; // ISO date string or Date
  actualDeparture?: string | null; // ISO date string or Date
  customerPoNumbers?: string | null; // Seems PO is often linked here
  recipientContactName?: string | null;
  recipientContactPhone?: string | null;
  // Any other dropoff-specific fields
}

// Represents data specifically for the core 'shipments_erd' table
export interface ShipmentBaseInsertData {
  documentId: string; // Link to the source document
  // originAddressId and destinationAddressId linked during transaction
  status: string | null; // e.g., 'Processing', 'Parsed', 'Delivered'
  loadNumber: string | null;
  orderNumber: string | null;
  proNumber: string | null;
  totalWeight: number | null;
  totalWeightUnit: string | null;
  totalVolume: number | null;
  totalVolumeUnit: string | null;
  totalItems: number | null;
  // Any other core fields needed at insertion time
}

// The final bundle produced by the parser for one shipment (row)
export interface ParsedShipmentBundle {
  shipmentBaseData: ShipmentBaseInsertData;
  customDetailsData: CustomDetailsInsertData;
  originAddressData: AddressInsertData | null; // May not always resolve
  destinationAddressData: AddressInsertData | null; // May not always resolve
  pickupData: PickupInsertData;
  dropoffData: DropoffInsertData;
  itemsData: ItemInsertData[];
  // Metadata for context during insertion/debugging
  sourceInfo: SourceInfo | null;
  parsingMetadata: ParsingMetadata | null;
  processingErrors: string[] | null;
  needsReviewFlag: boolean;
}

// --- END: Parser Output Structures ---

// Basic type definition based on the helper function in API route
// TODO: Refine this based on actual statuses used and potentially convert to an enum
export type ShipmentStatus =
  | 'DELIVERED'
  | 'IN_TRANSIT'
  | 'PICKUP_SCHEDULED'
  | 'ERROR'
  | 'NEEDS_REVIEW'; // Added based on priority map in API 