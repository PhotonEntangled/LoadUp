// Define the structure for the API response when fetching shipment details

export interface ApiAddressDetail {
  id?: string; // Optional: Database ID of the address record
  rawInput: string | null; // The original address string
  name: string | null; // Often the company name at the address
  street: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string | null;
  fullAddress: string | null; // The resolved, formatted address
  latitude: number | null;
  longitude: number | null;
  resolutionMethod: 'direct' | 'geocode' | 'manual' | 'failed' | 'partial' | 'none' | null;
  resolutionConfidence: number | null;
  resolvedTimestamp: string | null; // ISO 8601 timestamp
}

export interface ApiContact {
  id?: string; // Optional: Database ID
  contactName: string | null;
  contactNumber: string | null;
  contactEmail: string | null;
}

export interface ApiShipmentItemDimension {
  length: number | null;
  width: number | null;
  height: number | null;
  unit: string | null; // e.g., 'cm', 'in'
}

export interface ApiShipmentItem {
  id?: string; // Optional: Database ID
  itemNumber: string | null; // ADDED: Primary Item Number
  secondaryItemNumber: string | null; // ADDED: Secondary Item Number
  description: string | null;
  quantity: number | null;
  sku: string | null;
  weight: number | null;
  weightUnit: string | null; // e.g., 'kg', 'lbs'
  dimensions?: ApiShipmentItemDimension | null;
  hsCode: string | null; // Harmonized System code for customs
  // Other potential fields from the old structure if needed:
  lotSerialNumber?: string | null; // Merge or decide if still needed
  uom?: string | null; // Unit of Measure - potentially redundant with quantity/weightUnit
  bin?: string | null; // Location identifier
}

export interface ApiTransporterInfo {
  carrierName: string | null;
  truckId: string | null;
  trailerId: string | null;
  driverName: string | null;
  driverCell: string | null;
  mcNumber: string | null; // Motor Carrier number
  dotNumber: string | null; // Department of Transportation number
}

export interface ApiOtherCharge {
  description: string | null;
  amount: number;
  currency: string | null; // e.g., 'USD'
}

export interface ApiTripRate {
  rate: number | null;
  currency: string | null; // e.g., 'USD'
  dropCharge: number | null;
  manpowerCharge: number | null;
  fuelSurcharge: number | null;
  detentionRate: number | null;
  detentionCurrency: string | null; // Separate currency for detention?
  otherCharges?: ApiOtherCharge[];
}

export interface ApiBillingInfo {
  billToAddressId?: string | null; // Link to an Address record
  paymentTerms: string | null;
}

export interface ApiCustomDetails {
  // These fields were previously potentially at the root
  transporter?: ApiTransporterInfo | null;
  tripRate?: ApiTripRate | null;
  billingInfo?: ApiBillingInfo | null;
  totalCharge?: number | null;
  // Any other fields that don't fit the core/item/address structure
  // Example: shipmentNotes, specialInstructions etc.
}

export interface ApiShipmentCoreInfo {
  id: string; // Primary key from the database
  documentId: string; // Link back to the source document
  loadNumber: string | null;
  orderNumber: string | null;
  poNumber: string | null;
  status: string | null; // Consider using an enum: 'Processing', 'In Transit', 'Delivered', 'Exception' etc.
  totalWeight: number | null;
  totalWeightUnit: string | null;
  totalVolume: number | null;
  totalVolumeUnit: string | null;
  totalItems: number | null;

  // Dates (ISO 8601 strings or Date objects - ensure consistency)
  promisedShipDate: string | null;
  plannedDeliveryDate: string | null;
  actualPickupArrival: string | null;
  actualPickupDeparture: string | null;
  actualDeliveryArrival: string | null;
  actualDeliveryDeparture: string | null; // Added this
  // --- ADDED: Last Known Position --- 
  lastKnownLatitude: number | null;
  lastKnownLongitude: number | null;
  lastKnownTimestamp: string | null; // ISO 8601
  lastKnownBearing: number | null; // ADDED: Bearing in degrees (0-360)
}

export interface ApiShipmentMetadata {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  sourceFilename: string | null;
  dataSource: string | null; // e.g., 'EDI', 'Manual', 'TMS API'
  remarks: string | null; // Moved remarks here
}

// The main structure for the API response
export interface ApiShipmentDetail {
  coreInfo: ApiShipmentCoreInfo;
  originAddress: ApiAddressDetail | null;
  destinationAddress: ApiAddressDetail | null;
  shipper: ApiContact | null; // Shipper contact info
  recipient: ApiContact | null; // Recipient contact info (formerly potentially shipToCustomer)
  items: ApiShipmentItem[];
  customDetails: ApiCustomDetails | null;
  metadata: ApiShipmentMetadata;
  locationDetails: {
    pickups: ApiPickupDropoffInfo[];
    dropoffs: ApiPickupDropoffInfo[];
  };
  contacts: {
    primaryShipperContact: ApiContact | null;
    primaryConsigneeContact: ApiContact | null;
    primaryBillToContact: ApiContact | null;
    otherContacts: ApiContact[];
  };
  financials: ApiFinancialInfo;
  tripAndCarrier: {
    carrierName: string | null;
    driverName: string | null;
    driverCell: string | null;
    driverIc: string | null;
    truckId: string | null;
    trailerId: string | null;
    modeOfTransport: string | null;
    estimatedTravelTimeHours: number | null;
    actualDistanceKm: number | null;
  };
  statusUpdates: ApiStatusUpdate[];
}

// Added Type Definition
export interface ApiFinancialInfo {
    totalCharges: number;
    currency: string;
    invoiceNumber: string;
    paymentTerms: string;
    rateDetails: Array<{ description: string; amount: number; currency: string }>;
    billingAddress: ApiAddressDetail | null;
    taxInformation: {
        taxId: string;
        taxAmount: number;
    };
}

// Added Type Definition
export interface ApiStatusUpdate {
    timestamp: string;
    status: string;
    location: string;
    notes: string;
}

// Added Type Definition
export interface ApiPickupDropoffInfo {
    locationType: 'Pickup' | 'Dropoff';
    sequence: number;
    locationName: string;
    address: ApiAddressDetail | null;
    contact: ApiContact | null;
    scheduledDateTimeUTC: string | null;
    actualDateTimeUTC: string | null;
    notes: string;
    resolutionStatus: string; // e.g., 'Pending', 'Resolved', 'Issue'
    driverInstructions: string;
} 