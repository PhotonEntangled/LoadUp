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
import { auth } from '../../../lib/auth';
import type { ParsedShipmentBundle } from '../../../types/parser.types'; // Changed to relative path
import { insertShipmentBundle } from '../../../services/database/shipmentInserter'; // Changed to relative path
import { DocumentType, type ShipmentData } from '../../../types/shipment'; // Changed to relative path
import type { ShipmentStatus } from '../../../types/shipment'; // Changed to relative path
import * as fs from 'fs'; // Added for debug output
import * as path from 'path'; // Added for debug output
import type { InferSelectModel } from 'drizzle-orm'; // Added for type inference

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
  logger.info("API: GET /api/documents called");

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user from the database to ensure they exist (Optional, but good practice)
    // Corrected: Use imported 'users' table
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    // Add check if user actually exists if needed
    // if (!user) { ... handle user not found ... }

  const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search')?.trim();
    const statusFilter = searchParams.get('status')?.trim(); // Frontend status filter

    logger.info(`API: Filtering with search: '${searchQuery || 'N/A'}', status: '${statusFilter || 'N/A'}`);

    // --- Construct Drizzle Query Conditions ---
    // Corrected: Use the actual foreign key column name
    const baseCondition = eq(documents.uploadedById, userId);
    const conditions: SQL[] = [baseCondition];
  if (searchQuery) {
      conditions.push(like(documents.filename, `%${searchQuery}%`));
    }

    // Note: Status filtering might need adjustment.
    // Do we filter by the *new* aggregate status or the old document DB status?
    // For now, let's assume filtering happens *after* fetching and calculating.
    // If performance is an issue, we'll need to filter directly in the DB query,
    // which requires translating frontend statuses back to potential DB statuses or
    // storing the aggregate status in the DB.

    // --- Execute Query to get Documents ---
    // Select necessary document fields
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
      // Corrected: Use and() helper correctly within where()
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt)); // Sort by creation date

    logger.debug("Executing Drizzle document query:", documentQuery.toSQL());
    // Apply explicit type
    const dbDocuments: SelectedDocument[] = await documentQuery;
    logger.info(`API: Found ${dbDocuments.length} documents matching basic criteria.`);

    if (dbDocuments.length === 0) {
      return NextResponse.json([]); // No documents found, return early
    }

    // Add explicit type for 'doc' parameter
    const documentIds = dbDocuments.map((doc: SelectedDocument) => doc.id);

    // --- Execute Query to get Shipment Statuses for these Documents ---
    // Fetch shipment statuses linked to the retrieved documents
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

    // Group shipment statuses by document ID for efficient lookup
    const statusesByDocumentId: Record<string, (ShipmentStatus | null)[]> = {};
    for (const shipment of dbShipmentStatuses) {
        if (shipment.documentId) {
            if (!statusesByDocumentId[shipment.documentId]) {
                statusesByDocumentId[shipment.documentId] = [];
            }
            // Map the raw DB status before adding
            statusesByDocumentId[shipment.documentId].push(mapDbShipmentStatus(shipment.status));
        }
    }

    // --- Map results to DocumentMetadata including Aggregate Status ---
    // Add explicit type for 'doc' parameter
    let mappedResults: DocumentMetadata[] = dbDocuments.map((doc: SelectedDocument) => {
        const shipmentStatuses = statusesByDocumentId[doc.id] || [];
        const aggregateStatus = calculateAggregateStatus(shipmentStatuses, doc.status);

        return {
            id: doc.id,
            // Handle potential null filename safely
            filename: doc.filename || 'Unknown Filename',
            dateParsed: formatDate(doc.parsedDate),
            shipments: doc.shipmentCount ?? 0,
            shipmentSummaryStatus: aggregateStatus,
        };
    });

    // --- Apply Frontend Status Filter (Post-Calculation) ---
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
  logger.info("API: POST /api/documents called");

  const session = await auth();
  if (!session?.user?.id) {
    logger.warn('API: Unauthorized upload attempt.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let docId: string | undefined;
  let filename: string | undefined;
  let finalStatus: typeof documentStatusEnum.enumValues[number] = 'ERROR'; // Default to error
  let processedCount = 0;
  let failedCount = 0;
  const processingErrors: string[] = []; // Store specific bundle errors

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

    logger.info(`API: Received file: ${filename}, Type: ${fileType}, Size: ${fileSize} bytes`);

    // Read file content
    const fileBuffer = await file.arrayBuffer();

    // TODO: Implement actual file storage (e.g., S3, Azure Blob) and get filePath
    // const filePath = `uploads/${filename}`; // Placeholder path

    // 1. Create initial Document record
    logger.info(`API: Creating initial document record for ${filename}`);
    const newDocument = await db.insert(documents).values({
      filename: filename,
      // filePath: filePath,
      fileType: fileType,
      fileSize: fileSize,
      status: 'PROCESSING', // Start with processing status
      uploadedById: userId, // CORRECT: This will now use the userId from the session
      // batchId: null, // Assign later if part of a batch upload
    }).returning({ insertedId: documents.id });

    if (!newDocument || newDocument.length === 0 || !newDocument[0]?.insertedId) {
      logger.error('API: Failed to create initial document record in database.');
      throw new Error('Database error creating document record.');
    }
    docId = newDocument[0].insertedId;
    logger.info(`API: Created document record with ID: ${docId}`);

    // --- Parsing and Transaction Logic ---
    // 2. Instantiate Parser Service
    const parser = new ExcelParserService();

    // 3. Call Parser Service
    logger.info(`API: Starting parsing for document ${docId}`);
    // Ensure parseExcelFile returns the correct type: ParsedShipmentBundle[]
    const detectedDocumentType = determineDocumentType(filename);
    // Ensure parseExcelFile returns the correct type: ParsedShipmentBundle[]
    const parsedBundles: ParsedShipmentBundle[] = await parser.parseExcelFile(fileBuffer, {
      documentType: detectedDocumentType, // Pass the detected type
      fileName: filename // Pass the filename for context/logging within parser
    });
    logger.info(`API: Parsed ${parsedBundles.length} shipment bundles from document ${docId} (Detected Type: ${detectedDocumentType})`);

    // ---- BEGIN DEBUG: Save parser output ----
    try {
      const debugOutputDir = path.resolve(process.cwd(), '.debug_output');
      // <<< CHANGE: Add timestamp to filename >>>
      const timestamp = Date.now();
      const debugOutputPath = path.join(debugOutputDir, `parsed_output_${docId || 'unknown_doc'}_${timestamp}.json`); 
      
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
    // ---- END DEBUG: Save parser output ----

    // Check if parsing produced any bundles before starting transaction
    if (parsedBundles.length === 0) {
      logger.warn(`API: No shipment bundles were parsed from ${filename}. Updating document status to PROCESSED (with 0 shipments).`);
      finalStatus = 'PROCESSED';
      processedCount = 0;
      // Skip transaction block if nothing to process
    } else {
      // 4. Process bundles sequentially (calling insertShipmentBundle for each)
      logger.info(`API: Processing ${parsedBundles.length} bundles for document ${docId}...`);
      let successfulInserts = 0;
      const failedBundleIndices: number[] = [];

      // <<<< RESTORE DB INSERTION LOOP >>>>
      // Loop through all parsed bundles
      for (let index = 0; index < parsedBundles.length; index++) {
        const bundle = parsedBundles[index];
        const bundleNumber = index + 1; // 1-based index for logging
        
        try {
          // Use 1-based index for logging clarity
          logger.debug(`API: Attempting to insert Bundle ${bundleNumber}/${parsedBundles.length}... Document ID: ${docId}`); 
          
          // Ensure sourceDocumentId is set on the bundle before inserting
          if (!bundle.metadata) {
              logger.warn(`API: Bundle ${bundleNumber} is missing metadata. Initializing.`);
              bundle.metadata = { originalRowData: {}, originalRowIndex: -1 }; // Ensure metadata exists
          }
          if (!bundle.metadata.sourceDocumentId) {
              logger.debug(`API: Setting sourceDocumentId ${docId} on Bundle ${bundleNumber}`);
              bundle.metadata.sourceDocumentId = docId;
          }
          
          // Assume insertShipmentBundle returns { success: boolean, shipmentId?: string, error?: string }
          const insertionResult = await insertShipmentBundle(bundle); // Call the transactional inserter
          
          if (insertionResult.success && insertionResult.shipmentId) { // Check for success and shipmentId
              successfulInserts++;
               logger.info(`API: Successfully inserted Bundle ${bundleNumber}/${parsedBundles.length}. Shipment ID: ${insertionResult.shipmentId}`); // Use result.shipmentId
          } else {
               // Insertion failed or didn't return expected ID
               logger.warn(`API: Failed to insert Bundle ${bundleNumber}. Reason: ${insertionResult.error || 'insertShipmentBundle returned success=false or missing shipmentId'}.`); // Log error from result
               failedBundleIndices.push(index); // Use 0-based index for internal tracking
          }
        } catch (insertError: any) {
          // Log with specific bundle number that failed
          logger.error(`API: Error inserting Bundle ${bundleNumber}/${parsedBundles.length} for document ${docId}: ${insertError.message}`, { stack: insertError.stack, bundleIndex: index }); 
          failedBundleIndices.push(index); // Use 0-based index for internal tracking
          // Continue processing other bundles
        }
      } // ---> END OF LOOP <--- 

      logger.info(`API: Insertion loop complete for document ${docId}. Successful Inserts: ${successfulInserts}, Failed Bundles: ${failedBundleIndices.length} (Indices: ${failedBundleIndices.join(', ')})`); // Added failed indices
      // <<<< END RESTORE >>>>

      // Determine final status based on bundle processing results
      if (failedBundleIndices.length === 0) {
          finalStatus = 'PROCESSED';
          processedCount = successfulInserts;
          logger.info(`API: All ${processedCount} bundles processed successfully for document ${docId}.`);
      } else {
          finalStatus = 'ERROR';
          processedCount = successfulInserts; 
          failedCount = failedBundleIndices.length;
          // Store specific error messages from failed bundles
          processingErrors.push(...failedBundleIndices.map(idx => `Bundle ${idx + 1} failed: ${parsedBundles[idx]?.metadata?.processingErrors?.join(', ') || 'Unknown error'}`));
          logger.warn(`API: Partially processed document ${docId}. Success: ${processedCount}, Failed: ${failedCount}.`);
      }
      
    } // End of else block (parsedBundles.length > 0)

    // 5. Update Document Status (outside transaction)
    logger.info(`API: Updating final status for document ${docId} to ${finalStatus} with ${processedCount} shipments.`);
    await db.update(documents)
      .set({
        status: finalStatus,
        shipmentCount: processedCount,
        parsedDate: new Date(), 
        errorMessage: processingErrors.join('; ') || null // Store concatenated errors
      })
      .where(eq(documents.id, docId));

    // 6. Return success response
    return NextResponse.json({
      message: `Document processed. Status: ${finalStatus}`,
      documentId: docId,
      filename: filename,
      totalBundlesFound: parsedBundles.length,
      processedShipments: processedCount,
      failedShipments: failedCount, 
      errors: processingErrors, // Include detailed errors
    }, { status: 200 });

  } catch (error: any) {
    logger.error(`API: Overall error in POST /api/documents: ${error.message}`, { stack: error.stack });
    // If we have a docId, try to mark it as ERROR
    if (docId) {
      try {
        logger.error(`API: Attempting to mark document ${docId} as ERROR due to overall failure.`);
        await db.update(documents)
          .set({ status: 'ERROR' })
          .where(eq(documents.id, docId));
      } catch (updateError) {
        logger.error(`API: Failed to update document ${docId} status to ERROR after catching overall error:`, updateError);
      }
    }
    return NextResponse.json({ 
        message: 'Error processing document upload', 
        error: error.message,
        documentId: docId, 
        filename: filename 
    }, { status: 500 });
  }
}
