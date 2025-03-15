/**
 * Service for managing processed documents in the database
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';

import { 
  processedDocuments, 
  documentBatches,
  DOCUMENT_SOURCE_ENUM,
  PROCESSING_STATUS_ENUM
} from '@loadup/database/schema/shipments';

import { ShipmentData } from '../ocr/DocumentParser';
import { DataSourceType } from '../data/ShipmentDataProcessor';

/**
 * Options for creating a processed document
 */
export interface CreateProcessedDocumentOptions {
  batchId?: string;
  createdBy?: string;
  needsReview?: boolean;
  confidence?: number;
}

/**
 * Service for managing processed documents in the database
 */
export class ProcessedDocumentService {
  constructor(private db: PostgresJsDatabase) {}

  /**
   * Create a new processed document
   * @param source The source of the document (OCR_IMAGE or EXCEL_TXT)
   * @param originalFileUrl The URL of the original file
   * @param rawData The raw data extracted from the document
   * @param processedData The processed shipment data
   * @param options Additional options
   * @returns The created processed document
   */
  async createProcessedDocument(
    source: DataSourceType,
    originalFileUrl: string,
    rawData: any,
    processedData: ShipmentData,
    options?: CreateProcessedDocumentOptions
  ) {
    return await this.db.insert(processedDocuments).values({
      id: uuidv4(),
      source: this.mapDataSourceToDocumentSource(source),
      status: 'PROCESSED',
      originalFileUrl,
      rawData,
      processedData,
      confidence: options?.confidence || processedData.confidence || 0,
      needsReview: options?.needsReview || processedData.needsReview || false,
      batchId: options?.batchId || null,
      createdBy: options?.createdBy || null,
    }).returning();
  }

  /**
   * Create a new document batch
   * @param name The name of the batch
   * @param source The source of the documents in the batch
   * @param fileCount The number of files in the batch
   * @param createdBy The ID of the user who created the batch
   * @returns The created batch
   */
  async createDocumentBatch(
    name: string,
    source: DataSourceType,
    fileCount: number,
    createdBy?: string
  ) {
    return await this.db.insert(documentBatches).values({
      id: uuidv4(),
      name,
      source: this.mapDataSourceToDocumentSource(source),
      fileCount,
      status: 'PENDING',
      createdBy: createdBy || null,
    }).returning();
  }

  /**
   * Update a document batch's status
   * @param batchId The ID of the batch
   * @param status The new status
   * @param processedCount The number of processed documents
   * @param validatedCount The number of validated documents
   * @param rejectedCount The number of rejected documents
   * @returns The updated batch
   */
  async updateBatchStatus(
    batchId: string,
    status: string,
    processedCount?: number,
    validatedCount?: number,
    rejectedCount?: number
  ) {
    const updateData: any = {
      status: status as any, // Cast to any to avoid type issues
      updatedAt: new Date(),
    };

    if (processedCount !== undefined) {
      updateData.processedCount = processedCount;
    }

    if (validatedCount !== undefined) {
      updateData.validatedCount = validatedCount;
    }

    if (rejectedCount !== undefined) {
      updateData.rejectedCount = rejectedCount;
    }

    return await this.db.update(documentBatches)
      .set(updateData)
      .where(eq(documentBatches.id, batchId))
      .returning();
  }

  /**
   * Get a processed document by ID
   * @param documentId The ID of the document
   * @returns The processed document
   */
  async getProcessedDocument(documentId: string) {
    return await this.db.query.processedDocuments.findFirst({
      where: eq(processedDocuments.id, documentId),
    });
  }

  /**
   * Get processed documents by batch ID
   * @param batchId The ID of the batch
   * @param limit The maximum number of documents to return
   * @param offset The offset for pagination
   * @returns The processed documents in the batch
   */
  async getProcessedDocumentsByBatch(batchId: string, limit = 10, offset = 0) {
    return await this.db.query.processedDocuments.findMany({
      where: eq(processedDocuments.batchId, batchId),
      limit,
      offset,
      orderBy: [desc(processedDocuments.createdAt)],
    });
  }

  /**
   * Get processed documents that need review
   * @param limit The maximum number of documents to return
   * @param offset The offset for pagination
   * @returns The processed documents that need review
   */
  async getProcessedDocumentsNeedingReview(limit = 10, offset = 0) {
    return await this.db.query.processedDocuments.findMany({
      where: eq(processedDocuments.needsReview, true),
      limit,
      offset,
      orderBy: [desc(processedDocuments.createdAt)],
    });
  }

  /**
   * Get document batches
   * @param limit The maximum number of batches to return
   * @param offset The offset for pagination
   * @returns The document batches
   */
  async getDocumentBatches(limit = 10, offset = 0) {
    return await this.db.query.documentBatches.findMany({
      limit,
      offset,
      orderBy: [desc(documentBatches.createdAt)],
    });
  }

  /**
   * Get a document batch by ID
   * @param batchId The ID of the batch
   * @returns The document batch
   */
  async getDocumentBatch(batchId: string) {
    return await this.db.query.documentBatches.findFirst({
      where: eq(documentBatches.id, batchId),
    });
  }

  /**
   * Mark a processed document as reviewed
   * @param documentId The ID of the document
   * @param userId The ID of the user who reviewed the document
   * @returns The updated document
   */
  async markDocumentAsReviewed(documentId: string, userId: string) {
    return await this.db.update(processedDocuments)
      .set({
        needsReview: false,
        reviewedBy: userId,
        reviewedAt: new Date(),
        status: 'VALIDATED',
      })
      .where(eq(processedDocuments.id, documentId))
      .returning();
  }

  /**
   * Mark a processed document as rejected
   * @param documentId The ID of the document
   * @param userId The ID of the user who rejected the document
   * @returns The updated document
   */
  async markDocumentAsRejected(documentId: string, userId: string) {
    return await this.db.update(processedDocuments)
      .set({
        needsReview: false,
        reviewedBy: userId,
        reviewedAt: new Date(),
        status: 'REJECTED',
      })
      .where(eq(processedDocuments.id, documentId))
      .returning();
  }

  /**
   * Map DataSourceType to DOCUMENT_SOURCE_ENUM
   * @param sourceType The DataSourceType to map
   * @returns The corresponding DOCUMENT_SOURCE_ENUM
   */
  private mapDataSourceToDocumentSource(sourceType: DataSourceType): 'OCR_IMAGE' | 'EXCEL_TXT' {
    switch (sourceType) {
      case DataSourceType.OCR_IMAGE:
        return 'OCR_IMAGE';
      case DataSourceType.EXCEL_TXT:
        return 'EXCEL_TXT';
      case DataSourceType.MANUAL_ENTRY:
      default:
        return 'OCR_IMAGE'; // Default to OCR_IMAGE for manual entry
    }
  }
} 