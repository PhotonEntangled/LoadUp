import { describe, test, expect, vi, beforeEach } from 'vitest';
import { openAIService } from './OpenAIService';
import OpenAI from 'openai';

// Mock OpenAI client
vi.mock('openai', () => {
  const OpenAIMock = vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }));
  return { default: OpenAIMock };
});

describe('OpenAIService', () => {
  let openAIClientMock: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get instance of mocked OpenAI client
    openAIClientMock = new OpenAI().chat.completions;
    
    // Clear the cache
    (openAIService as any).fieldMappingCache.clear();
  });
  
  describe('mapField', () => {
    test('should map field using OpenAI API', async () => {
      // Mock API response
      openAIClientMock.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              mappedField: 'shipToAddress',
              confidence: 0.92,
              reasoning: 'This field contains shipping address information'
            })
          }
        }]
      });
      
      const result = await openAIService.mapField(
        'Ship To Address', 
        ['loadNumber', 'orderNumber', 'shipToAddress', 'shipToCustomer']
      );
      
      expect(openAIClientMock.create).toHaveBeenCalled();
      expect(result).toEqual({
        mappedField: 'shipToAddress',
        confidence: 0.92,
        reasoning: 'This field contains shipping address information'
      });
    });
    
    test('should use cache for repeated mapping requests', async () => {
      // Mock API response
      openAIClientMock.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              mappedField: 'remarks',
              confidence: 0.85,
              reasoning: 'This field contains notes about the shipment'
            })
          }
        }]
      });
      
      // First call should use API
      await openAIService.mapField(
        'Notes', 
        ['loadNumber', 'remarks', 'shipToCustomer']
      );
      
      // Second call with same parameters should use cache
      const result = await openAIService.mapField(
        'Notes', 
        ['loadNumber', 'remarks', 'shipToCustomer']
      );
      
      // API should be called only once
      expect(openAIClientMock.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        mappedField: 'remarks',
        confidence: 0.85,
        reasoning: 'This field contains notes about the shipment'
      });
    });
    
    test('should handle API errors gracefully', async () => {
      // Mock API error
      openAIClientMock.create.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await openAIService.mapField(
        'Error Field', 
        ['loadNumber', 'orderNumber']
      );
      
      // Should return a low confidence fallback response
      expect(result).toEqual({
        mappedField: 'unknown',
        confidence: 0.1,
        reasoning: 'Failed to map field due to API error'
      });
    });
    
    test('should handle malformed API responses', async () => {
      // Mock malformed API response
      openAIClientMock.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      });
      
      const result = await openAIService.mapField(
        'Bad Response', 
        ['loadNumber', 'orderNumber']
      );
      
      // Should return a low confidence fallback response
      expect(result).toEqual({
        mappedField: 'unknown',
        confidence: 0.1,
        reasoning: 'Failed to parse AI response'
      });
    });
    
    test('should handle empty API responses', async () => {
      // Mock empty API response
      openAIClientMock.create.mockResolvedValueOnce({
        choices: []
      });
      
      const result = await openAIService.mapField(
        'Empty Response', 
        ['loadNumber', 'orderNumber']
      );
      
      // Should return a low confidence fallback response
      expect(result).toEqual({
        mappedField: 'unknown',
        confidence: 0.1,
        reasoning: 'No response from AI service'
      });
    });
  });
}); 