import { NextResponse } from 'next/server';
import { db } from '../../../lib/database/drizzle';
// Import necessary schema objects
import {
    documents,
    documentStatusEnum,
    addresses, // Added import
    shipmentsErd, // Corrected import name
    users, // ADDED: Import users table schema
    // Import other tables used in TODOs if/when implemented
    // customShipmentDetails,
    // pickUps,
    // dropOffs,
    // items,
    // documentShipmentMap
} from '../../../lib/database/schema';
import { desc, eq, and, or, like, SQL, sql, inArray } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { logger } from '../../../utils/logger';
import { ExcelParserService } from '../../../services/excel/ExcelParserService';
import { auth } from '@/lib/auth';
import type { ParsedShipmentBundle } from '../../../types/parser.types'; // Changed to relative path
import { insertShipmentBundle } from '../../../services/database/shipmentInserter'; // Changed to relative path
import { DocumentType, type ShipmentData } from '../../../types/shipment'; // Changed to relative path
import type { ShipmentStatus } from '../../../types/shipment'; // Changed to relative path
import * as fs from 'fs'; // Added for debug output
import * as path from 'path'; // Added for debug output
import type { InferSelectModel } from 'drizzle-orm'; // Added for type inference
import { neon, NeonQueryFunction } from '@neondatabase/serverless'; // Added NeonQueryFunction

// Define the frontend type (based on components/document-page.tsx)
// Duplicating here for clarity in API route, ideally import from shared types
interface DocumentMetadata {
  id: string;
  filename: string;
  dateParsed: string | null; // Allow null if parsedDate is null
  shipments: number | null; // Allow null if shipmentCount is null
  shipmentSummaryStatus: "Needs Review" | "Delayed" | "In Transit" | "Completed" | "Mixed" | "Uploaded" | "Pickup Scheduled" | "Error"; // Expanded statuses
}

// --- ADDED: Explicit type for selected document fields ---
type SelectedDocument = {
  id: string;
  filename: string | null; // Allow null based on schema/usage
  parsedDate: Date | null;
  shipmentCount: number | null;
  status: typeof documentStatusEnum.enumValues[number] | null;
  createdAt: Date | null;
};
// --- END ADDED TYPE ---

// Helper to format date to YYYY-MM-DD string, handling null
function formatDate(date: Date | null): string | null {
  if (!date) return null;
  // Basic ISO string slice, consider timezone/locale if needed
  try {
     return date.toISOString().slice(0, 10); 
  } catch (e) {
     return null; // Handle potential invalid date objects
  }
}

// Helper to map DB status to frontend summary status
function mapDbStatusToSummary(dbStatus: typeof documentStatusEnum.enumValues[number] | null | undefined): DocumentMetadata['shipmentSummaryStatus'] {
    switch(dbStatus) {
        case 'PROCESSED': return 'Completed';
        case 'ERROR': return 'Needs Review';
        case 'PROCESSING': return 'In Transit';
        case 'UPLOADED': return 'Uploaded'; // Map UPLOADED
        default: return 'Mixed'; // Default for null or unhandled statuses
    }
}

