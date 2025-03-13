"use client";

import { Card } from "@/components/shared/Card";
import { FileText, Upload, Search, CheckCircle, XCircle } from "lucide-react";

const mockDocuments = [
  {
    id: "1",
    fileName: "Invoice_123456.pdf",
    type: "Invoice",
    uploadedAt: "2024-03-14T10:30:00",
    status: "PROCESSED",
    shipmentId: "SHIP-001",
    processedData: {
      invoiceNumber: "INV-123456",
      amount: "$1,250.00",
      date: "2024-03-14",
    },
  },
  {
    id: "2",
    fileName: "BOL_789012.pdf",
    type: "Bill of Lading",
    uploadedAt: "2024-03-14T11:15:00",
    status: "PROCESSING",
    shipmentId: "SHIP-002",
  },
];

export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and process shipping documents
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center space-x-2 border rounded-lg px-3 py-2 mb-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="flex-1 outline-none bg-transparent"
              />
            </div>

            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {doc.fileName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doc.type} • Shipment {doc.shipmentId}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                            doc.status === "PROCESSED"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {doc.status === "PROCESSED" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border-2 border-blue-800 border-t-transparent animate-spin" />
                          )}
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                      </p>
                      {doc.processedData && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4">
                          {Object.entries(doc.processedData).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-sm font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* OCR Preview */}
        <Card className="lg:col-span-1 p-4 min-h-[600px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Document Preview
          </h2>
          <div className="h-full rounded-lg bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Select a document to preview</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 