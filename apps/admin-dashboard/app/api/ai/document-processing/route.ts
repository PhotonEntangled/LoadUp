import { NextRequest, NextResponse } from 'next/server';
import { ExcelParserService, FIELD_MAPPINGS } from '../../../../../../services/excel/ExcelParserService';
import { openAIService } from '../../../../../../services/ai/OpenAIService';
import { ERD_SCHEMA_FIELDS } from '../../../../../../services/ai/schema-reference';

// Initialize services
const excelParserService = new ExcelParserService();

/**
 * Helper function to convert Buffer to ArrayBuffer
 */
function bufferToArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer;
}

/**
 * Process OCR data through the same Excel parsing pipeline
 * using OpenAI's Vision API to extract text from images
 */
async function processImageWithOCR(imageBuffer: ArrayBuffer, fileName: string, options: any = {}) {
  console.log(`Processing image file for OCR: ${fileName}`);
  
  try {
    // Convert image buffer to base64
    const base64Image = Buffer.from(new Uint8Array(imageBuffer)).toString('base64');
    
    // Use our OpenAIService which has built-in error handling and retry logic
    const extractionResult = await openAIService.extractTextFromImage(base64Image, true);
    
    if (extractionResult.error) {
      throw new Error(`OCR extraction failed: ${extractionResult.error}`);
    }
    
    if (!extractionResult.text || extractionResult.text.trim() === '') {
      throw new Error('No text could be extracted from the image');
    }
    
    const extractedText = extractionResult.text;
    console.log('Successfully extracted text from image:', extractedText.substring(0, 150) + '...');
    
    // If we already have structured shipment data from the extraction, use it
    if (extractionResult.shipmentData) {
      console.log('Using pre-extracted shipment data');
      
      // Enhance with metadata
      return [{
        ...extractionResult.shipmentData,
        miscellaneousFields: {
          ...extractionResult.shipmentData.miscellaneousFields,
          extractedText: extractedText,
          originalFileName: fileName,
          ocrConfidence: extractionResult.confidence || 0.85
        }
      }];
    }
    
    // Otherwise, process the extracted text through the Excel parser
    const parseOptions = {
      hasHeaderRow: true,
      useAIMapping: options.useAIMapping ?? true,
      aiMappingConfidenceThreshold: options.aiMappingConfidenceThreshold ?? 0.7,
      fieldMapping: options.documentType === 'ETD_REPORT' 
        ? FIELD_MAPPINGS.ETD_REPORT 
        : FIELD_MAPPINGS.OUTSTATION_RATES,
      // Special processing flags for OCR data
      isOcrData: true,
      ocrSource: 'vision_api',
      ocrConfidence: extractionResult.confidence || 0.85
    };
    
    // Process the extracted text through the Excel parser's text parsing function
    let shipmentData;
    try {
      shipmentData = await excelParserService.parseText(extractedText, parseOptions);
    } catch (parseError) {
      console.error('Error parsing extracted text:', parseError);
      
      // If parsing fails, return basic data structure with the extracted text
      return [{
        loadNumber: 'UNKNOWN',
        miscellaneousFields: {
          extractedText: extractedText,
          originalFileName: fileName,
          ocrConfidence: extractionResult.confidence || 0.85,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        }
      }];
    }
    
    if (!shipmentData || shipmentData.length === 0) {
      // Return basic structure with extracted text if no shipments were identified
      return [{
        loadNumber: 'UNKNOWN',
        miscellaneousFields: {
          extractedText: extractedText,
          originalFileName: fileName,
          ocrConfidence: extractionResult.confidence || 0.85,
          parseStatus: 'No shipment data identified'
        }
      }];
    }
    
    // Store the original OCR text in the miscellaneousFields for reference
    return shipmentData.map(shipment => ({
      ...shipment,
      miscellaneousFields: {
        ...shipment.miscellaneousFields,
        extractedText: extractedText,
        originalFileName: fileName,
        ocrConfidence: extractionResult.confidence || 0.85
      }
    }));
  } catch (error) {
    console.error('Error processing OCR data:', error);
    
    // Return a basic error structure
    return [{
      loadNumber: 'ERROR',
      miscellaneousFields: {
        errorMessage: error instanceof Error ? error.message : String(error),
        originalFileName: fileName,
        scanStatus: 'failed'
      }
    }];
  }
}

