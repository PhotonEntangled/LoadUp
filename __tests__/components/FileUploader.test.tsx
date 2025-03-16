import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
// Import using relative paths with file extensions
// @ts-ignore - Ignoring the extension error as we need to fix the module resolution strategy
import { FileUploader } from '../../components/document/FileUploader.tsx';

// Import the ShipmentParser module - Jest will automatically use the mock from __mocks__
// @ts-ignore - Ignoring the extension error as we need to fix the module resolution strategy
import { ShipmentParser, ShipmentSourceType } from '../../services/parsers/ShipmentParser.js';

// Define the ShipmentParserInput type to match the actual implementation
interface ShipmentParserInput {
  type: string;
  data: string;
}

// Define the ShipmentData type to match the actual implementation
interface ShipmentData {
  trackingNumber: string;
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  sender: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  weight: string;
  service: string;
  confidence: number;
  needsReview?: boolean;
}

// Define a type for our mock instance
interface ShipmentParserMockInstance {
  parseShipment: {
    mockRejectedValueOnce: (error: Error) => jest.Mock;
    mockImplementation: (fn: any) => jest.Mock;
  } & jest.Mock;
}

// Tell Jest to mock the ShipmentParser module
jest.mock('../../services/parsers/ShipmentParser');

// Mock FileReader
class MockFileReader {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(file: Blob) {
    this.result = 'data:image/jpeg;base64,mockImageData';
    setTimeout(() => this.onload && this.onload(), 0);
  }
  readAsText(file: Blob) {
    this.result = 'LOAD NO\tShip To Customer Name\tAddress\tState\n123456\tTest Name\tTest Address\tTS';
    setTimeout(() => this.onload && this.onload(), 0);
  }
}

// Set the mock FileReader
Object.defineProperty(global, 'FileReader', {
  value: MockFileReader
});

describe('FileUploader Component', () => {
  // Properly typed mock functions
  const mockOnFilesProcessed = jest.fn();
  // Create a mock function that accepts an Error parameter
  const mockOnError = jest.fn((error: Error) => {});

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset any DOM elements that might have been added
    document.body.innerHTML = '';
  });

  it('renders the component with image upload option selected by default', () => {
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    const imageButton = screen.getByText('Upload Image');
    expect(imageButton.className).toContain('active');
    expect(screen.getByText('Upload images of shipping documents for OCR processing')).toBeTruthy();
  });

  it('switches to Excel TXT upload mode when button is clicked', () => {
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    fireEvent.click(screen.getByText('Upload Excel TXT'));
    
    const excelButton = screen.getByText('Upload Excel TXT');
    expect(excelButton.className).toContain('active');
    expect(screen.getByText('Upload TXT files exported from Excel with shipping data')).toBeTruthy();
  });

  it('processes image files correctly', async () => {
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });
      fireEvent.change(fileInput);
    }

    await waitFor(() => {
      expect(mockOnFilesProcessed).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          trackingNumber: 'OCR123'
        })
      ]));
    });
  });

  it('processes Excel TXT files correctly', async () => {
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    // Switch to Excel mode
    fireEvent.click(screen.getByText('Upload Excel TXT'));

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });
      fireEvent.change(fileInput);
    }

    await waitFor(() => {
      expect(mockOnFilesProcessed).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          trackingNumber: 'EXCEL123'
        })
      ]));
    });
  });

  it('handles file processing errors', async () => {
    // Mock console.error to prevent test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the FileReader to trigger an error
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      readAsText: jest.fn(),
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      result: null
    };
    
    // Override the FileReader implementation for this test
    Object.defineProperty(global, 'FileReader', {
      value: jest.fn(() => mockFileReader)
    });
    
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Get the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });
      fireEvent.change(fileInput);
      
      // Trigger the error
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror();
        }
      }, 0);
    }

    await waitFor(() => {
      // Check that onError was called with the error
      expect(mockOnError).toHaveBeenCalled();
    });
  });
}); 