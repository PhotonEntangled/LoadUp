"use client"

import React from "react"
import { useState } from "react"
import {
  MapPin,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Download,
  Edit,
  Truck,
  Package,
  Calendar,
  Users,
  DollarSign,
  FileText,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ApiShipmentDetail, ApiAddressDetail, ApiContact } from "@/types/api"

interface ShipmentDetailViewProps {
  shipment: ApiShipmentDetail
}

// Resolution method icons
const ResolutionIcon = ({ method }: { method: string | null }) => {
  switch (method) {
    case "direct":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "geocode":
    case "partial":
      return <HelpCircle className="h-4 w-4 text-amber-500" />
    case "manual":
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-red-500" />
  }
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

// Helper function to format currency
function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount === null) return "N/A"

  const currencyCode = currency || "USD"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Status badge component
const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null

  const statusLower = status.toLowerCase()

  return (
    <Badge
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        statusLower === "processed" || statusLower === "delivered" || statusLower === "completed"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : statusLower === "in transit"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            : statusLower === "delayed" || statusLower === "exception" || statusLower === "error"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              : statusLower === "awaiting_status"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
      )}
    >
      {statusLower === 'awaiting_status' ? 'Awaiting Status' : status}
    </Badge>
  )
}

// Overview Tab Component
const OverviewTab = ({ shipment }: { shipment: ApiShipmentDetail }) => {
  return (
    <div className="space-y-6">
      {/* Remarks Section */}
      {shipment.metadata.remarks && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Remarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{shipment.metadata.remarks}</p>
          </CardContent>
        </Card>
      )}

      {/* Shipment Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Package className="h-4 w-4" />
            Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Order Number</p>
              <p className="text-sm">{shipment.coreInfo.orderNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">PO Number</p>
              <p className="text-sm">{shipment.coreInfo.poNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Weight</p>
              <p className="text-sm">
                {shipment.coreInfo.totalWeight
                  ? `${shipment.coreInfo.totalWeight} ${shipment.coreInfo.totalWeightUnit || "kg"}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Volume</p>
              <p className="text-sm">
                {shipment.coreInfo.totalVolume
                  ? `${shipment.coreInfo.totalVolume} ${shipment.coreInfo.totalVolumeUnit || "cu ft"}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Items</p>
              <p className="text-sm">{shipment.coreInfo.totalItems || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{formatDate(shipment.metadata.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Updated At</p>
              <p className="text-sm">{formatDate(shipment.metadata.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Source</p>
              <p className="text-sm">{shipment.metadata.sourceFilename || shipment.metadata.dataSource || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Key Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Promised Ship Date</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.promisedShipDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Planned Delivery Date</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.plannedDeliveryDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Actual Pickup Arrival</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.actualPickupArrival)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Actual Pickup Departure</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.actualPickupDeparture)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Actual Delivery Arrival</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.actualDeliveryArrival)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Actual Delivery Departure</p>
              <p className="text-sm">{formatDate(shipment.coreInfo.actualDeliveryDeparture)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Location Details Tab Component
const LocationDetailsTab = ({ shipment }: { shipment: ApiShipmentDetail }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Origin Address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Origin Details
            {shipment.originAddress?.resolutionMethod && (
              <span className="ml-auto">
                <ResolutionIcon method={shipment.originAddress.resolutionMethod} />
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressDetails address={shipment.originAddress} />
        </CardContent>
      </Card>

      {/* Destination Address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Destination Details
            {shipment.destinationAddress?.resolutionMethod && (
              <span className="ml-auto">
                <ResolutionIcon method={shipment.destinationAddress.resolutionMethod} />
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressDetails address={shipment.destinationAddress} />
        </CardContent>
      </Card>
    </div>
  )
}

// Address Details Component
const AddressDetails = ({ address }: { address: ApiAddressDetail | null }) => {
  if (!address) {
    return <p className="text-sm text-muted-foreground">No address information available</p>
  }

  return (
    <div className="space-y-3">
      {address.name && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm">{address.name}</p>
        </div>
      )}
      {address.fullAddress && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Full Address</p>
          <p className="text-sm">{address.fullAddress}</p>
        </div>
      )}
      {!address.fullAddress && address.street && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Street</p>
          <p className="text-sm">{address.street}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {address.city && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">City</p>
            <p className="text-sm">{address.city}</p>
          </div>
        )}
        {address.stateProvince && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">State/Province</p>
            <p className="text-sm">{address.stateProvince}</p>
          </div>
        )}
        {address.postalCode && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Postal Code</p>
            <p className="text-sm">{address.postalCode}</p>
          </div>
        )}
        {address.country && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Country</p>
            <p className="text-sm">{address.country}</p>
          </div>
        )}
      </div>
      {address.latitude !== null && address.longitude !== null && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Coordinates</p>
          <p className="text-sm">
            {address.latitude}, {address.longitude}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto ml-2"
              onClick={() =>
                window.open(`https://maps.google.com/?q=${address.latitude},${address.longitude}`, "_blank")
              }
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </p>
        </div>
      )}
      {address.resolutionMethod && address.resolutionConfidence !== null && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Resolution Confidence</p>
          <p className="text-sm">{(address.resolutionConfidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  )
}

// Items Tab Component
const ItemsTab = ({ shipment }: { shipment: ApiShipmentDetail }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Package className="h-4 w-4" />
          Shipment Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shipment.items && shipment.items.length > 0 ? (
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item #</TableHead>
                  <TableHead>2nd Item #</TableHead>
                  <TableHead>Lot #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Bin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipment.items.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="font-medium">{item.itemNumber || "N/A"}</TableCell>
                    <TableCell>{item.secondaryItemNumber || "N/A"}</TableCell>
                    <TableCell>{item.lotSerialNumber || "N/A"}</TableCell>
                    <TableCell>{item.description || "N/A"}</TableCell>
                    <TableCell>{item.quantity !== null ? item.quantity : "N/A"}</TableCell>
                    <TableCell>{item.uom || item.weightUnit || "N/A"}</TableCell>
                    <TableCell>{item.weight !== null ? `${item.weight} ${item.weightUnit || "kg"}` : "N/A"}</TableCell>
                    <TableCell>
                      {item.dimensions
                        ? `${item.dimensions.length || 0} × ${item.dimensions.width || 0} × ${item.dimensions.height || 0} ${item.dimensions.unit || ""}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{item.bin || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">No items found for this shipment</div>
        )}
      </CardContent>
    </Card>
  )
}

// Contacts Tab Component
const ContactsTab = ({ shipment }: { shipment: ApiShipmentDetail }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Shipper Contact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Users className="h-4 w-4" />
            Shipper Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactDetails contact={shipment.shipper} />
        </CardContent>
      </Card>

      {/* Recipient Contact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipient Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactDetails contact={shipment.recipient} />
        </CardContent>
      </Card>
    </div>
  )
}

// Contact Details Component
const ContactDetails = ({ contact }: { contact: ApiContact | null }) => {
  if (!contact) {
    return <p className="text-sm text-muted-foreground">No contact information available</p>
  }

  return (
    <div className="space-y-3">
      {contact.contactName && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm">{contact.contactName}</p>
        </div>
      )}
      {contact.contactNumber && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Phone</p>
          <p className="text-sm">{contact.contactNumber}</p>
        </div>
      )}
      {contact.contactEmail && (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Email</p>
          <p className="text-sm">{contact.contactEmail}</p>
        </div>
      )}
    </div>
  )
}

// Trip & Charges Tab Component
const TripChargesTab = ({ shipment }: { shipment: ApiShipmentDetail }) => {
  const tripAndCarrierData = shipment.tripAndCarrier
  const tripRate = shipment.customDetails?.tripRate
  const billingInfo = shipment.customDetails?.billingInfo

  return (
    <div className="space-y-6">
      {/* Transporter Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Carrier & Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tripAndCarrierData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Carrier Name</p>
                <p className="text-sm">{tripAndCarrierData.carrierName ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Truck ID</p>
                <p className="text-sm">{tripAndCarrierData.truckId ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Trailer ID</p>
                <p className="text-sm">{tripAndCarrierData.trailerId ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Driver Name</p>
                <p className="text-sm">{tripAndCarrierData.driverName ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Driver Cell</p>
                <p className="text-sm">{tripAndCarrierData.driverCell ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Driver IC</p>
                <p className="text-sm">{tripAndCarrierData.driverIc ?? "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No carrier or driver information available</p>
          )}
        </CardContent>
      </Card>

      {/* Trip Rate Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Trip Rate & Charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tripRate ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Trip Rate</p>
                  <p className="text-sm font-semibold">{formatCurrency(tripRate.rate, tripRate.currency)}</p>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Drop Charge</p>
                  <p className="text-sm font-semibold">{formatCurrency(tripRate.dropCharge, tripRate.currency)}</p>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Manpower Charge</p>
                  <p className="text-sm font-semibold">{formatCurrency(tripRate.manpowerCharge, tripRate.currency)}</p>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Total Charge</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(shipment.customDetails?.totalCharge ?? null, tripRate.currency)} 
                  </p>
                </div>
              </div>

              {/* Other Charges */}
              {tripRate.otherCharges && tripRate.otherCharges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Additional Charges</h4>
                  <div className="border border-border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tripRate.otherCharges.map((charge, index) => (
                          <TableRow key={index}>
                            <TableCell>{charge.description || "Additional Charge"}</TableCell>
                            <TableCell>{formatCurrency(charge.amount, charge.currency || tripRate.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No trip rate information available</p>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      {billingInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Payment Terms</p>
                <p className="text-sm">{billingInfo.paymentTerms || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bill To Address ID</p>
                <p className="text-sm">{billingInfo.billToAddressId || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function ShipmentDetailView({ shipment }: ShipmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header with basic shipment info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{`Load #${shipment.coreInfo.loadNumber || shipment.coreInfo.id}`}</h1>
            <StatusBadge status={shipment.coreInfo.status} />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {`Order #${shipment.coreInfo.orderNumber || "N/A"}${
              shipment.coreInfo.poNumber ? ` • PO #${shipment.coreInfo.poNumber}` : ""
            }`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabbed interface */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Location Details</span>
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>Items</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="trip" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            <span>Trip & Charges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab shipment={shipment} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationDetailsTab shipment={shipment} />
        </TabsContent>

        <TabsContent value="items">
          <ItemsTab shipment={shipment} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab shipment={shipment} />
        </TabsContent>

        <TabsContent value="trip">
          <TripChargesTab shipment={shipment} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 