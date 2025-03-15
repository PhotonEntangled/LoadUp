import React, { useState, useRef } from 'react';
import { ShipmentData } from '../../services/ocr/DocumentParser';
import { ShipmentParser, ShipmentSourceType, ShipmentParserInput } from '../../services/parsers/ShipmentParser';

interface FileUploaderProps {
  onFilesProcessed: (shipments: ShipmentData[]) => void;
  onError: (error: Error) => void;
}

/**
 * Component for uploading and processing shipment files (images or Excel TXT)
 */
export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesProcessed, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'excel'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shipmentParser = new ShipmentParser();

  /**
   * Handle file selection
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const shipments: ShipmentData[] = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileContent = await readFile(file);
        
        // Determine the source type based on file type and upload type
        const sourceType = determineSourceType(file, uploadType);
        
        // Parse the file
        const parserInput: ShipmentParserInput = {
          type: sourceType,
          data: fileContent
        };
        
        const parsedShipments = await shipmentParser.parseShipment(parserInput);
        shipments.push(...parsedShipments);
      }

      // Call the callback with the processed shipments
      onFilesProcessed(shipments);
    } catch (error) {
      console.error('Error processing files:', error);
      onError(error instanceof Error ? error : new Error('Unknown error processing files'));
    } finally {
      setIsProcessing(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Read a file as text or data URL
   */
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  /**
   * Determine the source type based on file type and upload type
   */
  const determineSourceType = (file: File, uploadType: 'image' | 'excel'): ShipmentSourceType => {
    if (uploadType === 'image' || file.type.startsWith('image/')) {
      return ShipmentSourceType.OCR_IMAGE;
    } else {
      return ShipmentSourceType.EXCEL_TXT;
    }
  };

  /**
   * Get accepted file types based on upload type
   */
  const getAcceptedFileTypes = (): string => {
    return uploadType === 'image' 
      ? 'image/jpeg,image/png,image/gif' 
      : '.txt,.csv';
  };

  return (
    <div className="file-uploader">
      <div className="upload-type-selector">
        <button 
          className={`upload-type-button ${uploadType === 'image' ? 'active' : ''}`}
          onClick={() => setUploadType('image')}
          disabled={isProcessing}
        >
          Upload Image
        </button>
        <button 
          className={`upload-type-button ${uploadType === 'excel' ? 'active' : ''}`}
          onClick={() => setUploadType('excel')}
          disabled={isProcessing}
        >
          Upload Excel TXT
        </button>
      </div>
      
      <div className="upload-instructions">
        {uploadType === 'image' ? (
          <p>Upload images of shipping documents for OCR processing</p>
        ) : (
          <p>Upload TXT files exported from Excel with shipping data</p>
        )}
      </div>
      
      <div className="file-input-container">
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedFileTypes()}
          onChange={handleFileChange}
          disabled={isProcessing}
          multiple={uploadType === 'excel'} // Allow multiple files for Excel
        />
        
        <button 
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Select ${uploadType === 'image' ? 'Image' : 'Excel TXT'} Files`}
        </button>
      </div>
      
      {isProcessing && (
        <div className="processing-indicator">
          <p>Processing files, please wait...</p>
        </div>
      )}
      
      <style jsx>{`
        .file-uploader {
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .upload-type-selector {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }
        
        .upload-type-button {
          padding: 8px 16px;
          margin: 0 5px;
          border: 1px solid #ccc;
          background: #f5f5f5;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .upload-type-button.active {
          background: #007bff;
          color: white;
          border-color: #0069d9;
        }
        
        .upload-instructions {
          margin-bottom: 15px;
          color: #666;
        }
        
        .file-input-container {
          margin-bottom: 15px;
        }
        
        .file-input-container input[type="file"] {
          display: none;
        }
        
        .upload-button {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .upload-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .processing-indicator {
          color: #007bff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}; 