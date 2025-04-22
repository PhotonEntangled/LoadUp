"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShipmentData, DocumentType } from "@/types/shipment";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Camera } from "lucide-react";
import { useDocumentStore } from '@/lib/store/documentStore';
import { useToast } from '@/components/ui/use-toast';
import DocumentScanner from '@/components/logistics/DocumentScanner';
import { LogisticsDocumentUploaderRef } from "@/components/logistics/LogisticsDocumentUploader";

export default function DocumentScanPage() {
  const router = useRouter();
  // const { toast } = useToast(); // Keep commented out for build success
  const [documentName, setDocumentName] = useState<string>("Scanned Document");
  const [documentType, setDocumentType] = useState<string>(DocumentType.ETD_REPORT);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  // Get state and actions from document store
  const { setProcessedShipments, saveProcessedShipments } = useDocumentStore();

  const handleScanComplete = (data: any) => {
    setScanResult(data);
    setScanComplete(true);
    
    // Convert OCR results to a shipment data format
    const newShipment: Partial<ShipmentData> = {
      loadNumber: data.fields.loadNumber?.value || "",
      orderNumber: data.fields.orderNumber?.value || "",
      poNumber: data.fields.poNumber?.value || "",
      promisedShipDate: data.fields.promisedShipDate?.value || "",
      shipToCustomer: data.fields.shipToCustomer?.value || "",
      destination: {
        ...(data.fields.shipToAddress?.value ? {
          street: data.fields.shipToAddress?.value,
          rawInput: data.fields.shipToAddress?.value
        } : {}),
        city: data.fields.shipToCity?.value || "",
        state: data.fields.shipToState?.value || "",
        postalCode: data.fields.shipToZip?.value || "",
        country: data.fields.shipToCountry?.value || "",
      },
      remarks: "Generated from scanned document",
      items: [],
      totalWeight: 0,
      parsingMetadata: {
        originalHeaders: [],
        fieldMappingsUsed: [],
        aiMappedFields: [],
        needsReview: data.confidence < 0.8,
        parserVersion: 'scan-v1'
      },
      confidenceScore: {
        confidence: data.confidence,
        needsReview: data.confidence < 0.8,
        message: data.confidence < 0.8 ? 'Low scan confidence' : 'Scan confidence acceptable'
      },
      needsReview: data.confidence < 0.8,
      miscellaneousFields: {
        scanConfidence: data.confidence,
        scanDate: new Date().toISOString(),
        rawText: data.text
      }
    };
    
    // Add to processed shipments
    setProcessedShipments([newShipment as ShipmentData]);
    
    // toast({ // Keep commented out
    //   title: "Scan Complete",
    //   description: "Document has been scanned and processed.",
    //   variant: "success"
    // });
    console.log("[Scan Complete Toast Suppressed During Build]"); // Log instead of toast
  };

  const handleSaveDocument = () => {
    saveProcessedShipments(documentName, documentType);
    
    // toast({ // Keep commented out
    //   title: "Document Saved",
    //   description: "Scanned document has been saved successfully.",
    //   variant: "success"
    // });
    console.log("[Document Saved Toast Suppressed During Build]"); // Log instead of toast
    
    router.push('/documents');
  };

  const handleSelectDocumentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <h1 className="text-2xl font-bold">Scan Logistics Document</h1>
        </div>
        
        {scanComplete && (
          <Button onClick={handleSaveDocument}>
            <Save className="h-4 w-4 mr-2" />
            Save Document
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {scanComplete ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Document Scanned Successfully</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={handleSelectDocumentType}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(DocumentType).map((type: unknown) => {
                  const typeString = type as string;
                  return (
                    <option key={typeString} value={typeString}>
                      {typeString}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md mb-4">
              <h3 className="font-medium mb-2">Scan Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scan Confidence</p>
                  <p className="font-medium">{(scanResult.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fields Detected</p>
                  <p className="font-medium">{Object.keys(scanResult.fields).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Extracted Text</h3>
              <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-auto max-h-40">
                {scanResult.text}
              </pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveDocument}>
                <Save className="h-4 w-4 mr-2" />
                Save Document
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Camera className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Scan New Document</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Use your camera or upload an image to scan a logistics document. 
              The system will automatically extract relevant shipment information.
            </p>
            
            {/* <DocumentScanner 
              onScanComplete={handleScanComplete}
              onClose={() => router.push('/documents')}
            /> */}
            <p className="text-center text-muted-foreground p-4 border border-dashed rounded-md">[DocumentScanner component temporarily commented out for build diagnosis]</p>
          </Card>
        )}
      </div>
    </div>
  );
} 