import fs from 'fs';
import { ShipmentData } from '../../types/shipment';
import { logger } from '../../utils/logger';

/**
 * Service for parsing shipment text files
 */
export class TextFileParserService {
  private readonly FIELD_DELIMITERS = [':', '=', '\t'];
  private readonly SECTION_DELIMITERS = ['===', '---', '***', '#####'];
  
  /**
   * Parse a text file into structured shipment data
   * @param filePath Path to the text file
   * @returns Array of ShipmentData objects
   */
  async parseTextFile(filePath: string): Promise<ShipmentData[]> {
    try {
      logger.info(`Parsing text file: ${filePath}`);
      
      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Split into sections if delimiters exist
      const sections = this.splitIntoSections(fileContent);
      
      // Parse each section as a shipment
      const shipments = sections.map(section => this.parseSection(section));
      
      logger.info(`Parsed ${shipments.length} shipments from text file`);
      return shipments;
    } catch (error) {
      logger.error(`Error parsing text file: ${(error as Error).message}`);
      throw new Error(`Failed to parse text file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Split file content into sections based on delimiters
   * @param content File content
   * @returns Array of content sections
   */
  private splitIntoSections(content: string): string[] {
    // Check if any section delimiter exists in content
    const hasDelimiter = this.SECTION_DELIMITERS.some(delimiter => 
      content.includes(delimiter)
    );
    
    if (!hasDelimiter) {
      // If no delimiter found, treat entire content as one section
      return [content];
    }
    
    // Find the first delimiter that appears in the content
    const usedDelimiter = this.SECTION_DELIMITERS.find(delimiter => 
      content.includes(delimiter)
    ) || this.SECTION_DELIMITERS[0];
    
    // Split content by the delimiter and filter empty sections
    return content
      .split(new RegExp(`${usedDelimiter}+\\s*`, 'g'))
      .map(section => section.trim())
      .filter(section => section.length > 0);
  }
  
  /**
   * Parse a section of text into shipment data
   * @param section Text section
   * @returns Structured shipment data
   */
  private parseSection(section: string): ShipmentData {
    // Initialize shipment data
    const shipment: Partial<ShipmentData> = {
      items: []
    };
    
    // Split content into lines
    const lines = section.split('\n').map(line => line.trim());
    
    // Process each line
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('#')) {
        continue;
      }
      
      // Find the first delimiter in the line
      const delimiterIndex = this.findDelimiterIndex(line);
      
      if (delimiterIndex > 0) {
        // Extract field and value
        const fieldName = line.substring(0, delimiterIndex).trim();
        const fieldValue = line.substring(delimiterIndex + 1).trim();
        
        // Map the field to shipment data
        this.mapFieldToShipment(fieldName, fieldValue, shipment);
      } else {
        // Handle lines without delimiters as remarks or additional info
        if (!shipment.remarks) {
          shipment.remarks = line;
        } else {
          shipment.remarks += `\n${line}`;
        }
      }
    }
    
    // Ensure items array exists
    if (!shipment.items) {
      shipment.items = [];
    }
    
    return shipment as ShipmentData;
  }
  
  /**
   * Find the index of the first delimiter in a line
   * @param line Line of text
   * @returns Index of delimiter or -1 if not found
   */
  private findDelimiterIndex(line: string): number {
    for (const delimiter of this.FIELD_DELIMITERS) {
      const index = line.indexOf(delimiter);
      if (index > 0) {
        return index;
      }
    }
    return -1;
  }
  
  /**
   * Map a field and value to the shipment object
   * @param fieldName Original field name
   * @param fieldValue Field value
   * @param shipment Shipment object to populate
   */
  private mapFieldToShipment(fieldName: string, fieldValue: string, shipment: Partial<ShipmentData>): void {
    // Normalize field name to camelCase
    const normalizedField = this.normalizeFieldName(fieldName);
    
    // Handle special fields
    if (normalizedField.includes('item') || normalizedField.includes('product')) {
      // Handle item-related fields
      this.handleItemField(normalizedField, fieldValue, shipment);
      return;
    }
    
    // Map standard fields
    switch (normalizedField) {
      case 'loadNumber':
      case 'loadNo':
      case 'load':
        shipment.loadNumber = fieldValue;
        break;
      case 'orderNumber':
      case 'orderNo':
      case 'order':
        shipment.orderNumber = fieldValue;
        break;
      case 'poNumber':
      case 'poNo':
      case 'purchaseOrder':
        shipment.poNumber = fieldValue;
        break;
      case 'shipDate':
      case 'promisedShipDate':
      case 'shipmentDate':
        shipment.promisedShipDate = fieldValue;
        break;
      case 'customer':
      case 'shipToCustomer':
      case 'customerName':
        shipment.shipToCustomer = fieldValue;
        break;
      case 'address':
      case 'shipToAddress':
      case 'deliveryAddress':
        shipment.shipToAddress = fieldValue;
        break;
      case 'state':
      case 'shipToState':
        shipment.shipToState = fieldValue;
        break;
      case 'phone':
      case 'contactNumber':
      case 'phoneNumber':
        shipment.contactNumber = fieldValue;
        break;
      case 'weight':
      case 'totalWeight':
      case 'shipmentWeight':
        shipment.totalWeight = parseFloat(fieldValue) || 0;
        break;
      case 'notes':
      case 'remarks':
      case 'specialInstructions':
        shipment.remarks = fieldValue;
        break;
      default:
        // Handle unknown fields
        logger.debug(`Unknown field in text file: ${fieldName}`);
        // Add to additional fields
        if (!shipment.additionalFields) {
          shipment.additionalFields = {};
        }
        shipment.additionalFields[normalizedField] = fieldValue;
    }
  }
  
  /**
   * Handle item-related fields
   * @param fieldName Normalized field name
   * @param fieldValue Field value
   * @param shipment Shipment object to populate
   */
  private handleItemField(fieldName: string, fieldValue: string, shipment: Partial<ShipmentData>): void {
    // Ensure items array exists
    if (!shipment.items) {
      shipment.items = [];
    }
    
    // Extract item index if present (e.g., "item1" → 1)
    const indexMatch = fieldName.match(/(\d+)/);
    const itemIndex = indexMatch ? parseInt(indexMatch[0]) - 1 : 0;
    
    // Ensure item exists at the specified index
    while (shipment.items.length <= itemIndex) {
      shipment.items.push({
        itemNumber: '',
        description: '',
        quantity: 0
      });
    }
    
    // Update item fields
    if (fieldName.includes('number')) {
      shipment.items[itemIndex].itemNumber = fieldValue;
    } else if (fieldName.includes('desc')) {
      shipment.items[itemIndex].description = fieldValue;
    } else if (fieldName.includes('quant')) {
      shipment.items[itemIndex].quantity = parseInt(fieldValue) || 1;
    } else if (fieldName.includes('weight')) {
      shipment.items[itemIndex].weight = parseFloat(fieldValue) || 0;
    } else {
      // Set as item number by default
      shipment.items[itemIndex].itemNumber = fieldValue;
    }
  }
  
  /**
   * Normalize field name to camelCase
   * @param fieldName Original field name
   * @returns Normalized field name
   */
  private normalizeFieldName(fieldName: string): string {
    // Remove special characters and convert to camelCase
    return fieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .split(' ')
      .filter(part => part.length > 0)
      .map((part, index) => 
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join('');
  }
} 