// Helper to map individual shipment DB status to a standardized ShipmentStatus
// Corrected to handle specific DB enum values
function mapDbShipmentStatus(dbStatus: typeof shipmentsErd.status.enumValues[number] | null | undefined): ShipmentStatus | null {
    if (!dbStatus) return null;
    // Use a switch on the specific DB enum values
    switch(dbStatus) {
        case 'PLANNED': 
        case 'BOOKED':
            return 'PICKUP_SCHEDULED'; // Map PLANNED/BOOKED to PICKUP_SCHEDULED
        case 'IN_TRANSIT':
        case 'AT_PICKUP': // Consider AT_PICKUP as IN_TRANSIT for summary?
            return 'IN_TRANSIT';
        case 'AT_DROPOFF':
            // Map AT_DROPOFF to something relevant? Maybe NEEDS_REVIEW or IN_TRANSIT?
            // Let's map it to IN_TRANSIT for now, as it's still active.
            // Or null if we want it ignored by priority? Let's try null.
            return null; // Or 'NEEDS_REVIEW'? or 'IN_TRANSIT'?
        case 'COMPLETED':
            return 'DELIVERED';
        case 'EXCEPTION':
            return 'ERROR';
        case 'AWAITING_STATUS':
            // How should AWAITING_STATUS be treated in aggregation? 
            // Maybe ignore it (return null) or map to NEEDS_REVIEW?
            return null; // Ignore for priority calculation for now.
        case 'CANCELLED':
            // Map CANCELLED if needed, maybe to null or ERROR?
            return null; 
        default:
            logger.warn(`[mapDbShipmentStatus] Unhandled DB status encountered: ${dbStatus}`);
            return null; // Default to null for unhandled cases
    }
}

// Helper to calculate aggregate status from a list of shipment statuses
function calculateAggregateStatus(
    shipmentStatuses: (ShipmentStatus | null)[],
    documentDbStatus: typeof documentStatusEnum.enumValues[number] | null | undefined
): DocumentMetadata['shipmentSummaryStatus'] {
    if (!shipmentStatuses || shipmentStatuses.length === 0) {
        // If no shipments, rely on document status
        switch(documentDbStatus) {
            case 'PROCESSED': return 'Completed'; // Document processed, 0 shipments = Completed?
            case 'ERROR': return 'Error'; // Document had an error during processing
            case 'PROCESSING': return 'In Transit'; // Should ideally not happen if 0 shipments?
            case 'UPLOADED': return 'Uploaded';
            default: return 'Needs Review'; // Default if document status is weird
        }
    }

    const uniqueStatuses = new Set(shipmentStatuses.filter(s => s !== null));

    // Define Status Priority (Higher value = higher priority)
    const statusPriority: Record<ShipmentStatus, number> = {
        'ERROR': 50,
        'NEEDS_REVIEW': 40, // Add if applicable
        'PICKUP_SCHEDULED': 30,
        'IN_TRANSIT': 20,
        'DELIVERED': 10,
        // Add other statuses as needed
    };

    let highestPriorityStatus: ShipmentStatus | null = null;
    let highestPriority = -1;

    for (const status of uniqueStatuses) {
         if (status && statusPriority[status] !== undefined && statusPriority[status] > highestPriority) {
             highestPriority = statusPriority[status];
             highestPriorityStatus = status;
         }
    }

    // Map the highest priority status to the frontend summary status
    switch(highestPriorityStatus) {
        case 'ERROR': return 'Error'; // Or 'Needs Review' depending on desired terminology
        case 'NEEDS_REVIEW': return 'Needs Review';
        case 'PICKUP_SCHEDULED': return 'Pickup Scheduled';
        case 'IN_TRANSIT': return 'In Transit';
        case 'DELIVERED': return 'Completed';
        default:
            // If only null statuses or unmapped statuses, fall back to document status?
            if (uniqueStatuses.size === 0) {
                 switch(documentDbStatus) {
                    case 'PROCESSED': return 'Completed';
                    case 'ERROR': return 'Error';
                    case 'PROCESSING': return 'In Transit';
                    case 'UPLOADED': return 'Uploaded';
                    default: return 'Needs Review';
                 }
            }
            // --- MODIFIED: Explicitly return 'Mixed' if multiple statuses exist --- 
            // If we reached here, it means no high-priority status was found.
            // Check if there was more than one distinct status among the shipments.
            if (uniqueStatuses.size > 1) {
                return 'Mixed';
            }
            // --- END MODIFICATION --- 
            // If only one non-high-priority status exists, or something unexpected.
            // Falling back to 'Mixed' might still be the safest default here.
            // Or potentially try mapping the single remaining status if possible?
            // For now, keep fallback to Mixed.
            return 'Mixed'; 
    }
}

