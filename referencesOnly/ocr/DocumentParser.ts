/**
 * Types for OCR processing
 */
export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ShipmentData {
  trackingNumber: string;
  recipient: Address;
  sender: Address;
  weight: string;
  service: string;
  confidence: number;
  needsReview?: boolean;
  fieldConfidence?: Record<string, number>;
}

/**
 * Service for parsing OCR results from Google Cloud Vision API
 * and extracting structured shipping information
 */
export class DocumentParser {
  // Confidence threshold for fields that need review
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  
  // Regular expressions for extracting shipping information
  private readonly TRACKING_REGEX = /(?:tracking|tracking #|tracking number|tracking no)[:\s]*([a-z0-9]+)/i;
  private readonly WEIGHT_REGEX = /(?:weight|wt)[:\s]*([0-9.]+\s*(?:kg|lb|lbs|pounds|oz|ounces))/i;
  private readonly SERVICE_REGEX = /(?:service|service type|shipping method)[:\s]*([a-z\s]+)/i;
  private readonly ZIP_CODE_REGEX = /\b(\d{5}(?:-\d{4})?)\b/;
  private readonly STATE_REGEX = /\b([A-Z]{2})\b/;

  /**
   * Parses OCR response from Google Cloud Vision API
   * @param ocrResponse The response from Google Cloud Vision API
   * @returns Structured shipment data
   */
  parseOcrResponse(ocrResponse: any): ShipmentData {
    try {
      const fullText = ocrResponse.responses[0].fullTextAnnotation.text;
      const confidence = ocrResponse.responses[0].fullTextAnnotation.pages[0].confidence;
      const textAnnotations = ocrResponse.responses[0].textAnnotations;
      
      // Extract shipping information
      const trackingNumber = this.extractTrackingNumber(fullText);
      const { recipient, sender } = this.extractAddresses(fullText);
      const weight = this.extractWeight(fullText);
      const service = this.extractService(fullText);
      
      // Calculate field confidence
      const fieldConfidence = this.calculateFieldConfidence(textAnnotations);
      
      // Determine if the shipment needs review
      const needsReview = confidence < this.CONFIDENCE_THRESHOLD || 
                          !trackingNumber || 
                          !recipient.name || 
                          !sender.name;
      
      return {
        trackingNumber: trackingNumber || 'UNKNOWN',
        recipient,
        sender,
        weight: weight || 'UNKNOWN',
        service: service || 'UNKNOWN',
        confidence,
        needsReview,
        fieldConfidence
      };
    } catch (error) {
      console.error('Error parsing OCR response:', error);
      return this.createEmptyShipmentData();
    }
  }

  /**
   * Extracts tracking number from OCR text
   * @param text Full text from OCR
   * @returns Tracking number or null if not found
   */
  private extractTrackingNumber(text: string): string | null {
    const match = text.match(this.TRACKING_REGEX);
    return match ? match[1].trim() : null;
  }

  /**
   * Extracts weight information from OCR text
   * @param text Full text from OCR
   * @returns Weight or null if not found
   */
  private extractWeight(text: string): string | null {
    const match = text.match(this.WEIGHT_REGEX);
    return match ? match[1].trim() : null;
  }

  /**
   * Extracts service type from OCR text
   * @param text Full text from OCR
   * @returns Service type or null if not found
   */
  private extractService(text: string): string | null {
    const match = text.match(this.SERVICE_REGEX);
    return match ? match[1].trim() : null;
  }

  /**
   * Extracts recipient and sender addresses from OCR text
   * @param text Full text from OCR
   * @returns Object containing recipient and sender addresses
   */
  private extractAddresses(text: string): { recipient: Address, sender: Address } {
    // Split text into sections
    const sections = text.split(/\n\n+/);
    
    let recipientSection = '';
    let senderSection = '';
    
    // Find recipient and sender sections
    for (const section of sections) {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('ship to') || lowerSection.includes('recipient') || lowerSection.includes('deliver to')) {
        recipientSection = section;
      } else if (lowerSection.includes('from') || lowerSection.includes('sender') || lowerSection.includes('return')) {
        senderSection = section;
      }
    }
    
    return {
      recipient: this.parseAddressSection(recipientSection),
      sender: this.parseAddressSection(senderSection)
    };
  }

  /**
   * Parses an address section into structured address data
   * @param section Text section containing address information
   * @returns Structured address data
   */
  private parseAddressSection(section: string): Address {
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    // Remove header line (e.g., "Ship To:", "From:")
    if (lines[0] && (lines[0].toLowerCase().includes('to:') || lines[0].toLowerCase().includes('from:'))) {
      lines.shift();
    }
    
    // Extract name (first line)
    const name = lines.length > 0 ? lines[0].trim() : '';
    
    // Extract address (second line)
    const address = lines.length > 1 ? lines[1].trim() : '';
    
    // Extract city, state, zip from the last line
    const cityStateZip = lines.length > 2 ? lines[lines.length - 1].trim() : '';
    
    // Parse city, state, zip
    const zipMatch = cityStateZip.match(this.ZIP_CODE_REGEX);
    const zipCode = zipMatch ? zipMatch[1] : '';
    
    const stateMatch = cityStateZip.match(this.STATE_REGEX);
    const state = stateMatch ? stateMatch[1] : '';
    
    // City is everything before the state
    const city = stateMatch ? cityStateZip.substring(0, cityStateZip.indexOf(state)).trim().replace(/,\s*$/, '') : cityStateZip;
    
    return {
      name,
      address,
      city,
      state,
      zipCode
    };
  }

  /**
   * Calculates confidence scores for individual fields
   * @param textAnnotations Text annotations from OCR response
   * @returns Object mapping field names to confidence scores
   */
  private calculateFieldConfidence(textAnnotations: any[]): Record<string, number> {
    const fieldConfidence: Record<string, number> = {};
    
    // This is a simplified implementation
    // In a real-world scenario, you would analyze the bounding boxes and confidence scores
    // of individual text elements to determine field-specific confidence
    
    // For now, we'll assign random confidence scores for demonstration
    fieldConfidence['trackingNumber'] = Math.random() * 0.3 + 0.7; // 0.7-1.0
    fieldConfidence['recipient.name'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['recipient.address'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['recipient.city'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['recipient.state'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['recipient.zipCode'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['sender.name'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['sender.address'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['sender.city'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['sender.state'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['sender.zipCode'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['weight'] = Math.random() * 0.3 + 0.7;
    fieldConfidence['service'] = Math.random() * 0.3 + 0.7;
    
    return fieldConfidence;
  }

  /**
   * Creates an empty shipment data object
   * @returns Empty shipment data
   */
  private createEmptyShipmentData(): ShipmentData {
    return {
      trackingNumber: 'UNKNOWN',
      recipient: {
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      sender: {
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      },
      weight: 'UNKNOWN',
      service: 'UNKNOWN',
      confidence: 0,
      needsReview: true
    };
  }
} 