"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPinned, ArrowLeft, ArrowRight, Search, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ShipmentCard from "@/components/shipments/ShipmentCard"

// Mock data - this would typically come from an API call based on the documentId
const mockShipments = [
  {
    shipmentId: "ship1",
    loadNumber: "L-12345",
    orderNumber: "ORD-9876",
    poNumber: "PO-5544",
    status: "Processed",
    pickupWarehouse: "Warehouse A - 123 Main St",
    pickupLocationDetails: {
      rawInput: "Warehouse A - 123 Main St",
      resolvedAddress: "123 Main Street, Seattle, WA 98101",
      latitude: 47.6062,
      longitude: -122.3321,
      resolutionMethod: "direct",
      resolutionConfidence: 0.95,
    },
    shipToAddress: "456 Elm St, Customer B",
    destinationLocation: {
      rawInput: "456 Elm St, Customer B",
      resolvedAddress: "456 Elm Street, Portland, OR 97201",
      latitude: 45.5152,
      longitude: -122.6784,
      resolutionMethod: "estimated",
      resolutionConfidence: 0.8,
    },
    shipToArea: "Northwest",
    shipDate: "2025-03-15",
    requestDate: "2025-03-10",
    contactNumber: "555-123-4567",
    totalWeight: 1250,
    remarks: "Handle with care, fragile items included.",
    needsReview: false,
    items: [
      {
        itemId: "ITM-001",
        itemNumber: "ITM-001",
        description: "Glass Panels",
        quantity: 10,
        weight: 500,
        lotNumber: "LOT-A1",
      },
      {
        itemId: "ITM-002",
        itemNumber: "ITM-002",
        description: "Wooden Frames",
        quantity: 20,
        weight: 750,
        lotNumber: "LOT-B2",
      },
    ],
    miscellaneousFields: {
      "Driver Notes": "Call before delivery",
      "Special Instructions": "Use rear entrance",
    },
    sourceInfo: {
      sheetName: "March Shipments",
      rowIndex: 5,
      fileName: "Shipments-March.xlsx",
    },
    pickupLocation: {
      fullAddress: "123 Main Street, Seattle, WA 98101",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "USA",
    },
    destinationLocation: {
      fullAddress: "456 Elm Street, Portland, OR 97201",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
    },
    plannedDeliveryDate: "2025-03-16",
    tripId: "TRIP-001",
    tripInfo: {
      truckRegistration: "ABC-123",
      transporterName: "Acme Transport",
    },
    podInfo: {
      podReturned: true,
      podUrl: "https://example.com/pod.pdf",
    },
    totalWeight: 1250,
    plannedPickupDate: "2025-03-14",
    estimatedPickupArrival: "2025-03-14T10:00:00Z",
    actualPickupArrival: "2025-03-14T11:00:00Z",
    estimatedDeliveryArrival: "2025-03-16T14:00:00Z",
    actualDeliveryArrival: "2025-03-16T15:00:00Z",
    manpower: 2,
    specialRequirements: "Fragile, handle with care",
    isHazardous: false,
    equipment: {
      liftgate: true,
      palletJack: false,
    },
  },
  {
    shipmentId: "ship2",
    loadNumber: "L-12346",
    orderNumber: "ORD-9877",
    poNumber: "PO-5545",
    status: "In Transit",
    pickupWarehouse: "Distribution Center 5",
    pickupLocationDetails: {
      rawInput: "Distribution Center 5",
      resolvedAddress: "789 Industrial Blvd, Chicago, IL 60607",
      latitude: 41.8781,
      longitude: -87.6298,
      resolutionMethod: "manual",
      resolutionConfidence: 1.0,
    },
    shipToAddress: "Customer C, 101 Commerce Ave",
    destinationLocation: {
      rawInput: "Customer C, 101 Commerce Ave",
      resolvedAddress: "101 Commerce Avenue, Detroit, MI 48226",
      latitude: 42.3314,
      longitude: -83.0458,
      resolutionMethod: "direct",
      resolutionConfidence: 0.9,
    },
    shipToArea: "Midwest",
    shipDate: "2025-03-20",
    requestDate: "2025-03-12",
    contactNumber: "555-987-6543",
    totalWeight: 3000,
    remarks: "Expedited delivery requested",
    needsReview: true,
    items: [
      {
        itemId: "ITM-101",
        itemNumber: "ITM-101",
        description: "Heavy Machinery Parts",
        quantity: 5,
        weight: 2000,
        lotNumber: "LOT-M1",
      },
      {
        itemId: "ITM-102",
        itemNumber: "ITM-102",
        description: "Electronics",
        quantity: 50,
        weight: 1000,
        lotNumber: "LOT-E2",
      },
    ],
    miscellaneousFields: {
      "Loading Dock": "Dock #3",
      "Insurance Value": "$25,000",
    },
    sourceInfo: {
      sheetName: "March Shipments",
      rowIndex: 6,
      fileName: "Shipments-March.xlsx",
    },
    lastKnownLocation: {
      location: "Indianapolis, IN",
      timestamp: "2025-03-22T14:30:00Z",
      latitude: 39.7684,
      longitude: -86.1581,
    },
    pickupLocation: {
      fullAddress: "789 Industrial Blvd, Chicago, IL 60607",
      city: "Chicago",
      state: "IL",
      postalCode: "60607",
      country: "USA",
    },
    destinationLocation: {
      fullAddress: "101 Commerce Avenue, Detroit, MI 48226",
      city: "Detroit",
      state: "MI",
      postalCode: "48226",
      country: "USA",
    },
    plannedDeliveryDate: "2025-03-22",
    tripId: "TRIP-002",
    tripInfo: {
      truckRegistration: "XYZ-789",
      transporterName: "Beta Logistics",
    },
    podInfo: {
      podReturned: false,
      podUrl: null,
    },
    totalWeight: 3000,
    plannedPickupDate: "2025-03-19",
    estimatedPickupArrival: "2025-03-19T08:00:00Z",
    actualPickupArrival: "2025-03-19T09:00:00Z",
    estimatedDeliveryArrival: "2025-03-22T16:00:00Z",
    actualDeliveryArrival: null,
    manpower: 3,
    specialRequirements: "Requires forklift",
    isHazardous: true,
    equipment: {
      liftgate: false,
      palletJack: true,
    },
  },
  {
    shipmentId: "ship3",
    loadNumber: "L-12347",
    orderNumber: "ORD-9878",
    poNumber: "PO-5546",
    status: "Delayed",
    pickupWarehouse: "Warehouse B - South Campus",
    pickupLocationDetails: {
      rawInput: "Warehouse B - South Campus",
      resolvedAddress: "",
      latitude: null,
      longitude: null,
      resolutionMethod: "none",
      resolutionConfidence: 0,
    },
    shipToAddress: "789 Park Ave, Client D",
    destinationLocation: {
      rawInput: "789 Park Ave, Client D",
      resolvedAddress: "789 Park Avenue, New York, NY 10021",
      latitude: 40.7731,
      longitude: -73.9642,
      resolutionMethod: "estimated",
      resolutionConfidence: 0.7,
    },
    shipToArea: "Northeast",
    shipDate: "2025-03-25",
    requestDate: "2025-03-18",
    contactNumber: "555-555-1212",
    totalWeight: 750,
    remarks:
      "Weather delay expected due to storm in transit route. This is a longer remark to demonstrate how text truncation and expansion works in the UI for longer content entries.",
    needsReview: true,
    items: [
      {
        itemId: "ITM-201",
        itemNumber: "ITM-201",
        description: "Medical Supplies",
        quantity: 100,
        weight: 500,
        lotNumber: "LOT-MS5",
      },
      {
        itemId: "ITM-202",
        itemNumber: "ITM-202",
        description: "Pharmaceuticals",
        quantity: 50,
        weight: 250,
        lotNumber: "LOT-PH2",
      },
    ],
    miscellaneousFields: {
      "Temperature Requirements": "2-8°C",
      "Validation Required": "Yes",
      "Client Contract": "C-5567",
    },
    sourceInfo: {
      sheetName: "March Shipments",
      rowIndex: 7,
      fileName: "Shipments-March.xlsx",
    },
    pickupLocation: {
      fullAddress: "Warehouse B - South Campus",
      city: "Somecity",
      state: "CA",
      postalCode: "91234",
      country: "USA",
    },
    destinationLocation: {
      fullAddress: "789 Park Avenue, New York, NY 10021",
      city: "New York",
      state: "NY",
      postalCode: "10021",
      country: "USA",
    },
    plannedDeliveryDate: "2025-03-27",
    tripId: "TRIP-003",
    tripInfo: {
      truckRegistration: "DEF-456",
      transporterName: "Gamma Shipping",
    },
    podInfo: {
      podReturned: false,
      podUrl: null,
    },
    totalWeight: 750,
    plannedPickupDate: "2025-03-24",
    estimatedPickupArrival: "2025-03-24T12:00:00Z",
    actualPickupArrival: null,
    estimatedDeliveryArrival: "2025-03-27T18:00:00Z",
    actualDeliveryArrival: null,
    manpower: 1,
    specialRequirements: "Temperature controlled",
    isHazardous: false,
    equipment: {
      liftgate: false,
      palletJack: false,
    },
  },
]

