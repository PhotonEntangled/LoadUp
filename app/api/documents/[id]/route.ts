import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/database/drizzle'; // Import db
import { documents } from '@/lib/database/schema'; // Import schema
import { eq } from 'drizzle-orm'; // Import eq
import { logger } from '@/utils/logger'; // Import logger

// DELETE handler for /api/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const docId = params.id; // Extract the document ID from the dynamic route parameter

  logger.info(`API: DELETE /api/documents/${docId} called`);

  if (!docId) {
    logger.error('API: No document ID provided for deletion.');
    return NextResponse.json({ message: 'Document ID is required' }, { status: 400 });
  }

  try {
    // --- Database Logic ---
    logger.info(`API: Attempting to delete document with ID: ${docId}`);
    
    // Execute the delete operation
    const deleteResult = await db.delete(documents).where(eq(documents.id, docId));

    // Check if deletion happened - Drizzle might not give affectedRows directly easily
    // We assume success if no error is thrown. A select check *before* delete could confirm existence.
    // For now, rely on absence of error.
    logger.info(`API: Successfully executed delete statement for document ID: ${docId}`);
    
    // Return success response
    return NextResponse.json({ message: `Document ${docId} deleted successfully` }, { status: 200 });
  } catch (error: unknown) {
    logger.error(`API: Error deleting document ${docId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Database deletion failed';
    return NextResponse.json({ message: `Failed to delete document ${docId}`, error: errorMessage }, { status: 500 });
  }
}

// Add OPTIONS method for CORS preflight if needed (Only DELETE now)
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE', // Only DELETE
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

// Optional: Add a GET handler here if you want to fetch a single document by ID
// export async function GET(request: NextRequest, { params }: { params: { id: string } }) { ... } 