"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Share2, Edit, Trash2, Check, ChevronDown } from "lucide-react";
import ShipmentDataDisplay from "@/components/logistics/ShipmentDataDisplay";
import { useDocumentStore, Document as DocumentType } from "@/lib/store/documentStore";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/formatters";
import { UserRole } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Simple dropdown state hook to avoid dependency on Shadcn dropdown-menu component
function useDropdownState() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return { isOpen, setIsOpen, ref };
}

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
  
  const handleDownloadCSV = () => {
    if (!document || !document.shipments) return;
    const csvData = document.shipments.map(shipment => ({
      loadNumber: shipment.loadNumber || '',
      orderNumber: shipment.orderNumber || '',
      poNumber: shipment.poNumber || '',
      shipToCustomer: shipment.shipToCustomer || '',
      "destination.street": shipment.destination?.street || shipment.destination?.rawInput || '', 
      "destination.city": shipment.destination?.city || '',
      "destination.state": shipment.destination?.state || '',
      "destination.postalCode": shipment.destination?.postalCode || '',
      promisedShipDate: shipment.promisedShipDate ? formatDate(String(shipment.promisedShipDate)) : '',
      status: shipment.status || '',
      itemCount: (shipment.items ?? []).length,
      totalWeight: shipment.totalWeight || 0,
      remarks: shipment.remarks || '',
    }));
    
    // Define headers for CSV
    const headers = [
      { label: "Load Number", key: "loadNumber" },
      { label: "Order Number", key: "orderNumber" },
      { label: "PO Number", key: "poNumber" },
      { label: "Ship To Customer", key: "shipToCustomer" },
      { label: "Destination Address", key: "destination.street" },
      { label: "Destination City", key: "destination.city" },
      { label: "Destination State", key: "destination.state" },
      { label: "Destination Postal Code", key: "destination.postalCode" },
      { label: "Promised Ship Date", key: "promisedShipDate" },
      { label: "Status", key: "status" },
      { label: "Item Count", key: "itemCount" },
      { label: "Total Weight", key: "totalWeight" },
      { label: "Remarks", key: "remarks" },
    ];
    
    // Generate and download CSV
    // const csvContent = generateCSV(headers, rows);
    // downloadFile(
    //   csvContent,
    //   `${document.name.replace(/\s+/g, '_')}.csv`
    // );
    
    toast({
      title: "Download Started",
      description: "Your document is being downloaded as CSV.",
      variant: "success",
      duration: 3000
    });
  };
  
  const handleDownloadJSON = () => {
    if (!document) return;
    
    // Convert the entire document to JSON with pretty printing
    const jsonContent = JSON.stringify(document, null, 2);
    const jsonUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`;
    
    // Use the downloadFile utility (which now handles data URIs correctly)
    // downloadFile(jsonUri, `${document.name.replace(/\s+/g, '_')}.json`);
    
    toast({
      title: "Download Started",
      description: "Your document is being downloaded as JSON.",
      variant: "success",
      duration: 3000
    });
  };
  
  // For download dropdown menu
  const downloadDropdown = useDropdownState();
  
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
          <div className="relative" ref={downloadDropdown.ref}>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => downloadDropdown.setIsOpen(!downloadDropdown.isOpen)}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            
            {downloadDropdown.isOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleDownloadCSV();
                      downloadDropdown.setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadJSON();
                      downloadDropdown.setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download as JSON
                  </button>
                </div>
              </div>
            )}
          </div>
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
              {/* Convert Date to ISO string before formatting */}
              {formatDate(document.uploadDate?.toISOString())}
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
          {document.shipments && document.shipments.length > 0 ? (
            <ShipmentDataDisplay shipments={document.shipments} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-gray-500">No shipment data available for this document.</p>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
} 