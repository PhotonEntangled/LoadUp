import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openAIService } from '@/services/ai/OpenAIService';
import { ERD_SCHEMA_FIELDS } from '@/services/ai/schema-reference';

// Safely get the API key from environment variables
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.OPENAI_API_KEY || 
           process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
           process.env.REACT_APP_OPENAI_API_KEY;
  }
  return null;
};

// Initialize the OpenAI client
const apiKey = getApiKey();
if (!apiKey) {
  console.error('API Error: OpenAI API key is missing from environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || 'missing-api-key', // Default value to prevent initialization error
});

// Create a formatted schema reference for prompts
const schemaReference = Object.entries(ERD_SCHEMA_FIELDS)
  .map(([field, description]) => `${field}: ${description}`)
  .join('\n');

/**
 * API endpoint for extracting text from images using OpenAI's Vision API
 */
export async function POST(req: NextRequest) {
  try {
    // Check if API key is available
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured in the environment variables' },
        { status: 500 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { imageBase64, includeSchema = true } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid image data' },
        { status: 400 }
      );
    }

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

    // Call the OpenAI Vision API
    const response = await openai.chat.completions.create({
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
      console.error('Empty response from OpenAI Vision API');
      return NextResponse.json(
        { error: 'Failed to extract text from image' },
        { status: 500 }
      );
    }

    // For structured extraction, we can make a second call to extract specific fields
    // Use the first extracted text to build a structured JSON
    const structureResponse = await openai.chat.completions.create({
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
        console.error('Error parsing structured data:', error);
      }
    }

    return NextResponse.json({
      text: content,
      confidence: 0.85, // Estimated confidence for GPT-4 Vision
      shipmentData,
    });
  } catch (error) {
    console.error('Error in image extraction endpoint:', error);
    
    let errorMessage = 'Failed to process image';
    let statusCode = 500;
    
    // Try to extract more specific error details
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle common OpenAI API errors
      if (errorMessage.includes('429')) {
        errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
      } else if (errorMessage.includes('401')) {
        errorMessage = "OpenAI API authentication failed. Please check your API key.";
        statusCode = 401;
      } else if (errorMessage.includes('insufficient_quota')) {
        errorMessage = "OpenAI API quota exceeded. Please check your billing status.";
        statusCode = 402;
      } else if (errorMessage.includes('deprecated')) {
        errorMessage = "The OpenAI model configuration has been updated. Please refresh the application.";
      }
    }
    
    return NextResponse.json(
      { 
        error: 'OCR extraction failed',
        message: errorMessage
      },
      { status: statusCode }
    );
  }
} 