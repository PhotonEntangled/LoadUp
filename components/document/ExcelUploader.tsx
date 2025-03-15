import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
// Replace expo-document-picker with a more compatible approach
import * as FileSystem from 'expo-file-system';
import { ShipmentData } from '../../services/ocr/DocumentParser';
import { DataSourceType } from '../../services/data/ShipmentDataProcessor';

interface ExcelUploaderProps {
  onFilesProcessed: (shipments: ShipmentData[], source: DataSourceType) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

/**
 * Component for uploading Excel files (saved as TXT)
 */
export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onFilesProcessed,
  onError,
  isProcessing = false,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleSelectFile = async () => {
    try {
      // For web, we'll use a file input
      if (Platform.OS === 'web') {
        // This would be handled by a hidden file input in the web version
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }
      
      // For mobile, we'd use a different approach
      // This is a placeholder - in a real implementation, you would use
      // a platform-specific file picker or document picker
      Alert.alert(
        'Feature Not Available',
        'File selection is not available in this demo. In a production app, this would use the appropriate native file picker.'
      );
      
      // Simulating file selection for demo purposes
      const demoFileName = 'sample_shipment.txt';
      const demoContent = 'LOAD NO\tShip To Customer Name\tAddress Line 1 and 2\tState/ Province\n' +
                         'ABC123\tJohn Doe\t123 Main St "New York"\tNY\n' +
                         'DEF456\tJane Smith\t456 Oak Ave "Los Angeles" 90001\tCA';
      
      setFileName(demoFileName);
      setFileContent(demoContent);
      
      // Process the demo content
      onFilesProcessed([], DataSourceType.EXCEL_TXT);
    } catch (error) {
      console.error('Error selecting file:', error);
      onError(`Error selecting file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  /**
   * Handle file upload
   */
  const handleUpload = () => {
    if (!fileContent) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    // This would normally process the file content through the ShipmentDataProcessor
    // For now, we'll just pass the raw content to the parent component
    onFilesProcessed([], DataSourceType.EXCEL_TXT);
  };

  /**
   * Clear selected file
   */
  const handleClear = () => {
    setFileName(null);
    setFileContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle file input change (for web)
   */
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        
        // Process the file content
        if (text) {
          onFilesProcessed([], DataSourceType.EXCEL_TXT);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Excel Files</Text>
      <Text style={styles.subtitle}>
        Select Excel files (saved as TXT) to process shipment data
      </Text>

      {Platform.OS === 'web' && (
        <input
          type="file"
          accept=".txt,.xls,.xlsx"
          onChange={handleFileInputChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      )}

      <View style={styles.uploadArea}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectFile}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Select File</Text>
        </TouchableOpacity>

        {fileName && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{fileName}</Text>
            <TouchableOpacity onPress={handleClear} disabled={isProcessing}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {fileName && (
          <TouchableOpacity
            style={[styles.uploadButton, !fileContent && styles.disabledButton]}
            onPress={handleUpload}
            disabled={!fileContent || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Process File</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Export your Excel file as a TXT file (Tab delimited)
        </Text>
        <Text style={styles.instructionText}>
          2. Select the TXT file using the button above
        </Text>
        <Text style={styles.instructionText}>
          3. Click "Process File" to extract shipment data
        </Text>
        <Text style={styles.instructionText}>
          4. Review and approve the extracted data
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  uploadArea: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '100%',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
}); 