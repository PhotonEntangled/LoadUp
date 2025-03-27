"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2,
  Plus,
  Camera
} from "lucide-react";
import { useDocumentStore, Document as DocumentType } from "@/lib/store/documentStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, generateCSV, downloadFile } from "@/lib/utils";

export default function DocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { documents, removeDocument } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Load documents effect
  useEffect(() => {
    if (documents.length > 0) {
      toast({
        title: "Documents Loaded",
        description: `Loaded ${documents.length} documents.`,
        variant: "default",
        duration: 2000
      });
    }
  }, []);
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? doc.type === selectedType : true;
    return matchesSearch && matchesType;
  });
  
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));
  
  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      removeDocument(id);
      toast({
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
        variant: "success",
        duration: 3000
      });
    }
  };
  
  const handleViewDocument = (doc: DocumentType) => {
    router.push(`/documents/view/${doc.id}`);
  };
  
  const handleExportDocument = (doc: DocumentType) => {
    // Convert shipments to a format for CSV generation
    const headers = ["Load Number", "Order Number", "Ship Date", "Request Date", "Ship To", "Address", "State", "Contact", "PO Number", "Remarks", "Item Count", "Total Weight"];
    
    // Create rows for CSV
    const rows: string[][] = doc.shipments.map(shipment => [
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
      `${doc.name.replace(/\s+/g, '_')}.csv`
    );
    
    toast({
      title: "Export Started",
      description: `Exporting ${doc.name} as CSV.`,
      variant: "success",
      duration: 3000
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Logistics Documents</h1>
        <div className="flex items-center gap-2">
          <Link href="/documents/scan">
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Document
            </Button>
          </Link>
          <Link href="/documents/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
              >
                <option value="">All Document Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedType
                ? "Try adjusting your search or filter criteria"
                : "Upload your first document to get started"}
            </p>
            {!searchQuery && !selectedType && (
              <Link href="/documents/upload">
                <Button className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border border-gray-200">Document Name</th>
                  <th className="p-3 text-left border border-gray-200">Type</th>
                  <th className="p-3 text-left border border-gray-200">Upload Date</th>
                  <th className="p-3 text-left border border-gray-200">Status</th>
                  <th className="p-3 text-left border border-gray-200">Shipments</th>
                  <th className="p-3 text-left border border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border border-gray-200">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-3 border border-gray-200">{doc.type}</td>
                    <td className="p-3 border border-gray-200">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="p-3 border border-gray-200">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-200">{doc.shipments.length}</td>
                    <td className="p-3 border border-gray-200">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleExportDocument(doc)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 