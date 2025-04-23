"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Camera, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { Card } from '../shared/Card';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface DocumentScannerProps {
  onScanComplete?: (data: any) => void;
  onClose?: () => void;
}

/**
 * Document Scanner component that allows users to upload images
 * and scan them using OCR technology.
 */
export default function DocumentScanner({ onScanComplete, onClose }: DocumentScannerProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setScanError(null);
      setScanResult(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  // Handle camera capture (placeholder - in a real implementation, this would use device camera)
  const handleCameraCapture = () => {
    toast({
      title: "Camera Access",
      description: "Camera access will be implemented in a future update.",
      variant: "default"
    });
  };
  
  // Scan the document using OCR
  const handleScan = async () => {
    if (!file) {
      setScanError("Please select a document to scan first.");
      return;
    }
    
    setIsLoading(true);
    setScanError(null);
    setScanResult(null); // Clear previous results
    
    try {
      // Create a FormData object to send to our API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'ETD_REPORT'); // Default to ETD report type
      formData.append('useAIMapping', 'true');
      formData.append('aiMappingConfidenceThreshold', '0.7');
      
      // Send the image to the server-side API for OCR processing
      const response = await fetch('/api/ai/document-processing', {
        method: 'POST',
        body: formData,
      });
      
      // Parse the response as JSON
      // Note: we've updated the API to always return a 200 status with error details if needed
      const data = await response.json();
      
      // Check if we got an error status
      if (data.status === 'error') {
        throw new Error(data.message || 'Error processing document');
      }
      
      // Check if we got shipment data back
      if (!data.shipmentData || data.shipmentData.length === 0) {
        throw new Error("No shipment data could be extracted from the image");
      }
      
      // Check if we have error shipments
      const errorShipment = data.shipmentData.find((shipment: any) => 
        shipment.loadNumber === 'ERROR' || shipment.miscellaneousFields?.scanStatus === 'failed'
      );
      
      if (errorShipment) {
        throw new Error(errorShipment.miscellaneousFields?.errorMessage || 'Error processing shipment data');
      }
      
      // Get the extracted text from the first shipment's miscellaneous fields
      const extractedText = data.shipmentData[0]?.miscellaneousFields?.extractedText || 
                          "Extracted text not available";
      
      // Format the scan result for display
      const scanResult = {
        text: extractedText,
        confidence: data.shipmentData[0]?.miscellaneousFields?.ocrConfidence || 0.85,
        fields: {
          // Extract some key fields for display
          loadNumber: { 
            value: data.shipmentData[0]?.loadNumber || 'Not found',
            confidence: 0.9
          },
          orderNumber: { 
            value: data.shipmentData[0]?.orderNumber || 'Not found',
            confidence: 0.9
          },
          shipToCustomer: { 
            value: data.shipmentData[0]?.shipToCustomer || 'Not found',
            confidence: 0.9
          }
        },
        originalFile: file
      };
      
      setScanResult(scanResult);
      
      if (onScanComplete) {
        onScanComplete({
          imageData: previewUrl,
          text: extractedText,
          confidence: data.shipmentData[0]?.miscellaneousFields?.ocrConfidence || 0.85,
          shipmentData: data.shipmentData,
          originalFile: file
        });
      }
      
      toast({
        title: "Scan Complete",
        description: `Successfully processed ${data.shipmentData.length} shipment(s)`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error scanning document:", error);
      setScanError(error instanceof Error ? error.message : "Failed to scan document. Please try again.");
      
      // Set a minimal scan result to show the failed state
      setScanResult({
        error: true,
        errorMessage: error instanceof Error ? error.message : String(error),
        originalFile: file
      });
      
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "There was an error scanning the document.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Document Scanner</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Upload controls */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Upload Document</h3>
            <div className="flex gap-2">
              <div className="w-full">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-1/2 flex items-center justify-center bg-blue-50 hover:bg-blue-100"
              onClick={handleCameraCapture}
              disabled={isLoading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            
            <Button 
              variant="default" 
              className="w-1/2 flex items-center justify-center"
              onClick={handleScan}
              disabled={isLoading || !file}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Processing..." : "Scan Document"}
            </Button>
          </div>
          
          {scanError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600">
                <p className="font-medium">Error scanning document</p>
                <p>{scanError}</p>
                <p className="mt-1 text-xs">
                  Try a clearer image or a different document format.
                </p>
              </div>
            </div>
          )}
          
          {scanResult && !scanResult.error && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium text-green-700">Scan Successful</h4>
              </div>
              <div className="text-sm">
                <p>Confidence: {(scanResult.confidence * 100).toFixed(1)}%</p>
                <div className="mt-2">
                  <h5 className="font-medium mb-1">Extracted Fields:</h5>
                  <ul className="space-y-1">
                    {Object.entries(scanResult.fields).map(([key, value]: [string, any]) => (
                      <li key={key} className="flex items-center justify-between">
                        <span className="text-gray-700">{key}:</span>
                        <span className="font-medium">{value.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {scanResult && scanResult.error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h4 className="font-medium text-amber-700">Document Processed with Errors</h4>
              </div>
              <div className="text-sm text-amber-700">
                <p>The document was processed but we couldn&apos;t extract all the necessary information.</p>
                <p className="mt-1">You may want to try with a clearer image or a different document format.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Document preview */}
        <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
          {previewUrl ? (
            <div className="relative w-full h-full min-h-[300px]">
              <Image 
                src={previewUrl} 
                alt="Document preview" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 p-6">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No document selected</p>
              <p className="text-xs mt-1">Upload an image or take a photo to scan</p>
            </div>
          )}
        </div>
      </div>
      
      {scanResult && scanResult.text && !scanResult.error && (
        <div className="mt-6 p-3 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Raw Extracted Text</h3>
          <pre className="bg-white p-3 rounded text-sm font-mono whitespace-pre-wrap border border-gray-200 max-h-60 overflow-auto">
            {scanResult.text}
          </pre>
        </div>
      )}
    </Card>
  );
} 