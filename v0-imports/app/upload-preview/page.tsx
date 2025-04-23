"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import LogisticsDocumentUploader from "@/components/logistics/LogisticsDocumentUploader"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function UploadPreviewPage() {
  // State for dialog visibility
  const [isOpen, setIsOpen] = useState(true)
  const { theme, setTheme } = useTheme()

  // Handle processing completion
  const handleProcessingComplete = (shipments) => {
    console.log("Processing complete:", shipments)

    toast({
      title: "Upload Complete",
      description: `Successfully processed ${shipments.length} shipments.`,
    })
  }

  // Handle processing errors
  const handleProcessingError = (error) => {
    console.error("Processing error:", error)

    toast({
      title: "Processing Error",
      description: error.message || "An error occurred during processing.",
      variant: "destructive",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Document Uploader Preview</h1>

      {/* Theme toggle buttons */}
      <div className="flex gap-4 mb-6">
        <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
          Light Mode
        </Button>
        <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
          Dark Mode
        </Button>
        <Button variant="outline" onClick={() => setIsOpen(true)} className="ml-auto">
          Open Dialog
        </Button>
      </div>

      {/* Dialog with uploader component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Shipment Document</DialogTitle>
            <DialogDescription>
              Select or drag & drop your shipment files here. Processing will begin automatically.
            </DialogDescription>
          </DialogHeader>

          <LogisticsDocumentUploader
            onProcessingComplete={handleProcessingComplete}
            onProcessingError={handleProcessingError}
          />
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      <div className="mt-8 p-6 border rounded-lg bg-muted">
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <p className="mb-4">
          This page demonstrates the LogisticsDocumentUploader component inside a Dialog. You can toggle between light
          and dark modes using the buttons above.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The dialog is hardcoded to be open by default</li>
          <li>Try uploading files by dragging and dropping or using the browse button</li>
          <li>Test the "Scan Document" tab to see the scanning interface</li>
          <li>Click "Process Document" to see the simulated processing flow</li>
          <li>Toast notifications will appear on success or error</li>
        </ul>
      </div>

      {/* Toaster component for displaying toast notifications */}
      <Toaster />
    </div>
  )
}
