"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, ChevronDown, ChevronRight, Info, FileCheck, ArrowUpToLine, ChevronUp, MapPin, HelpCircle, CheckCircle2, ArrowUpDown, Trash2 } from "lucide-react";
// Import Shadcn DropdownMenu components - Temporarily Commented Out
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"; 
import { ShipmentField } from "./ShipmentField";
import { ShipmentItemsTable } from "./ShipmentItemsTable";
import { useToast } from "@/components/ui/use-toast";
// Comment out missing utils
// import { downloadShipmentAsCSV, downloadShipmentAsJSON } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { convertExcelDateToJSDate } from "@/lib/excel-helper";
import { ShipmentData as ShipmentDataType, LocationDetail } from "@/types/shipment";
import { Badge } from "@/components/ui/badge";
import { AIMappingLabel } from "./AIMappingLabel";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ShipmentTableViewProps {
  shipments: ShipmentDataType[];
  onDownloadCSV?: (shipment: ShipmentDataType) => void;
  className?: string;
  selectedItems?: string[];
  onSelectItem?: (shipment: ShipmentDataType, selected: boolean) => void;
  isEditMode?: boolean;
  onEditField?: (shipmentIndex: number, field: string, value: string) => void;
}

// Helper type for Core Field definition
type CoreFieldKey = keyof Omit<
    ShipmentDataType, 
    'items' | 'miscellaneousFields' | 'parsingMetadata' | 'sourceInfo' | 'confidenceScore' | 'processingErrors' | 'createdAt' | 'updatedAt' | 'origin' | 'destination' // Exclude origin/dest from Omit
> | 'origin' | 'destination'; // Explicitly include origin and destination

type CoreField = {
  key: CoreFieldKey;
  label: string;
}

// Update CORE_FIELDS to use new keys
const CORE_FIELDS: CoreField[] = [
  { key: "loadNumber", label: "Load #" },
  { key: "orderNumber", label: "Order #" },
  { key: "poNumber", label: "PO Number" },
  { key: "promisedShipDate", label: "Ship Date" },
  { key: "origin", label: "Pickup" }, // Use origin
  { key: "destination", label: "Destination" }, // Use destination
  // Removed: { key: "shipToState", label: "State" },
  { key: "contactNumber", label: "Contact" },
  { key: "totalWeight", label: "Weight" },
  { key: "status", label: "Status" },
  { key: "remarks", label: "Remarks" },
];

