import { RawRowData } from '@/types/shipment';
import { HeaderMappingResultType } from './ExcelParserService';
import { findActualKeyForStandardField } from './parserUtils';
import { logger } from '@/utils/logger';
import { parseContactString } from './contactUtils'; // Import to potentially reuse phone regex

interface SwapCorrectionResult {
    correctedRowData: RawRowData;
    note?: string;
    needsReview?: boolean;
}

// Regex for typical PO patterns (adjust as needed)
// Example: Starts with HWSH + digits, or is alphanumeric with length > 5
// const poRegex = /^(HWSH\d+)|([a-zA-Z0-9]{6,})$/i; // Original broad regex
// Stricter PO Regex for swap detection: HWSH prefix OR (alphanumeric/hyphen/underscore with >=3 digits)
const poRegex = /^(HWSH\d+)|(^[a-zA-Z0-9_-]*\d{3,}[a-zA-Z0-9_-]*$)/i;

// Re-use or adapt phone regex from contactUtils (example, might need direct import/copy)
const phonePatternHeuristic = /(?:\+?60|0)?1\d[-\s]?\d{7,8}|\d{2}[-\s]?\d{7,8}/;
const nameKeywordsHeuristic = /\b(MR|MS|MRS|SD|PIC)\b/i;

/**
 * Detects if 'contactNumber' and 'poNumber' fields appear swapped in the raw data
 * based on heuristics and attempts to correct them. Also parses multiple PO numbers.
 *
 * @param rowData The raw row data object.
 * @param headerMappingResult The mapping result used to identify actual keys.
 * @returns An object containing the potentially corrected row data and metadata flags.
 */
export function detectAndCorrectSwappedFields(
    rowData: RawRowData,
    headerMappingResult: HeaderMappingResultType
): SwapCorrectionResult {
    logger.debug(`[detectAndCorrectSwappedFields] Entering function.`); // Log Entry
    const correctedRowData = { ...rowData }; // Work with a copy
    let note: string | undefined = undefined;
    let needsReview: boolean = false;

    const contactKey = findActualKeyForStandardField('contactNumber', headerMappingResult);
    const poKey = findActualKeyForStandardField('poNumber', headerMappingResult);

    if (!contactKey || !poKey) {
        logger.debug('[detectAndCorrectSwappedFields] Missing contactKey or poKey, skipping swap check.');
        return { correctedRowData, note, needsReview };
    }

    let contactValue = String(correctedRowData[contactKey] || '').trim();
    let poValue = String(correctedRowData[poKey] || '').trim();

    // --- Refined Heuristic Checks --- 
    // Stricter PO Regex for general PO validation (used below and in parseMultiplePoNumbers maybe)
    const strictPoRegex = /^(HWSH\d+)|(^[a-zA-Z0-9_-]*\d{3,}[a-zA-Z0-9_-]*$)/i;
    
    // --- Check if ANY part of contact value looks PO-like (less strict, for SWAP decision) ---
    const contactParts = contactValue.split(/[\/\n\r,;]+/).map(p => p.trim()).filter(Boolean);
    // Check: contains HWSH OR has parts that are shortish alphanumeric/hyphen
    const simpleAlphanumCheck = /^[a-zA-Z0-9-]{2,15}$/;
    const contactHasAnyPOlikePart = contactValue.toUpperCase().includes('HWSH') || 
                                     contactParts.some(part => simpleAlphanumCheck.test(part) && !phonePatternHeuristic.test(part)); 
    logger.debug(`[detectAndCorrectSwappedFields] Swap Check - contactHasAnyPOlikePart (revised): ${contactHasAnyPOlikePart}`);
    // --- End check ---
    
    // Stricter check for PO looking like contact:
    const poHasPhone = phonePatternHeuristic.test(poValue);
    const poHasNoPOPattern = !strictPoRegex.test(poValue); // Use strict regex here for PO field value
    
    // Require phone pattern AND no PO pattern.
    const poLooksLikeContact = poHasPhone && poHasNoPOPattern; 
    logger.debug(`[detectAndCorrectSwappedFields] Swap Check - poLooksLikeContact (Strict): ${poLooksLikeContact}`);

    // --- Swap Logic --- 
    // Swap only if contact value contains a PO-like part AND po value strictly looks like contact
    if (contactHasAnyPOlikePart && poLooksLikeContact) { 
        logger.warn(`[detectAndCorrectSwappedFields] Potential swap detected! Contact: "${contactValue.replace(/[\n\r]/g, '<NL>')}", PO: "${poValue.replace(/[\n\r]/g, '<NL>')}". Swapping values.`);
        
        // Perform the swap
        correctedRowData[contactKey] = poValue; // Po value moves to contact field
        correctedRowData[poKey] = contactValue; // Contact value moves to PO field
        
        // Update local variables after swap for multi-PO parsing
        contactValue = correctedRowData[contactKey]; 
        poValue = correctedRowData[poKey];

        needsReview = true;
        note = `Automatically swapped potentially incorrect 'Contact Number' (${contactValue.replace(/[\n\r]/g, '<NL>')}) and 'PO Number' (${poValue}) based on heuristics.`;
        logger.debug(`[detectAndCorrectSwappedFields] Swap completed. New Contact: "${contactValue.replace(/[\n\r]/g, '<NL>')}", New PO: "${poValue}"`);
    }

    // --- Multi-PO Parsing Logic (Applied to the final poValue in correctedRowData[poKey]) ---
    const finalPoValue = String(correctedRowData[poKey] || '').trim();
    if (finalPoValue) {
        // Split by common delimiters (newline, slash, comma, semicolon), filter empty, trim
        const potentialPOs = finalPoValue.split(/[\/\n\r,;]+/).map(p => p.trim()).filter(Boolean);
        
        // Optional: Validate each part against PO regex if needed
        const validPOs = potentialPOs; // Keep all for now, could filter with: .filter(p => poRegex.test(p));

        if (validPOs.length > 1) {
            correctedRowData[poKey] = validPOs.join(' | '); // Update the field with delimited string
            logger.debug(`[detectAndCorrectSwappedFields] Parsed multiple POs: ${correctedRowData[poKey]}`);
            if (!note) { // Add a note if swap didn't already create one
                note = `Parsed multiple PO numbers from original field value: ${finalPoValue.replace(/[\n\r]/g, '<NL>')}`;
            } else {
                 note += ` Additionally parsed multiple PO numbers from resulting field value.`;
            }
            needsReview = true; // Flag for review if multiple POs were found
        } else if (validPOs.length === 1) {
            // If only one PO after splitting, store just that one cleanly
            correctedRowData[poKey] = validPOs[0];
        } else {
            // If splitting results in no valid POs (e.g., only delimiters), keep original or clear?
            // Keep original value for now if splitting fails
            correctedRowData[poKey] = finalPoValue; 
        }
    }

    // --- Final Null/Undefined Check --- Ensure nulls/undefined become empty strings if no other logic applied
    if (correctedRowData[contactKey] === null || correctedRowData[contactKey] === undefined) {
        correctedRowData[contactKey] = '';
    }
    if (correctedRowData[poKey] === null || correctedRowData[poKey] === undefined) {
        correctedRowData[poKey] = '';
    }
    // --- End Final Null/Undefined Check ---

    logger.debug(`[detectAndCorrectSwappedFields] Exiting function.`); // Log Exit
    return { correctedRowData, note, needsReview };
}

