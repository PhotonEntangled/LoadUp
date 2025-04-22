import { PostgresJsTransaction } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../lib/database/schema';
import { addresses } from '../../lib/database/schema';
// Use the updated function and type
import { findMockEntryByKeywords, type MockAddressEntry } from './mockAddressData';
// import { findMockLocation, type MockLocation } from './mockAddressData'; // DEPRECATED - Use findMockEntryByKeywords
import { logger } from '../../utils/logger';

// Infer the insert type from the schema table
import type { InferInsertModel } from 'drizzle-orm';
type AddressInsertData = InferInsertModel<typeof addresses>;

// Define Transaction type using the imported schema
type Transaction = PostgresJsTransaction<typeof schema, any>;

/**
 * Attempts to find an existing address in the DB matching a mock location entry,
 * or creates a new address record based on the mock location data within a transaction.
 * Uses the keyword-based lookup.
 *
 * @param tx The Drizzle transaction object.
 * @param rawInput The raw address string to resolve.
 * @returns The UUID of the found or created address, or null if no mock match or error.
 */
export async function findOrCreateMockAddress(
    tx: Transaction,
    rawInput: string | null | undefined
): Promise<string | null> {
    console.log(`[findOrCreateMockAddress] Received rawInput: '${rawInput}'`);

    if (!rawInput || !rawInput.trim()) {
        logger.warn('[findOrCreateMockAddress] Received null or empty rawInput.');
        return null;
    }

    // Use the keyword-based lookup function
    const mockEntry = findMockEntryByKeywords(rawInput);

    // Check if we got the default "Unknown" entry back, treat as no match for creation
    // Or if no entry was found at all (shouldn't happen with default, but safe check)
    if (!mockEntry || mockEntry.mockId === 'MOCK-UNKNOWN-MY') {
        logger.warn(`[findOrCreateMockAddress] No specific mock location found for rawInput: "${rawInput}". Returning null.`);
        return null;
    }

    logger.info(`[findOrCreateMockAddress] Found mock location entry "${mockEntry.mockId}" for "${rawInput}"`);

    try {
        // Build the filter conditions array based on MockAddressEntry fields
        // Ensure we only add conditions if the corresponding field in mockEntry has a value
        const conditions = [
            mockEntry.street1 ? eq(addresses.street1, mockEntry.street1) : undefined,
            mockEntry.city ? eq(addresses.city, mockEntry.city) : undefined,
            mockEntry.postalCode ? eq(addresses.postalCode, mockEntry.postalCode) : undefined,
            mockEntry.country ? eq(addresses.country, mockEntry.country) : undefined,
            mockEntry.state ? eq(addresses.state, mockEntry.state) : undefined
        ].filter((condition): condition is NonNullable<typeof condition> => condition !== undefined); // Type guard for filtering


        // Only query if there are valid conditions to match
        let existingAddress: { id: string } | undefined = undefined;
        if (conditions.length > 0) {
             existingAddress = await tx.query.addresses.findFirst({
                 // Use `and` only if there are multiple conditions
                 where: conditions.length > 1 ? and(...conditions) : conditions[0],
                 columns: {
                     id: true,
                 },
             });
        }

        if (existingAddress) {
            logger.info(`[findOrCreateMockAddress] Found existing address ID: ${existingAddress.id} for mock entry ${mockEntry.mockId}`);
            return existingAddress.id;
        }

        // 2. If not found, create a new address record using MockAddressEntry data
        logger.info(`[findOrCreateMockAddress] No existing address found for mock ${mockEntry.mockId}. Creating new address...`);

        const addressData: AddressInsertData = {
            rawInput: rawInput.trim(),
            street1: mockEntry.street1 || null, // Use || null for safety
            street2: mockEntry.street2 || null,
            city: mockEntry.city || null,
            state: mockEntry.state || null,
            postalCode: mockEntry.postalCode || null,
            country: mockEntry.country || null,
            latitude: mockEntry.latitude || null, // Already string or null in MockAddressEntry, fits decimal(string) type
            longitude: mockEntry.longitude || null, // Already string or null in MockAddressEntry, fits decimal(string) type
            resolutionMethod: 'mock-keyword', // Indicate keyword method used
            resolutionConfidence: '1.0', // Assume high confidence for direct mock match
        };

        const inserted = await tx.insert(addresses).values(addressData).returning({ id: addresses.id });

        if (!inserted || inserted.length === 0 || !inserted[0].id) {
            logger.error('[findOrCreateMockAddress] Failed to insert new address or retrieve ID after insertion.', { addressData });
            throw new Error('Failed to insert new address record.');
        }

        const newAddressId = inserted[0].id;
        logger.info(`[findOrCreateMockAddress] Created new address ID: ${newAddressId} for mock ${mockEntry.mockId}`);
        return newAddressId;

    } catch (error) {
        logger.error('[findOrCreateMockAddress] Error during find/create process:', error);
        // Re-throw the error so the calling function (e.g., transaction) knows it failed
        throw error;
    }
}

/*
// --- DEPRECATED MOCK LOCATION FINDER BELOW - KEEPING FOR REFERENCE ---
// import { findMockLocation, type MockLocation } from './mockAddressData'; // DEPRECATED

export async function findOrCreateMockAddress_DEPRECATED(
    tx: Transaction,
    rawInput: string | null | undefined
): Promise<string | null> {
    // ... (original deprecated logic using findMockLocation) ...
}
*/