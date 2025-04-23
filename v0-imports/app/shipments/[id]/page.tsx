"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShipmentDetailView from "@/components/shipments/ShipmentDetailView"
import Link from "next/link"
import type { ApiShipmentDetail } from "../../../types/api"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { StaticRouteMap } from "@/components/map/StaticRouteMap"

// Define the StatusBadge component directly in this file
const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null

  const statusLower = status.toLowerCase()

  return (
    <Badge
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        statusLower === "processed" || statusLower === "delivered"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : statusLower === "in transit"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            : statusLower === "delayed" || statusLower === "exception"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
      )}
    >
      {status}
    </Badge>
  )
}

// Helper function to format dates
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

// Change the single mockShipmentDetail to an array of mock shipments
const mockShipments: ApiShipmentDetail[] = [
  {
    coreInfo: {
      id: "ship-123",
      documentId: "doc-1",
      loadNumber: "MOCK-L-doc-1-1",
      orderNumber: "ORD-9876",
      poNumber: "PO-5544",
      status: "In Transit",
      totalWeight: 1250,
      totalWeightUnit: "kg",
      totalVolume: 12.5,
      totalVolumeUnit: "cu ft",
      totalItems: 30,
      promisedShipDate: "2025-03-15",
      plannedDeliveryDate: "2025-03-16",
      actualPickupArrival: "2025-03-15T10:30:00Z",
      actualPickupDeparture: "2025-03-15T11:45:00Z",
      actualDeliveryArrival: null,
      actualDeliveryDeparture: null,
    },
    originAddress: {
      rawInput: "Warehouse A - 123 Main St",
      name: "Warehouse A",
      street: "123 Main Street",
      city: "Seattle",
      stateProvince: "WA",
      postalCode: "98101",
      country: "USA",
      fullAddress: "123 Main Street, Seattle, WA 98101, USA",
      latitude: 47.6062,
      longitude: -122.3321,
      resolutionMethod: "direct",
      resolutionConfidence: 0.95,
      resolvedTimestamp: "2025-03-10T12:00:00Z",
    },
    destinationAddress: {
      rawInput: "456 Elm St, Customer B",
      name: "Customer B Headquarters",
      street: "456 Elm Street",
      city: "Portland",
      stateProvince: "OR",
      postalCode: "97201",
      country: "USA",
      fullAddress: "456 Elm Street, Portland, OR 97201, USA",
      latitude: 45.5152,
      longitude: -122.6784,
      resolutionMethod: "geocode",
      resolutionConfidence: 0.8,
      resolvedTimestamp: "2025-03-10T12:05:00Z",
    },
    shipper: {
      contactName: "John Smith",
      contactNumber: "555-123-4567",
      contactEmail: "john.smith@warehousea.com",
    },
    recipient: {
      contactName: "Jane Doe",
      contactNumber: "555-987-6543",
      contactEmail: "jane.doe@customerb.com",
    },
    items: [
      {
        id: "item-001",
        description: "Glass Panels",
        quantity: 10,
        sku: "GP-001",
        weight: 500,
        weightUnit: "kg",
        dimensions: {
          length: 48,
          width: 24,
          height: 0.5,
          unit: "in",
        },
        hsCode: "7005.29",
        lotSerialNumber: "LOT-A1",
        uom: "pcs",
        bin: "A-101",
      },
      {
        id: "item-002",
        description: "Wooden Frames",
        quantity: 20,
        sku: "WF-002",
        weight: 750,
        weightUnit: "kg",
        dimensions: {
          length: 50,
          width: 26,
          height: 2,
          unit: "in",
        },
        hsCode: "4418.10",
        lotSerialNumber: "LOT-B2",
        uom: "pcs",
        bin: "B-202",
      },
    ],
    customDetails: {
      transporter: {
        carrierName: "Acme Transport",
        truckId: "ABC-123",
        trailerId: "TR-456",
        driverName: "Mike Johnson",
        driverCell: "555-111-2222",
        mcNumber: "MC-789456",
        dotNumber: "DOT-123456",
      },
      tripRate: {
        rate: 1250.0,
        currency: "USD",
        dropCharge: 175.5,
        manpowerCharge: 75.0,
        otherCharges: [
          {
            description: "Toll Fees",
            amount: 45.75,
            currency: "USD",
          },
          {
            description: "Special Handling",
            amount: 125.0,
            currency: "USD",
          },
        ],
      },
      billingInfo: {
        billToAddressId: "addr-789",
        paymentTerms: "Net 30",
      },
    },
    metadata: {
      createdAt: "2025-03-10T08:30:00Z",
      updatedAt: "2025-03-15T14:45:00Z",
      sourceFilename: "Shipments-March.xlsx",
      dataSource: "ERP Import",
      remarks:
        "Handle with care, fragile items included. Customer requested delivery notification 1 hour prior to arrival.",
    },
  },
  {
    coreInfo: {
      id: "ship-456",
      documentId: "doc-1",
      loadNumber: "MOCK-L-doc-1-2",
      orderNumber: "ORD-5432",
      poNumber: "PO-7788",
      status: "Processed",
      totalWeight: 850,
      totalWeightUnit: "kg",
      totalVolume: 8.3,
      totalVolumeUnit: "cu ft",
      totalItems: 15,
      promisedShipDate: "2025-03-12",
      plannedDeliveryDate: "2025-03-14",
      actualPickupArrival: "2025-03-12T09:15:00Z",
      actualPickupDeparture: "2025-03-12T10:30:00Z",
      actualDeliveryArrival: "2025-03-14T13:45:00Z",
      actualDeliveryDeparture: "2025-03-14T14:30:00Z",
    },
    originAddress: {
      rawInput: "Distribution Center 5",
      name: "Distribution Center 5",
      street: "789 Industrial Blvd",
      city: "Chicago",
      stateProvince: "IL",
      postalCode: "60607",
      country: "USA",
      fullAddress: "789 Industrial Blvd, Chicago, IL 60607, USA",
      latitude: 41.8781,
      longitude: -87.6298,
      resolutionMethod: "manual",
      resolutionConfidence: 1.0,
      resolvedTimestamp: "2025-03-08T10:15:00Z",
    },
    destinationAddress: {
      rawInput: "Customer C, 101 Commerce Ave",
      name: "Customer C Headquarters",
      street: "101 Commerce Avenue",
      city: "Detroit",
      stateProvince: "MI",
      postalCode: "48226",
      country: "USA",
      fullAddress: "101 Commerce Avenue, Detroit, MI 48226, USA",
      latitude: 42.3314,
      longitude: -83.0458,
      resolutionMethod: "direct",
      resolutionConfidence: 0.9,
      resolvedTimestamp: "2025-03-08T10:20:00Z",
    },
    shipper: {
      contactName: "Robert Johnson",
      contactNumber: "555-222-3333",
      contactEmail: "robert.johnson@distributioncenter5.com",
    },
    recipient: {
      contactName: "Sarah Williams",
      contactNumber: "555-444-5555",
      contactEmail: "sarah.williams@customerc.com",
    },
    items: [
      {
        id: "item-101",
        description: "Heavy Machinery Parts",
        quantity: 5,
        sku: "HMP-101",
        weight: 500,
        weightUnit: "kg",
        dimensions: {
          length: 36,
          width: 24,
          height: 12,
          unit: "in",
        },
        hsCode: "8431.49",
        lotSerialNumber: "LOT-M1",
        uom: "pcs",
        bin: "C-301",
      },
      {
        id: "item-102",
        description: "Electronics",
        quantity: 10,
        sku: "EL-102",
        weight: 350,
        weightUnit: "kg",
        dimensions: {
          length: 24,
          width: 18,
          height: 6,
          unit: "in",
        },
        hsCode: "8517.62",
        lotSerialNumber: "LOT-E2",
        uom: "pcs",
        bin: "D-402",
      },
    ],
    customDetails: {
      transporter: {
        carrierName: "Beta Logistics",
        truckId: "XYZ-789",
        trailerId: "TR-101",
        driverName: "Lisa Brown",
        driverCell: "555-666-7777",
        mcNumber: "MC-654321",
        dotNumber: "DOT-987654",
      },
      tripRate: {
        rate: 950.0,
        currency: "USD",
        dropCharge: 125.0,
        manpowerCharge: 65.0,
        otherCharges: [
          {
            description: "Weekend Delivery",
            amount: 85.0,
            currency: "USD",
          },
        ],
      },
      billingInfo: {
        billToAddressId: "addr-456",
        paymentTerms: "Net 15",
      },
    },
    metadata: {
      createdAt: "2025-03-08T11:45:00Z",
      updatedAt: "2025-03-14T15:30:00Z",
      sourceFilename: "Shipments-March.xlsx",
      dataSource: "ERP Import",
      remarks: "Expedited delivery requested. Signature required upon delivery.",
    },
  },
]

