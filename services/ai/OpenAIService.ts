/**
 * Service for OpenAI API integration
 * 
 * This service handles communication with the OpenAI API for AI-enhanced field mapping
 * in the Excel parser. It includes functionality for mapping field names, caching results,
 * and calculating confidence scores.
 */

import OpenAI from 'openai';
import { logger } from '@/utils/logger';
import { ShipmentData } from '@/types/shipment';
import { AIMappedField } from '@/types/shipment';
import { ERD_SCHEMA_FIELDS } from '@/services/ai/schema-reference';

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

// Create a formatted schema reference for prompts
const schemaReference = Object.entries(ERD_SCHEMA_FIELDS)
  .map(([field, description]) => `${field}: ${description}`)
  .join('\n');

export class OpenAIService {
  private mappingCache: MappingCache = {};
  private cacheTTL: number = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  private openaiClientInstance: OpenAI | null = null; // Store the instance once created
  
  constructor() {
    // Load cache from persistent storage if available
    this.loadCache();
  }
  
  // Private method to get/initialize the OpenAI client lazily
  private _getOpenAIClient(): OpenAI {
    // Return existing instance if available
    if (this.openaiClientInstance) {
      return this.openaiClientInstance;
    }

    // Safely get the API key, checking all possible environment variable formats
    const getApiKey = () => {
      if (typeof process !== 'undefined' && process.env) {
        return process.env.OPENAI_API_KEY || 
               process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
               process.env.REACT_APP_OPENAI_API_KEY;
      }
      return null;
    };
    
    const apiKey = getApiKey();

    if (!apiKey) {
      logger.error('[OpenAIService] OpenAI API key is missing from environment variables.');
      throw new Error('OpenAI API key is missing. Cannot initialize client.');
    }

    try {
      logger.info('[OpenAIService] Lazily initializing OpenAI client...');
      this.openaiClientInstance = new OpenAI({ apiKey: apiKey });
      logger.info('[OpenAIService] OpenAI client initialized successfully.');
      return this.openaiClientInstance;
    } catch (error) {
      logger.error('[OpenAIService] Failed to initialize OpenAI client:', error);
      throw new Error('Failed to initialize OpenAI client.');
    }
  }
  
  /**
   * Extract text from an image using OpenAI's Vision API
   * @param imageBase64 The base64-encoded image data
   * @param includeSchema Whether to include our ERD schema in the prompt
   * @returns Extracted text with confidence score
   */
  async extractTextFromImage(imageBase64: string, includeSchema: boolean = true): Promise<ImageTextExtractionResult> {
    try {
      // Use client-side fetch pattern remains the same
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
          logger.error(`[OpenAIService] Client-side API error (${response.status}): ${errorText}`);
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.text) {
          logger.error('[OpenAIService] Invalid response format from client-side API:', result);
          throw new Error("Invalid response format from API");
        }
        
        return {
          text: result.text,
          confidence: result.confidence || 0.8,
          shipmentData: result.shipmentData
        };
      }
      
      // --- Server-Side Logic --- 
      logger.info('[OpenAIService] Processing image directly in server environment');
      const client = this._getOpenAIClient(); // Get client instance lazily
      
      const formattedImageData = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      
      let systemPrompt = `You are an expert OCR system specializing in logistics documents...`; // Keep prompt concise here
      
      if (includeSchema) {
        systemPrompt += `\n\nThe extracted text will be used to identify...schema:\n${schemaReference}`;
      }
      
