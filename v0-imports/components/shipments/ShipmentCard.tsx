"use client"
import { MapPin, CheckCircle, HelpCircle, AlertTriangle, Edit, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Define the props interface for the ShipmentCard component
interface ShipmentCardProps {
  shipment: any // Replace with ShipmentCardDataShape when available
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: (shipmentId: string) => void
  onSelectShipment: (shipment: any) => void
  onDownload: (shipment: any, format: string) => void
  onEdit: (shipment: any) => void
}

// Resolution method icons
const ResolutionIcon = ({ method }: { method: string }) => {
  switch (method) {
    case "direct":
      return <CheckCircle className="h-4 w-4 text-green-500" title="Direct resolution" />
    case "estimated":
    case "prescan":
      return <HelpCircle className="h-4 w-4 text-amber-500" title="Estimated resolution" />
    case "manual":
      return <CheckCircle className="h-4 w-4 text-blue-500" title="Manual resolution" />
    default:
      return <AlertTriangle className="h-4 w-4 text-red-500" title="No resolution" />
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

export default function ShipmentCard({
  shipment,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelectShipment,
  onDownload,
  onEdit,
}: ShipmentCardProps) {
  return (
    <div
      className={cn(
        "border rounded-lg bg-card text-card-foreground overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "",
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">{`Load #${shipment.loadNumber}`}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              {`Order #${shipment.orderNumber}${shipment.poNumber ? ` • PO #${shipment.poNumber}` : ""}`}
            </div>
          </div>
          <div
            className={cn(
              "text-xs font-medium px-2.5 py-0.5 rounded-full",
              shipment.status === "Processed" || shipment.status === "Delivered"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : shipment.status === "In Transit"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : shipment.status === "Delayed" || shipment.status === "Exception"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
            )}
          >
            {shipment.status}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pickup Location</p>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                {shipment.pickupLocation.city && shipment.pickupLocation.state
                  ? `${shipment.pickupLocation.city}, ${shipment.pickupLocation.state}`
                  : shipment.pickupLocation.fullAddress || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Destination</p>
            <div className="flex items-center gap-1">
              <span className="text-sm">
                {shipment.destinationLocation.city && shipment.destinationLocation.state
                  ? `${shipment.destinationLocation.city}, ${shipment.destinationLocation.state}`
                  : shipment.destinationLocation.fullAddress || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Planned Delivery Date</p>
          <p className="text-sm">{shipment.plannedDeliveryDate ? formatDate(shipment.plannedDeliveryDate) : "N/A"}</p>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 border-t border-border pt-4">
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="locations">Location Details</TabsTrigger>
                <TabsTrigger value="items">Items ({shipment.items?.length || 0})</TabsTrigger>
                <TabsTrigger value="trip">Trip Info</TabsTrigger>
                <TabsTrigger value="pod">POD</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="border border-border rounded-md p-4 bg-card">
                  {shipment.remarks && (
                    <div className="mb-4">
                      <h3 className="text-md font-medium mb-2">Remarks</h3>
                      <p className="text-sm">{shipment.remarks}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Weight</p>
                      <p className="text-sm">{shipment.totalWeight ? `${shipment.totalWeight} kg` : "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Planned Pickup</p>
                      <p className="text-sm">
                        {shipment.plannedPickupDate ? formatDate(shipment.plannedPickupDate) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Planned Delivery</p>
                      <p className="text-sm">
                        {shipment.plannedDeliveryDate ? formatDate(shipment.plannedDeliveryDate) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Est. Pickup Arrival</p>
                      <p className="text-sm">
                        {shipment.estimatedPickupArrival ? formatDate(shipment.estimatedPickupArrival) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Actual Pickup Arrival</p>
                      <p className="text-sm">
                        {shipment.actualPickupArrival ? formatDate(shipment.actualPickupArrival) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Est. Delivery Arrival</p>
                      <p className="text-sm">
                        {shipment.estimatedDeliveryArrival ? formatDate(shipment.estimatedDeliveryArrival) : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Actual Delivery Arrival</p>
                      <p className="text-sm">
                        {shipment.actualDeliveryArrival ? formatDate(shipment.actualDeliveryArrival) : "N/A"}
                      </p>
                    </div>

                    {shipment.manpower !== null && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Manpower</p>
                        <p className="text-sm">{shipment.manpower}</p>
                      </div>
                    )}

                    {shipment.specialRequirements && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Special Requirements</p>
                        <p className="text-sm">{shipment.specialRequirements}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Hazardous</p>
                      <p className="text-sm">{shipment.isHazardous ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Equipment</p>
                      <p className="text-sm">
                        {[
                          shipment.equipment.liftgate ? "Liftgate" : null,
                          shipment.equipment.palletJack ? "Pallet Jack" : null,
                        ]
                          .filter(Boolean)
                          .join(", ") || "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="locations">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-md p-4 bg-card">
                    <h3 className="text-md flex items-center gap-2 font-medium mb-3">
                      <MapPin className="h-4 w-4" />
                      Pickup Details
                    </h3>
                    <div className="space-y-2">
                      {shipment.pickupLocation.fullAddress && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Full Address</p>
                          <p className="text-sm">{shipment.pickupLocation.fullAddress}</p>
                        </div>
                      )}
                      {shipment.pickupLocation.city && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">City</p>
                          <p className="text-sm">{shipment.pickupLocation.city}</p>
                        </div>
                      )}
                      {shipment.pickupLocation.state && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">State</p>
                          <p className="text-sm">{shipment.pickupLocation.state}</p>
                        </div>
                      )}
                      {shipment.pickupLocation.postalCode && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Postal Code</p>
                          <p className="text-sm">{shipment.pickupLocation.postalCode}</p>
                        </div>
                      )}
                      {shipment.pickupLocation.country && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Country</p>
                          <p className="text-sm">{shipment.pickupLocation.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-border rounded-md p-4 bg-card">
                    <h3 className="text-md flex items-center gap-2 font-medium mb-3">
                      <MapPin className="h-4 w-4" />
                      Destination Details
                    </h3>
                    <div className="space-y-2">
                      {shipment.destinationLocation.fullAddress && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Full Address</p>
                          <p className="text-sm">{shipment.destinationLocation.fullAddress}</p>
                        </div>
                      )}
                      {shipment.destinationLocation.city && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">City</p>
                          <p className="text-sm">{shipment.destinationLocation.city}</p>
                        </div>
                      )}
                      {shipment.destinationLocation.state && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">State</p>
                          <p className="text-sm">{shipment.destinationLocation.state}</p>
                        </div>
                      )}
                      {shipment.destinationLocation.postalCode && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Postal Code</p>
                          <p className="text-sm">{shipment.destinationLocation.postalCode}</p>
                        </div>
                      )}
                      {shipment.destinationLocation.country && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Country</p>
                          <p className="text-sm">{shipment.destinationLocation.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items">
                <div className="border border-border rounded-md overflow-hidden">
                  {shipment.items && shipment.items.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item #</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Lot/Serial #</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>UOM</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Bin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shipment.items.map((item) => (
                          <TableRow key={item.itemId}>
                            <TableCell className="font-medium">{item.itemNumber || "N/A"}</TableCell>
                            <TableCell>{item.description || "N/A"}</TableCell>
                            <TableCell>{item.lotSerialNumber || "N/A"}</TableCell>
                            <TableCell>{item.quantity !== null ? item.quantity : "N/A"}</TableCell>
                            <TableCell>{item.uom || "N/A"}</TableCell>
                            <TableCell>{item.weight !== null ? `${item.weight} kg` : "N/A"}</TableCell>
                            <TableCell>{item.bin || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No items found for this shipment</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trip">
                <div className="border border-border rounded-md p-4 bg-card">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Trip ID</p>
                      <p className="text-sm">{shipment.tripId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Truck Registration</p>
                      <p className="text-sm">{shipment.tripInfo.truckRegistration || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Transporter</p>
                      <p className="text-sm">{shipment.tripInfo.transporterName || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pod">
                <div className="border border-border rounded-md p-4 bg-card">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">POD Returned</p>
                      <p className="text-sm">{shipment.podInfo.podReturned ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">POD Document</p>
                      {shipment.podInfo.podUrl ? (
                        <a
                          href={shipment.podInfo.podUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-sm">Not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(shipment.shipmentId)}>
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onSelectShipment(shipment)}>
            View on Map
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDownload(shipment, "csv")}>Download as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(shipment, "json")}>Download as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={() => onEdit(shipment)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}
