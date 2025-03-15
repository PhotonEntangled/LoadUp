import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExcelUploader } from '../../components/document/ExcelUploader';
import { DataSourceType } from '../../services/data/ShipmentDataProcessor';
import { Alert, Platform } from 'react-native';

// Mock the dependencies
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('ExcelUploader', () => {
  const mockOnFilesProcessed = jest.fn();
  const mockOnError = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    expect(getByText('Upload Excel Files')).toBeTruthy();
    expect(getByText('Select File')).toBeTruthy();
    expect(getByText('Instructions:')).toBeTruthy();
  });
  
  it('shows alert when select file button is pressed on mobile', async () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    fireEvent.press(getByText('Select File'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Feature Not Available',
      'File selection is not available in this demo. In a production app, this would use the appropriate native file picker.'
    );
    
    // Should use demo data
    await waitFor(() => {
      expect(mockOnFilesProcessed).toHaveBeenCalledWith([], DataSourceType.EXCEL_TXT);
    });
  });
  
  it('disables the process button when no file is selected', () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    // Process File button should not be visible initially
    expect(() => getByText('Process File')).toThrow();
  });
  
  it('shows file info after selecting a file', async () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    fireEvent.press(getByText('Select File'));
    
    await waitFor(() => {
      expect(getByText('sample_shipment.txt')).toBeTruthy();
      expect(getByText('Clear')).toBeTruthy();
      expect(getByText('Process File')).toBeTruthy();
    });
  });
  
  it('clears the selected file when clear button is pressed', async () => {
    const { getByText, queryByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    // Select a file first
    fireEvent.press(getByText('Select File'));
    
    await waitFor(() => {
      expect(getByText('sample_shipment.txt')).toBeTruthy();
    });
    
    // Clear the file
    fireEvent.press(getByText('Clear'));
    
    await waitFor(() => {
      expect(queryByText('sample_shipment.txt')).toBeNull();
      expect(queryByText('Process File')).toBeNull();
    });
  });
  
  it('processes the file when process button is pressed', async () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    // Select a file first
    fireEvent.press(getByText('Select File'));
    
    await waitFor(() => {
      expect(getByText('Process File')).toBeTruthy();
    });
    
    // Process the file
    fireEvent.press(getByText('Process File'));
    
    await waitFor(() => {
      // Should be called twice - once on select and once on process
      expect(mockOnFilesProcessed).toHaveBeenCalledTimes(2);
      expect(mockOnFilesProcessed).toHaveBeenLastCalledWith([], DataSourceType.EXCEL_TXT);
    });
  });
  
  it('shows loading indicator when processing', async () => {
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError}
        isProcessing={true}
      />
    );
    
    // Select a file first
    fireEvent.press(getByText('Select File'));
    
    await waitFor(() => {
      // Check that the Process File button exists but is not pressable
      const processButton = getByText('Process File');
      expect(processButton).toBeTruthy();
      // In React Native, we can't directly check if a component is disabled
      // Instead, we can check if the parent TouchableOpacity has the disabled prop
      expect(processButton.parent?.props.disabled).toBe(true);
    });
  });
  
  it('handles errors during file selection', async () => {
    // Mock an error in the file selection process
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by making the Alert.alert throw
    (Alert.alert as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    const { getByText } = render(
      <ExcelUploader 
        onFilesProcessed={mockOnFilesProcessed} 
        onError={mockOnError} 
      />
    );
    
    fireEvent.press(getByText('Select File'));
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });
  });
}); 