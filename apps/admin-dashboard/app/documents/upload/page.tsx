"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogisticsDocumentUploader, { LogisticsDocumentType } from "@/components/logistics/LogisticsDocumentUploader";
import ShipmentDataDisplay from "@/components/logistics/ShipmentDataDisplay";
import { ShipmentData } from "@/lib/document-processing";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, AlertCircle, Edit, Check } from "lucide-react";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

export default function DocumentUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>(LogisticsDocumentType.ETD_REPORT);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [generatedName, setGeneratedName] = useState<string>("");
  const [autoCreateShipments, setAutoCreateShipments] = useState<boolean>(true);
  
  // Get state and actions from document store
  const { 
    processedShipments, 
    isProcessing, 
    redirectAfterUpload,
    setProcessedShipments, 
    setIsProcessing, 
    saveProcessedShipments,
    setRedirectAfterUpload
  } = useDocumentStore();

  // Check if we should redirect after upload
  useEffect(() => {
    if (redirectAfterUpload) {
      setRedirectAfterUpload(false);
      router.push('/documents');
      
      toast({
        title: "Success",
        description: "Documents saved successfully!",
        variant: "success",
        duration: 5000
      });
    }
  }, [redirectAfterUpload, router, setRedirectAfterUpload, toast]);

  // Generate an intelligent document name based on shipment data
  const generateIntelligentName = (shipments: ShipmentData[], fileName: string = '') => {
    // Default to filename without extension if provided
    let baseName = fileName ? fileName.split('.')[0] : "New Document";
    
    if (shipments.length === 0) {
      return baseName;
    }
    
    try {
      // Extract date information from first shipment
      const dateStr = shipments[0]?.promisedShipDate ? 
        new Date(shipments[0].promisedShipDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      // Extract all sheet names - convert Set to Array for iteration
      const sheets = Array.from(new Set(shipments.map(s => 
        s.miscellaneousFields?.sheetName || 'Unknown'
      )));
      
      // Get load number range
      const loadNumbers = shipments
        .map(s => s.loadNumber ? parseInt(s.loadNumber, 10) : 0)
        .filter(n => !isNaN(n) && n > 0);
      
      const minLoad = loadNumbers.length > 0 ? Math.min(...loadNumbers) : null;
      const maxLoad = loadNumbers.length > 0 ? Math.max(...loadNumbers) : null;
      
      // Get carriers - convert Set to Array for iteration
      const carriers = Array.from(new Set(shipments
        .map(s => s.carrier)
        .filter(c => c && c.trim() !== '')
      ));
      
      // Get unique destinations (states) - convert Set to Array for iteration
      const destinations = Array.from(new Set(shipments
        .map(s => s.shipToState)
        .filter(s => s && s.trim() !== '')
      ));
      
      // Build intelligent name components
      const components = [];
      
      // Add date
      components.push(dateStr);
      
      // Add load info
      if (minLoad && maxLoad) {
        if (minLoad === maxLoad) {
          components.push(`Load${minLoad}`);
        } else {
          components.push(`Loads${minLoad}-${maxLoad}`);
        }
      }
      
      // Add carrier info (limit to 2)
      if (carriers.length > 0) {
        if (carriers.length === 1) {
          components.push(`${carriers[0]}`);
        } else if (carriers.length === 2) {
          components.push(`${carriers[0]}_${carriers[1]}`);
        } else {
          components.push(`MultipleCarriers(${carriers.length})`);
        }
      }
      
      // Add destination info (limit to 3)
      if (destinations.length > 0) {
        if (destinations.length <= 3) {
          components.push(`To_${destinations.join('_')}`);
        } else {
          components.push(`MultiDest(${destinations.length})`);
        }
      }
      
      // Add sheet info if available
      if (sheets.length === 1) {
        if (sheets[0] !== 'Unknown') {
          components.push(sheets[0]);
        }
      } else if (sheets.length > 1) {
        components.push(`Multi_${sheets.length}Sheets`);
      }
      
      // Add shipment count
      components.push(`${shipments.length}Shipments`);
      
      // Combine components into intelligent name
      return components.join('_');
    } catch (error) {
      console.error('Error generating intelligent name:', error);
      return baseName;
    }
  };

  const handleDocumentProcessed = (shipments: ShipmentData[], fileName: string = '') => {
    setProcessedShipments(shipments);
    setProcessingError(null);
    
    // Generate intelligent name
    const intelligentName = generateIntelligentName(shipments, fileName);
    setGeneratedName(intelligentName);
    
    // Set document name if not already set
    if (!documentName) {
      setDocumentName(intelligentName);
    }
    
    if (shipments.length > 0) {
      toast({
        title: "Document Processed",
        description: `Successfully extracted ${shipments.length} shipments from document.`,
        variant: "success",
        duration: 5000
      });
      
      // Automatically create shipment records if autoCreateShipments is enabled
      if (autoCreateShipments) {
        // Simulate API call to create shipment records
        toast({
          title: "Creating Shipment Records",
          description: `Creating ${shipments.length} formal shipment records...`,
          variant: "default",
          duration: 3000
        });
        
        // In a real app, this would call the API for each shipment
        setTimeout(() => {
          // Save to the document store
          const name = intelligentName || `Batch ${new Date().toISOString().split('T')[0]}`;
          saveProcessedShipments(name, documentType);
          
          toast({
            title: "Shipments Created",
            description: `Successfully created ${shipments.length} shipment records.`,
            variant: "success",
            duration: 5000
          });
        }, 1500);
      }
      
      // Automatically save the document after processing
      if (fileName && !autoCreateShipments) {
        setTimeout(() => {
          handleSaveAll(intelligentName);
        }, 1000);
      }
    } else {
      setProcessingError("Could not extract shipment data from document. Please check the format.");
      toast({
        title: "Processing Error",
        description: "Could not extract shipment data from document. Please check the format.",
        variant: "destructive",
        duration: 7000
      });
    }
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setProcessingError(null);
  };

  const handleSaveAll = (suggestedName?: string) => {
    try {
      if (processedShipments.length === 0) {
        toast({
          title: "No Shipments",
          description: "There are no shipments to save.",
          variant: "warning",
          duration: 3000
        });
        return;
      }
      
      // Use provided name, document name state, or default
      const name = suggestedName || documentName || `Batch ${new Date().toISOString().split('T')[0]}`;
      saveProcessedShipments(name, documentType);
      
      toast({
        title: "Success",
        description: "All shipments saved successfully.",
        variant: "success",
        duration: 3000
      });
      
      // Router will redirect due to redirectAfterUpload being set to true
    } catch (error) {
      console.error("Error saving shipments:", error);
      toast({
        title: "Error",
        description: "Failed to save shipments. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const toggleNameEdit = () => {
    if (isEditingName) {
      // Save changes
      setIsEditingName(false);
    } else {
      // Start editing
      setIsEditingName(true);
    }
  };

  // Render the intelligent document name display
  const renderIntelligentName = () => {
    if (!generatedName) return null;
    
    return (
      <div className="flex items-center text-sm text-gray-700 mt-2 bg-blue-50 p-2 rounded-md border border-blue-100 animate-fadeIn">
        <div className="flex flex-col">
          <span className="font-medium text-blue-800">Suggested Name:</span>
          <span className="text-blue-900 font-medium">{generatedName}</span>
          <span className="text-xs text-blue-600 mt-1">
            Generated based on {processedShipments.length} shipments
          </span>
        </div>
        <div className="ml-auto flex space-x-2">
          {!isEditingName && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setDocumentName(generatedName);
                setIsEditingName(true);
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Use
            </Button>
          )}
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold">Upload Logistics Document</h1>
        </div>
        
        {processedShipments.length > 0 && (
          <Button onClick={() => handleSaveAll()}>
            <Save className="h-4 w-4 mr-2" />
            Save All Shipments
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoCreateShipments"
              checked={autoCreateShipments}
              onChange={(e) => setAutoCreateShipments(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoCreateShipments" className="text-sm text-gray-700">
              Automatically create formal shipment records after processing (recommended)
            </label>
          </div>
          
          <LogisticsDocumentUploader
            onProcessingStart={handleProcessingStart}
            onDocumentProcessed={handleDocumentProcessed}
          />
        </Card>
        
        {isProcessing && (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Processing document...</span>
            </div>
          </Card>
        )}
        
        {processingError && !isProcessing && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{processingError}</span>
            </div>
          </Card>
        )}
        
        {processedShipments.length > 0 && (
          <>
            {/* Document Name Editor */}
            <Card className="p-4 border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-500">Document Name</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleNameEdit}
                  className="h-8 px-2"
                >
                  {isEditingName ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {isEditingName ? (
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full mt-1"
                  placeholder="Enter document name..."
                  autoFocus
                  onBlur={toggleNameEdit}
                  onKeyDown={(e) => e.key === 'Enter' && toggleNameEdit()}
                />
              ) : (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium text-lg text-gray-900">{documentName}</span>
                  {renderIntelligentName()}
                </div>
              )}
              
              <div className="mt-1 text-xs text-gray-500">
                {processedShipments.length} shipments processed from {
                  Array.from(new Set(processedShipments.map(s => s.miscellaneousFields?.sheetName))).filter(Boolean).join(', ')
                }
              </div>
            </Card>
            
            <ShipmentDataDisplay 
              shipments={processedShipments}
            />
          </>
        )}
      </div>
    </div>
  );
} 