/**
 * Generates a unique tracking number for shipments
 * Format: LU-YYYYMMDD-XXXXX (LU prefix, date, 5 random alphanumeric characters)
 */
export function generateTrackingNumber(): string {
  const prefix = 'LU';
  
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate 5 random alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomStr += characters.charAt(randomIndex);
  }
  
  return `${prefix}-${dateStr}-${randomStr}`;
}

/**
 * Validates a tracking number format
 * @param trackingNumber The tracking number to validate
 * @returns boolean indicating if the tracking number is valid
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  // Check format: LU-YYYYMMDD-XXXXX
  const regex = /^LU-\d{8}-[A-Z0-9]{5}$/;
  return regex.test(trackingNumber);
}

/**
 * Extracts the date from a tracking number
 * @param trackingNumber The tracking number
 * @returns Date object or null if invalid
 */
export function getDateFromTrackingNumber(trackingNumber: string): Date | null {
  if (!isValidTrackingNumber(trackingNumber)) {
    return null;
  }
  
  const datePart = trackingNumber.split('-')[1];
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1; // JS months are 0-indexed
  const day = parseInt(datePart.substring(6, 8));
  
  return new Date(year, month, day);
} 