import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogisticsDocumentUploader, { LogisticsDocumentType } from '../LogisticsDocumentUploader';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the EnhancedFileUpload component
jest.mock('@/components/ui/enhanced-file-upload', () => ({
  EnhancedFileUpload: jest.fn(({ onUpload, ref }) => (
    <div data-testid="mock-file-upload">
      <button 
        data-testid="mock-upload-trigger" 
        onClick={() => onUpload([new File(['test'], 'test.pdf', { type: 'application/pdf' })])}
      >
        Trigger Upload
      </button>
    </div>
  )),
}));

describe('LogisticsDocumentUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LogisticsDocumentUploader />);
    
    // Check for main elements
    expect(screen.getByText('Upload Logistics Documents')).toBeInTheDocument();
    expect(screen.getByText('Document Type')).toBeInTheDocument();
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Scan Document')).toBeInTheDocument();
    expect(screen.getByText('Document Processing Tips')).toBeInTheDocument();
  });

  it('handles document type selection', async () => {
    render(<LogisticsDocumentUploader />);
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Select a different document type
    fireEvent.click(screen.getByText(LogisticsDocumentType.INVOICE));
    
    // Check if the selection was applied
    expect(screen.getByText(LogisticsDocumentType.INVOICE)).toBeInTheDocument();
  });

  it('handles file upload with default behavior', async () => {
    render(<LogisticsDocumentUploader />);
    
    // Trigger the upload
    fireEvent.click(screen.getByTestId('mock-upload-trigger'));
    
    // Check if toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Bill of Lading document(s) uploaded successfully')
      );
    });
  });

  it('calls onProcessDocument when provided', async () => {
    const mockProcessDocument = jest.fn().mockResolvedValue(undefined);
    
    render(
      <LogisticsDocumentUploader 
        onProcessDocument={mockProcessDocument}
      />
    );
    
    // Trigger the upload
    fireEvent.click(screen.getByTestId('mock-upload-trigger'));
    
    // Check if the callback was called
    await waitFor(() => {
      expect(mockProcessDocument).toHaveBeenCalledWith(
        expect.any(Array),
        LogisticsDocumentType.BILL_OF_LADING
      );
    });
    
    // Toast should not be called in this case
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('handles scan button click', () => {
    const mockScanDocument = jest.fn();
    
    render(
      <LogisticsDocumentUploader 
        onScanDocument={mockScanDocument}
      />
    );
    
    // Click the scan button
    fireEvent.click(screen.getByText('Scan Document'));
    
    // Check if the callback was called
    expect(mockScanDocument).toHaveBeenCalled();
  });

  it('shows default message when scan is not implemented', () => {
    render(<LogisticsDocumentUploader />);
    
    // Click the scan button
    fireEvent.click(screen.getByText('Scan Document'));
    
    // Check if toast info was called
    expect(toast.info).toHaveBeenCalledWith('Scan functionality not implemented yet');
  });

  it('handles upload errors', async () => {
    const mockProcessDocument = jest.fn().mockRejectedValue(new Error('Test error'));
    
    render(
      <LogisticsDocumentUploader 
        onProcessDocument={mockProcessDocument}
      />
    );
    
    // Trigger the upload
    fireEvent.click(screen.getByTestId('mock-upload-trigger'));
    
    // Check if error toast was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to process documents. Please try again.');
    });
  });
}); 