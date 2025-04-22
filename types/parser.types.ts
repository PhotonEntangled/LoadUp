// @/types/parser.types.ts

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { 
    shipmentsErd, 
    customShipmentDetails, 
    addresses, 
    pickups,
    dropoffs,
    items, 
    bookings 
} from '../lib/database/schema';
import { DocumentType } from '@/types/shipment';

// Define ProcessingError Type
export interface ProcessingError {
  message: string;
  severity: 'error' | 'warning' | 'critical';
  field?: string; // Optional field context
  rowIndex?: number; // Optional row context
}

// --- Base Insert Types (Inferred from Schema or Defined) ---

/** Placeholder for items table data structure. Define actual structure when available in schema.ts */
export interface ShipmentItemInsertData {
    shipmentId?: string; // FK to shipmentsErd
    itemNumber?: string | null;
    secondaryItemNumber?: string | null;
    description?: string | null;
    lotSerialNumber?: string | null;
    quantity?: number | null;
    uom?: string | null; // Consider linking to itemUnits table if applicable
    weight?: number | null; // Use number, assuming schema uses decimal/real
    bin?: string | null;
    // Add other relevant item fields as needed
}

// Explicitly define insert types for clarity and potential modifications
export type ShipmentBaseInsertData = InferInsertModel<typeof shipmentsErd>;
export type AddressInsertData = InferInsertModel<typeof addresses>;
export type PickupInsertData = InferInsertModel<typeof pickups>;
export type DropoffInsertData = InferInsertModel<typeof dropoffs>;

// TODO: Fix the database schema (lib/database/schema.ts) for customShipmentDetails.
//       The following fields (tripRate, dropCharge, etc.) should be numeric types (decimal, real), not varchar/text.
/** Extended insert type for custom details, including specific invoice fields. */
export interface CustomDetailsInsertData {
  // shipmentId?: string; // FK added during transaction
  customerShipmentNumber?: string | undefined;
  customerDocumentNumber?: string | undefined;
  remarks?: string | undefined;
  // Invoice/Rate Fields - Changed to number | undefined to match schema
  tripRate?: number | undefined;
  dropCharge?: number | undefined;
  manpowerCharge?: number | undefined;
  totalCharge?: number | undefined;
  // Raw Input fields
  rawTripRateInput?: string | undefined;
  rawDropChargeInput?: string | undefined;
  rawManpowerChargeInput?: string | undefined;
  rawTotalChargeInput?: string | undefined;
  // Misc Rate Fields (If applicable, ensure schema supports)
  miscTripRate?: number | undefined;
  miscDrop?: number | undefined;
  miscManpower?: number | undefined;
  miscTotal?: number | undefined;

  stackable?: boolean | undefined;
  manpower?: number | undefined;
  specialRequirement?: string | undefined;
  totalTransportWeight?: number | undefined;
  totalTransportVolume?: number | undefined;
  carrierName?: string | null;
  truckId?: string | null;
  // ... other custom_shipment_details fields ...
}

// --- Parser Metadata Structure ---

/** Metadata related to the parsing process for a single row/shipment. */
export interface ParserProcessingMetadata {
  originalRowData: Record<string, any>; // Raw data from the source row
  originalRowIndex: number; // 0-based index in the source file/sheet
  confidenceScore?: number | null; // Overall confidence score for the parsing
  processingErrors?: string[] | null; // List of errors encountered during parsing this row
  needsReview?: boolean | null; // Flag indicating if manual review is recommended
  sourceDocumentId?: string | null; // Link back to the source document.id
  rawOriginInput?: string | null;
  rawDestinationInput?: string | null;
  processingNotes?: string[]; // Optional array for notes like split detection
}

// --- The Main Parser Output Bundle ---

/**
 * Represents the structured output of the parsing process for a single shipment row.
 * This bundle contains data organized for insertion into the corresponding
 * relational database tables defined in lib/database/schema.ts.
 */
export interface ParsedShipmentBundle {
  /** Data intended for the 'shipments_erd' table. */
  shipmentBaseData: ShipmentBaseInsertData;

  /** Data intended for the 'custom_shipment_details' table. */
  customDetailsData: CustomDetailsInsertData | null; // Can be null if no custom details found/applicable

  /** Data intended for the 'addresses' table representing the origin. */
  originAddressData: AddressInsertData | null; // Can be null if origin address couldn't be determined

  /** Data intended for the 'addresses' table representing the destination. */
  destinationAddressData: AddressInsertData | null; // Can be null if destination address couldn't be determined

  /** Data intended for the 'pickups' table. */
  pickupData: PickupInsertData | null; // Assuming one primary pickup per shipment row for now

  /** Data intended for the 'dropoffs' table. */
  dropoffData: DropoffInsertData | null; // Null if no dropoff data

  /** Array of data intended for the 'items' table. */
  itemsData: ShipmentItemInsertData[]; // Array, potentially empty

  /** Metadata about the parsing process for this specific shipment row. */
  metadata: ParserProcessingMetadata; // Always present

  /** The normalized status string derived by the shipmentBuilder (e.g., 'DELIVERED', 'PENDING', 'AWAITING_STATUS'). */
  parsedStatusString: string;

  /** Raw parsed truck/driver details for downstream processing (e.g., finding/creating related Trip/Truck/Driver records). */
  parsedDriverName?: string | undefined; // Name parsed from truck details or contact
  parsedDriverPhone?: string | undefined; // Phone parsed from truck details or contact
  parsedTruckIdentifier?: string | undefined; // e.g., Plate number parsed from truck details
  parsedDriverIc?: string | undefined; // ADDED: IC number parsed from truck details
}

// Add ExcelParseOptions interface here
export interface ExcelParseOptions {
    hasHeaderRow?: boolean;
    headerRowIndex?: number; // Original index in the sheet
    useAIMapping?: boolean; // Specific flag for AI mapping, potentially deprecated by aiFieldMappingEnabled
    aiFieldMappingEnabled?: boolean; // Preferred flag for AI mapping
    aiMappingConfidenceThreshold?: number;
    sheetIndex?: number; // Index of sheet to process (0-based)
    sheetName?: string; // Name of sheet to process
    // fieldMapping?: Record<string, string>; // Direct field mapping override (less common)
    isOcrData?: boolean; // Flag if the source is OCR
    ocrSource?: string; // Identifier for the source file/document if OCR
    ocrConfidence?: number; // Overall confidence from OCR process
    documentType?: DocumentType; // Hint for the type of document being parsed
    includeUnmappedData?: boolean; // Option to include data not mapped to known headers
    sourceDocumentId?: string; // FIX: Add optional sourceDocumentId
    fileName?: string; // ADDED: Optional filename
}