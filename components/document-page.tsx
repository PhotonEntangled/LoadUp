"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, Search, Upload, Loader2, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // If needed for close button outside uploader
  // DialogClose, // Removed - Not exported
} from "@/components/ui/dialog"
// Import the uploader component
import LogisticsDocumentUploader, { LogisticsDocumentUploaderRef } from "@/components/logistics/LogisticsDocumentUploader"
// Import ShipmentData type
import type { ShipmentData } from "@/types/shipment"
// Import the standalone toast function
import { toast } from "@/hooks/use-toast";
// REMOVED import { formatDate } from "@/lib/utils"; 
// REMOVED import { StatusBadge } from "@/components/shared/StatusBadge"; 
// Import useDebounce
import { useDebounce } from "@/hooks/use-debounce";
import { StatusBadge } from "@/components/shared/StatusBadge";
// Added AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the DocumentMetadata type
export interface DocumentMetadata {
  id: string
  filename: string
  dateParsed: string
  shipments: number
  shipmentSummaryStatus: "Needs Review" | "Delayed" | "In Transit" | "Completed" | "Mixed"
}

// REMOVED sampleDocuments

// No longer need DocumentsPageProps if not passing initialDocuments
// interface DocumentsPageProps {
//   documents?: DocumentMetadata[];
// }

