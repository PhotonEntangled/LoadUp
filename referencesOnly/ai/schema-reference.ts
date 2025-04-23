/**
 * ERD Schema Reference for AI Field Mapping
 * 
 * This file contains standardized field names and descriptions from the ERD schema
 * to be used by the AI field mapping service.
 */

export interface SchemaFieldDefinition {
  [field: string]: string; // field name -> description
}

/**
 * Schema field structure
 */
export interface SchemaField {
  name: string;
  description: string;
}

/**
 * Essential shipment fields with descriptions based on the ERD schema
 */
export const ERD_SCHEMA_FIELDS: SchemaFieldDefinition = {
  // Core shipment fields
  "loadNumber": "The unique identifier for a shipment load",
  "orderNumber": "The customer's order number for the shipment",
  "promisedShipDate": "The date when the shipment is promised to be shipped",
  "requestDate": "The date when the shipment was requested by the customer",
  "shipToArea": "The geographic area or region where the shipment is being delivered",
  "shipToCustomer": "The name of the customer receiving the shipment",
  "shipToAddress": "The delivery address for the shipment",
  "shipToState": "The state or province for the delivery address",
  "contactNumber": "The phone number of the contact person for the shipment",
  "poNumber": "The purchase order number associated with the shipment",
  "remarks": "Additional notes or comments about the shipment",
  
  // Item fields
  "itemNumber": "The unique identifier for a product or item in the shipment",
  "description": "The description of the item or product",
  "lotSerialNumber": "The lot or serial number for tracking the item",
  "quantity": "The number of units of the item",
  "uom": "The unit of measure for the item (e.g., kg, pcs, pallets)",
  "weight": "The weight of the item, typically in kilograms",

  // Additional shipment fields from ERD
  "totalWeight": "The total weight of the entire shipment",
  "totalVolume": "The total volume of the entire shipment",
  "shipmentWeight": "The weight of the shipment",
  "shipmentVolume": "The volume of the shipment",
  "quantityOfItems": "The total number of items in the shipment",
  "totalPalettes": "The total number of palettes in the shipment",
  "customerDeliveryNumber": "The customer's delivery reference number",
  "customerPoNumbers": "Customer PO reference numbers",
  
  // Trip-related fields
  "pickUpDate": "Scheduled pickup date/time",
  "dropOffDate": "Scheduled dropoff date/time",
  "actualDateTimeOfArrival": "Actual arrival time",
  "actualDateTimeOfDeparture": "Actual departure time",
  "estimatedDateTimeOfArrival": "Estimated arrival time",
  "estimatedDateTimeOfDeparture": "Estimated departure time",
  
  // Address fields
  "addressId": "Foreign key to address records",
  
  // Status fields
  "activityStatus": "Status of the shipping activity",
  "cargoStatusId": "Foreign key to CargoStatuses"
};

/**
 * Standard fields in SchemaField format for easier usage
 */
export const STANDARD_FIELDS: Record<string, SchemaField> = Object.entries(ERD_SCHEMA_FIELDS).reduce(
  (acc, [name, description]) => {
    acc[name] = { name, description };
    return acc;
  },
  {} as Record<string, SchemaField>
);

/**
 * Map of common synonyms for field names to help with matching
 */
export const FIELD_SYNONYMS: Record<string, string[]> = {
  "loadNumber": ["load no", "load #", "load id", "load reference", "shipment number", "shipment id"],
  "orderNumber": ["order no", "order #", "order id", "sales order", "so number"],
  "promisedShipDate": ["ship date", "shipping date", "promised date", "delivery date", "ship by date"],
  "requestDate": ["requested date", "order date", "requested delivery", "request ship date"],
  "shipToCustomer": ["customer", "customer name", "recipient", "consignee", "ship to name", "receiver"],
  "shipToAddress": ["address", "delivery address", "destination", "ship to", "shipping address"],
  "shipToState": ["state", "province", "region", "destination state"],
  "contactNumber": ["phone", "telephone", "contact", "phone number", "mobile", "cell"],
  "poNumber": ["po#", "purchase order", "po", "purchase order number", "customer po"],
  "remarks": ["notes", "comments", "special instructions", "instructions", "additional info", "details"]
};

/**
 * Get potential standard field names based on original field name
 * @param originalFieldName Original field name from Excel file
 * @param fields Optional: List of fields to consider (defaults to all STANDARD_FIELDS)
 * @returns Array of potential matching fields with their descriptions
 */
export function getPotentialMatches(
  originalFieldName: string,
  fields: SchemaField[] = Object.values(STANDARD_FIELDS)
): { fieldName: string; description: string }[] {
  const normalizedName = originalFieldName.toLowerCase().trim();
  const results: { fieldName: string; description: string; score: number }[] = [];
  
  // Check for exact matches
  for (const field of fields) {
    // Direct match with field name
    if (field.name.toLowerCase() === normalizedName) {
      results.push({ fieldName: field.name, description: field.description, score: 1.0 });
      continue;
    }
    
    // Check synonym matches
    const synonyms = FIELD_SYNONYMS[field.name] || [];
    if (synonyms.some(synonym => synonym.toLowerCase() === normalizedName)) {
      results.push({ fieldName: field.name, description: field.description, score: 0.9 });
      continue;
    }
    
    // Check for partial matches
    if (field.name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(field.name.toLowerCase())) {
      results.push({ 
        fieldName: field.name, 
        description: field.description, 
        score: 0.7 
      });
      continue;
    }
    
    // Check for word matches
    const fieldWords = field.name.toLowerCase().split(/\W+/);
    const inputWords = normalizedName.split(/\W+/);
    
    const commonWords = fieldWords.filter(word => 
      inputWords.includes(word) && word.length > 2
    );
    
    if (commonWords.length > 0) {
      const matchScore = commonWords.length / Math.max(fieldWords.length, inputWords.length);
      results.push({ 
        fieldName: field.name, 
        description: field.description, 
        score: 0.5 * matchScore 
      });
    }
  }
  
  // Sort by score descending and return top 5 results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ fieldName, description }) => ({ fieldName, description }));
}

/**
 * Get all standard field names with their descriptions
 * @returns Array of all standard fields
 */
export function getAllStandardFields(): SchemaField[] {
  return Object.values(STANDARD_FIELDS);
}

/**
 * Get synonyms for a specific field
 * @param fieldName The field name to get synonyms for
 * @returns Array of synonyms or empty array if field doesn't exist
 */
export function getSynonymsForField(fieldName: string): string[] {
  return FIELD_SYNONYMS[fieldName] || [];
}

/**
 * Get standard field options for AI mapping
 * @returns Array of field names for AI mapping
 */
export function getStandardFieldOptions(): string[] {
  return Object.keys(STANDARD_FIELDS);
} 