// GET handler for /api/documents
export async function GET(request: NextRequest) {
  logger.info("API: GET /api/documents called (MINIMAL TEST)");

  // --- START MINIMAL TEST --- 
  // Comment out all original logic to isolate the issue
  /*
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

  const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search')?.trim();
    const statusFilter = searchParams.get('status')?.trim();

    logger.info(`API: Filtering with search: '${searchQuery || 'N/A'}', status: '${statusFilter || 'N/A'}`);

    const baseCondition = eq(documents.uploadedById, userId);
    const conditions: SQL[] = [baseCondition];
  if (searchQuery) {
      conditions.push(like(documents.filename, `%${searchQuery}%`));
    }

    const documentQuery = db
      .select({
        id: documents.id,
        filename: documents.filename,
        parsedDate: documents.parsedDate,
        shipmentCount: documents.shipmentCount,
        status: documents.status,
        createdAt: documents.createdAt
      })
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));

    logger.debug("Executing Drizzle document query:", documentQuery.toSQL());
    const dbDocuments: SelectedDocument[] = await documentQuery;
    logger.info(`API: Found ${dbDocuments.length} documents matching basic criteria.`);

    if (dbDocuments.length === 0) {
      return NextResponse.json([]);
    }

    const documentIds = dbDocuments.map((doc: SelectedDocument) => doc.id);

    const shipmentStatusQuery = db
        .select({
            documentId: shipmentsErd.sourceDocumentId,
            status: shipmentsErd.status
        })
        .from(shipmentsErd)
        .where(inArray(shipmentsErd.sourceDocumentId, documentIds));

    logger.debug("Executing Drizzle shipment status query:", shipmentStatusQuery.toSQL());
    const dbShipmentStatuses = await shipmentStatusQuery;
    logger.info(`API: Found ${dbShipmentStatuses.length} shipment status entries for ${documentIds.length} documents.`);

    const statusesByDocumentId: Record<string, (ShipmentStatus | null)[]> = {};
    for (const shipment of dbShipmentStatuses) {
        if (shipment.documentId) {
            if (!statusesByDocumentId[shipment.documentId]) {
                statusesByDocumentId[shipment.documentId] = [];
            }
            statusesByDocumentId[shipment.documentId].push(mapDbShipmentStatus(shipment.status));
        }
    }

    let mappedResults: DocumentMetadata[] = dbDocuments.map((doc: SelectedDocument) => {
        const shipmentStatuses = statusesByDocumentId[doc.id] || [];
        const aggregateStatus = calculateAggregateStatus(shipmentStatuses, doc.status);

        return {
            id: doc.id,
            filename: doc.filename || 'Unknown Filename',
            dateParsed: formatDate(doc.parsedDate),
            shipments: doc.shipmentCount ?? 0,
            shipmentSummaryStatus: aggregateStatus,
        };
    });

  if (statusFilter && statusFilter !== 'all') {
       logger.info(`API: Applying frontend status filter: '${statusFilter}'`);
       mappedResults = mappedResults.filter(doc =>
           doc.shipmentSummaryStatus.toLowerCase() === statusFilter.toLowerCase()
       );
       logger.info(`API: ${mappedResults.length} documents after applying status filter.`);
    }

    logger.info(`API: Returning ${mappedResults.length} mapped and filtered documents.`);
    return NextResponse.json(mappedResults);

  } catch (error: any) {
    logger.error(`API: Error fetching documents: ${error.message}`, { stack: error.stack });
    return NextResponse.json({ message: 'Error fetching documents', error: error.message }, { status: 500 });
  }
  */
  // --- END MINIMAL TEST --- 

  // Return empty array for testing purposes
  return NextResponse.json([]);
}

