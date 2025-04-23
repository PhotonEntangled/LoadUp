import { type NextRequest, NextResponse } from 'next/server';
// Set drizzle path back to /lib/
import { db } from '@/lib/database/drizzle';
import { shipmentsErd, documentStatusEnum, documentSourceEnum, documents } from '@/lib/database/schema';
import { eq, sql } from 'drizzle-orm';
// MODIFIED: Import the CLASS, remove FIELD_MAPPINGS
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import { openAIService } from '@/services/ai/OpenAIService';
import { ERD_SCHEMA_FIELDS } from '@/services/ai/schema-reference';
// Update shared type import to use @/ alias
import { type ShipmentData, type AIMappedField, type DocumentType } from '@/types/shipment';
// ADDED: Import ParsedShipmentBundle type
import { type ParsedShipmentBundle } from '@/types/parser.types';
// import { processedDocuments } from 'src/lib/database/schema'; // REMOVED Import
import { OpenAIService } from '@/services/ai/OpenAIService';
import { logger } from '@/utils/logger';

// Instantiate OpenAI service if needed directly in this route
const openAiService = new OpenAIService();
// MODIFIED: Instantiate ExcelParserService
const excelParserService = new ExcelParserService();

/**
 * Helper function to convert Buffer to ArrayBuffer
 */
function bufferToArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer;
}

// Define an interface for the options
interface ProcessImageOptions {
  useAIMapping?: boolean;
  aiMappingConfidenceThreshold?: number;
  documentType?: string; // Assuming documentType might also be passed
}

/**
 * Process OCR data through the same Excel parsing pipeline
 * using OpenAI's Vision API to extract text from images
 */