// This is a simple debounce implementation
function useDebounce(callback, delay) {
  const timeoutRef = useState(null)[0]

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay, timeoutRef],
  )
}

export default function ShipmentDetailPage({ documentId }) {
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [expandedCards, setExpandedCards] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredShipments, setFilteredShipments] = useState([])

  // Fetch shipments data for the document
  useEffect(() => {
    // In a real app, this would be an API call like:
    // fetch(`/api/documents/${documentId}/shipments`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setShipments(data);
    //     if (data.length > 0) setSelectedShipment(data[0]);
    //   });

    // For the mock, we'll just use our static data
    setShipments(mockShipments)
    if (mockShipments.length > 0) setSelectedShipment(mockShipments[0])
  }, [documentId])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredShipments(shipments)
      return
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim()

    const filtered = shipments.filter((shipment) => {
      // Helper function to check if a value contains the search term
      const containsSearchTerm = (value) => {
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(normalizedSearchTerm)
      }

      // Check top-level fields
      if (
        containsSearchTerm(shipment.loadNumber) ||
        containsSearchTerm(shipment.orderNumber) ||
        containsSearchTerm(shipment.poNumber) ||
        containsSearchTerm(shipment.status) ||
        containsSearchTerm(shipment.pickupWarehouse) ||
        containsSearchTerm(shipment.shipToAddress) ||
        containsSearchTerm(shipment.shipToArea) ||
        containsSearchTerm(shipment.shipDate) ||
        containsSearchTerm(shipment.requestDate) ||
        containsSearchTerm(shipment.contactNumber) ||
        containsSearchTerm(shipment.totalWeight) ||
        containsSearchTerm(shipment.remarks)
      ) {
        return true
      }

      // Check pickup location details
      if (
        containsSearchTerm(shipment.pickupLocationDetails?.rawInput) ||
        containsSearchTerm(shipment.pickupLocationDetails?.resolvedAddress) ||
        containsSearchTerm(shipment.pickupLocationDetails?.resolutionMethod)
      ) {
        return true
      }

      // Check destination location details
      if (
        containsSearchTerm(shipment.destinationLocation?.rawInput) ||
        containsSearchTerm(shipment.destinationLocation?.resolvedAddress) ||
        containsSearchTerm(shipment.destinationLocation?.resolutionMethod)
      ) {
        return true
      }

      // Check items
      if (
        shipment.items?.some(
          (item) =>
            containsSearchTerm(item.itemNumber) ||
            containsSearchTerm(item.description) ||
            containsSearchTerm(item.quantity) ||
            containsSearchTerm(item.weight) ||
            containsSearchTerm(item.lotNumber),
        )
      ) {
        return true
      }

      // Check miscellaneous fields
      if (shipment.miscellaneousFields) {
        for (const [key, value] of Object.entries(shipment.miscellaneousFields)) {
          if (containsSearchTerm(key) || containsSearchTerm(value)) {
            return true
          }
        }
      }

      // Check source info
      if (
        containsSearchTerm(shipment.sourceInfo?.sheetName) ||
        containsSearchTerm(shipment.sourceInfo?.rowIndex) ||
        containsSearchTerm(shipment.sourceInfo?.fileName)
      ) {
        return true
      }

      return false
    })

    setFilteredShipments(filtered)
  }, [searchTerm, shipments])

  const toggleCardExpansion = (shipmentId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [shipmentId]: !prev[shipmentId],
    }))
  }

  const handleDownload = (shipment, format) => {
    // In a real app, this would trigger the actual download logic
    console.log(`Downloading shipment ${shipment.shipmentId} as ${format}`)
  }

  const handleEdit = (shipment) => {
    // In a real app, this would navigate to an edit page or open an edit modal
    console.log(`Editing shipment ${shipment.shipmentId}`)
  }

  const handleSearchChange = useDebounce((e) => {
    setSearchTerm(e.target.value)
  }, 300)

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Shipment List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Shipment Details</h1>
              <p className="text-muted-foreground">
                Document ID: {documentId} • {shipments.length} shipments found
              </p>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>

            <Input
              type="text"
              placeholder="Search shipments by any field..."
              className="pl-10 pr-10 bg-card border-input"
              onChange={(e) => handleSearchChange(e)}
              defaultValue={searchTerm}
            />

            {searchTerm && (
              <button className="absolute inset-y-0 right-3 flex items-center" onClick={() => setSearchTerm("")}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {filteredShipments.length > 0 ? (
            filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment.shipmentId}
                shipment={shipment}
                isExpanded={!!expandedCards[shipment.shipmentId]}
                isSelected={selectedShipment?.shipmentId === shipment.shipmentId}
                onToggleExpand={toggleCardExpansion}
                onSelectShipment={setSelectedShipment}
                onDownload={handleDownload}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-border rounded-lg bg-card">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipments found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                We couldn't find any shipments matching "{searchTerm}". Try adjusting your search terms or clearing the
                search.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="w-96 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Map Preview</h2>
          <p className="text-sm text-muted-foreground">
            {selectedShipment ? `Showing route for Load #${selectedShipment.loadNumber}` : "Select a shipment to view"}
          </p>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {selectedShipment ? (
            <div className="h-full">
              <div className="bg-muted rounded-lg border border-border overflow-hidden h-[300px] mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-muted-foreground font-medium">Map Preview</div>
                </div>

                {/* Origin-Destination Line */}
                <div className="absolute left-0 right-0 top-1/2 flex items-center justify-between px-8">
                  <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-200/30 z-10"></div>
                  <div className="h-1 bg-indigo-400/70 flex-1 mx-4"></div>
                  <div className="h-4 w-4 rounded-full bg-red-500 ring-4 ring-red-200/30 z-10"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs text-foreground truncate">
                      {selectedShipment.pickupLocation.city && selectedShipment.pickupLocation.state
                        ? `${selectedShipment.pickupLocation.city}, ${selectedShipment.pickupLocation.state}`
                        : selectedShipment.pickupLocation.fullAddress || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs text-foreground truncate">
                      {selectedShipment.destinationLocation.city && selectedShipment.destinationLocation.state
                        ? `${selectedShipment.destinationLocation.city}, ${selectedShipment.destinationLocation.state}`
                        : selectedShipment.destinationLocation.fullAddress || "N/A"}
                    </span>
                  </div>
                </div>

                {selectedShipment.lastKnownLocation && (
                  <div className="border-t border-border pt-2">
                    <p className="text-xs font-medium text-foreground">Last Known Location:</p>
                    <p className="text-xs text-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-purple-500" />
                      {selectedShipment.lastKnownLocation.location}
                    </p>
                  </div>
                )}

                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  🔍 Open Full Tracking
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted rounded-lg border border-border border-dashed">
              <div className="text-center">
                <MapPinned className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a shipment to view its route</p>
              </div>
            </div>
          )}
        </div>

        {selectedShipment && (
          <div className="border-t border-border p-4">
            <div className="flex justify-between">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
