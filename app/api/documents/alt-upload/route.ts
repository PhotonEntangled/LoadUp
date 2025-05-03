import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { logger } from '@/utils/logger';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import { DocumentType } from '@/types/shipment';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Initialize neon client
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}
const sql = neon(connectionString);

// Helper function to determine DocumentType from filename
function determineDocumentType(filename: string | undefined): DocumentType {
  if (!filename) {
    return DocumentType.UNKNOWN;
  }
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('etd')) {
    return DocumentType.ETD_REPORT;
  }
  if (lowerFilename.includes('outstation') || lowerFilename.includes('niro')) {
    return DocumentType.OUTSTATION_RATES;
  }
  // Special case for test file
  if (filename === 'all_status_test_shipments.xlsx') {
    return DocumentType.MOCK_STATUS_TEST;
  }
  return DocumentType.UNKNOWN;
}

// POST handler for /api/documents/alt-upload
export async function POST(request: NextRequest) {
  logger.info("API: POST /api/documents/alt-upload called (DIRECT SQL TEST)");

  // User authentication
  const session = await auth();
  if (!session?.user?.id) {
    logger.warn('API: Unauthorized upload attempt.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let documentId: string | undefined;
  let filename: string | undefined;
  
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.error('API: No file found in form data.');
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    filename = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    logger.info(`API: Received file: ${filename}, Type: ${fileType}, Size: ${fileSize} bytes, UserID: ${userId}`);

    // Direct SQL INSERT using template strings
    logger.info(`API: Attempting direct SQL insert for document: ${filename}`);
    
    try {
      // Generate a UUID for the document
      const uuidResult = await sql`SELECT gen_random_uuid() as id`;
      documentId = uuidResult[0]?.id;
      
      if (!documentId) {
        throw new Error('Failed to generate UUID for document');
      }
      
      logger.info(`API: Generated UUID for document: ${documentId}`);
      
      // Insert document with direct SQL
      await sql`
        INSERT INTO documents (
          id, 
          filename, 
          file_type,
          file_size, 
          status, 
          uploaded_by_id
        ) VALUES (
          ${documentId}, 
          ${filename}, 
          ${fileType}, 
          ${fileSize}, 
          'PROCESSING', 
          ${userId}
        )
      `;
      
      logger.info(`API: Direct SQL insert successful for document: ${documentId}`);
    } catch (sqlError: any) {
      logger.error(`API: SQL Error during document insert: ${sqlError.message}`, { error: sqlError });
      return NextResponse.json({ 
        message: 'Database error during document creation', 
        error: sqlError.message 
      }, { status: 500 });
    }

    // Parse the file (just like original handler)
    const fileBuffer = await file.arrayBuffer();
    const parser = new ExcelParserService();
    
    logger.info(`API: Starting parsing for document ${documentId}`);
    const detectedDocumentType = determineDocumentType(filename);
    const parsedBundles = await parser.parseExcelFile(fileBuffer, {
      documentType: detectedDocumentType,
      fileName: filename,
      sourceDocumentId: documentId
    });
    
    logger.info(`API: Parsed ${parsedBundles.length} shipment bundles from document ${documentId}`);

    // Update document status with direct SQL
    await sql`
      UPDATE documents 
      SET 
        status = 'PROCESSED', 
        shipment_count = ${parsedBundles.length},
        parsed_date = NOW()
      WHERE id = ${documentId}
    `;
    
    logger.info(`API: Updated document ${documentId} status to PROCESSED with ${parsedBundles.length} shipments`);

    // Return success response
    return NextResponse.json({
      message: `Document processed successfully via alt-upload (DIRECT SQL)`,
      documentId: documentId,
      filename: filename,
      totalBundlesFound: parsedBundles.length
    }, { status: 200 });

  } catch (error: any) {
    logger.error(`API: Overall error in POST /api/documents/alt-upload: ${error.message}`, { stack: error.stack });
    
    // Try to update document status if we have an ID
    if (documentId) {
      try {
        await sql`
          UPDATE documents 
          SET 
            status = 'ERROR', 
            error_message = ${error.message}
          WHERE id = ${documentId}
        `;
        logger.info(`API: Updated document ${documentId} status to ERROR due to processing failure`);
      } catch (updateError: any) {
        logger.error(`API: Failed to update error status for document ${documentId}: ${updateError.message}`);
      }
    }
    
    return NextResponse.json({ 
      message: 'Error processing document upload', 
      error: error.message,
      documentId: documentId,
      filename: filename
    }, { status: 500 });
  }
} 