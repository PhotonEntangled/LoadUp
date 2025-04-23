export interface ApiAddressDetail {
  id?: string
  rawInput: string | null
  name: string | null
  street: string | null // Note: shipmentCard uses street1/street2, adjust mapping if needed
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
  fullAddress: string | null
  latitude: number | null
  longitude: number | null
  resolutionMethod: "direct" | "geocode" | "manual" | "failed" | "partial" | "none" | null
  resolutionConfidence: number | null
  resolvedTimestamp: string | null
  // Consider adding location-specific contact fields if available/needed
  // contactPerson?: string | null;
  // contactPhone?: string | null;
  // contactEmail?: string | null;
}

export interface ApiContact {
  id?: string
  contactName: string | null
  contactNumber: string | null
  contactEmail: string | null
}

export interface ApiShipmentItemDimension {
  length: number | null
  width: number | null
  height: number | null
  unit: string | null
}

export interface ApiShipmentItem {
  id?: string
  description: string | null
  quantity: number | null
  sku: string | null
  weight: number | null
  weightUnit: string | null
  dimensions?: ApiShipmentItemDimension | null
  hsCode: string | null
  lotSerialNumber?: string | null
  uom?: string | null
  bin?: string | null
}

export interface ApiTransporterInfo {
  carrierName: string | null
  truckId: string | null
  trailerId: string | null
  driverName: string | null
  driverCell: string | null
  mcNumber: string | null
  dotNumber: string | null
}

export interface ApiOtherCharge {
  description: string | null
  amount: number // Use number for financial values
  currency: string | null
}

export interface ApiTripRate {
  rate: number | null // Use number
  currency: string | null
  dropCharge: number | null
  manpowerCharge: number | null
  otherCharges?: ApiOtherCharge[]
}

export interface ApiBillingInfo {
  billToAddressId?: string | null
  paymentTerms: string | null
}

export interface ApiCustomDetails {
  transporter?: ApiTransporterInfo | null
  tripRate?: ApiTripRate | null
  billingInfo?: ApiBillingInfo | null
  // Add other custom fields as needed, e.g.:
  // specialInstructions?: string | null;
}

export interface ApiShipmentCoreInfo {
  id: string
  documentId: string
  loadNumber: string | null
  orderNumber: string | null
  poNumber: string | null
  status: string | null // Ideally an enum
  totalWeight: number | null // Use number
  totalWeightUnit: string | null
  totalVolume: number | null // Use number
  totalVolumeUnit: string | null
  totalItems: number | null // Use number

  // Dates should be consistently formatted (ISO strings recommended for API)
  promisedShipDate: string | null
  plannedDeliveryDate: string | null
  actualPickupArrival: string | null
  actualPickupDeparture: string | null
  actualDeliveryArrival: string | null
  actualDeliveryDeparture: string | null
}

export interface ApiShipmentMetadata {
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  sourceFilename: string | null
  dataSource: string | null
  remarks: string | null
}

// Main structure
export interface ApiShipmentDetail {
  coreInfo: ApiShipmentCoreInfo
  originAddress: ApiAddressDetail | null
  destinationAddress: ApiAddressDetail | null
  shipper: ApiContact | null // Primary shipper contact
  recipient: ApiContact | null // Primary recipient contact
  items: ApiShipmentItem[]
  customDetails: ApiCustomDetails | null
  metadata: ApiShipmentMetadata
}
