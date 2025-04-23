"use client"

import { useState, useMemo } from "react"
import { FileText, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the DocumentMetadata type
export interface DocumentMetadata {
  id: string
  filename: string
  dateParsed: string
  shipments: number
  status: "Processed" | "Processing" | "Error"
}

// Sample data for shipment slips
const sampleDocuments: DocumentMetadata[] = [
  {
    id: "doc-1",
    filename: "march_shipments.csv",
    dateParsed: "2025-03-25",
    shipments: 24,
    status: "Processed",
  },
  {
    id: "doc-2",
    filename: "international_orders.xlsx",
    dateParsed: "2025-03-27",
    shipments: 18,
    status: "Processing",
  },
  {
    id: "doc-3",
    filename: "domestic_deliveries.csv",
    dateParsed: "2025-03-28",
    shipments: 42,
    status: "Processed",
  },
  {
    id: "doc-4",
    filename: "express_shipments.xlsx",
    dateParsed: "2025-03-29",
    shipments: 15,
    status: "Error",
  },
  {
    id: "doc-5",
    filename: "warehouse_transfers.csv",
    dateParsed: "2025-03-29",
    shipments: 8,
    status: "Processed",
  },
]

interface DocumentsPageProps {
  documents?: DocumentMetadata[]
}

export default function DocumentsPage({ documents = sampleDocuments }: DocumentsPageProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter documents based on selected filter and search query
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Status filter
      const statusMatch = statusFilter === "all" || doc.status.toLowerCase() === statusFilter.toLowerCase()

      // Search filter (case insensitive)
      const searchMatch = searchQuery === "" || doc.filename.toLowerCase().includes(searchQuery.toLowerCase())

      return statusMatch && searchMatch
    })
  }, [documents, statusFilter, searchQuery])

  // Handle file upload (stubbed)
  const handleUpload = () => {
    console.log("Upload functionality would open here")
    // This would typically open a file picker or modal
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Shipment Slips</h1>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search shipments..."
                className="pl-8 bg-card border-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-card border-input">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            {/* Upload Button */}
            <Button onClick={handleUpload} className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Upload Slip
            </Button>
          </div>
        </div>

        {/* Document Cards Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 relative">
                  <div className="flex justify-end mb-2">
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <h3 className="text-base font-medium line-clamp-2 break-words">{doc.filename}</h3>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date Parsed:</span>
                      <span className="font-medium">{formatDate(doc.dateParsed)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipments:</span>
                      <span className="font-medium">{doc.shipments} Shipments</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
                    asChild
                  >
                    <Link href={`/shipments/${doc.id}`}>View Shipments</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card border rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No shipment slips found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Upload a shipment slip to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for status badges
function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "processed":
      return (
        <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {status}
        </span>
      )
    case "processing":
      return (
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {status}
        </span>
      )
    case "error":
      return (
        <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {status}
        </span>
      )
    default:
      return (
        <span className="bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {status}
        </span>
      )
  }
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