// Update the component to handle multiple shipments
export default function ShipmentDetailPage() {
  const params = useParams()
  const [shipments, setShipments] = useState<ApiShipmentDetail[]>([])
  const [selectedShipment, setSelectedShipment] = useState<ApiShipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call like:
    // fetch(`/api/documents/${params.id}/shipments`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setShipments(data);
    //     if (data.length > 0) setSelectedShipment(data[0]);
    //     setLoading(false);
    //   });

    // For the mock, we'll just use our static data
    setTimeout(() => {
      setShipments(mockShipments)
      if (mockShipments.length > 0) setSelectedShipment(mockShipments[0])
      setLoading(false)
    }, 500) // Simulate loading delay
  }, [params.id])

  const handleSelectShipment = (shipment: ApiShipmentDetail) => {
    setSelectedShipment(shipment)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="h-4 w-40 bg-muted rounded"></div>
          <div className="h-[1px] bg-border"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (shipments.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Shipments Found</h2>
          <p className="text-muted-foreground mb-6">No shipments were found for this document.</p>
          <Button asChild>
            <Link href="/shipments">Back to Shipments</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/shipments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipments
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-2">Shipments for Document ID: {params.id}</h1>
        <p className="text-muted-foreground">{shipments.length} shipments found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Shipment List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
            <h2 className="text-lg font-semibold mb-3">Shipment List</h2>
          </div>

          {shipments.map((shipment) => (
            <div
              key={shipment.coreInfo.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors",
                selectedShipment?.coreInfo.id === shipment.coreInfo.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
              onClick={() => handleSelectShipment(shipment)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Load #{shipment.coreInfo.loadNumber}</h3>
                <StatusBadge status={shipment.coreInfo.status} />
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Order #{shipment.coreInfo.orderNumber}{" "}
                {shipment.coreInfo.poNumber && `• PO #${shipment.coreInfo.poNumber}`}
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Origin</p>
                  <p>
                    {shipment.originAddress?.city}, {shipment.originAddress?.stateProvince}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p>
                    {shipment.destinationAddress?.city}, {shipment.destinationAddress?.stateProvince}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Date</p>
                  <p>{formatDate(shipment.coreInfo.plannedDeliveryDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p>{shipment.coreInfo.totalItems || shipment.items.length} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shipment Detail View and Map */}
        <div className="w-full lg:w-2/3 space-y-6">
          {selectedShipment ? (
            <>
              {/* Map Preview */}
              <div className="border rounded-lg p-4 bg-card">
                <h3 className="text-sm font-medium mb-2">Route Map</h3>

                <StaticRouteMap
                  routeGeometry={null}
                  originCoordinates={
                    selectedShipment?.originAddress?.latitude && selectedShipment?.originAddress?.longitude
                      ? [selectedShipment.originAddress.longitude, selectedShipment.originAddress.latitude]
                      : [-122.3321, 47.6062]
                  } // Default to Seattle coordinates
                  destinationCoordinates={
                    selectedShipment?.destinationAddress?.latitude && selectedShipment?.destinationAddress?.longitude
                      ? [selectedShipment.destinationAddress.longitude, selectedShipment.destinationAddress.latitude]
                      : [-122.6784, 45.5152]
                  } // Default to Portland coordinates
                  lastKnownPosition={null}
                  mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
                  height={200}
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm truncate">
                      {selectedShipment?.originAddress?.city}, {selectedShipment?.originAddress?.stateProvince}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm truncate">
                      {selectedShipment?.destinationAddress?.city},{" "}
                      {selectedShipment?.destinationAddress?.stateProvince}
                    </span>
                  </div>
                </div>

                <Button size="sm" className="w-full">
                  Open Full Tracking
                </Button>
              </div>

              {/* Shipment Detail View */}
              <ShipmentDetailView shipment={selectedShipment} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-medium mb-2">Select a Shipment</h3>
              <p className="text-muted-foreground text-center">
                Please select a shipment from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