export function parseMultiplePoNumbers(poString: string): string[] {
    logger.debug(`[parseMultiplePoNumbers] Entering function. Input: "${poString}"`); // Log Entry
    if (!poString || typeof poString !== 'string') {
        logger.debug("[parseMultiplePoNumbers] Exiting function (invalid input). Result: []"); // Log Exit (Invalid)
        return [];
    }

    // 1. Remove content within parentheses first
    const cleanedPoString = poString.replace(/\(.*?\)/g, '').trim();
    logger.debug(`[parseMultiplePoNumbers] Cleaned PO String: "${cleanedPoString}"`); // Log Cleaned String

    // 2. Split by common delimiters (newline, slash, comma, semicolon)
    const parts = cleanedPoString.split(/[\/\n\r,;]+/);
    logger.debug(`[parseMultiplePoNumbers] Split into parts: ${JSON.stringify(parts)}`);

    // 3. Filter, Trim, and Validate each part
    // const poValidatorRegex = /^(HWSH\d+|[a-zA-Z0-9][a-zA-Z0-9\s-]{1,}[a-zA-Z0-9])$/i; // Previous complex validator
    // Simplified validator: Check if it contains at least two alphanumeric characters
    const poValidatorRegex = /[a-zA-Z0-9].*[a-zA-Z0-9]/; // Contains at least two alphanum chars
    const validPOs = parts
        .map(part => part.trim()) // Trim whitespace from each part
        .filter(part => part.length > 0) // Filter out empty strings resulting from split
        .filter(part => poValidatorRegex.test(part)); // Keep only parts that look like valid POs
    
    logger.debug(`[parseMultiplePoNumbers] Validated POs after filtering (simplified regex): ${JSON.stringify(validPOs)}`);

    // 4. Return unique results
    const finalResult = [...new Set(validPOs)]; // Remove duplicates
    logger.debug(`[parseMultiplePoNumbers] Exiting function. Result: ${JSON.stringify(finalResult)}`); // Log Exit (Result)
    return finalResult;
} 