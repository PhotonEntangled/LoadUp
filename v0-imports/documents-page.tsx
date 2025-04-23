"use client"

import { useState, useMemo } from "react"
import { FileText, Search, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

interface ShipmentSlipsPageProps {
  documents?: DocumentMetadata[]
}

export default function ShipmentSlipsPage({ documents = sampleDocuments }: ShipmentSlipsPageProps) {
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1F3A]">Shipment Slips</h1>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search shipments..."
                className="pl-8 bg-white border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-white border-gray-200">
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
            <Button onClick={handleUpload} className="gap-1 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90">
              <Upload className="h-4 w-4" />
              Upload Slip
            </Button>
          </div>
        </div>

        {/* Document Cards Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="overflow-hidden border border-gray-200 bg-white">
                <CardHeader className="pb-2 pt-4 relative">
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="pr-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <CardTitle className="text-base font-medium text-[#0B1F3A] line-clamp-2 break-words">
                        {doc.filename}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Date Parsed:</span>
                      <span className="font-medium">{formatDate(doc.dateParsed)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Shipments:</span>
                      <span className="font-medium">{doc.shipments} Shipments</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0B1F3A] font-medium" asChild>
                    <Link href={`/shipments/${doc.id}`}>View Shipments</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-[#0B1F3A]">No shipment slips found</h3>
            <p className="text-gray-500 mt-1">
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
        <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium min-w-[80px] text-center text-xs md:text-sm whitespace-nowrap px-2">
          {status}
        </Badge>
      )
    case "processing":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium min-w-[80px] text-center text-xs md:text-sm whitespace-nowrap px-2">
          {status}
        </Badge>
      )
    case "error":
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium min-w-[80px] text-center text-xs md:text-sm whitespace-nowrap px-2">
          {status}
        </Badge>
      )
    default:
      return <Badge className="min-w-[80px] text-center text-xs md:text-sm whitespace-nowrap px-2">{status}</Badge>
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
