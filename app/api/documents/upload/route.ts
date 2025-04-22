import { NextResponse } from 'next/server';
import { ExcelParserService } from '@/services/excel/ExcelParserService'; // Adjust path if needed
import { insertShipmentBundle } from '@/services/database/shipmentInserter'; // Adjust path if needed
import { type ParsedShipmentBundle } from '@/types/parser.types';
import { db } from '@/lib/database/drizzle';
import { documents } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/utils/logger'; // Use logger

export async function POST(request: Request) {
  logger.info('API: POST /api/documents/upload hit');
  let documentId: string | undefined; // Initialize documentId
  let filename: string | undefined; // Initialize filename

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.error('API: No file found in form data');
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    filename = file.name; // Assign filename here
    const fileType = file.type;
    const fileSize = file.size;

    logger.info(`API: Received file: ${filename}, size: ${fileSize}, type: ${fileType}`);

    // --- 1. Create Initial Document Record ---
    try {
      logger.info(`API: Creating initial document record for ${filename}`);
      const newDocument = await db.insert(documents).values({
        filename: filename,
        fileType: fileType,
        fileSize: fileSize,
        status: 'PROCESSING', // Start with processing status
      }).returning({ insertedId: documents.id });

      if (!newDocument || newDocument.length === 0 || !newDocument[0]?.insertedId) {
        throw new Error('Failed to create document record or retrieve its ID.');
      }
      documentId = newDocument[0].insertedId;
      logger.info(`API: Document record created with ID: ${documentId}`);

    } catch (dbError: any) {
      logger.error(`API: Database error during initial document record creation for ${filename}: ${dbError.message}`, dbError);
      throw new Error(`Database error during initial record creation: ${dbError.message}`); // Re-throw to be caught by outer try-catch
    }

    // Get ArrayBuffer directly
    const bytes = await file.arrayBuffer();

    // --- 2. Parsing ---
    let parsedBundles: ParsedShipmentBundle[] = [];
    try {
      const parserService = new ExcelParserService();
      const parseOptions = { fileName: filename, sourceDocumentId: documentId };
      parsedBundles = await parserService.parseExcelFile(bytes, parseOptions);
      logger.info(`Parsed ${parsedBundles.length} shipment bundles from file ${filename} (Doc ID: ${documentId}).`);
    } catch (parseError: any) {
      logger.error(`API: Error during file parsing for ${filename} (Doc ID: ${documentId}): ${parseError.message}`, parseError);
      if (documentId) {
           await db.update(documents)
             .set({ status: 'ERROR', errorMessage: `Parsing failed: ${parseError.message}` })
             .where(eq(documents.id, documentId));
           logger.info(`API: Marked document ${documentId} as ERROR due to parsing failure.`);
      }
      return NextResponse.json({ success: false, error: `Failed to parse file: ${parseError.message}`, documentId }, { status: 500 });
    }

    // --- 3. Database Insertion ---
    const insertionResults = [];
    let successCount = 0;
    let failureCount = 0;
    const processingErrors: string[] = []; // Collect individual insertion errors

    logger.info(`API: Attempting to insert ${parsedBundles.length} bundles for Doc ID: ${documentId}...`);
    for (const bundle of parsedBundles) {
      try {
        if (!bundle.metadata) {
            bundle.metadata = {} as any; // Initialize if missing (shouldn't happen ideally)
             logger.warn(`API: Bundle for row ${bundle.metadata?.originalRowIndex ?? '?'} was missing metadata object. Initialized.`);
        }
        if (!bundle.metadata.sourceDocumentId && documentId) {
           bundle.metadata.sourceDocumentId = documentId;
           logger.debug(`API: Injected sourceDocumentId ${documentId} into bundle metadata for row ${bundle.metadata.originalRowIndex ?? '?'}`);
        }
        if (!bundle.metadata?.sourceDocumentId) {
          throw new Error(`Bundle missing sourceDocumentId for row ${bundle.metadata?.originalRowIndex ?? '?'} even after generation attempt.`);
        }

        const insertResult = await insertShipmentBundle(bundle);

        if (insertResult.success && insertResult.shipmentId) {
            insertionResults.push({
              success: true,
              shipmentId: insertResult.shipmentId,
              identifier: bundle.metadata?.originalRowIndex ?? bundle.shipmentBaseData?.shipmentDocumentNumber ?? 'unknown'
            });
            successCount++;
        } else {
            throw new Error(insertResult.error || 'Unknown insertion error');
        }

      } catch (error: any) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const identifier = bundle.metadata?.originalRowIndex ?? bundle.shipmentBaseData?.shipmentDocumentNumber ?? 'unknown';
        logger.warn(`API: Failed to insert bundle for row ${identifier} (Doc ID: ${documentId}): ${errorMessage}`);
        processingErrors.push(`Row ${identifier}: ${errorMessage}`); // Collect specific error
        insertionResults.push({
          success: false,
          error: errorMessage,
          identifier: identifier
        });
      }
    }
    logger.info(`API: Insertion complete for Doc ID: ${documentId}. ${successCount} success, ${failureCount} failures.`);

    // --- 4. Final Document Update ---
    const finalStatus = failureCount === 0 ? 'PROCESSED' : 'ERROR'; // Mark ERROR if any bundle failed
    logger.info(`API: Updating final status for document ${documentId} to ${finalStatus} with ${successCount} shipments.`);
    await db.update(documents)
      .set({
        status: finalStatus,
        shipmentCount: successCount, // Count only successful insertions
        parsedDate: new Date(),
        errorMessage: processingErrors.join('; ') || null // Store concatenated errors if any
      })
      .where(eq(documents.id, documentId));

    // --- 5. Response ---
    return NextResponse.json({
      success: failureCount === 0,
      message: `Processed ${parsedBundles.length} shipment records from ${filename}. ${successCount} succeeded, ${failureCount} failed.`,
      documentId: documentId, // Include documentId in response
      results: insertionResults,
    });

  } catch (error: any) {
    logger.error(`API: Overall error in POST /api/documents/upload: ${error.message}`, { stack: error.stack, documentId, filename });
    if (documentId) {
      try {
        logger.error(`API: Attempting to mark document ${documentId} as ERROR due to overall failure.`);
        await db.update(documents)
          .set({ status: 'ERROR', errorMessage: `Overall processing failed: ${error.message}` })
          .where(eq(documents.id, documentId));
      } catch (updateError) {
        logger.error(`API: Failed to update document ${documentId} status to ERROR after catching overall error:`, updateError);
      }
    }
    return NextResponse.json({
        success: false,
        error: `An unexpected error occurred during upload: ${error.message}`,
        documentId: documentId, // Include IDs if available
        filename: filename
     }, { status: 500 });
  }
} 