import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the custom matchers
import { FileUploader } from './FileUploader';
import { ShipmentParser } from '../../services/parsers/ShipmentParser';

// Mock the ShipmentParser
jest.mock('../../services/parsers/ShipmentParser', () => {
  return {
    ShipmentSourceType: {
      OCR_IMAGE: 'OCR_IMAGE',
      EXCEL_TXT: 'EXCEL_TXT'
    },
    ShipmentParser: jest.fn().mockImplementation(() => {
      return {
        parseShipment: jest.fn().mockImplementation(async (input) => {
          if (input.type === 'OCR_IMAGE') {
            return [{
              trackingNumber: 'OCR123',
              recipient: {
                name: 'OCR Recipient',
                address: '123 OCR St',
                city: 'OCR City',
                state: 'OC',
                zipCode: '12345'
              },
              sender: {
                name: 'OCR Sender',
                address: '456 OCR Ave',
                city: 'OCR Town',
                state: 'OS',
                zipCode: '67890'
              },
              weight: '10 lbs',
              service: 'OCR Express',
              confidence: 0.85,
              needsReview: false
            }];
          } else {
            return [{
              trackingNumber: 'EXCEL123',
              recipient: {
                name: 'Excel Recipient',
                address: '123 Excel St',
                city: 'Excel City',
                state: 'EX',
                zipCode: '12345'
              },
              sender: {
                name: 'Excel Sender',
                address: '456 Excel Ave',
                city: 'Excel Town',
                state: 'ES',
                zipCode: '67890'
              },
              weight: '5 lbs',
              service: 'Excel Standard',
              confidence: 0.9,
              needsReview: false
            }];
          }
        })
      };
    })
  };
});

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

describe('FileUploader', () => {
  const mockOnFilesProcessed = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByText('Upload images of shipping documents for OCR processing')).toBeInTheDocument();
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
    expect(screen.getByText('Upload TXT files exported from Excel with shipping data')).toBeInTheDocument();
  });

  it('processes image files correctly', async () => {
    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /select image files/i });
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
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
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
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
    // Mock the ShipmentParser to throw an error
    (ShipmentParser as jest.Mock).mockImplementationOnce(() => {
      return {
        parseShipment: jest.fn().mockRejectedValue(new Error('Processing failed'))
      };
    });

    render(
      <FileUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });
      fireEvent.change(fileInput);
    }

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 