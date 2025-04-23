/**
 * Service for OpenAI API integration
 * 
 * This service handles communication with the OpenAI API for AI-enhanced field mapping
 * in the Excel parser. It includes functionality for mapping field names, caching results,
 * and calculating confidence scores.
 */

import { ShipmentData } from '../../apps/admin-dashboard/lib/document-processing';
import { ERD_SCHEMA_FIELDS } from './schema-reference';
import OpenAI from 'openai';

interface FieldMappingResult {
  mappedField: string;
  confidence: number;
  reasoning: string;
}

interface MappingCache {
  [key: string]: any;
}

/**
 * Result from extracting text from an image
 */
interface ImageTextExtractionResult {
  text: string;
  confidence: number;
  shipmentData?: any;
  error?: string;
}

// Initialize the OpenAI client for server-side usage
let openaiClient: OpenAI | null = null;

// Safely get the API key, checking all possible environment variable formats
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    // Check different environment variable formats
    return process.env.OPENAI_API_KEY || 
           process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
           process.env.REACT_APP_OPENAI_API_KEY;
  }
  return null;
};

// Only initialize if the API key is available
const apiKey = getApiKey();
if (apiKey) {
  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    console.log('[OpenAIService] Successfully initialized OpenAI client');
  } catch (error) {
    console.error('[OpenAIService] Failed to initialize OpenAI client:', error);
  }
} else {
  console.warn('[OpenAIService] No OpenAI API key found in environment variables');
}

// Create a formatted schema reference for prompts
const schemaReference = Object.entries(ERD_SCHEMA_FIELDS)
  .map(([field, description]) => `${field}: ${description}`)
  .join('\n');

export class OpenAIService {
  private mappingCache: MappingCache = {};
  private cacheTTL: number = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  
  constructor() {
    // Load cache from persistent storage if available
    this.loadCache();
  }
  
