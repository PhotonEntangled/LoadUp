"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Badge
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Upload, Loader2, AlertCircle, FileText, Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LogisticsDocumentUploader, { LogisticsDocumentUploaderRef } from "@/components/logistics/LogisticsDocumentUploader";
import type { ShipmentData } from "@/types/shipment";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';

export interface DocumentMetadata {
  id: string;
  filename: string | null;
  dateParsed: string | null;
  shipments: number;
  shipmentSummaryStatus: "Needs Review" | "Delayed" | "In Transit" | "Completed" | "Mixed" | "Uploaded" | "Pickup Scheduled" | "Error";
}

// Simple Dev Only Wrapper (Remove if not needed elsewhere)
// const DevOnlyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   if (process.env.NODE_ENV === 'development') {
//     return <>{children}</>;
//   }
//   return null;
// };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const uploaderRef = useRef<LogisticsDocumentUploaderRef>(null);
  const router = useRouter();

  const fetchDocuments = useCallback(async (currentSearch: string, currentStatus: string) => {
    console.log(`Fetching documents with search: '${currentSearch}', status: '${currentStatus}'`);
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.append('search', currentSearch);
      if (currentStatus !== 'all') params.append('status', currentStatus);
      const apiUrl = `/api/documents?${params.toString()}`;
      console.log("Fetching documents from:", apiUrl);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        let errorBody = '';
        try { errorBody = await response.text(); } catch (_) { /* ignore */ }
        throw new Error(`HTTP error ${response.status}${errorBody ? `: ${errorBody}` : ''}`);
      }
      const data: DocumentMetadata[] = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Initial fetch triggered");
    fetchDocuments("", "all");
  }, [fetchDocuments]);

  useEffect(() => {
    const isInitialState = debouncedSearchQuery === "" && statusFilter === "all";
    if (!isInitialState) {
      console.log("Subsequent fetch triggered by filter change");
      fetchDocuments(debouncedSearchQuery, statusFilter);
    }
  }, [debouncedSearchQuery, statusFilter, fetchDocuments]);

  const documentsToDisplay = documents;

  const handleProcessingComplete = (uploadedShipments: ShipmentData[]) => {
    console.log("Processing complete, refreshing list", uploadedShipments);
    setIsUploadDialogOpen(false);
    uploaderRef.current?.reset();
    toast({ title: "Upload Complete", description: `Successfully processed ${uploadedShipments.length} shipment(s).` });
    fetchDocuments(debouncedSearchQuery, statusFilter);
  };

  const handleProcessingError = (error: Error) => {
    console.error("Processing error:", error);
    toast({ title: "Processing Error", description: error.message || "An error occurred during processing.", variant: "destructive" });
  };

  const handleDeleteDocument = useCallback(async (docId: string, filename: string | null) => {
    if (!docId) return;
    console.log(`Attempting to delete document with ID: ${docId}`);
    try {
      const response = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorDetails = "Failed to delete document";
        try { const errorData = await response.json(); errorDetails = errorData.message || errorDetails; } catch (e) { errorDetails = response.statusText || errorDetails; }
        throw new Error(errorDetails);
      }
      toast({ title: "Document Deleted", description: `Document ${filename || docId} has been deleted.` });
      fetchDocuments(debouncedSearchQuery, statusFilter);
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Error Deleting Document", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive" });
    }
  }, [fetchDocuments, debouncedSearchQuery, statusFilter]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  const handleSimulateClick = (docId: string) => {
    logger.info(`[DocumentsPage] Navigating to simulation for document: ${docId}`);
    router.push(`/simulation/${docId}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center w-full md:w-auto md:ml-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 border dark:bg-input dark:border-input dark:text-foreground w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => { setStatusFilter(value); }}
            >
              <SelectTrigger className="w-full md:w-48 border dark:bg-input dark:border-input dark:text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-popover dark:text-popover-foreground dark:border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Pickup Scheduled">Pickup Scheduled</SelectItem>
                <SelectItem value="Needs Review">Needs Review</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1 w-full md:w-auto">
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
            <Button onClick={() => fetchDocuments(debouncedSearchQuery, statusFilter)} variant="destructive" className="mt-4">Try Again</Button>
          </div>
        ) : documentsToDisplay.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documentsToDisplay.map((doc) => (
              <div key={doc.id} className="bg-card dark:bg-card rounded-lg border border-border dark:border-border shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 pb-2 relative">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={doc.shipmentSummaryStatus} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
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
                            <span className="font-semibold">&quot;{doc.filename || doc.id}&quot;</span> and its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-muted-foreground mt-0.5 flex-shrink-0" />
                    <h3 className="font-semibold text-sm truncate mb-1 pt-1 pr-8" title={doc.filename || 'No Filename'}>
                      {doc.filename || `Document ${doc.id}`}
                    </h3>
                  </div>
                </div>
                <div className="p-4 pt-1 text-xs text-muted-foreground flex justify-between items-center">
                  <span>Parsed: {formatDate(doc.dateParsed)}</span>
                  <span>{doc.shipments} Shipment(s)</span>
                </div>
                <div className="p-2 border-t border-border bg-muted/50 flex justify-end items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/shipments/${doc.id}`} aria-label={`View shipments for ${doc.filename || doc.id}`}>
                      View Shipments
                    </Link>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleSimulateClick(doc.id)}
                    aria-label={`Simulate shipments for ${doc.filename || doc.id}`}
                  >
                    Simulate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No documents found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Upload a new document to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
