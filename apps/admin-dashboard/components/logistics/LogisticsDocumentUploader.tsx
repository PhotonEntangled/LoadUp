"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/shared/Card";
import { Upload, File, X, FileText, Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipmentData } from "@/lib/document-processing";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentScanner from "./DocumentScanner";

export enum LogisticsDocumentType {
  BILL_OF_LADING = "Bill of Lading",
  INVOICE = "Invoice",
  PACKING_LIST = "Packing List",
  CUSTOMS_DECLARATION = "Customs Declaration",
  DELIVERY_ORDER = "Delivery Order",
  OUTSTATION_RATES = "Outstation Rates",
  ETD_REPORT = "ETD Report",
  OTHER = "Other"
}

export interface LogisticsDocumentUploaderProps {
  onDocumentProcessed?: (shipments: ShipmentData[], fileName?: string) => void;
  onProcessingStart?: () => void;
  onProcessingComplete?: (shipments: ShipmentData[]) => void;
  onProcessingError?: (error: Error) => void;
}

export interface LogisticsDocumentUploaderRef {
  reset: () => void;
}

const LogisticsDocumentUploader = forwardRef<LogisticsDocumentUploaderRef, LogisticsDocumentUploaderProps>(
  ({ onDocumentProcessed, onProcessingStart, onProcessingComplete, onProcessingError }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const [documentType, setDocumentType] = useState<LogisticsDocumentType>(LogisticsDocumentType.ETD_REPORT);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentFileName, setCurrentFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const [activeTab, setActiveTab] = useState<"upload" | "scan">("upload");

    useImperativeHandle(ref, () => ({
      reset: () => {
        setFiles([]);
        setDocumentType(LogisticsDocumentType.ETD_REPORT);
      }
    }));

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...newFiles]);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
      }
    };

    const handleRemoveFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Handle document processing
     */
    const handleProcessDocument = async () => {
      if (files.length === 0) {
        toast({
          title: "No Files Selected",
          description: "Please select at least one file to process.",
          variant: "destructive",
          duration: 3000
        });
        return;
      }
      
      if (onProcessingStart) {
        onProcessingStart();
      }
      
      setIsProcessing(true);
      
      try {
        // Process each file and collect the shipment data
        const allShipments: ShipmentData[] = [];
        
        for (const file of files) {
          try {
            setCurrentFileName(file.name);
            
            // Create a FormData object
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('useAIMapping', 'true');
            formData.append('aiMappingConfidenceThreshold', '0.7');
            formData.append('hasHeaderRow', 'true');
            
            // Send the file to the server-side API for processing
            const response = await fetch('/api/ai/document-processing', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Server error: ${errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.shipmentData && data.shipmentData.length > 0) {
              allShipments.push(...data.shipmentData);
              toast({
                title: "Success",
                description: `Processed ${data.shipmentData.length} shipments from ${file.name}`,
                duration: 3000
              });
            } else {
              toast({
                title: "No Data Found",
                description: `No shipment data found in ${file.name}`,
                variant: "warning",
                duration: 3000
              });
            }
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            toast({
              title: "File Processing Error",
              description: `Could not process ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
              variant: "destructive",
              duration: 5000
            });
            
            if (onProcessingError && fileError instanceof Error) {
              onProcessingError(fileError);
            }
          }
        }
        
        // Call the appropriate callback with the processed shipments
        if (onDocumentProcessed) {
          // Pass the first file name if there's only one file, otherwise pass a generic name
          const fileName = files.length === 1 ? files[0].name : "Multiple Files";
          onDocumentProcessed(allShipments, fileName);
        }
        
        if (onProcessingComplete) {
          onProcessingComplete(allShipments);
        }
      } catch (error) {
        console.error("Error processing document:", error);
        toast({
          title: "Processing Error",
          description: "An error occurred while processing the document. Please try again.",
          variant: "destructive",
          duration: 5000
        });
        
        // If there's an error, still call the callbacks with an empty array
        if (onDocumentProcessed) {
          onDocumentProcessed([]);
        }
        
        if (onProcessingComplete) {
          onProcessingComplete([]);
        }
        
        if (onProcessingError && error instanceof Error) {
          onProcessingError(error);
        }
      } finally {
        setIsProcessing(false);
        setCurrentFileName('');
      }
    };
    
    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        // For now, we'll use readAsText for all file types
        // In a production app, you would use different methods based on file type
        // and potentially use libraries like xlsx for Excel files
        reader.onload = (event) => {
          if (event.target?.result) {
            // For this demo, we'll convert all file content to string
            // In a real app, you'd process Excel files differently
            const content = event.target.result.toString();
            resolve(content);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("File reading error"));
        
        // For Excel files, we would normally use readAsArrayBuffer
        // But for this demo, we'll use readAsText for simplicity
        reader.readAsText(file);
      });
    };

    const handleScanComplete = (data: any) => {
      try {
        if (!data) {
          throw new Error("Invalid scan data received");
        }
        
        let file: File | null = null;
        
        // If the scanner provides an original file, use it directly
        if (data.originalFile && data.originalFile instanceof File) {
          console.log("Using original file from scanner:", data.originalFile.name);
          file = data.originalFile;
        } else if (data.imageData) {
          // Create an image file from the imageData if available
          console.log("Creating image file from scan data");
          try {
            // Convert base64 to blob
            const imageData = data.imageData;
            const contentType = imageData.split(';')[0].split(':')[1];
            
            const byteString = atob(imageData.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: contentType });
            
            // Get the proper file extension based on content type
            let extension = '.jpg';
            if (contentType === 'image/png') extension = '.png';
            else if (contentType === 'image/jpeg') extension = '.jpg';
            else if (contentType === 'image/gif') extension = '.gif';
            
            // Create a file from the blob
            const fileName = `scanned-document-${new Date().getTime()}${extension}`;
            file = new Blob([blob], { type: contentType }) as any;
            Object.defineProperty(file, 'name', {
              writable: false,
              value: fileName
            });
            Object.defineProperty(file, 'lastModified', {
              writable: false,
              value: Date.now()
            });
          } catch (error) {
            console.error("Error creating image file:", error);
            // Fall back to text file if image conversion fails
          }
        }
        
        // If we have shipment data from OCR processing, we can use it directly
        if (data.shipmentData && data.shipmentData.length > 0) {
          console.log("Shipment data already processed by OCR:", data.shipmentData.length, "shipments");
          
          // We can pass this data directly to the document processed handler
          if (onDocumentProcessed) {
            // Generate an appropriate file name
            const fileName = file ? file.name : `OCR-Scan-${new Date().toISOString().slice(0, 10)}`;
            onDocumentProcessed(data.shipmentData, fileName);
            
            toast({
              title: "Document Processed",
              description: `Successfully processed ${data.shipmentData.length} shipments from scanned document.`,
              variant: "success"
            });
            
            // No need to add to files since we're processing directly
            if (onProcessingComplete) {
              onProcessingComplete(data.shipmentData);
            }
            
            // Switch back to upload tab after successful scan
            setActiveTab("upload");
            return;
          }
        }
        
        // If no pre-processed data and no file, create a text file with the OCR results
        if (!file && data.text) {
          console.log("Creating text file from OCR text");
          const textContent = typeof data.text === 'string'
            ? data.text
            : `OCR Results:\n${JSON.stringify(data, null, 2)}`;
            
          const blob = new Blob([textContent], { type: 'text/plain' });
          file = blob as unknown as File;
          Object.defineProperty(file, 'name', {
            writable: false,
            value: `scanned-document-${new Date().getTime()}.txt`
          });
          Object.defineProperty(file, 'lastModified', {
            writable: false,
            value: Date.now()
          });
        }
        
        if (!file) {
          throw new Error("Could not create a valid file from scan data");
        }
        
        // Add to files for later processing
        setFiles(prevFiles => [...prevFiles, file as File]);
        
        toast({
          title: "Document Scanned",
          description: "Scanned document has been added to your files. Click 'Process Document' to extract shipment data.",
          variant: "success"
        });
        
        // Switch back to upload tab after successful scan
        setActiveTab("upload");
      } catch (error) {
        console.error("Error processing scanned document:", error);
        toast({
          title: "Scan Error",
          description: "Failed to process scanned document.",
          variant: "destructive"
        });
      }
    };

    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Logistics Document
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as LogisticsDocumentType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(LogisticsDocumentType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "scan")} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Document
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 mb-2">
                  Drag and drop your document here, or{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: .txt, .csv, .xls, .xlsx, .pdf
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".txt,.csv,.xls,.xlsx,.pdf"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scan" className="mt-4">
            <DocumentScanner 
              onScanComplete={handleScanComplete} 
              onClose={() => setActiveTab("upload")}
            />
          </TabsContent>
        </Tabs>
        
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <Button
            onClick={handleProcessDocument}
            disabled={files.length === 0 || isProcessing}
            className="w-full"
          >
            <File className="h-5 w-5 mr-2" />
            {isProcessing ? "Processing..." : "Process Document"}
          </Button>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Processing Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>For ETD Reports, ensure the file contains all shipment details</li>
            <li>For Outstation Rates, make sure the rates table is complete</li>
            <li>Text files (.txt) work best for automated extraction</li>
            <li>Ensure the document is properly formatted for best results</li>
          </ul>
        </div>
      </Card>
    );
  }
);

LogisticsDocumentUploader.displayName = "LogisticsDocumentUploader";

export default LogisticsDocumentUploader; 