export const ShipmentTableView = ({
  shipments,
  onDownloadCSV,
  className = "",
  selectedItems = [],
  onSelectItem,
  isEditMode = false,
  onEditField
}: ShipmentTableViewProps) => {
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const handleDownloadCSV = (shipment: ShipmentDataType) => {
    if (onDownloadCSV) {
      onDownloadCSV(shipment);
    } else {
      // Comment out calls to missing utils
      // downloadShipmentAsCSV(shipments);
      
      // Show success notification
      toast({
        title: "CSV Downloaded",
        description: `Exported shipment ${shipment.loadNumber || shipment.orderNumber || 'data'} to CSV`,
        variant: "success"
      });
    }
  };
  
  // Toggle item expansion for a specific shipment
  const toggleItems = (shipmentIndex: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [shipmentIndex]: !prev[shipmentIndex]
    }));
  };
  
  // Toggle additional details for a specific shipment
  const toggleDetails = (shipmentIndex: number) => {
    setExpandedDetails(prev => ({
      ...prev,
      [shipmentIndex]: !prev[shipmentIndex]
    }));
  };
  
  // Handle field edit
  const handleFieldEdit = (shipmentIndex: number, fieldName: string, value: string) => {
    if (onEditField && isEditMode) {
      onEditField(shipmentIndex, fieldName, value);
    }
  };
  
  // Render cell content based on column key
  const renderCell = (shipment: ShipmentDataType, columnKey: CoreFieldKey, index: number) => {
    const value = (shipment as any)[columnKey]; // Use any temporarily for broader access
    let displayValue: React.ReactNode = '-';
    const columnKeyStr = columnKey as string; // Cast columnKey to string for safe usage

    // Handle date formatting
    if (['promisedShipDate', 'requestDate'].includes(columnKeyStr)) {
        const dateValue = value as string | number | undefined;
        let date: Date | string | null = null;
        // Ensure dateValue is not undefined before converting
        if (dateValue !== undefined && dateValue !== null) {
            date = convertExcelDateToJSDate(dateValue);
        }
        // Check if date is a valid Date object by checking for the method
        displayValue = (date && typeof (date as any).toLocaleDateString === 'function') 
                        ? (date as unknown as Date).toLocaleDateString() // Cast via unknown first
                        : (dateValue ? String(dateValue) : '-'); 
    } 
    // Handle Pickup Location Details
    else if (columnKeyStr === 'origin') {
        const location = shipment.origin;
        if (location) {
            // Prioritize resolved address, fallback to raw, then name
            const text = location.resolvedAddress || location.rawInput || location.name; 
            const isResolved = location.resolutionMethod && location.resolutionMethod !== 'none';
            const isEstimate = location.resolutionMethod === 'estimated' || location.resolutionMethod === 'prescan';
            displayValue = (
                <span className="flex items-center">
                    {text || '-'}
                    {isResolved && (
                        isEstimate ? 
                        <HelpCircle className="h-3 w-3 ml-1 text-orange-500" /> :
                        <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                    )}
                </span>
            );
        } else {
            displayValue = '-'; // No fallback like pickupWarehouse needed
        }
    }
    // Handle Destination Location Details
    else if (columnKeyStr === 'destination') {
        const location = shipment.destination;
         if (location) {
            // Prioritize resolved address, fallback to raw, then maybe customer name?
            const text = location.resolvedAddress || location.rawInput || shipment.shipToCustomer; 
             const isResolved = location.resolutionMethod && location.resolutionMethod !== 'none';
             const isEstimate = location.resolutionMethod === 'estimated' || location.resolutionMethod === 'prescan'; 
             displayValue = (
                 <span className="flex items-center">
                     {text || '-'}
                     {isResolved && (
                         isEstimate ?
                         <HelpCircle className="h-3 w-3 ml-1 text-orange-500" /> :
                         <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                     )}
                 </span>
             );
        } else {
            displayValue = shipment.shipToCustomer || '-'; // Fallback to customer name if no dest obj
        }
    }
    // Handle status - Keep simple for now, can be enhanced with badges later
    else if (columnKeyStr === 'status') {
        displayValue = value ? String(value) : 'pending';
    } 
    // Default rendering for other simple types
    else if (typeof value !== 'object' || value === null) { 
      displayValue = value !== null && typeof value !== 'undefined' ? String(value) : '-';
    }

    // Now render using ShipmentField, passing all required props
    return (
        <ShipmentField 
            shipment={shipment} // Pass the full shipment object
            fieldName={columnKeyStr} // Pass the field key as string
            value={displayValue} // Pass the calculated display value
            isEditable={isEditMode} // Pass the edit mode status
            onEdit={(fieldName, newValue) => handleFieldEdit(index, fieldName, newValue)} // Pass the edit handler
            showAIIndicator={true} // Keep AI indicators enabled by default
        />
    );
  };
  
  // Get all miscellaneous fields from a shipment
  const hasMiscellaneousFields = (shipment: ShipmentDataType): boolean => {
    return !!(shipment.miscellaneousFields && Object.keys(shipment.miscellaneousFields).length > 0);
  };
  
  // Add a method to check if a shipment is selected
  const isSelected = (shipment: ShipmentDataType): boolean => {
    const identifier = shipment.loadNumber || shipment.orderNumber || '';
    return selectedItems.includes(identifier);
  };
  
  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 p-2 border border-gray-200"></th>
              {CORE_FIELDS.map(field => (
                <th key={field.key as string} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments.map((shipment, index) => (
              <React.Fragment key={`shipment-${shipment.loadNumber || shipment.orderNumber || 'no-id'}-${index}`}>
                <tr className={`${expandedItems[index] ? 'bg-blue-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} transition-colors duration-150 ease-in-out`}>
                  <td className="w-8 p-2 border border-gray-200 text-center">
                    <button onClick={() => toggleDetails(index)} className="text-blue-500 hover:text-blue-700">
                      {hasMiscellaneousFields(shipment) && (
                        <Info size={16} className="text-blue-500" />
                      )}
                      {expandedDetails[index] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </td>
                  {CORE_FIELDS.map(field => (
                    <td key={field.key as string} className="px-4 py-3 whitespace-nowrap">
                      {renderCell(shipment, field.key, index)}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {shipment.items?.length || 0} item(s)
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {/* Ensure two separate buttons are present */}
                    <div className="flex space-x-2">
                      {/* CSV Download Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadCSV(shipment)}
                        className="text-xs"
                        title="Download shipment data as CSV"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </Button>
                      {/* JSON Download Button - Added explicitly */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Comment out calls to missing utils
                          // downloadShipmentAsJSON(shipments);
                        }}
                        className="text-xs"
                        title="Download full shipment data as JSON"
                      >
                        {/* Using text label for clarity */}
                        JSON 
                      </Button>
                    </div>
                    {/* Original DropdownMenu Code remains commented out 
                    <DropdownMenu> ... </DropdownMenu>
                    */}
                  </td>
                </tr>
                
                {expandedDetails[index] && (
                  <tr>
                    {/* Combined Cell for all expanded details */}
                    <td colSpan={CORE_FIELDS.length + 3} className="p-4 bg-gray-100 border-t border-gray-300"> 
                      <div className="space-y-4">

                        {/* Location Details - Show Origin and Destination */}
                        {(shipment.origin || shipment.destination) && (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">Location Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Origin Display */}
                              {shipment.origin && (
                                <div className="p-2 bg-white rounded border border-gray-200 space-y-1">
                                  <div className="font-medium text-gray-600">Origin</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Raw:</span> {shipment.origin.rawInput || '-'}</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Resolved:</span> {shipment.origin.resolvedAddress || '-'}</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Coords:</span> {shipment.origin.latitude?.toFixed(4)}, {shipment.origin.longitude?.toFixed(4)}</div>
                                  <div className="text-xs flex items-center">
                                    <span className="font-semibold text-gray-600 min-w-[80px] inline-block">Resolution:</span>
                                    <span className="capitalize mr-1">{shipment.origin.resolutionMethod || 'none'}</span>
                                    {shipment.origin.resolutionMethod && shipment.origin.resolutionMethod !== 'none' && (
                                      <> 
                                        (
                                        {(shipment.origin.resolutionMethod === 'estimated' || shipment.origin.resolutionMethod === 'prescan') ? 
                                          <HelpCircle className="h-3 w-3 inline text-orange-500 mx-0.5" /> : 
                                          <CheckCircle2 className="h-3 w-3 inline text-green-500 mx-0.5" />
                                        }
                                        {shipment.origin.resolutionConfidence?.toFixed(2)}
                                        )
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Destination Display */}
                              {shipment.destination && (
                                <div className="p-2 bg-white rounded border border-gray-200 space-y-1">
                                  <div className="font-medium text-gray-600">Destination</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Raw:</span> {shipment.destination.rawInput || '-'}</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Resolved:</span> {shipment.destination.resolvedAddress || '-'}</div>
                                  <div className="text-xs"><span className="font-semibold text-gray-600 min-w-[80px] inline-block">Coords:</span> {shipment.destination.latitude?.toFixed(4)}, {shipment.destination.longitude?.toFixed(4)}</div>
                                   <div className="text-xs flex items-center">
                                    <span className="font-semibold text-gray-600 min-w-[80px] inline-block">Resolution:</span>
                                    <span className="capitalize mr-1">{shipment.destination.resolutionMethod || 'none'}</span>
                                    {shipment.destination.resolutionMethod && shipment.destination.resolutionMethod !== 'none' && (
                                      <> 
                                        (
                                        {(shipment.destination.resolutionMethod === 'estimated' || shipment.destination.resolutionMethod === 'prescan') ? 
                                          <HelpCircle className="h-3 w-3 inline text-orange-500 mx-0.5" /> : 
                                          <CheckCircle2 className="h-3 w-3 inline text-green-500 mx-0.5" />
                                        }
                                        {shipment.destination.resolutionConfidence?.toFixed(2)}
                                        )
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Miscellaneous Fields Section */}
                        {shipment.miscellaneousFields && Object.keys(shipment.miscellaneousFields).length > 0 && (
                          <div>
                             <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                               <Info className="h-4 w-4 mr-1 text-gray-500" /> Miscellaneous Fields
                             </h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                              {Object.entries(shipment.miscellaneousFields)
                                // .filter(([key]) => key !== 'sheetName') // Maybe keep sheetName here?
                                .map(([key, value], fieldIndex) => {
                                  const stringValue = value?.toString() || '-';
                                  // Keep existing logic for date detection and display/edit
                                  const numValue = parseFloat(stringValue);
                                  const isLikelyDate = !isNaN(numValue) && numValue > 1 && numValue < 50000;
                                  const displayValue = isLikelyDate ? 
                                    convertExcelDateToJSDate(numValue) : 
                                    stringValue;
                                  
                                  return (
                                    <div key={key} className="p-2 bg-white rounded border border-gray-200 flex flex-col">
                                      <div className="text-xs text-gray-500 font-medium">{key}</div>
                                      {isEditMode ? (
                                        <Input 
                                          type="text" 
                                          value={displayValue !== '-' ? displayValue : ''} 
                                          onChange={(e) => {
                                            if (onEditField) {
                                              const miscPath = `miscellaneousFields.${key}`;
                                              onEditField(index, miscPath, e.target.value);
                                            }
                                          }}
                                          className="w-full p-1 text-sm h-8 mt-1" 
                                        />
                                      ) : (
                                        <div className="text-sm mt-1">{displayValue}</div>
                                      )}
                                    </div>
                                  );
                                })
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Items Table Section - Shown when items are expanded */}
                        {expandedItems[index] && (
                           <div>
                             <h4 className="text-md font-semibold text-gray-700 mb-2">Items</h4>
                             <ShipmentItemsTable 
                               items={shipment.items ?? []}
                               expanded={true}
                               onToggleItems={() => null}
                             />
                           </div>
                        )}

                      </div> {/* End main space-y-4 container */}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 