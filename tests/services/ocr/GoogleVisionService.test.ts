import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GoogleVisionService } from '../../../services/ocr/GoogleVisionService';

// Mock fetch
global.fetch = jest.fn();

describe('GoogleVisionService', () => {
  let service: GoogleVisionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new GoogleVisionService('test-api-key');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processImage', () => {
    it('should call the Google Vision API with the correct parameters', async () => {
      // Mock successful API response
      const mockResponse = {
        responses: [
          {
            fullTextAnnotation: {
              text: 'Sample text from document',
              pages: [{ confidence: 0.98 }]
            },
            textAnnotations: [
              {
                description: 'Sample text from document',
                boundingPoly: { vertices: [{ x: 0, y: 0 }] }
              },
              {
                description: 'Sample',
                boundingPoly: { vertices: [{ x: 0, y: 0 }] }
              }
            ]
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockResponse),
        ok: true
      });

      const base64Image = 'base64-encoded-image-data';
      const result = await service.processImage(base64Image);

      // Check that fetch was called with the correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://vision.googleapis.com/v1/images:annotate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining(base64Image)
        })
      );

      // Check that the result contains the expected data
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when the API call fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      const base64Image = 'base64-encoded-image-data';
      
      await expect(service.processImage(base64Image)).rejects.toThrow(
        'Failed to process image: 400 Bad Request'
      );
    });

    it('should throw an error when the API response is invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({}),
        ok: true
      });

      const base64Image = 'base64-encoded-image-data';
      
      await expect(service.processImage(base64Image)).rejects.toThrow(
        'Invalid API response'
      );
    });
  });
}); 