  /**
   * Extract text from an image using OpenAI's Vision API
   * @param imageBase64 The base64-encoded image data
   * @param includeSchema Whether to include our ERD schema in the prompt
   * @returns Extracted text with confidence score
   */
  async extractTextFromImage(imageBase64: string, includeSchema: boolean = true): Promise<ImageTextExtractionResult> {
    try {
      console.log('[OpenAIService] Calling Vision API for image text extraction');
      
      // Call the Next.js API endpoint when in browser
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/ai/image-extraction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64,
            includeSchema,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[OpenAIService] API error (${response.status}): ${errorText}`);
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        // Parse the response
        const result = await response.json();
        
        // Validate the result
        if (!result.text) {
          console.error('[OpenAIService] Invalid response format from API:', result);
          throw new Error("Invalid response format from API");
        }
        
        return {
          text: result.text,
          confidence: result.confidence || 0.8,
          shipmentData: result.shipmentData
        };
      }
      
      // In a Node.js environment (SSR or API routes), use the OpenAI client directly
      if (!openaiClient) {
        console.error('[OpenAIService] OpenAI client not initialized - API key may be missing');
        return {
          text: '',
          confidence: 0,
          error: "OpenAI client not initialized. Check API key configuration."
        };
      }
      
      console.log('[OpenAIService] Processing image directly with OpenAI Vision API in server environment');
      
      // Ensure the image data is properly formatted
      const formattedImageData = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      
      // Create system prompt with or without schema
      let systemPrompt = `You are an expert OCR system specializing in logistics documents. 
Extract all text content from the provided image, preserving the structure as much as possible.
If tables are present, try to maintain the tabular format using | as column separators.`;
      
      if (includeSchema) {
        systemPrompt += `\n\nThe extracted text will be used to identify the following types of information from our logistics ERD schema:
${schemaReference}`;
      }
      
      try {
        // Call the OpenAI Vision API
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 4096,
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: 'Extract all text from this logistics document image, preserving the structure as much as possible.' 
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: formattedImageData,
                  },
                },
              ],
            },
          ],
        });
        
        // Extract the content from the response
        const content = response.choices[0]?.message?.content?.trim();
        
        if (!content) {
          console.error('[OpenAIService] Empty response from OpenAI Vision API');
          return {
            text: '',
            confidence: 0,
            error: "Failed to extract text from image - empty response"
          };
        }
        
        // For structured extraction, make a second call to extract specific fields
        // Use the first extracted text to build a structured JSON
        const structureResponse = await openaiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `You are an expert in logistics data extraction. Given the text extracted from a document image, 
identify and extract key logistics information according to the following schema:

${schemaReference}

Return your response as a VALID JSON object with the following structure:
{
  "loadNumber": "...",
  "orderNumber": "...",
  "promisedShipDate": "...",
  "shipToCustomer": "...",
  "shipToAddress": "...",
  "shipToState": "...",
  "contactNumber": "...",
  "poNumber": "...",
  "remarks": "...",
  "items": [
    {
      "itemNumber": "...",
      "description": "...",
      "quantity": "...",
      "weight": "..."
    }
  ]
}

If you can't identify a field, use null or an empty string. Only include fields you can identify with reasonable confidence.`,
            },
            {
              role: 'user',
              content: `Extract structured data from this OCR text:\n\n${content}`,
            },
          ],
        });
        
        const structuredContent = structureResponse.choices[0]?.message?.content?.trim();
        let shipmentData = null;
        
        if (structuredContent) {
          try {
            shipmentData = JSON.parse(structuredContent);
          } catch (error) {
            console.error('[OpenAIService] Error parsing structured data:', error);
          }
        }
        
        return {
          text: content,
          confidence: 0.85, // Estimated confidence for GPT-4 Vision
          shipmentData,
        };
        
      } catch (openaiError) {
        console.error('[OpenAIService] OpenAI API error:', openaiError);
        let errorMessage = "Error calling OpenAI Vision API";
        
        // Try to extract the specific error message from OpenAI's error response
        if (openaiError instanceof Error) {
          errorMessage = openaiError.message;
          
          // Check for common API errors
          if (errorMessage.includes('429')) {
            errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
          } else if (errorMessage.includes('401')) {
            errorMessage = "OpenAI API authentication failed. Please check your API key.";
          } else if (errorMessage.includes('insufficient_quota')) {
            errorMessage = "OpenAI API quota exceeded. Please check your billing status.";
          } else if (errorMessage.includes('deprecated')) {
            errorMessage = "The OpenAI model configuration needs to be updated. Please contact support.";
          }
        }
        
        return {
          text: '',
          confidence: 0,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('[OpenAIService] Error calling AI image extraction API:', error);
      
      // Return a fallback response
      return {
        text: '',
        confidence: 0,
        error: error instanceof Error ? error.message : "Error occurred during image extraction"
      };
    }
  }
  
  /**
   * Map a field name using OpenAI
   * @param originalField The original field name from the Excel file
   * @param potentialMatches Optional list of potential matches to consider first
   * @returns Mapping result with confidence score and reasoning
   */
  async mapField(originalField: string, potentialMatches?: string[]): Promise<FieldMappingResult> {
    // Check cache first to avoid unnecessary API calls
    const cachedResult = this.getCachedMapping(originalField);
    if (cachedResult) {
      console.log(`[OpenAIService] Using cached mapping for "${originalField}" → "${cachedResult.mappedField}" (${cachedResult.confidence})`);
      return {
        mappedField: cachedResult.mappedField,
        confidence: cachedResult.confidence,
        reasoning: "Retrieved from cache"
      };
    }
    
    try {
      console.log(`[OpenAIService] Calling AI field mapping API for: "${originalField}"`);
      
      // Check if running in browser environment
      if (typeof window !== 'undefined') {
        // Call the Next.js API endpoint when in browser
        const response = await fetch('/api/ai/field-mapping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalField,
            potentialMatches: this.formatPotentialMatchesArray(potentialMatches),
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[OpenAIService] API error (${response.status}): ${errorText}`);
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        // Parse the response
        const result = await response.json();
        
        // Validate the result
        if (!result.field && !result.mappedField) {
          console.error('[OpenAIService] Invalid response format from API:', result);
          throw new Error("Invalid response format from API");
        }
        
        // Normalize the response format
        const normalizedResult: FieldMappingResult = {
          mappedField: result.field || result.mappedField,
          confidence: result.confidence || 0,
          reasoning: result.reasoning || "Provided by API"
        };
        
        // Cache the result
        this.cacheMapping(originalField, normalizedResult.mappedField, normalizedResult.confidence);
        
        console.log(`[OpenAIService] AI mapped "${originalField}" → "${normalizedResult.mappedField}" (${normalizedResult.confidence})`);
        return normalizedResult;
      } else {
        // In a Node.js environment (SSR or API routes), do not attempt to use fetch for API
        console.warn('[OpenAIService] Running in Node.js environment - direct API calls not supported');
        return {
          mappedField: "unknown",
          confidence: 0,
          reasoning: "AI mapping not available in server environment"
        };
      }
    } catch (error) {
      console.error('[OpenAIService] Error calling AI field mapping API:', error);
      
      // Return a fallback response
      return {
        mappedField: "unknown",
        confidence: 0,
        reasoning: error instanceof Error ? error.message : "Error occurred during AI mapping"
      };
    }
  }
  
  /**
   * Format potential matches for the prompt
   */
  private formatPotentialMatchesArray(potentialMatches?: string[]): string[] {
    // If specific matches are provided, use those
    if (potentialMatches && potentialMatches.length > 0) {
      return potentialMatches;
    }
    
    // Otherwise use the standard ERD schema fields
    return Object.keys(ERD_SCHEMA_FIELDS);
  }
  
  /**
   * Format potential matches as a string for display
   */
  private formatPotentialMatches(potentialMatches?: string[]): string {
    // If specific matches are provided, use those
    if (potentialMatches && potentialMatches.length > 0) {
      return potentialMatches.map(field => `- ${field}`).join('\n');
    }
    
    // Otherwise use the standard ERD schema fields
    return Object.entries(ERD_SCHEMA_FIELDS)
      .map(([field, description]) => `- ${field}: ${description}`)
      .join('\n');
  }
  
  /**
   * Get a cached mapping if it exists and is not expired
   */
  private getCachedMapping(originalField: string): { mappedField: string; confidence: number } | null {
    const cacheKey = originalField.toLowerCase().trim();
    const cached = this.mappingCache[cacheKey];
    
    if (cached) {
      // Check if cache entry is expired
      const now = Date.now();
      if (now - cached.timestamp <= this.cacheTTL) {
        return {
          mappedField: cached.mappedField,
          confidence: cached.confidence
        };
      }
    }
    
    return null;
  }
  
  /**
   * Cache a field mapping result
   */
  private cacheMapping(originalField: string, mappedField: string, confidence: number): void {
    const cacheKey = originalField.toLowerCase().trim();
    this.mappingCache[cacheKey] = {
      mappedField,
      confidence,
      timestamp: Date.now()
    };
    
    // Save cache to persistent storage
    this.saveCache();
  }
  
  /**
   * Save cache to persistent storage (localStorage in browser, file in Node.js)
   */
  private saveCache(): void {
    try {
      // In browser
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('fieldMappingCache', JSON.stringify(this.mappingCache));
      }
      // In Node.js - would need to use fs to write to file
      // This is a simplified implementation
    } catch (error) {
      console.error('Error saving field mapping cache:', error);
    }
  }
  
  /**
   * Load cache from persistent storage
   */
  private loadCache(): void {
    try {
      // In browser
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('fieldMappingCache');
        if (cached) {
          this.mappingCache = JSON.parse(cached);
        }
      }
      // In Node.js - would need to use fs to read from file
      // This is a simplified implementation
    } catch (error) {
      console.error('Error loading field mapping cache:', error);
      this.mappingCache = {};
    }
  }
}

// Export a singleton instance
export const openAIService = new OpenAIService(); 