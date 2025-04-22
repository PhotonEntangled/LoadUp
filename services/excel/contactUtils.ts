import { logger } from '@/utils/logger';

// Regex to broadly capture potential phone-like sequences.
const potentialPhoneCandidateRegex = /\+?[\d\s()-]{7,}\d/g;

// Regex for known name prefixes/titles - improved to catch more variations
const namePrefixRegex = /\b(?:MR|MS|MRS|SD|PIC)\s*[:.\s-]*/gi;
// Regex for ALL separators to normalize to space
const separatorNormalizeToSpaceRegex = /[\/\n\r;]+/g;

/**
 * Cleans a string to digits and validates against Malaysian patterns.
 * @param digits - A string containing only digits, potentially with a prefix.
 * @returns The validated, cleaned phone number in a canonical format (0... or 60...), or null if invalid.
 */
function validateMalaysianDigits(digits: string): string | null {
    if (digits.length < 9 || digits.length > 12) return null;

    if (digits.startsWith('60')) {
        if (/^60(?:1\d{8,9}|[3-9]\d{7,8})$/.test(digits)) return digits;
    } else if (digits.startsWith('0')) {
         if (/^0(?:1\d{8,9}|[3-9]\d{7,8})$/.test(digits)) return digits;
    }
    return null;
}

/**
 * Parses a raw contact string potentially containing names and phone numbers.
 * 
 * @param rawContact - The raw string from the source data.
 * @returns An object containing parsed names and phones, joined by ' | ' if multiple.
 */
export function parseContactString(rawContact: string | null | undefined): { names: string | undefined; phones: string | undefined } {
    const entryTime = Date.now();

    if (!rawContact || typeof rawContact !== 'string' || rawContact.trim() === '') {
        return { names: undefined, phones: undefined };
    }

    const originalText = rawContact;
    const validatedPhones = new Set<string>();
    const originalCandidatesValidated = new Map<string, string>();

    // 1. Find and Validate Phone Candidates
    potentialPhoneCandidateRegex.lastIndex = 0;
    let match;
    while ((match = potentialPhoneCandidateRegex.exec(originalText)) !== null) {
        const candidate = match[0];
        const digitsOnly = candidate.replace(/\D/g, '');

        let digitsToValidate = digitsOnly;
        if (digitsOnly.startsWith('60') && candidate.includes('+')) {
           digitsToValidate = '0' + digitsOnly.substring(2);
        } else if (digitsOnly.startsWith('60') && !candidate.includes('+')){
             digitsToValidate = digitsOnly; // Keep 60...
        } else if (!digitsOnly.startsWith('0') && (digitsOnly.length >= 9 && digitsOnly.length <= 11)) {
             digitsToValidate = '0' + digitsOnly;
        }

        const validated = validateMalaysianDigits(digitsToValidate);
        if (validated) {
            validatedPhones.add(validated);
            if (!originalCandidatesValidated.has(candidate)) {
                originalCandidatesValidated.set(candidate, validated);
            }
        }
    }

    const phonesResult = validatedPhones.size > 0 ? Array.from(validatedPhones).join(' | ') : undefined;

    // 2. Isolate Names by Replacing Validated Originals with EMPTY STRING
    let textForNames = originalText;
    const sortedOriginals = Array.from(originalCandidatesValidated.keys()).sort((a, b) => b.length - a.length);

    for (const original of sortedOriginals) {
        const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        textForNames = textForNames.replace(new RegExp(escapedOriginal, 'g'), ''); // Replace with empty
    }

    // 3. Clean the Name String
    // First, fully remove parenthesized content including parentheses
    textForNames = textForNames.replace(/\(.*?\)/g, ' ').trim();
    
    // Split by slash, newline, carriage return, or semicolon to get name segments
    const nameSegments = textForNames.split(/[\/\n\r;]+/).filter(segment => segment.trim().length > 0);
    
    // Process each segment
    const cleanedSegments = nameSegments.map(segment => {
        let cleaned = segment;
        // Remove prefixes (apply multiple times to catch all instances)
        while (namePrefixRegex.test(cleaned)) {
            cleaned = cleaned.replace(namePrefixRegex, '');
        }
        // Remove any leftover parentheses
        cleaned = cleaned.replace(/[()]/g, '');
        // Collapse multiple spaces
        cleaned = cleaned.replace(/\s{2,}/g, ' ');
        // Remove purely numeric artifacts
        cleaned = cleaned.replace(/^\d+$/, '');
        return cleaned.trim();
    })
    .filter(segment => segment.length > 0 && !/^\s*\d*\s*$/.test(segment));

    // Special case: if pipe exists in original, preserve it in output
    if (textForNames.includes('|')) {
        // Process differently to preserve the pipe
        textForNames = textForNames.replace(/[()]/g, '')
            .replace(namePrefixRegex, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        
        if (textForNames.length > 0 && !/^\s*\d*\s*$/.test(textForNames)) {
            return { names: textForNames, phones: phonesResult };
        }
    }

    // Join the cleaned segments with the expected separator
    let namesResult: string | undefined = undefined;
    if (cleanedSegments.length > 0) {
        namesResult = cleanedSegments.join(' | ');
    }

    const result = { names: namesResult, phones: phonesResult };
    logger.debug({ functionName: 'parseContactString', durationMs: Date.now() - entryTime, input: rawContact.replace(/[\r\n;|]+/g, ' ').trim(), result }, 'Exiting function (cleaned input)');
    return result;
} 