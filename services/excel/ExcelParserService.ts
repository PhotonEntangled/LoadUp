/**
 * Service for parsing Excel files (saved as TXT)
 * Requires xlsx library to be installed: npm install xlsx
 */

import { ShipmentData } from '../ocr/DocumentParser';

// This would normally be imported from xlsx library
// import * as XLSX from 'xlsx';

/**
 * Interface for Excel parsing options
 */
interface ExcelParseOptions {
  hasHeaderRow?: boolean;
  dateFormat?: string;
  requiredFields?: string[];
}

/**
 * Service for parsing Excel files (saved as TXT)
 */
export class ExcelParserService {
  private defaultOptions: ExcelParseOptions = {
    hasHeaderRow: true,
    dateFormat: 'MM/DD/YYYY',
    requiredFields: ['LOAD NO', 'Ship To Customer Name', 'Address Line 1 and 2', 'State/ Province']
  };

  /**
   * Parse a TXT version of an Excel file
   * @param content The content of the TXT file
   * @param options Parsing options
   * @returns Array of ShipmentData objects
   */
  async parseExcelTxt(content: string, options?: ExcelParseOptions): Promise<ShipmentData[]> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Split the content into lines
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      // Find the header row (if applicable)
      let headerRow: string[] = [];
      let dataStartIndex = 0;
      
      if (opts.hasHeaderRow) {
        // Look for a row that contains most of the required fields
        for (let i = 0; i < Math.min(20, lines.length); i++) {
          const row = this.parseTxtRow(lines[i]);
          const requiredFieldsFound = opts.requiredFields?.filter(field => 
            row.some(cell => cell.includes(field))
          ).length || 0;
          
          if (requiredFieldsFound >= (opts.requiredFields?.length || 0) * 0.7) {
            headerRow = row;
            dataStartIndex = i + 1;
            break;
          }
        }
        
        // If no header row found, use the first row as header
        if (headerRow.length === 0 && lines.length > 0) {
          headerRow = this.parseTxtRow(lines[0]);
          dataStartIndex = 1;
        }
      }
      
      // Parse data rows
      const shipments: ShipmentData[] = [];
      
      for (let i = dataStartIndex; i < lines.length; i++) {
        const row = this.parseTxtRow(lines[i]);
        
        // Skip empty rows or rows with insufficient data
        if (row.length < 3) continue;
        
        const shipment = this.createShipmentFromRow(row, headerRow);
        if (shipment) {
          shipments.push(shipment);
        }
      }
      
      return shipments;
    } catch (error) {
      console.error('Error parsing Excel TXT file:', error);
      throw new Error(`Failed to parse Excel TXT file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Parse a row from the TXT file into an array of cells
   * @param line The line from the TXT file
   * @returns Array of cell values
   */
  private parseTxtRow(line: string): string[] {
    // Split by tabs or multiple spaces
    return line.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell !== '');
  }
  
  /**
   * Create a ShipmentData object from a row of data
   * @param row The row data
   * @param headers The header row (if available)
   * @returns ShipmentData object or null if invalid
   */
  private createShipmentFromRow(row: string[], headers: string[]): ShipmentData | null {
    try {
      // If we have headers, use them to map the data
      const rowData: Record<string, string> = {};
      
      if (headers.length > 0) {
        // Map each cell to its corresponding header
        for (let i = 0; i < Math.min(headers.length, row.length); i++) {
          rowData[headers[i]] = row[i];
        }
      } else {
        // Without headers, use positional mapping based on the sample files
        // This is specific to the format of the provided TXT files
        if (row.length >= 10) {
          rowData['LOAD NO'] = row[1] || '';
          rowData['Ship To Customer Name'] = row[row.length - 4] || '';
          rowData['Address Line 1 and 2'] = row[row.length - 3] || '';
          rowData['State/ Province'] = row[row.length - 2] || '';
        }
      }
      
      // Extract address components
      const addressParts = this.parseAddress(rowData['Address Line 1 and 2'] || '');
      
      // Create shipment data
      const shipment: ShipmentData = {
        trackingNumber: rowData['LOAD NO'] || 'UNKNOWN',
        recipient: {
          name: rowData['Ship To Customer Name'] || 'UNKNOWN',
          address: addressParts.address,
          city: addressParts.city,
          state: rowData['State/ Province'] || 'UNKNOWN',
          zipCode: addressParts.zipCode
        },
        sender: {
          name: 'NIRO TRANSPORTER', // Default based on sample files
          address: 'Default Address',
          city: 'Default City',
          state: 'Default State',
          zipCode: 'Default ZipCode'
        },
        weight: rowData['Weight (KG)'] || 'UNKNOWN',
        service: rowData['Ship Via'] || 'UNKNOWN',
        confidence: 0.9, // High confidence for direct data extraction
        needsReview: false
      };
      
      return shipment;
    } catch (error) {
      console.error('Error creating shipment from row:', error);
      return null;
    }
  }
  
  /**
   * Parse an address string into components
   * @param address The full address string
   * @returns Object with address components
   */
  private parseAddress(address: string): { address: string; city: string; zipCode: string } {
    // Default values
    const result = {
      address: address,
      city: 'UNKNOWN',
      zipCode: 'UNKNOWN'
    };
    
    try {
      // Extract city if it's in quotes
      const cityMatch = address.match(/"([^"]+)"/);
      if (cityMatch && cityMatch[1]) {
        result.city = cityMatch[1];
      }
      
      // Look for zip code pattern (5-digit number)
      const zipMatch = address.match(/\b\d{5}\b/);
      if (zipMatch) {
        result.zipCode = zipMatch[0];
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing address:', error);
      return result;
    }
  }
  
  /**
   * Calculate confidence score for the extracted data
   * @param shipment The shipment data
   * @returns Updated shipment with confidence score
   */
  calculateConfidence(shipment: ShipmentData): ShipmentData {
    let confidenceScore = 1.0;
    let fieldsChecked = 0;
    
    // Check required fields
    const fieldsToCheck = [
      { value: shipment.trackingNumber, weight: 0.2 },
      { value: shipment.recipient.name, weight: 0.2 },
      { value: shipment.recipient.address, weight: 0.15 },
      { value: shipment.recipient.city, weight: 0.1 },
      { value: shipment.recipient.state, weight: 0.1 },
      { value: shipment.recipient.zipCode, weight: 0.1 },
      { value: shipment.weight, weight: 0.1 },
      { value: shipment.service, weight: 0.05 }
    ];
    
    // Calculate weighted confidence
    let totalWeight = 0;
    let weightedConfidence = 0;
    
    for (const field of fieldsToCheck) {
      totalWeight += field.weight;
      
      if (field.value === 'UNKNOWN') {
        // Field is missing
        weightedConfidence += 0;
      } else {
        // Field is present
        weightedConfidence += field.weight;
      }
      
      fieldsChecked++;
    }
    
    // Calculate final confidence score
    confidenceScore = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    
    // Update shipment
    return {
      ...shipment,
      confidence: confidenceScore,
      needsReview: confidenceScore < 0.7
    };
  }
} 