      // Call the OpenAI Vision API
      const response = await client.chat.completions.create({
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
              { type: 'text', text: 'Extract text from image.' },
              { type: 'image_url', image_url: { url: formattedImageData } },
            ],
          },
        ],
      });

      const content = response.choices[0]?.message?.content?.trim();
        
      if (!content) {
        logger.error('[OpenAIService] Empty response from OpenAI Vision API');
        // Return error structure
        return {
          text: '',
          confidence: 0,
          error: "Failed to extract text from image - empty response"
        };
      }
        
      // Second call for structured data
      const structureResponse = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are an expert in logistics data extraction...Return your response as a VALID JSON object...${schemaReference}...`,
           },
          {
            role: 'user',
            content: `Extract structured data from this OCR text:\n\n${content}`,
          },
        ],
        response_format: { type: "json_object" }, // Request JSON output
      });

      const structuredContent = structureResponse.choices[0]?.message?.content?.trim();
      let shipmentData = null;
        
      if (structuredContent) {
        try {
          shipmentData = JSON.parse(structuredContent);
        } catch (parseError) {
          logger.error('[OpenAIService] Error parsing structured JSON data:', parseError);
          // Decide: return partial data or error? Let's return partial for now.
        }
      }
        
      return {
        text: content,
        confidence: 0.85, // Placeholder confidence
        shipmentData,
      };
      // --- End Server-Side Logic ---

    } catch (error: any) {
      logger.error(`[OpenAIService] Error in extractTextFromImage: ${error.message}`, { stack: error.stack });
      return {
        text: '',
        confidence: 0,
        error: `Failed to extract text: ${error.message}`
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
    const cacheKey = `${originalField}:${(potentialMatches || []).sort().join(',')}`;
    const cached = this.getCachedMapping(cacheKey);
    if (cached) {
      logger.info(`[OpenAIService] Cache hit for field mapping: "${originalField}"`);
      return { ...cached, reasoning: "Retrieved from cache." };
    }

    logger.info(`[OpenAIService] Performing AI field mapping for: "${originalField}"`);
    const client = this._getOpenAIClient();

    const formattedPotentialMatches = this.formatPotentialMatches(potentialMatches);

    const systemPrompt = `You are an expert field mapping assistant... Provide your response as a JSON object...
Schema:
${schemaReference}

Potential Matches:
${formattedPotentialMatches || 'N/A'}

Format: {"mappedField": "schema_field_name", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`; 

    const userPrompt = `Map the field "${originalField}" to the most appropriate field in the provided schema.`;

    try {
      const response = await client.chat.completions.create({ 
        model: "gpt-3.5-turbo", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 150,
        response_format: { type: "json_object" }, // Request JSON output
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Received empty content from OpenAI API.");
      }

      const result = JSON.parse(content) as FieldMappingResult;
      if (!result.mappedField || typeof result.confidence !== 'number') {
        throw new Error("Invalid JSON structure received from OpenAI API.");
      }

      // Validate mapped field against schema
      if (!ERD_SCHEMA_FIELDS[result.mappedField]) {
          logger.warn(`[OpenAIService] AI mapped to an invalid schema field: "${result.mappedField}". Falling back to 'unknown'.`);
          result.mappedField = 'unknown';
          result.confidence = 0.1; // Low confidence for fallback
      }

      // Cache the validated result
      this.cacheMapping(cacheKey, result.mappedField, result.confidence);

      logger.info(`[OpenAIService] Successfully mapped "${originalField}" -> "${result.mappedField}" with confidence ${result.confidence}`);
      return result;

    } catch (error: any) {
      logger.error(`[OpenAIService] Error during field mapping for "${originalField}": ${error.message}`, { stack: error.stack });
      // Return a fallback response on error
      return {
        mappedField: "unknown",
        confidence: 0,
        reasoning: `Error during mapping: ${error.message}`
      };
    }
  }
  
  /**
   * Format potential matches for the prompt
   */
  private formatPotentialMatchesArray(potentialMatches?: string[]): string[] {
    if (!potentialMatches || potentialMatches.length === 0) {
      return [];
    }
    // Clean and normalize potential matches (e.g., lowercase, trim)
    return potentialMatches.map(match => match.trim().toLowerCase()).filter(Boolean);
  }
  
  /**
   * Format potential matches as a string for display
   */
  private formatPotentialMatches(potentialMatches?: string[]): string {
    const formattedArray = this.formatPotentialMatchesArray(potentialMatches);
    return formattedArray.length > 0 ? formattedArray.join('\n') : "No potential matches provided.";
  }
  
  /**
   * Get a cached mapping if it exists and is not expired
   */
  private getCachedMapping(cacheKey: string): { mappedField: string; confidence: number } | null {
    const cachedItem = this.mappingCache[cacheKey];
    if (cachedItem && (Date.now() - cachedItem.timestamp < this.cacheTTL)) {
      return { mappedField: cachedItem.mappedField, confidence: cachedItem.confidence };
    }
    // Clean up expired cache entry if found
    if (cachedItem) {
        delete this.mappingCache[cacheKey];
        this.saveCache(); // Persist cache removal if applicable
    }
    return null;
  }
  
  /**
   * Cache a field mapping result
   */
  private cacheMapping(cacheKey: string, mappedField: string, confidence: number): void {
    this.mappingCache[cacheKey] = {
      mappedField,
      confidence,
      timestamp: Date.now()
    };
    this.saveCache(); // Persist cache update if applicable
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