async function processImageWithOCR(imageBuffer: ArrayBuffer, fileName: string, options: ProcessImageOptions = {}) {
  console.log(`Processing image file for OCR: ${fileName}`);
  let extractedText = ''; // Store extracted text
  let ocrConfidence = 0;

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

    extractedText = extractionResult.text; // Assign extracted text
    ocrConfidence = extractionResult.confidence || 0.85; // Assign confidence
    console.log('Successfully extracted text from image:', extractedText.substring(0, 150) + '...');

    // If we already have structured shipment data from the extraction, use it
    if (extractionResult.shipmentData) {
      console.log('Using pre-extracted shipment data');

      // Enhance with metadata
      return {
        shipments: [{
          ...extractionResult.shipmentData,
          miscellaneousFields: {
            ...extractionResult.shipmentData.miscellaneousFields,
            // extractedText: extractedText, // Keep rawData separate in DB
            originalFileName: fileName,
            ocrConfidence: ocrConfidence
          }
        }],
        rawData: extractedText, // Return rawData separately
        confidence: ocrConfidence
      };
    }

    // Otherwise, process the extracted text through the Excel parser
    // Process the extracted text through the Excel parser's text parsing function
    // --- START NEUROTIC FIX: Comment out broken/non-functional OCR text parsing path ---
    // TODO: [NEUROTIC] This section is commented out because `excelParserService.parseText` does not exist (see L92 TODO)
    // and the subsequent mapping attempts to treat `ShipmentData[]` as `ParsedShipmentBundle[]`, causing type errors (L139).
    // This entire path needs functional review and implementation before re-enabling.
    /*
    const parsedShipments: ShipmentData[] = []; // Initialize with explicit type and empty array
    try {
      // Use the instantiated service
      // TODO: Revisit OCR text parsing strategy. parseText does not exist on ExcelParserService.
      // parsedShipments = await excelParserService.parseText(extractedText, parseOptions);
      logger.warn('[processImageWithOCR] excelParserService.parseText call skipped as method does not exist. OCR text parsing needs review.');
    } catch (parseError) {
      console.error('Error parsing extracted text:', parseError);

      // If parsing fails, return basic data structure with the extracted text
      return {
        shipments: [{
          loadNumber: 'UNKNOWN',
          miscellaneousFields: {
            // extractedText: extractedText,
            originalFileName: fileName,
            ocrConfidence: ocrConfidence,
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          }
        }],
        rawData: extractedText,
        confidence: ocrConfidence
      };
    }

    if (!parsedShipments || parsedShipments.length === 0) {
      // Return basic structure with extracted text if no shipments were identified
      return {
        shipments: [{
          loadNumber: 'UNKNOWN',
          miscellaneousFields: {
            // extractedText: extractedText,
            originalFileName: fileName,
            ocrConfidence: ocrConfidence,
            parseStatus: 'No shipment data identified'
          }
        }],
        rawData: extractedText,
        confidence: ocrConfidence
      };
    }

    // Store the original OCR text in the miscellaneousFields for reference
    // MODIFIED: Merge OCR fields into metadata, not non-existent miscellaneousFields
    const finalShipments: ParsedShipmentBundle[] = parsedShipments.map((shipment: ParsedShipmentBundle) => ({ // <<< Linter Error Here (L139)
      ...shipment,
      // Merge into existing metadata
      metadata: {
        ...shipment.metadata, // Keep existing metadata
        // Add OCR specific fields here
        originalFileName: fileName, // Assuming fileName is available in scope
        ocrConfidence: ocrConfidence // Assuming ocrConfidence is available
      }
    }));

    return {
      shipments: finalShipments,
      rawData: extractedText,
      confidence: ocrConfidence
    };
    */
    // --- END NEUROTIC FIX ---
    // Since the above is commented out, we need a return value here if the pre-extracted data wasn't found.
    // Return a minimal error structure indicating the text parsing path is disabled.
    logger.warn('[processImageWithOCR] Text parsing from OCR is currently disabled due to non-existent parser method. Returning error structure.');
    return {
        // Corrected: Create a minimal valid ParsedShipmentBundle for the error case
        shipments: [{
            // Required fields:
            shipmentBaseData: {}, // Empty object satisfies base type, inserter handles defaults/FKs
            customDetailsData: null,
            originAddressData: null,
            destinationAddressData: null,
            pickupData: null,
            dropoffData: null,
            itemsData: [],
            parsedStatusString: 'OCR_TEXT_PARSING_DISABLED', // Indicate specific error state
            metadata: { // Required metadata object
                originalRowData: { error: 'OCR Text Parsing Disabled' },
                originalRowIndex: -1, // Indicate no specific row
                processingErrors: ['OCR text extraction succeeded, but subsequent text parsing is disabled.'],
                needsReview: true, // Flag for review
                sourceDocumentId: null, // Not available in this path yet
                originalFileName: fileName, // Keep filename
                ocrConfidence: ocrConfidence // Keep confidence
                // Optional fields omitted: confidenceScore, rawOriginInput, rawDestinationInput, processingNotes
            },
            // Optional fields omitted: parsedDriverName, parsedDriverPhone, parsedTruckIdentifier, parsedDriverIc
        } as ParsedShipmentBundle], // Cast remains necessary due to partial nature
        rawData: extractedText,
        confidence: ocrConfidence,
        error: 'OCR Text Parsing is currently disabled.'
    };


  } catch (error) {
    console.error('Error processing OCR data:', error);

    // Return a basic error structure
    // MODIFIED: Use metadata for error details
    return {
      // Corrected: Create a minimal valid ParsedShipmentBundle for the catch block
      shipments: [{
            // Required fields:
            shipmentBaseData: {}, // Empty object satisfies base type, inserter handles defaults/FKs
        customDetailsData: null,
        originAddressData: null,
        destinationAddressData: null,
        pickupData: null,
        dropoffData: null,
        itemsData: [],
            parsedStatusString: 'OCR_PROCESSING_ERROR', // Indicate general processing error
            metadata: { // Required metadata object
          originalRowData: { error: 'OCR Processing Failed' },
                originalRowIndex: -1, // Indicate no specific row
          processingErrors: [error instanceof Error ? error.message : String(error)],
                needsReview: true, // Flag for review
                sourceDocumentId: null, // Not available here
                originalFileName: fileName, // Keep filename
                ocrConfidence: ocrConfidence // Keep confidence if available
                // Optional fields omitted
            },
            // Optional fields omitted
      } as ParsedShipmentBundle], // Cast remains necessary
      rawData: extractedText, // Include raw text even on error if available
      confidence: ocrConfidence,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * POST handler for document processing
 */
export async function POST(request: NextRequest) {
  let documentId: string | null = null;
  // Use a plain Partial object for accumulating fields
  let accumulatedUpdateData: Partial<{ 
      status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "ERROR";
      errorMessage: string | null;
      parsedDate: Date;
      shipmentCount: number | null;
      updatedAt: Date;
  }> = {}; 

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided or invalid file' }, { status: 400 });
    }

    const documentType = formData.get('documentType') as string || 'ETD_REPORT';
    const useAIMapping = formData.get('useAIMapping') === 'true';
    const aiMappingConfidenceThreshold = parseFloat(formData.get('aiMappingConfidenceThreshold') as string || '0.7');
    const hasHeaderRow = formData.get('hasHeaderRow') !== 'false';
    const isImageFile = file.type.startsWith('image/');

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Construct payload directly for insert, ensuring filename is string
    const initialInsertPayload = {
        filename: file.name, // Directly use validated string
        filePath: 'temp/path', // Example
        fileType: file.type,
        fileSize: file.size,
        source: isImageFile ? documentSourceEnum.enumValues[0] : documentSourceEnum.enumValues[1],
        // Let DB handle defaults for status, uploadDate, createdAt etc.
    };

    let insertedRecord;
    try {
      insertedRecord = await db.insert(documents)
        .values(initialInsertPayload) // Use the directly constructed object
        .returning({ insertedId: documents.id });

      documentId = insertedRecord[0].insertedId;
      logger.info(`Document record created with ID: ${documentId}`);
      // Set initial status in accumulator
      accumulatedUpdateData.status = documentStatusEnum.enumValues[1]; // PROCESSING

    } catch (dbError: any) {
       // If error includes constraint violation on filename, it means file.name was invalid
       logger.error('Error inserting initial document record:', dbError);
       return NextResponse.json({ error: 'Database error during initial record creation.' }, { status: 500 });
    }

    let processedResults: any = { // Store results including rawData, shipments, confidence
      shipments: [],
      rawData: null,
      confidence: null,
      error: null
    };
    let processingError: Error | null = null;
    let finalStatus: (typeof documentStatusEnum.enumValues)[number] = documentStatusEnum.enumValues[2]; // 'PROCESSED'
    let shipmentCount: number | null = null;

    const buffer = await file.arrayBuffer();

    try {
      // --- Start Processing Logic ---
      if (isImageFile) {
        processedResults = await processImageWithOCR(buffer, file.name, { documentType, useAIMapping, aiMappingConfidenceThreshold });
      } else {
        // Process Excel/text file with the regular parser
        let sheetIndex: number | undefined = undefined;
        const sheetIndexParam = formData.get('sheetIndex') as string;
        if (sheetIndexParam) {
          sheetIndex = parseInt(sheetIndexParam, 10);
        }

        // Assuming excelParserService.parse returns similar structure or adapting it
        // Use the instantiated service
        const excelResult = await excelParserService.parseExcelFile(buffer, {
          hasHeaderRow,
          // REMOVED: useAIMapping, // Let the service default handle this?
          // REMOVED: aiMappingConfidenceThreshold,
          documentType: documentType as DocumentType, // Pass documentType
          sheetIndex,
          fileName: file.name // Pass filename
        });
        processedResults.shipments = excelResult; // Assuming it returns array of bundles
        shipmentCount = excelResult.length;
        // NOTE: rawData and confidence might not be available from excel parser directly
      }
      // --- End Processing Logic ---

      // Basic error check from processing results
      if (processedResults.error || (processedResults.shipments && processedResults.shipments[0]?.loadNumber === 'ERROR')) {
          throw new Error(processedResults.error || 'Processing resulted in error state');
      }

      shipmentCount = processedResults.shipments?.length ?? 0;

    } catch (error) {
      console.error(`Processing error for document ${documentId}:`, error);
      processingError = error instanceof Error ? error : new Error(String(error));
      finalStatus = documentStatusEnum.enumValues[3]; // 'ERROR'
      // Keep processedResults.rawData if available from OCR error path
      if (!processedResults.rawData && error instanceof Error) {
          processedResults.rawData = `Error: ${error.message}`;
      }
    }

    // --- Prepare final update data --- 
    // Accumulate fields into the simple partial object
    accumulatedUpdateData = {
      ...accumulatedUpdateData,
      status: finalStatus, 
      errorMessage: processingError ? processingError.message.substring(0, 1000) : null, // Nullable ok
      parsedDate: new Date(), 
      shipmentCount: shipmentCount, // Nullable ok
      updatedAt: new Date(), 
    };
    
    // Return success/error response (logic simplified for example)
    if (finalStatus === documentStatusEnum.enumValues[2]) { // PROCESSED
      console.log(`Document ${documentId} processed successfully. Shipment Count: ${shipmentCount}`);
      return NextResponse.json({
        status: 'success',
        message: 'Document processed successfully',
        documentId: documentId,
        shipmentCount: shipmentCount,
      });
    } else { // ERROR
      console.log(`Document ${documentId} processing failed.`);
      return NextResponse.json({
        status: 'error',
        message: processingError?.message || 'Document processing failed',
        documentId: documentId,
      }, { status: 500 });
    }

  } catch (error: unknown) {
      logger.error('Unhandled endpoint error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Define payload specifically for the error update
      const errorUpdatePayload = {
        status: documentStatusEnum.enumValues[3], // ERROR
        errorMessage: `Unhandled endpoint error: ${errorMessage.substring(0, 500)}`,
        updatedAt: new Date(), 
      };
       if (documentId) {
          try {
              // Pass the specifically constructed error payload
              await db.update(documents)
                .set(errorUpdatePayload)
                .where(eq(documents.id, documentId));
          } catch (finalDbError) {
              logger.error(`Failed to update document ${documentId} status on final error handler:`, finalDbError);
          }
      }
      return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });

  } finally {
      // Perform final update using only relevant fields from the accumulator
      if (documentId && accumulatedUpdateData.status) { 
      logger.info(`Performing final update for document ${documentId} with status: ${accumulatedUpdateData.status}`);
      
      // Construct the final payload explicitly for .set()
      const finalUpdatePayload: { 
          status?: "UPLOADED" | "PROCESSING" | "PROCESSED" | "ERROR";
          errorMessage?: string | null;
          parsedDate?: Date;
          shipmentCount?: number | null;
          updatedAt?: Date;
      } = {};
      if (accumulatedUpdateData.status) finalUpdatePayload.status = accumulatedUpdateData.status;
      if (accumulatedUpdateData.errorMessage !== undefined) finalUpdatePayload.errorMessage = accumulatedUpdateData.errorMessage;
      if (accumulatedUpdateData.parsedDate) finalUpdatePayload.parsedDate = accumulatedUpdateData.parsedDate;
      if (accumulatedUpdateData.shipmentCount !== undefined) finalUpdatePayload.shipmentCount = accumulatedUpdateData.shipmentCount;
      if (accumulatedUpdateData.updatedAt) finalUpdatePayload.updatedAt = accumulatedUpdateData.updatedAt;

      try {
        // Pass the explicitly constructed final payload
        await db.update(documents)
          .set(finalUpdatePayload) 
          .where(eq(documents.id, documentId)); 
        logger.info(`Successfully performed final update for document ${documentId}`);
      } catch (dbError: unknown) {
        logger.error(`Database error during final update for document ${documentId}:`, dbError);
      }
    }
  }
  logger.error('Reached end of function unexpectedly.');
  return NextResponse.json({ error: 'Internal server error: Unexpected end of execution.' }, { status: 500 });
} 