/**
 * POST handler for document processing
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    // Get file from formData
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided or invalid file' }, { status: 400 });
    }
    
    // Get the document type and other options
    const documentType = formData.get('documentType') as string || 'ETD_REPORT';
    const useAIMapping = formData.get('useAIMapping') === 'true';
    const aiMappingConfidenceThreshold = parseFloat(formData.get('aiMappingConfidenceThreshold') as string || '0.7');
    const hasHeaderRow = formData.get('hasHeaderRow') !== 'false';
    
    // Check if file is an image for OCR processing
    const isImageFile = file.type.startsWith('image/');
    
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
    console.log(`Document type: ${documentType}, isImage: ${isImageFile}`);
    
    let shipmentData;
    
    // Convert File to ArrayBuffer for processing
    const buffer = await file.arrayBuffer();
    
    try {
      if (isImageFile) {
        // Process image file with OCR and run it through the same Excel parsing pipeline
        const options = {
          documentType,
          useAIMapping,
          aiMappingConfidenceThreshold,
          hasHeaderRow
        };
        
        shipmentData = await processImageWithOCR(buffer, file.name, options);
        
        console.log(`Processed image with OCR. Found ${shipmentData.length} shipments.`);
      } else {
        // Process Excel/text file with the regular parser
        // Make sheetIndex optional - only set it if explicitly provided
        let sheetIndex: number | undefined = undefined;
        const sheetIndexParam = formData.get('sheetIndex') as string;
        if (sheetIndexParam) {
          sheetIndex = parseInt(sheetIndexParam, 10);
        }
        
        // Select field mapping based on document type
        const fieldMapping = documentType === 'ETD_REPORT' 
          ? FIELD_MAPPINGS.ETD_REPORT 
          : FIELD_MAPPINGS.OUTSTATION_RATES;
        
        // Parse Excel file
        const parseOptions = {
          hasHeaderRow,
          fieldMapping,
          useAIMapping,
          aiMappingConfidenceThreshold
        };
        
        // Only include sheetIndex if it was explicitly provided
        if (sheetIndex !== undefined) {
          (parseOptions as any).sheetIndex = sheetIndex;
        }
        
        // Process the file
        shipmentData = await excelParserService.parseExcelFile(buffer, parseOptions);
        
        console.log(`Processed document file. Found ${shipmentData.length} shipments.`);
      }
      
      // Check if we have error shipments
      const hasErrors = shipmentData.some((shipment: any) => 
        shipment.loadNumber === 'ERROR' || 
        shipment.miscellaneousFields?.scanStatus === 'failed'
      );
      
      if (hasErrors) {
        // Return error information but with a 200 status - the front-end can handle this format
        return NextResponse.json({ 
          shipmentData, 
          status: 'error',
          message: 'There were errors processing the document'
        });
      }
      
      // Add source information to help with intelligent naming
      const enhancedShipmentData = shipmentData.map((shipment: any) => ({
        ...shipment,
        miscellaneousFields: {
          ...shipment.miscellaneousFields,
          fileSource: isImageFile ? 'OCR_IMAGE' : 'DOCUMENT_UPLOAD',
          fileName: file.name,
          processingDate: new Date().toISOString()
        }
      }));
      
      return NextResponse.json({ shipmentData: enhancedShipmentData });
      
    } catch (processingError) {
      console.error('Error processing document:', processingError);
      
      // Still return a 200 response with error information to avoid parsing issues
      return NextResponse.json({ 
        status: 'error',
        message: processingError instanceof Error ? processingError.message : String(processingError),
        shipmentData: [{
          loadNumber: 'ERROR',
          miscellaneousFields: {
            errorMessage: processingError instanceof Error ? processingError.message : String(processingError),
            originalFileName: file.name,
            processingDate: new Date().toISOString(),
            scanStatus: 'failed'
          }
        }]
      });
    }
  } catch (error) {
    console.error('Error in document processing endpoint:', error);
    
    // Return a 200 response with error information to avoid parsing issues
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to process document',
      errorDetails: error instanceof Error ? error.message : String(error),
      shipmentData: [{
        loadNumber: 'ERROR',
        miscellaneousFields: {
          errorMessage: error instanceof Error ? error.message : String(error),
          processingDate: new Date().toISOString(),
          scanStatus: 'failed'
        }
      }]
    });
  }
} 