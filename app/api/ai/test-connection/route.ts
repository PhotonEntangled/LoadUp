import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIService } from '@/services/ai/OpenAIService';

export async function GET(req: NextRequest) {
  let apiKey: string | undefined | null = null;
  try {
    // Safely get the API key from environment variables
    apiKey = process.env.OPENAI_API_KEY || 
                   process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                   process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          status: 'error',
          connected: false,
          message: 'API key is missing from environment variables',
          apiKeyFormat: apiKey ? 'Valid format' : 'Missing',
          apiKeyPrefix: apiKey?.substring(0, 7) || 'N/A'
        }, 
        { status: 500 }
      );
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Try a simple API call that doesn't cost much (models endpoint)
    const models = await openai.models.list();
    
    return NextResponse.json({
      status: 'success',
      connected: true,
      message: 'Successfully connected to OpenAI API',
      modelsAvailable: models.data.length,
      firstFewModels: models.data.slice(0, 3).map(model => model.id),
      apiKeyFormat: apiKey ? 'Valid format' : 'Missing',
      apiKeyPrefix: apiKey?.substring(0, 7) || 'N/A'
    });
    
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    
    let errorMessage = 'Unknown error occurred';
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Extract more specific error information from OpenAI errors
      if ('status' in error) {
        statusCode = (error as any).status;
      }
      
      if ('type' in error) {
        errorType = (error as any).type;
      }
      
      // Map common error patterns
      if (errorMessage.includes('insufficient_quota') || errorType === 'insufficient_quota') {
        errorMessage = 'Your OpenAI API key does not have sufficient quota. Please check your billing status at https://platform.openai.com/account/billing';
      } else if (errorMessage.includes('invalid_api_key') || statusCode === 401) {
        errorMessage = 'Your OpenAI API key appears to be invalid or has expired';
      } else if (errorMessage.includes('rate_limit') || statusCode === 429) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later';
      }
    }
    
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: errorMessage,
        errorType: errorType,
        apiKeyFormat: apiKey ? 'Valid format' : 'Missing',
        apiKeyPrefix: apiKey?.substring(0, 7) || 'N/A'
      },
      { status: 200 } // Return 200 to make it easier for the frontend to parse
    );
  }
} 