// Helper function to determine DocumentType from filename
// Force redeploy comment
function determineDocumentType(filename: string | undefined): DocumentType {
    // --- Special Case for Mock File --- 
    if (filename === 'all_status_test_shipments.xlsx') {
        logger.info(`[determineDocumentType] Detected MOCK file: ${filename}. Overriding type to MOCK_STATUS_TEST.`);
        return DocumentType.MOCK_STATUS_TEST;
    }    
    // --- End Special Case ---

    if (!filename) {
        logger.warn('[determineDocumentType] Filename is undefined, defaulting to UNKNOWN.');
        return DocumentType.UNKNOWN;
    }
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('etd')) {
        logger.info(`[determineDocumentType] Detected ETD_REPORT for filename: ${filename}`);
        return DocumentType.ETD_REPORT;
    }
    if (lowerFilename.includes('outstation') || lowerFilename.includes('niro')) {
        logger.info(`[determineDocumentType] Detected OUTSTATION_RATES for filename: ${filename}`);
        return DocumentType.OUTSTATION_RATES;
    }
    logger.info(`[determineDocumentType] No specific type detected for filename: ${filename}. Defaulting to UNKNOWN.`);
    return DocumentType.UNKNOWN;
}

// POST handler for /api/documents (File Upload)
export async function POST(request: NextRequest) {
  logger.info('API: POST /api/documents called');

  // --- TEMPORARILY DISABLED AUTH CHECK ---
  // const session = await auth();
  // if (!session?.user?.id) {
  //   logger.warn('API: Unauthorized upload attempt.');
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // const userId = session.user.id;
  const userId = 'mock-user-id-for-testing'; // Use a mock ID
  logger.info(`[documents POST] Auth bypassed, using mock userId: ${userId}`);
  // --- END TEMPORARY DISABLE ---

  // Use const as docId is not reassigned in this test configuration
  const docId: string | undefined = undefined; 
  let filename: string | undefined;
  let finalStatus: typeof documentStatusEnum.enumValues[number] = 'ERROR'; // Default to error
  let processedCount = 0;
  let failedCount = 0;
  const processingErrors: string[] = [];
  let parsedBundles: ParsedShipmentBundle[] = []; // Initialize

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.error('API: No file found in form data.');
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    filename = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    logger.info(`API: Received file: ${filename}, Type: ${fileType}, Size: ${fileSize} bytes, UserID: ${userId}`); // Log UserID too

    const fileBuffer = await file.arrayBuffer();

    // Prepare values for insert
    const valuesToInsert = {
      filename: filename,
      fileType: fileType,
      fileSize: fileSize,
      status: 'PROCESSING' as const, 
      uploadedById: userId,
    };
    
    // *** ADD DETAILED LOGGING BEFORE INSERT ***
    logger.debug("API: Values prepared for initial document insert:", JSON.stringify(valuesToInsert));
    logger.debug(`API: Data types - filename: ${typeof filename}, fileType: ${typeof fileType}, fileSize: ${typeof fileSize}, status: ${typeof valuesToInsert.status}, uploadedById: ${typeof userId}`);

    // 1. Create initial Document record (SIMPLIFIED INSERT - REMOVED .returning())
    logger.info(`API: Attempting simplified initial document record insert for ${filename}`);
    await db.insert(documents).values(valuesToInsert);
    
    logger.info(`API: Simplified insert executed for ${filename}. NOTE: Document ID not retrieved via .returning() in this test.`);

    // If the insert succeeded, we proceed. If it failed, the catch block will handle it.

    // 2. Instantiate Parser Service (KEEP THIS)
    const parser = new ExcelParserService();

    // 3. Call Parser Service (KEEP THIS)
    logger.info(`API: Starting parsing for document ${docId || 'unknown_doc'}`);
    const detectedDocumentType = determineDocumentType(filename);
    parsedBundles = await parser.parseExcelFile(fileBuffer, {
      documentType: detectedDocumentType,
      fileName: filename
    });
    logger.info(`API: Parsed ${parsedBundles.length} shipment bundles from document ${docId || 'unknown_doc'}`); // Adjusted log

    // --- DEBUG SAVE OUTPUT (Adjusted for potentially missing docId) ---
    try {
      const debugOutputDir = path.resolve(process.cwd(), '.debug_output');
      const timestamp = Date.now();
      // Use a fallback name if docId wasn't retrieved
      const debugOutputPath = path.join(debugOutputDir, `parsed_output_${docId || 'no_id_test'}_${timestamp}.json`); 
      
      // Attempt to delete existing file (less likely to exist now, but keep for safety)
      if (fs.existsSync(debugOutputPath)) {
        try {
          fs.unlinkSync(debugOutputPath);
          logger.info(`[DEBUG] Deleted existing debug output file: ${debugOutputPath}`);
        } catch (deleteError: any) {
          logger.warn(`[DEBUG] Failed to delete existing debug output file (${debugOutputPath}): ${deleteError.message}`);
          // Continue anyway, writeFileSync should overwrite
        }
      }
      
      logger.info(`[DEBUG] Attempting to write ${parsedBundles.length} bundles to UNIQUE path: ${debugOutputPath}`);
      
      logger.debug(`[DEBUG] Bundles right before stringify: Count=${parsedBundles.length}, Bundle11Load=${parsedBundles[11]?.customDetailsData?.customerShipmentNumber}, Bundle12Load=${parsedBundles[12]?.customDetailsData?.customerShipmentNumber}`);
      
      const outputJson = JSON.stringify(parsedBundles, null, 2);
      // <<< NEW LOG: Log string length >>>
      logger.debug(`[DEBUG] Stringified JSON length: ${outputJson.length}`);

      fs.writeFileSync(debugOutputPath, outputJson);
      logger.info(`[DEBUG] fs.writeFileSync completed for: ${debugOutputPath}`);
      
      // <<< NEW: Read back file content and verify >>>
      try {
          const fileContent = fs.readFileSync(debugOutputPath, 'utf-8');
          const readBundles = JSON.parse(fileContent);
          logger.info(`[DEBUG] Successfully read back file. Bundle count from disk: ${readBundles.length}`);
          // Optionally log more details from readBundles if needed:
          // logger.debug(`[DEBUG] Read Bundle 11 Load: ${readBundles[11]?.customDetailsData?.customerShipmentNumber}`);
          // logger.debug(`[DEBUG] Read Bundle 12 Load: ${readBundles[12]?.customDetailsData?.customerShipmentNumber}`);
      } catch (readError: any) {
          logger.error(`[DEBUG] FAILED to read back or parse debug file (${debugOutputPath}): ${readError.message}`);
      }
      // <<< END Read Back >>>
      
      logger.info(`[DEBUG] Parser output saved to: ${debugOutputPath}`); 
    } catch (debugError: any) {
        logger.error(`[DEBUG] Failed to save parser output: ${debugError.message}`, debugError);
    }
    // ---- END DEBUG SAVE OUTPUT ----

    // --- Bundle processing loop remains commented out --- 
    /*
    if (parsedBundles.length === 0) {
      logger.warn(`API: No shipment bundles were parsed from ${filename}. Updating document status to PROCESSED (with 0 shipments).`);
      finalStatus = 'PROCESSED';
      processedCount = 0;
    } else {
      logger.info(`API: Processing ${parsedBundles.length} bundles for document ${docId}...`);
      let successfulInserts = 0;
      const failedBundleIndices: number[] = [];

      for (let index = 0; index < parsedBundles.length; index++) {
        const bundle = parsedBundles[index];
          const bundleNumber = index + 1;
        
        try {
          logger.debug(`API: Attempting to insert Bundle ${bundleNumber}/${parsedBundles.length}... Document ID: ${docId}`); 
          
          if (!bundle.metadata) {
                bundle.metadata = { originalRowData: {}, originalRowIndex: -1 };
          }
          if (!bundle.metadata.sourceDocumentId) {
              bundle.metadata.sourceDocumentId = docId;
          }
          
            // ***** COMMENTING OUT THE ACTUAL INSERT CALL *****
            // const insertionResult = await insertShipmentBundle(bundle);
            // Simulate success for testing the update step
            const insertionResult = { success: true, shipmentId: `simulated-${bundleNumber}` }; 
          
            if (insertionResult.success && insertionResult.shipmentId) {
              successfulInserts++;
                 logger.info(`API: Successfully SIMULATED insertion for Bundle ${bundleNumber}/${parsedBundles.length}. Sim Shipment ID: ${insertionResult.shipmentId}`);
          } else {
                 logger.warn(`API: Failed to SIMULATE insert Bundle ${bundleNumber}.`);
                 failedBundleIndices.push(index);
          }
        } catch (insertError: any) {
            logger.error(`API: Error SIMULATING insert Bundle ${bundleNumber}/${parsedBundles.length}: ${insertError.message}`, { stack: insertError.stack, bundleIndex: index }); 
            failedBundleIndices.push(index);
        }
        } 

        logger.info(`API: SIMULATED Insertion loop complete for document ${docId}. Successful: ${successfulInserts}, Failed: ${failedBundleIndices.length}`);

      if (failedBundleIndices.length === 0) {
          finalStatus = 'PROCESSED';
          processedCount = successfulInserts;
            logger.info(`API: All ${processedCount} bundles SIMULATED successfully for document ${docId}.`);
      } else {
          finalStatus = 'ERROR';
          processedCount = successfulInserts; 
          failedCount = failedBundleIndices.length;
            processingErrors.push(...failedBundleIndices.map(idx => `Bundle ${idx + 1} failed simulation: ${parsedBundles[idx]?.metadata?.processingErrors?.join(', ') || 'Unknown error'}`));
            logger.warn(`API: Partially SIMULATED document ${docId}. Success: ${processedCount}, Failed: ${failedCount}.`);
      }
    }
    */
    // --- END ISOLATION --- 

    // Determine final status based ONLY on parsing success
    if (parsedBundles.length > 0) {
        finalStatus = 'PROCESSED';
        processedCount = 0; 
        failedCount = parsedBundles.length;
        processingErrors.push('Bundle insertion skipped for testing.');
        logger.info(`API: Test Mode - Skipping bundle insertion. Marking as PROCESSED if bundles exist.`);
    } else {
        finalStatus = 'PROCESSED';
        processedCount = 0;
        logger.warn(`API: Test Mode - No bundles parsed. Marking as PROCESSED.`);
    }

    // --- Final db.update remains commented out --- 
    /* 
    logger.info(`API: Updating final status for document ${docId} to ${finalStatus} with ${processedCount} shipments (NOTE: Bundle insertion AND FINAL UPDATE was SKIPPED).`);
    await db.update(documents)
      .set({
        status: finalStatus,
        shipmentCount: processedCount, // Will be 0
        parsedDate: new Date(), 
        errorMessage: processingErrors.join('; ') || null
      })
      .where(eq(documents.id, docId));
    */
    logger.warn(`API: Test Mode - SKIPPING final db.update for document ${docId || 'unknown_doc'}`); 

    // 6. Return success response (Modified for testing)
    return NextResponse.json({
      message: `Document processed (TEST MODE - INSERTION SIMPLIFIED, BUNDLES/UPDATE SKIPPED). Status: ${finalStatus}`,
      documentId: docId, // Will be undefined
      filename: filename,
      totalBundlesFound: parsedBundles.length,
      processedShipments: processedCount,
      failedShipments: failedCount, 
      errors: processingErrors,
    }, { status: 200 });

  } catch (error: any) {
    logger.error(`API: Overall error in POST /api/documents: ${error.message}`, { stack: error.stack });
    // Cannot update document status here reliably without the ID
    return NextResponse.json({ 
        message: 'Error processing document upload', 
        error: error.message,
        documentId: docId, // Will be undefined 
        filename: filename 
    }, { status: 500 });
  }
}