export default function DocumentsPage(/* REMOVED props */) {
  // State for fetched documents, loading, and error
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce the search query value
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const uploaderRef = useRef<LogisticsDocumentUploaderRef>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentMetadata | null>(null);

  // Stable function to fetch documents, accepting filters as arguments
  const fetchDocuments = useCallback(async (currentSearch: string, currentStatus: string) => {
    console.log(`Fetching documents with search: '${currentSearch}', status: '${currentStatus}'`);
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Use the passed-in (potentially debounced) search query
      if (currentSearch) params.append('search', currentSearch);
      if (currentStatus !== 'all') params.append('status', currentStatus);
      
      const apiUrl = `/api/documents?${params.toString()}`; 
      console.log("Fetching documents from:", apiUrl); 
      
      const response = await fetch(apiUrl); 
      if (!response.ok) {
        // Attempt to read error message from response body
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (_) { /* ignore */ }
        throw new Error(`HTTP error ${response.status}${errorBody ? `: ${errorBody}` : ''}`);
      }
      const data: DocumentMetadata[] = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setDocuments([]); // Clear documents on error
    } finally {
      setIsLoading(false);
    }
  // Empty dependency array makes this function stable
  }, []); 

  // Effect for the initial fetch on component mount
  useEffect(() => {
    console.log("Initial fetch triggered");
    fetchDocuments("", "all"); // Fetch with empty search and 'all' status
  // Depends only on the stable fetchDocuments function
  }, [fetchDocuments]);

  // Effect for subsequent fetches when debounced search or status filter changes
  useEffect(() => {
    // This check prevents running this effect on the initial mount
    // We use a flag or check if the values are different from initial state
    // A simple approach: check if either filter has a non-initial value
    const isInitialState = debouncedSearchQuery === "" && statusFilter === "all";

    // Only run if it's not the initial state identical to the initial fetch
    if (!isInitialState) { 
        console.log("Subsequent fetch triggered by filter change");
        fetchDocuments(debouncedSearchQuery, statusFilter);
    }
  // Depend on the debounced value and the status filter
  }, [debouncedSearchQuery, statusFilter, fetchDocuments]);

  // Use the main 'documents' state directly for rendering 
  const documentsToDisplay = documents; 

  // Upload callbacks
  const handleProcessingComplete = (uploadedShipments: ShipmentData[]) => {
    console.log("Processing complete, refreshing list", uploadedShipments);
    setIsUploadDialogOpen(false);
    uploaderRef.current?.reset();
    toast({ title: "Upload Complete", description: `Successfully processed ${uploadedShipments.length} shipment(s).` });
    // Refresh the documents list after successful upload (fetch with current filters)
    fetchDocuments(debouncedSearchQuery, statusFilter); 
  };

  const handleProcessingError = (error: Error) => {
    console.error("Processing error:", error);
    toast({ title: "Processing Error", description: error.message || "An error occurred during processing.", variant: "destructive" });
  };

  // --- Restore Original Delete Functionality ---
  const handleDeleteDocument = useCallback(async (docId: string) => {
    if (!docId) return;
    console.log(`Attempting to delete document with ID: ${docId}`);

    try {
      // --- Make the actual API call ---
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = "Failed to delete document";
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorDetails;
        } catch (e) {
          // If parsing JSON fails, use the status text
          errorDetails = response.statusText || errorDetails;
        }
        throw new Error(errorDetails);
      }

      // --- Handle successful deletion ---
      toast({ title: "Document Deleted", description: `Document ${docId} has been deleted.` });

      // Refresh the list after successful deletion
      fetchDocuments(debouncedSearchQuery, statusFilter);

    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Error Deleting Document", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive" });
    }
  }, [fetchDocuments, debouncedSearchQuery, statusFilter]); // Restore dependencies

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Remove redundant page title */}
          {/* <h1 className="text-2xl font-semibold tracking-tight">Shipment Slips</h1> */}

          {/* Align search/filter/upload to the right (or start if title removed) */}
          {/* Using ml-auto to push the controls to the right if needed, but likely better to just let them align left */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center w-full md:w-auto md:ml-auto">
            {/* Search Bar - Updates state, useEffect triggers debounced fetch */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 border dark:bg-input dark:border-input dark:text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>

            {/* Status Filter - Updates state, useEffect triggers fetch */}
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value); 
              }}
            >
              <SelectTrigger className="w-full md:w-48 border dark:bg-input dark:border-input dark:text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-popover dark:text-popover-foreground dark:border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Needs Review">Needs Review</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            {/* Upload Button triggers Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Upload className="h-4 w-4" />
                  Upload Slip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload Shipment Document</DialogTitle>
                  <DialogDescription>
                    Select or drag & drop your shipment files here. Processing will begin automatically.
                  </DialogDescription>
                </DialogHeader>
                <LogisticsDocumentUploader 
                  ref={uploaderRef} 
                  onProcessingComplete={handleProcessingComplete} 
                  onProcessingError={handleProcessingError} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Document Cards Grid - Conditional Rendering */}
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading documents...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 border border-destructive text-destructive rounded-lg">
            <AlertCircle className="h-12 w-12 mb-2" />
            <h3 className="text-lg font-medium">Failed to load documents</h3>
            <p className="mt-1">Error: {error}</p>
            {/* Pass current filters to retry fetch */}
            <Button onClick={() => fetchDocuments(debouncedSearchQuery, statusFilter)} variant="destructive" className="mt-4">Try Again</Button>
          </div>
        ) : documentsToDisplay.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documentsToDisplay.map((doc) => (
              <div key={doc.id} className="bg-card dark:bg-card rounded-lg border border-border dark:border-border shadow-sm overflow-hidden flex flex-col">
                {/* Card Header Area */}
                <div className="p-4 pb-2 relative">
                  <div className="flex justify-between items-start">
                    {/* Status Badge */}
                    <StatusBadge status={doc.shipmentSummaryStatus} />
                    
                    {/* Delete Button & Confirmation Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={(e) => {
                              e.stopPropagation(); // Prevent card click if needed
                              // Optional: set state here if dialog content depends on doc
                          }}
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the document 
                            <span className="font-semibold">&quot;{doc.filename}&quot;</span> and its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {/* Filename */}
                  <div className="flex items-start gap-2 mt-2">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-muted-foreground mt-0.5 flex-shrink-0" />
                    <h3 className="text-base font-medium dark:text-card-foreground line-clamp-2 break-words">{doc.filename}</h3>
                  </div>
                </div>
                
                {/* Card Body - Details */}
                <div className="p-4 pt-2">
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-muted-foreground">Date Parsed:</span>
                      <span className="font-medium dark:text-foreground">{formatDate(doc.dateParsed)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-muted-foreground">Shipments:</span>
                      <span className="font-medium dark:text-foreground">{doc.shipments} Shipments</span>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer - Action Button */}
                <div className="p-4 pt-2 mt-auto">
                  <Button className="w-full font-medium" asChild>
                    <Link href={`/shipments/${doc.id}`}>View Shipments</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card dark:bg-card border dark:border-border border-gray-200 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 dark:text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium text-[#0B1F3A] dark:text-foreground">No shipment slips found</h3>
            <p className="text-gray-500 dark:text-muted-foreground mt-1">
              {debouncedSearchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Upload a shipment slip to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  // Basic check for invalid date
  if (isNaN(date.getTime())) {
      return "Invalid Date";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
} 