"use client"

import type React from "react"

import { useState, useRef, forwardRef, useImperativeHandle } from "react"
import { Upload, File, X, FileText, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Define the ShipmentData type if not already defined elsewhere
export interface ShipmentData {
  id: string
  loadNumber: string
  orderNumber: string
  poNumber: string
  status: string
  pickupWarehouse: string
  shipToAddress: string
  shipDate: string
  requestDate: string
  contactNumber: string
  totalWeight: number
  remarks?: string
  // Add other fields as needed
}

export interface LogisticsDocumentUploaderProps {
  onProcessingStart?: () => void
  onProcessingComplete?: (shipments: ShipmentData[]) => void
  onProcessingError?: (error: Error) => void
}

export interface LogisticsDocumentUploaderRef {
  reset: () => void
}

const LogisticsDocumentUploader = forwardRef<LogisticsDocumentUploaderRef, LogisticsDocumentUploaderProps>(
  ({ onProcessingStart, onProcessingComplete, onProcessingError }, ref) => {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState<"upload" | "scan">("upload")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Expose reset method to parent components
    useImperativeHandle(ref, () => ({
      reset: () => {
        setFiles([])
      },
    }))

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files)
        setFiles((prev) => [...prev, ...newFiles])
      }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        setFiles((prev) => [...prev, ...newFiles])
      }
    }

    const handleRemoveFile = (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    /**
     * Handle document processing with simulated success
     */
    const handleProcessDocument = async () => {
      if (files.length === 0) {
        toast({
          title: "No Files Selected",
          description: "Please select at least one file to process.",
          variant: "destructive",
        })
        return
      }

      if (onProcessingStart) {
        onProcessingStart()
      }

      setIsProcessing(true)

      try {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Generate mock shipment data based on file names
        const mockShipments: ShipmentData[] = files.map((file, index) => ({
          id: `ship-${Date.now()}-${index}`,
          loadNumber: `L-${10000 + index}`,
          orderNumber: `ORD-${20000 + index}`,
          poNumber: `PO-${30000 + index}`,
          status: ["Processed", "In Transit", "Delayed"][Math.floor(Math.random() * 3)],
          pickupWarehouse: "Warehouse A",
          shipToAddress: "123 Destination St, City",
          shipDate: new Date().toISOString().split("T")[0],
          requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          contactNumber: "555-123-4567",
          totalWeight: Math.floor(Math.random() * 2000) + 500,
          remarks: `Processed from ${file.name}`,
        }))

        // Simulate success
        toast({
          title: "Processing Complete",
          description: `Successfully processed ${mockShipments.length} shipments.`,
        })

        if (onProcessingComplete) {
          onProcessingComplete(mockShipments)
        }
      } catch (error) {
        console.error("Error processing document:", error)

        toast({
          title: "Processing Error",
          description: "An error occurred while processing the document. Please try again.",
          variant: "destructive",
        })

        if (onProcessingError && error instanceof Error) {
          onProcessingError(error)
        }
      } finally {
        setIsProcessing(false)
      }
    }

    const handleScanComplete = () => {
      // Simulate a scanned document
      const mockFile = new File([""], "scanned-document.pdf", { type: "application/pdf" })
      setFiles((prev) => [...prev, mockFile])

      toast({
        title: "Document Scanned",
        description: "Scanned document has been added to your files.",
      })

      // Switch back to upload tab after successful scan
      setActiveTab("upload")
    }

    return (
      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "upload" | "scan")}
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-foreground mb-2">
                  Drag and drop your document here, or{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">Supported formats: .txt, .csv, .xls, .xlsx, .pdf</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".txt,.csv,.xls,.xlsx,.pdf"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scan" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-foreground mb-4 text-center">Position your document in front of the camera</p>
                  <Button onClick={handleScanComplete}>Capture Document</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm truncate max-w-xs text-foreground">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleProcessDocument} disabled={files.length === 0 || isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <File className="h-5 w-5 mr-2" />
                Process Document
              </>
            )}
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Processing Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Ensure the file contains all shipment details</li>
            <li>Text files (.txt) work best for automated extraction</li>
            <li>Ensure the document is properly formatted for best results</li>
            <li>For large files, processing may take a few moments</li>
          </ul>
        </div>
      </div>
    )
  },
)

LogisticsDocumentUploader.displayName = "LogisticsDocumentUploader"

export default LogisticsDocumentUploader
