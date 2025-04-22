"use client"
import { MapPin, CheckCircle, HelpCircle, AlertTriangle, Edit, Download, Calendar, Package, Truck, MoreHorizontal, Info, ChevronDown, ChevronUp, User, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/formatters";
import type { ApiShipmentDetail, ApiAddressDetail, ApiShipmentItem, ApiOtherCharge } from "@/types/api"; // Updated import
import { Badge } from "@/components/ui/badge";
import { ShipmentField } from "@/components/logistics/shipments/ShipmentField"; // Corrected import path
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"; // Added Tooltip imports
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"; // Added Accordion imports
import { StatusBadge } from "@/components/shipments/StatusBadge";

// Define the props interface for the ShipmentCard component
interface ShipmentCardProps {
  shipment: ApiShipmentDetail // Use the new type
  isSelected: boolean
  isLoading?: boolean // Added optional isLoading prop
  onSelectShipment: (shipment: ApiShipmentDetail) => void
  onDownload: (shipment: ApiShipmentDetail, format: string) => void
  onEdit: (shipment: ApiShipmentDetail) => void
}

// Define the expected type for resolutionMethod explicitly for clarity
type ResolutionMethodType = ApiAddressDetail['resolutionMethod']; // No change needed here

// Resolution method icons component
const ResolutionIcon = ({ method }: { method: string | null }) => {
  switch (method) {
    case "direct":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "estimated":
    case "prescan":
    case "geocode":
    case "partial":
      return <HelpCircle className="h-4 w-4 text-amber-500" />;
    case "manual":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
};

export default function ShipmentCard({
  shipment,
  isSelected,
  isLoading = false, // Default isLoading to false
  onSelectShipment,
  onDownload,
  onEdit,
}: ShipmentCardProps) {
  // Extract core info safely
  const coreInfo = shipment.coreInfo ?? {};
  const originAddress = shipment.originAddress;
  const destinationAddress = shipment.destinationAddress;
  const shipmentId = coreInfo.id ?? `shipment-${coreInfo.loadNumber || coreInfo.orderNumber || Math.random()}`;
  // Value for AccordionItem - using shipmentId for unique value
  const accordionValue = shipmentId;

  return (
    // Use AccordionItem as the root, apply selection ring here
    <AccordionItem 
      value={accordionValue} 
      className={cn(
        "border rounded-lg bg-card text-card-foreground overflow-hidden mb-2", // Add margin-bottom
        isSelected ? "ring-2 ring-primary ring-offset-background ring-offset-1" : "", // Adjusted ring for better visibility
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-background focus-within:ring-offset-1" // Ring on focus within
      )}
      // Prevent AccordionItem click from propagating if needed, but Trigger should handle selection
    >
      {/* Use AccordionTrigger for the header */}
      <AccordionTrigger 
        // Disable trigger when loading
        disabled={isLoading} 
        className={cn(
            // Use flex and justify-between directly on the trigger
            "flex justify-between items-center w-full", 
            "p-3 hover:no-underline focus:outline-none focus:ring-0 data-[state=open]:border-b group",
            isLoading && "opacity-50 cursor-wait" // Style when loading
        )} 
        aria-label={`Toggle details for shipment ${coreInfo.loadNumber || shipmentId.substring(0,8)}`}
      >
        {/* Main clickable area for SELECTION - NOW A DIRECT CHILD */}
        <div 
          className={cn(
              // Remove flex/justify-between from here
              "flex-grow flex items-center gap-2 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 rounded-sm mr-2", // Add margin-right
              !isLoading && "cursor-pointer" // Only add pointer cursor if not loading
          )}
          onClick={(e: React.MouseEvent) => { 
              if (isLoading) return; // Prevent selection if loading
              e.stopPropagation(); // *** Stop propagation here to prevent toggle ***
              onSelectShipment(shipment); 
          }}
          // Add keyboard accessibility for selection
          role="button"
          tabIndex={isLoading ? -1 : 0} // Make focusable only if not loading
          onKeyDown={(e: React.KeyboardEvent) => { if (!isLoading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); onSelectShipment(shipment); } }}
          aria-label={`Select shipment ${coreInfo.loadNumber || shipmentId.substring(0,8)}`}
          aria-disabled={isLoading} // Indicate disabled state
        >
          {/* Header Content: Load #/ID and PO# */}
          <div className="flex-grow text-left">
            <h2 className="text-sm font-semibold leading-tight" title={coreInfo.loadNumber ? `Load #${coreInfo.loadNumber}` : `Shipment ID: ${shipmentId}`}>
                {coreInfo.loadNumber 
                  ? `Load #${coreInfo.loadNumber}` 
                  : <span className="text-xs text-muted-foreground">ID: {shipmentId.substring(0,8)}...</span>
                }
            </h2>
             {/* Keep PO# visible in header? Or move to content? Keep for now. */}
            {coreInfo.poNumber && 
              <p className="text-xs text-muted-foreground mt-0.5 truncate" title={`PO #${coreInfo.poNumber}`}>
                {`PO #${coreInfo.poNumber}`}
              </p>
            }
            </div>
        </div>

        {/* Status Badge & Loading Spinner */}
        <div className="flex-none flex items-center space-x-2">
           {/* Show spinner instead of status when loading */}
           {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
           ) : (
              <StatusBadge status={coreInfo.status} />
           )}
        </div>
      </AccordionTrigger>

      {/* AccordionContent holds the details and actions */}
      <AccordionContent className="p-3 pt-2 text-sm">
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs truncate">
              {originAddress?.city && originAddress?.stateProvince
                ? `${originAddress.city}, ${originAddress.stateProvince}`
                : originAddress?.fullAddress || "N/A"}
                      </p>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start"><p>{originAddress?.fullAddress || 'N/A'}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                    </div>
                    <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</p>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs truncate">
             {destinationAddress?.city && destinationAddress?.stateProvince
               ? `${destinationAddress.city}, ${destinationAddress.stateProvince}`
               : destinationAddress?.fullAddress || "N/A"}
                          </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start"><p>{destinationAddress?.fullAddress || 'N/A'}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                        </div>
                        <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Delivery Date</p>
                        <p className="text-xs"> 
                            {coreInfo.plannedDeliveryDate ? formatDate(coreInfo.plannedDeliveryDate) : 'N/A'} 
                        </p>
                    </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end items-center gap-1 border-t pt-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()} title="Download Shipment Options">
                        <Download className="h-3.5 w-3.5" /> <span className="sr-only">Download</span>
                    </Button>
                </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={() => onDownload(shipment, "csv")}>Download as CSV</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDownload(shipment, "json")}>Download as JSON</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit(shipment); }} title="Edit Shipment">
                  <Edit className="h-3.5 w-3.5" /> <span className="sr-only">Edit</span>
             </Button>
      </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// IMPORTANT: The parent component rendering these cards will need to wrap them 
// in an <Accordion type="single" collapsible className="w-full"> component.
// Example in parent:
// <Accordion type="single" collapsible className="w-full">
//   {filteredShipments.map((shipment) => (
//     <ShipmentCard key={...} ... />
//   ))}
// </Accordion>
