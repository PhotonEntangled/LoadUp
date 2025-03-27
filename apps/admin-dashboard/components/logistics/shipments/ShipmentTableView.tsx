"use client";

import React, { useState, useMemo } from "react";
import { ShipmentData, formatDate } from "@/lib/document-processing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, ChevronDown, ChevronRight, Info, FileCheck, ArrowUpToLine } from "lucide-react";
import { ShipmentField } from "./ShipmentField";
import { ShipmentItemsTable } from "./ShipmentItemsTable";
import { useToast } from "@/components/ui/use-toast";
import { downloadShipmentAsCSV } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { convertExcelDateToJSDate } from "../../../../../utils/excel-helper";

interface ShipmentTableViewProps {
  shipments: ShipmentData[];
  onDownloadCSV?: (shipment: ShipmentData) => void;
  className?: string;
  selectedItems?: string[];
  onSelectItem?: (shipment: ShipmentData, selected: boolean) => void;
  isEditMode?: boolean;
  onEditField?: (shipmentIndex: number, field: string, value: string) => void;
}

// Core fields that are always displayed
const CORE_FIELDS = [
  { key: "loadNumber", label: "Load #" },
  { key: "orderNumber", label: "Order #" },
  { key: "poNumber", label: "PO Number" },
  { key: "promisedShipDate", label: "Ship Date" },
  { key: "shipToCustomer", label: "Ship To" },
  { key: "shipToState", label: "State" },
  { key: "contactNumber", label: "Contact" },
  { key: "remarks", label: "Remarks" },
  { key: "totalWeight", label: "Weight" },
  { key: "items", label: "Items" }
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
  
  const handleDownloadCSV = (shipment: ShipmentData) => {
    if (onDownloadCSV) {
      onDownloadCSV(shipment);
    } else {
      // Use the utility function to download CSV
      try {
        downloadShipmentAsCSV(shipment);
        
        // Show success notification
        toast({
          title: "CSV Downloaded",
          description: `Exported shipment ${shipment.loadNumber || shipment.orderNumber || 'data'} to CSV`,
          variant: "success"
        });
      } catch (error) {
        // Show error notification
        toast({
          title: "Download Failed",
          description: "Failed to generate CSV file. Please try again.",
          variant: "destructive"
        });
      }
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
  
  // Rendering a cell based on the column key
  const renderCell = (shipment: ShipmentData, columnKey: string, index: number) => {
    switch (columnKey) {
      case "loadNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="loadNumber" 
            value={shipment.loadNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "orderNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="orderNumber" 
            value={shipment.orderNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "poNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="poNumber" 
            value={shipment.poNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "promisedShipDate":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="promisedShipDate" 
            value={formatDate(shipment.promisedShipDate) || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "requestDate":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="requestDate" 
            value={formatDate(shipment.requestDate) || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "actualShipDate":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="actualShipDate" 
            value={formatDate(shipment.actualShipDate) || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "expectedDeliveryDate":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="expectedDeliveryDate" 
            value={formatDate(shipment.expectedDeliveryDate) || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToCustomer":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToCustomer" 
            value={shipment.shipToCustomer || shipment.shipToArea || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToAddress":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToAddress" 
            value={shipment.shipToAddress || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToCity":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToCity" 
            value={shipment.shipToCity || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToState":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToState" 
            value={shipment.shipToState || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToZip":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToZip" 
            value={shipment.shipToZip || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "shipToCountry":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="shipToCountry" 
            value={shipment.shipToCountry || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "contactName":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="contactName" 
            value={shipment.contactName || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "contactNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="contactNumber" 
            value={shipment.contactNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "contactEmail":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="contactEmail" 
            value={shipment.contactEmail || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "carrier":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="carrier" 
            value={shipment.carrier || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "trackingNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="trackingNumber" 
            value={shipment.trackingNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "routeNumber":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="routeNumber" 
            value={shipment.routeNumber || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "vehicleType":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="vehicleType" 
            value={shipment.vehicleType || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "remarks":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="remarks" 
            value={shipment.remarks || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "totalWeight":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="totalWeight" 
            value={`${shipment.totalWeight || '0'} kg`} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "totalValue":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="totalValue" 
            value={shipment.totalValue ? `$${shipment.totalValue}` : "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "dimensions":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="dimensions" 
            value={shipment.dimensions || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "status":
        return (
          <ShipmentField 
            shipment={shipment} 
            fieldName="status" 
            value={shipment.status || "-"} 
            isEditable={isEditMode}
            onEdit={(field, value) => handleFieldEdit(index, field, value)}
          />
        );
      case "items":
        return <span>{shipment.items.length}</span>;
      default:
        if (typeof shipment[columnKey as keyof ShipmentData] !== 'undefined') {
          const value = shipment[columnKey as keyof ShipmentData];
          return (
            <ShipmentField 
              shipment={shipment} 
              fieldName={columnKey} 
              value={typeof value === 'string' || typeof value === 'number' ? value : '-'} 
              isEditable={isEditMode}
              onEdit={(field, value) => handleFieldEdit(index, field, value)}
            />
          );
        }
        return "-";
    }
  };
  
  // Get all miscellaneous fields from a shipment
  const hasMiscellaneousFields = (shipment: ShipmentData): boolean => {
    return !!(shipment.miscellaneousFields && Object.keys(shipment.miscellaneousFields).length > 0);
  };
  
  // Add a method to check if a shipment is selected
  const isSelected = (shipment: ShipmentData): boolean => {
    const identifier = shipment.loadNumber || shipment.orderNumber || '';
    return selectedItems.includes(identifier);
  };
  
  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {onSelectItem && (
                <th className="w-8 p-2 border border-gray-200"></th>
              )}
              <th className="w-8 p-2 border border-gray-200"></th>
              {CORE_FIELDS.map(field => (
                <th key={field.key} className="p-2 text-left border border-gray-200">
                  {field.label}
                </th>
              ))}
              <th className="p-2 text-left border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment, index) => (
              <React.Fragment key={`${shipment.loadNumber || shipment.orderNumber || index}`}>
                {/* Main shipment row */}
                <tr 
                  className={`border-gray-200 hover:bg-gray-50 ${shipment.needsReview ? 'bg-yellow-50' : ''} ${isSelected(shipment) ? 'bg-blue-50' : ''}`}
                >
                  {onSelectItem && (
                    <td className="p-2 border border-gray-200 text-center">
                      <Checkbox
                        checked={isSelected(shipment)}
                        onCheckedChange={(checked) => onSelectItem(shipment, !!checked)}
                        className="h-4 w-4"
                      />
                    </td>
                  )}
                  <td className="p-2 border border-gray-200 text-center">
                    <button
                      onClick={() => toggleDetails(index)}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Toggle details"
                    >
                      {hasMiscellaneousFields(shipment) && (
                        <Info size={16} className="text-blue-500" />
                      )}
                      {expandedDetails[index] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </td>
                  {CORE_FIELDS.map(field => (
                    <td key={field.key} className="p-2 border border-gray-200">
                      {renderCell(shipment, field.key, index)}
                    </td>
                  ))}
                  <td className="p-2 border border-gray-200">
                    <div className="flex space-x-2">
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
                    </div>
                  </td>
                </tr>
                
                {/* Miscellaneous fields section - expanded on click */}
                {expandedDetails[index] && shipment.miscellaneousFields && (
                  <tr>
                    <td colSpan={CORE_FIELDS.length + (onSelectItem ? 2 : 1)} className="p-4 bg-gray-50">
                      <div className="mb-2">
                        {shipment.miscellaneousFields.sheetName && (
                          <div className="text-sm mb-2">
                            <span className="font-medium">
                            Sheet: {shipment.miscellaneousFields.sheetName}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="font-medium text-sm mb-2 text-blue-700 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Additional Fields
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
                        {/* Display miscellaneous fields */}
                        {Object.entries(shipment.miscellaneousFields)
                          .filter(([key]) => key !== 'sheetName') // Filter out sheetName as it's displayed separately
                          .map(([key, value], fieldIndex) => {
                            // Check if the value might be an Excel date
                            const stringValue = value?.toString() || '-';
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
                                        // Create a path for the miscellaneous field
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
                    </td>
                  </tr>
                )}
                
                {/* Items table - expanded on click */}
                {expandedItems[index] && (
                  <tr key={`${index}-items`}>
                    <td colSpan={CORE_FIELDS.length + 2 + (onSelectItem ? 1 : 0)} className="p-0 border border-gray-200">
                      <div className="p-2 bg-gray-50">
                        <ShipmentItemsTable 
                          items={shipment.items} 
                          expanded={true}
                          onToggleItems={() => null}
                        />
                      </div>
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