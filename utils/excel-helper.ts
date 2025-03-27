/**
 * Excel Helper Utilities
 * 
 * This file contains utilities for working with Excel data,
 * including date conversion and field detection.
 */

/**
 * Convert Excel serial date to JavaScript Date
 * Excel uses a different epoch (Jan 1, 1900) and handles leap years differently
 * 
 * @param serialDate Excel serial date number
 * @returns Formatted date string in d/m/y format or empty string if invalid
 */
export function convertExcelDateToJSDate(serialDate: number | string): string {
  if (!serialDate) return '';
  
  try {
    // Convert to number if it's a string
    const serial = typeof serialDate === 'string' ? parseFloat(serialDate) : serialDate;
    
    // Check if it's a valid number
    if (isNaN(serial)) return String(serialDate);
    
    // Excel's epoch starts on January 1, 1900
    // But Excel incorrectly treats 1900 as a leap year, so we adjust after Feb 28, 1900
    const date = new Date(Date.UTC(1899, 11, 30));
    
    // Add days (accounting for the Excel leap year bug)
    date.setUTCDate(date.getUTCDate() + Math.floor(serial));
    
    // Format the date in d/m/y format
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error converting Excel date:', error);
    return String(serialDate);
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