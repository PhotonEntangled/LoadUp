import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShipmentData } from './document-processing';

/**
 * Combines multiple class names using clsx and optimizes them with tailwind-merge
 * This prevents class conflicts and duplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object to a localized string
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'N/A';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
  }
}

/**
 * Truncates text with an ellipsis if it exceeds the max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generates a CSV string from an array of objects
 */
export function generateCSV(headers: string[], data: string[][]): string {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    // Escape any commas in the data
    const escapedRow = row.map(field => {
      if (field.includes(",") || field.includes("\"") || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });
    
    csvContent += escapedRow.join(",") + '\n';
  });
  
  return csvContent;
}

/**
 * Creates a downloadable file from content
 */
export function downloadFile(content: string, filename: string): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('downloadFile can only be used in a browser environment');
    return;
  }
  
  // Create download link
  const encodedUri = encodeURI(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  
  // Safely append to body
  if (document.body) {
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  } else {
    // Fallback if body is not available
    link.click();
  }
}

/**
 * Generates and downloads a CSV file from a shipment object
 */
export function downloadShipmentAsCSV(shipment: ShipmentData, filename?: string): void {
  // Define headers for CSV
  const headers = [
    'Load Number', 'Order Number', 'PO Number', 'Ship Date', 
    'Ship To', 'State', 'Contact', 'Total Weight', 'Items'
  ];
  
  // Map shipment data to match headers
  const row = [
    shipment.loadNumber || '',
    shipment.orderNumber || '',
    shipment.poNumber || '',
    shipment.promisedShipDate || '',
    shipment.shipToCustomer || '',
    shipment.shipToState || '',
    shipment.contactNumber || '',
    shipment.totalWeight?.toString() || '0',
    shipment.items.length.toString()
  ];
  
  // Generate CSV content
  const csvContent = generateCSV(headers, [row]);
  
  // Set default filename if not provided
  const defaultFilename = `shipment_${shipment.loadNumber || shipment.orderNumber || 'data'}.csv`;
  
  // Download the file
  downloadFile(csvContent, filename || defaultFilename);
}

/**
 * Generates and downloads a CSV file from multiple shipment objects
 */
export function downloadShipmentsAsCSV(shipments: ShipmentData[], filename?: string): void {
  if (!shipments.length) return;
  
  // Define headers for CSV
  const headers = [
    'Load Number', 'Order Number', 'PO Number', 'Ship Date', 
    'Ship To', 'State', 'Contact', 'Total Weight', 'Items'
  ];
  
  // Map shipments data to match headers
  const rows = shipments.map(shipment => [
    shipment.loadNumber || '',
    shipment.orderNumber || '',
    shipment.poNumber || '',
    shipment.promisedShipDate || '',
    shipment.shipToCustomer || '',
    shipment.shipToState || '',
    shipment.contactNumber || '',
    shipment.totalWeight?.toString() || '0',
    shipment.items.length.toString()
  ]);
  
  // Generate CSV content
  const csvContent = generateCSV(headers, rows);
  
  // Set default filename if not provided
  const defaultFilename = `shipments_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Download the file
  downloadFile(csvContent, filename || defaultFilename);
} 