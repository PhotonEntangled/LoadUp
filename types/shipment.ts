/**
 * Types for shipment data in the LoadUp application
 * Includes support for AI-mapped fields
 */

/**
 * Item in a shipment (products, packages, etc.)
 */
export interface ShipmentItem {
  itemNumber: string;
  description: string;
  quantity: number;
  weight?: number;
  dimensions?: string;
  hazardous?: boolean;
  specialHandling?: string;
  [key: string]: any; // Allow for additional item fields
}

/**
 * Information about an AI-mapped field
 */
export interface AIMappedField {
  field: string;       // The standardized field name
  originalField: string; // The original field name from the source
  confidence: number;  // Confidence score (0-1)
}

/**
 * Main shipment data structure
 */
export interface ShipmentData {
  // Essential shipment identifiers
  loadNumber: string;
  orderNumber: string;
  poNumber?: string;
  
  // Dates and timing
  promisedShipDate: string;
  actualShipDate?: string;
  expectedDeliveryDate?: string;
  requestDate?: string;
  
  // Shipping information
  shipToCustomer: string;
  shipToAddress: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZip?: string;
  shipToCountry?: string;
  
  // Contact information
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;
  
  // Shipment details
  items: ShipmentItem[];
  totalWeight: number;
  totalValue?: number;
  dimensions?: string;
  
  // Logistics information
  carrier?: string;
  trackingNumber?: string;
  routeNumber?: string;
  vehicleType?: string;
  
  // Additional information
  remarks?: string;
  
  // Custom fields
  additionalFields?: Record<string, any>;
  miscellaneousFields?: Record<string, any>;
  
  // AI mapping information
  aiMappedFields?: AIMappedField[];
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
}

/**
 * Result of shipment data confidence calculation
 */
export interface ShipmentConfidenceResult {
  confidence: number;  // Overall confidence score (0-1)
  needsReview: boolean; // Whether human review is recommended
  message: string;     // Descriptive message about confidence
}

/**
 * CSV export options for shipment data
 */
export interface ShipmentExportOptions {
  includeAIInfo?: boolean; // Whether to include AI mapping info in the export
  onlyEssentialFields?: boolean; // Whether to include only essential fields
}

/**
 * Batch processing result
 */
export interface BatchProcessingResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  warnings: number;
  shipments: ShipmentData[];
} 