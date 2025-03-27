"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Share2, Edit, Trash2 } from "lucide-react";
import ShipmentDataDisplay from "@/components/logistics/ShipmentDataDisplay";
import { useDocumentStore, Document as DocumentType } from "@/lib/store/documentStore";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, generateCSV, downloadFile } from "@/lib/utils";

export default function DocumentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { documents, removeDocument } = useDocumentStore();
  const [document, setDocument] = useState<DocumentType | null>(null);
  
  useEffect(() => {
    // Find the document in our store
    const foundDoc = documents.find(doc => doc.id === params.id);
    if (foundDoc) {
      setDocument(foundDoc);
    } else {
      toast({
        title: "Document Not Found",
        description: "The requested document could not be found.",
        variant: "destructive",
        duration: 5000
      });
    }
  }, [params.id, documents, toast]);
  
  const handleDeleteDocument = () => {
    if (!document) return;
    
    if (confirm("Are you sure you want to delete this document?")) {
      removeDocument(document.id);
      toast({
        title: "Success",
        description: "Document deleted successfully.",
        variant: "success",
        duration: 3000
      });
      router.push('/documents');
    }
  };
  
  const handleDownloadDocument = () => {
    if (!document) return;
    
    // Define headers for the CSV
    const headers = ["Load Number", "Order Number", "Ship Date", "Request Date", "Ship To", "Address", "State", "Contact", "PO Number", "Remarks", "Item Count", "Total Weight"];
    
    // Create rows for CSV
    const rows: string[][] = document.shipments.map(shipment => [
      shipment.loadNumber || "",
      shipment.orderNumber || "",
      shipment.promisedShipDate || "",
      shipment.requestDate || "",
      shipment.shipToCustomer || shipment.shipToArea || "",
      shipment.shipToAddress || "",
      shipment.shipToState || "",
      shipment.contactNumber || "",
      shipment.poNumber || "",
      shipment.remarks || "",
      shipment.items.length.toString(),
      shipment.totalWeight.toString()
    ]);
    
    // Generate and download CSV
    const csvContent = generateCSV(headers, rows);
    downloadFile(
      csvContent,
      `${document.name.replace(/\s+/g, '_')}.csv`
    );
    
    toast({
      title: "Download Started",
      description: "Your document is being downloaded.",
      variant: "success",
      duration: 3000
    });
  };
  
  if (!document) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Document not found</h3>
            <p className="text-gray-500">
              The document you are looking for does not exist or has been deleted.
            </p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/documents')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
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
          <h1 className="text-2xl font-bold">{document.name}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadDocument}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              window.print();
              toast({
                title: "Print Dialog",
                description: "Print dialog opened.",
                variant: "default",
                duration: 2000
              });
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={handleDeleteDocument}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Document Type</h3>
            <p className="font-medium">{document.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Upload Date</h3>
            <p className="font-medium">
              {formatDate(document.uploadDate)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {document.status}
              </span>
            </p>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Shipment Data</h2>
          <ShipmentDataDisplay 
            shipments={document.shipments}
            onCreateShipment={(shipment) => {
              toast({
                title: "Shipment Created",
                description: `Creating shipment for ${shipment.loadNumber || shipment.orderNumber}`,
                variant: "success",
                duration: 3000
              });
              // In a real app, we would call an API to create a shipment in the system
            }}
          />
        </div>
      </Card>
    </div>
  );
} 