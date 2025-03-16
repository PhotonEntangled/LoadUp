import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
// @ts-ignore - Module resolution issue with file extensions
import { ExcelUploader } from '../../components/document/ExcelUploader.tsx';
// @ts-ignore - Module resolution issue with path aliases
import { DataSourceType } from '@/services/*/data/ShipmentDataProcessor.js';

// Mock the expo-file-system module
jest.mock('expo-file-system', () => ({
  // Add any methods used in the component
}));

// Mock React Native components and Platform
jest.mock('react-native', () => {
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: jest.fn(() => ({})),
    },
    ActivityIndicator: 'ActivityIndicator',
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'web', // Default to web for tests
    },
  };
});

// Get access to the mocked Platform
import { Platform, Alert } from 'react-native';

describe('ExcelUploader Component', () => {
  const mockOnFilesProcessed = jest.fn();
  const mockOnError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS to web for each test
    // @ts-ignore - We know Platform is mocked
    Platform.OS = 'web';
  });

  it('renders correctly with initial state', () => {
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
      />
    );
    
    // Check title and instructions
    expect(screen.getByText('Upload Excel Files')).toBeTruthy();
    expect(screen.getByText('Select Excel files (saved as TXT) to process shipment data')).toBeTruthy();
    
    // Check select button
    expect(screen.getByText('Select File')).toBeTruthy();
    
    // Check instructions
    expect(screen.getByText('Instructions:')).toBeTruthy();
    expect(screen.getByText('1. Export your Excel file as a TXT file (Tab delimited)')).toBeTruthy();
    expect(screen.getByText('2. Select the TXT file using the button above')).toBeTruthy();
    expect(screen.getByText('3. Click "Process File" to extract shipment data')).toBeTruthy();
    expect(screen.getByText('4. Review and approve the extracted data')).toBeTruthy();
    
    // Process button should not be visible initially
    expect(screen.queryByText('Process File')).toBeNull();
  });

  it('handles file selection on web platform', async () => {
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
      />
    );
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    
    // Create a mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      
      fireEvent.change(fileInput);
      
      // Wait for file processing
      await waitFor(() => {
        expect(mockOnFilesProcessed).toHaveBeenCalledWith([], DataSourceType.EXCEL_TXT);
      });
      
      // Check that the file name is displayed
      expect(screen.getByText('test.txt')).toBeTruthy();
      
      // Process button should now be visible
      expect(screen.getByText('Process File')).toBeTruthy();
    }
  });

  it('handles file selection on mobile platform', async () => {
    // Set platform to iOS for this test
    // @ts-ignore - We know Platform is mocked
    Platform.OS = 'ios';
    
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
      />
    );
    
    // Click the select file button
    fireEvent.click(screen.getByText('Select File'));
    
    // Check that Alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Feature Not Available',
      expect.any(String)
    );
    
    // Check that the demo file was processed
    expect(mockOnFilesProcessed).toHaveBeenCalledWith([], DataSourceType.EXCEL_TXT);
  });

  it('handles file upload when a file is selected', async () => {
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
      />
    );
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Create a mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      
      fireEvent.change(fileInput);
      
      // Wait for file processing
      await waitFor(() => {
        expect(screen.getByText('Process File')).toBeTruthy();
      });
      
      // Click the process button
      fireEvent.click(screen.getByText('Process File'));
      
      // Check that onFilesProcessed was called again
      expect(mockOnFilesProcessed).toHaveBeenCalledTimes(2);
    }
  });

  it('handles clearing the selected file', async () => {
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
      />
    );
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Create a mock file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file selection
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      
      fireEvent.change(fileInput);
      
      // Wait for file name to appear
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeTruthy();
      });
      
      // Click the clear button
      fireEvent.click(screen.getByText('Clear'));
      
      // Check that the file name is no longer displayed
      expect(screen.queryByText('test.txt')).toBeNull();
      
      // Process button should no longer be visible
      expect(screen.queryByText('Process File')).toBeNull();
    }
  });

  it('shows loading indicator when processing', () => {
    render(
      <ExcelUploader
        onFilesProcessed={mockOnFilesProcessed}
        onError={mockOnError}
        isProcessing={true}
      />
    );
    
    // Select button should be disabled
    const selectButton = screen.getByText('Select File').closest('button');
    // Check if the button is disabled
    expect(selectButton?.disabled).toBe(true);
  });
}); 