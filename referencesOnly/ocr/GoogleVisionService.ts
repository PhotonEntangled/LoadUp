/**
 * Service for interacting with Google Cloud Vision API for OCR processing
 */
export class GoogleVisionService {
  private apiKey: string;
  private apiUrl: string;

  /**
   * Creates a new instance of GoogleVisionService
   * @param apiKey Google Cloud Vision API key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  }

  /**
   * Processes an image using Google Cloud Vision API for OCR
   * @param base64Image Base64-encoded image data
   * @returns The OCR response from Google Cloud Vision API
   */
  async processImage(base64Image: string): Promise<any> {
    try {
      const requestBody = this.generateRequestBody(base64Image);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to process image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the response
      if (!data.responses || !data.responses[0] || !data.responses[0].textAnnotations) {
        throw new Error('Invalid API response');
      }

      return data;
    } catch (error) {
      console.error('Error processing image with Google Cloud Vision:', error);
      throw error;
    }
  }

  /**
   * Generates the request body for the Google Cloud Vision API
   * @param base64Image Base64-encoded image data
   * @returns Request body object
   */
  private generateRequestBody(base64Image: string) {
    return {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };
  }
} 