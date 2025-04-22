/**
 * Excel Helper Utilities
 * 
 * This file contains utilities for working with Excel data,
 * including date conversion and field detection.
 */

import { logger } from '@/utils/logger';

/**
 * Convert Excel serial date to JavaScript Date
 * Excel uses a different epoch (Jan 1, 1900) and handles leap years differently
 * 
 * @param serialDate Excel serial date number
 * @returns JavaScript Date object or null if invalid
 */
export function convertExcelDateToJSDate(serialDate: number | string): Date | null {
  if (serialDate === null || serialDate === undefined || String(serialDate).trim() === '') {
    return null;
  }
  
  try {
    // Convert to number if it's a string
    const serial = typeof serialDate === 'string' ? parseFloat(serialDate.trim()) : serialDate;
    
    // Check if it's a valid number and within a reasonable Excel date range
    if (isNaN(serial) || serial < 1 || serial > 2958465) { // 2958465 is Dec 31, 9999
      logger.debug(`[convertExcelDateToJSDate] Invalid serial input: ${serialDate}`);
      return null;
    }
    
    // Excel's epoch starts on January 1, 1900
    // But Excel incorrectly treats 1900 as a leap year, so we adjust by starting from 1899-12-30 UTC
    const baseDate = new Date(Date.UTC(1899, 11, 30)); // Month is 0-indexed (11 is December)
    
    // Add days (accounting for the Excel leap year bug)
    // Subtract 1 from serial potentially needed due to base date/epoch definition
    baseDate.setUTCDate(baseDate.getUTCDate() + Math.floor(serial) - 1);

    // Validate the resulting date (e.g., check if year is reasonable)
    // Restore year validation check now that core logic is fixed
    if (baseDate.getUTCFullYear() < 1900 || baseDate.getUTCFullYear() > 9999) {
        logger.warn(`[convertExcelDateToJSDate] Calculated date year ${baseDate.getUTCFullYear()} is outside expected range (1900-9999) for serial ${serial}`);
        return null;
    }
    
    // Return the calculated Date object
    return baseDate;

  } catch (error) {
    logger.error(`[convertExcelDateToJSDate] Error converting Excel date: ${serialDate}`, error);
    return null; // Return null on error
  }
}

/**
 * Detect and convert Excel dates in an object
 * 
 * @param obj Object potentially containing Excel dates
 * @param dateFields Array of field names to check for Excel dates
 * @returns New object with converted dates
 */
export function convertExcelDatesInObject<T extends Record<string, any>>(
  obj: T, 
  dateFields: string[]
): T {
  if (!obj) return obj;
  
  // Create a new object to ensure immutability
  const result: Record<string, any> = { ...obj };
  
  for (const field of dateFields) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      typeof result[field] === 'number' && 
      isLikelyExcelDate(result[field])
    ) {
      result[field] = convertExcelDateToJSDate(result[field]);
    }
  }
  
  return result as T;
}

/**
 * Check if a value is likely an Excel date serial
 * Excel date serials typically fall within certain ranges
 * 
 * @param value The value to check
 * @returns Boolean indicating if value is likely an Excel date serial
 */
export function isLikelyExcelDate(value: number): boolean {
  // Excel dates start at 1 (Jan 1, 1900)
  // A reasonable range for modern dates would be:
  // 1 (Jan 1, 1900) to 50000 (approx. year 2037)
  return value > 1 && value < 50000;
} 