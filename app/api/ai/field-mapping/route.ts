import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  FIELD_SYNONYMS, 
  getStandardFieldOptions 
} from '@/services/ai/schema-reference';
import { openAIService } from '@/services/ai/OpenAIService';
import { ERD_SCHEMA_FIELDS } from '@/services/ai/schema-reference';
import { z } from 'zod';
import { FieldMappingResult } from '@/types/shipment';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache with TTL (1 week)
interface CacheEntry {
  result: { 
    field: string;
    confidence: number; 
  };
  expiresAt: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalField } = body;
    
    if (!originalField) {
      return NextResponse.json(
        { error: 'Original field name is required' },
        { status: 400 }
      );
    }
    
    // Check if we have a cached result
    if (cache[originalField] && cache[originalField].expiresAt > Date.now()) {
      return NextResponse.json(cache[originalField].result);
    }
    
    // Create a database schema reference string
    const standardizedFieldNames = getStandardFieldOptions();
    const schemaReference = standardizedFieldNames
      .map(field => {
        // Get all synonyms for this field
        const synonyms = FIELD_SYNONYMS[field] || [];
        // Return field name and its synonyms
        return `* "${field}": ${synonyms.join(', ')}`;
      })
      .join('\n');
    
    // Use the OpenAI API to map the field
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are an expert in analyzing Excel column names and mapping them to standardized field names for a logistics system.
          
Schema Reference:
${schemaReference}

Rules:
1. Analyze the Excel column name and determine the most likely standardized field name it corresponds to.
2. Your response must be in valid JSON format with exactly two fields: "field" and "confidence".
3. "field" should be the standardized field name that best matches the input.
4. "confidence" should be a decimal between 0 and 1 representing your confidence in the mapping.
5. If you cannot confidently map the field, return the most likely match with a low confidence score.
6. Remember to consider synonyms and common variations of field names.

Example 1:
Input: "SHIP TO CUSTOMER NAME"
Output: {"field": "shipToCustomer", "confidence": 0.95}

Example 2:
Input: "BOXES"
Output: {"field": "quantity", "confidence": 0.6}

Example 3:
Input: "Irrelevant Column"
Output: {"field": null, "confidence": 0.1}`,
        },
        {
          role: 'user',
          content: `Excel column name: "${originalField}"`,
        },
      ],
    });
    
    // Extract the content from the response
    const content = response.choices[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('Empty response from OpenAI');
      return NextResponse.json(
        { error: 'Failed to process field mapping' },
        { status: 500 }
      );
    }
    
    try {
      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      const parsedResult = JSON.parse(jsonContent);
      
      // Validate the result has required fields
      if (typeof parsedResult.field === 'undefined' || typeof parsedResult.confidence !== 'number') {
        throw new Error('Invalid response format');
      }
      
      // Cache the result
      cache[originalField] = {
        result: parsedResult,
        expiresAt: Date.now() + CACHE_TTL,
      };
      
      return NextResponse.json(parsedResult);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError, content);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing field mapping request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 