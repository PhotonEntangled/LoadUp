"use client";

import React, { useState } from "react";
import { Card } from "@/components/shared/Card";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  Truck, 
  Download,
  Clock,
  Hash,
  Tag,
  Info,
  AlertTriangle,
  User,
  Mail,
  Globe,
  DollarSign,
  Ruler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipmentData, formatDate, AIMappedField } from "@/lib/document-processing";
import { AIMappingLabel } from "./AIMappingLabel";
import { ShipmentItemsTable } from "./ShipmentItemsTable";
import { Input } from "@/components/ui/input";
import { convertExcelDateToJSDate } from "../../../../../utils/excel-helper";

interface ShipmentCardViewProps {
  shipments: ShipmentData[];
  onDownloadCSV?: (shipment: ShipmentData) => void;
  className?: string;
  isEditMode?: boolean;
  onEditField?: (shipmentIndex: number, field: string, value: string) => void;
}

export const ShipmentCardView = ({
  shipments,
  onDownloadCSV,
  className = "",
  isEditMode = false,
  onEditField
}: ShipmentCardViewProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Check if a field has AI mapping
  const getAIMappedField = (shipment: ShipmentData, fieldName: string): AIMappedField | undefined => {
    if (!shipment.aiMappedFields) return undefined;
    return shipment.aiMappedFields.find(field => field.field === fieldName);
  };
  
  // Check if the shipment has any AI-mapped fields
  const hasAIMappedFields = (shipment: ShipmentData): boolean => {
    return !!shipment.aiMappedFields && shipment.aiMappedFields.length > 0;
  };
  
  // Render AI confidence warning for shipments that need review
  const renderAIConfidenceWarning = (shipment: ShipmentData) => {
    if (!shipment.needsReview) return null;
    
    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded-md flex items-start space-x-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-700">
          <p className="font-medium">AI mapping confidence is low</p>
          <p>Some fields may not be mapped correctly. Please review before processing.</p>
        </div>
      </div>
    );
  };

  const handleDownloadCSV = (shipment: ShipmentData) => {
    if (onDownloadCSV) {
      onDownloadCSV(shipment);
    }
  };
  
  // Toggle item expansion for a specific shipment
  const toggleItems = (shipmentIndex: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [shipmentIndex]: !prev[shipmentIndex]
    }));
  };
  
  // Handle editing a field value
  const handleFieldEdit = (index: number, fieldName: string, value: string) => {
    if (onEditField && isEditMode) {
      onEditField(index, fieldName, value);
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {shipments.map((shipment, index) => (
        <Card key={index} className={`p-4 border ${shipment.needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Shipment Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center flex-wrap">
                  {shipment.loadNumber ? (
                    <>
                      Load #{shipment.loadNumber}
                      {getAIMappedField(shipment, 'loadNumber') && 
                        <AIMappingLabel aiField={getAIMappedField(shipment, 'loadNumber')!} />}
                    </>
                  ) : 'Shipment'}
                  
                  {shipment.status && (
                    <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {shipment.status}
                    </span>
                  )}
                  
                  {/* Display sheet name if available */}
                  {shipment.miscellaneousFields?.sheetName && (
                    <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      {shipment.miscellaneousFields.sheetName}
                    </span>
                  )}
                </h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadCSV(shipment)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </div>
              
              {renderAIConfidenceWarning(shipment)}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Left Column */}
                <div className="space-y-3">
                  {/* Identification Info */}
                  <div className="space-y-2">
                    {shipment.orderNumber && (
                      <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Order #:</span>
                        <span className="font-medium">
                          {shipment.orderNumber}
                          {getAIMappedField(shipment, 'orderNumber') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'orderNumber')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.poNumber && (
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">PO Number:</span>
                        <span className="font-medium">
                          {shipment.poNumber}
                          {getAIMappedField(shipment, 'poNumber') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'poNumber')!} />}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Dates */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Dates</h4>
                    
                    {shipment.promisedShipDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Ship Date:</span>
                        <span>
                          {formatDate(shipment.promisedShipDate)}
                          {getAIMappedField(shipment, 'promisedShipDate') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'promisedShipDate')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.requestDate && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Request Date:</span>
                        <span>
                          {formatDate(shipment.requestDate)}
                          {getAIMappedField(shipment, 'requestDate') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'requestDate')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.actualShipDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Actual Ship:</span>
                        <span>
                          {formatDate(shipment.actualShipDate)}
                          {getAIMappedField(shipment, 'actualShipDate') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'actualShipDate')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.expectedDeliveryDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Expected Delivery:</span>
                        <span>
                          {formatDate(shipment.expectedDeliveryDate)}
                          {getAIMappedField(shipment, 'expectedDeliveryDate') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'expectedDeliveryDate')!} />}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Shipment Details */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Shipment Details</h4>
                    
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 min-w-[100px]">Items:</span>
                      <span>{shipment.items.length}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 min-w-[100px]">Total Weight:</span>
                      <span>{shipment.totalWeight} kg</span>
                    </div>
                    
                    {shipment.totalValue !== undefined && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Total Value:</span>
                        <span>
                          ${shipment.totalValue}
                          {getAIMappedField(shipment, 'totalValue') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'totalValue')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.dimensions && (
                      <div className="flex items-center text-sm">
                        <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Dimensions:</span>
                        <span>
                          {shipment.dimensions}
                          {getAIMappedField(shipment, 'dimensions') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'dimensions')!} />}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-3">
                  {/* Shipping Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Shipping Information</h4>
                    
                    {(shipment.shipToCustomer || shipment.shipToArea) && (
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-gray-600 min-w-[100px]">Ship To:</span>
                        <div>
                          <div className="font-medium flex items-center">
                            {shipment.shipToCustomer || shipment.shipToArea}
                            {getAIMappedField(shipment, 'shipToCustomer') && 
                              <AIMappingLabel aiField={getAIMappedField(shipment, 'shipToCustomer')!} />}
                          </div>
                          
                          {shipment.shipToAddress && (
                            <div className="mt-1 flex items-center">
                              {shipment.shipToAddress}
                              {getAIMappedField(shipment, 'shipToAddress') && 
                                <AIMappingLabel aiField={getAIMappedField(shipment, 'shipToAddress')!} />}
                            </div>
                          )}
                          
                          <div className="mt-1">
                            {[
                              shipment.shipToCity,
                              shipment.shipToState,
                              shipment.shipToZip
                            ].filter(Boolean).join(', ')}
                            {shipment.shipToCountry && `, ${shipment.shipToCountry}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    
                    {shipment.contactName && (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Contact:</span>
                        <span>
                          {shipment.contactName}
                          {getAIMappedField(shipment, 'contactName') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'contactName')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.contactNumber && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Phone:</span>
                        <span>
                          {shipment.contactNumber}
                          {getAIMappedField(shipment, 'contactNumber') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'contactNumber')!} />}
                        </span>
                      </div>
                    )}
                    
                    {shipment.contactEmail && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600 min-w-[100px]">Email:</span>
                        <span>
                          {shipment.contactEmail}
                          {getAIMappedField(shipment, 'contactEmail') && 
                            <AIMappingLabel aiField={getAIMappedField(shipment, 'contactEmail')!} />}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Logistics Info */}
                  {(shipment.carrier || shipment.trackingNumber || shipment.routeNumber || shipment.vehicleType) && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Logistics Information</h4>
                      
                      {shipment.carrier && (
                        <div className="flex items-center text-sm">
                          <Truck className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 min-w-[100px]">Carrier:</span>
                          <span>
                            {shipment.carrier}
                            {getAIMappedField(shipment, 'carrier') && 
                              <AIMappingLabel aiField={getAIMappedField(shipment, 'carrier')!} />}
                          </span>
                        </div>
                      )}
                      
                      {shipment.trackingNumber && (
                        <div className="flex items-center text-sm">
                          <Hash className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 min-w-[100px]">Tracking #:</span>
                          <span>
                            {shipment.trackingNumber}
                            {getAIMappedField(shipment, 'trackingNumber') && 
                              <AIMappingLabel aiField={getAIMappedField(shipment, 'trackingNumber')!} />}
                          </span>
                        </div>
                      )}
                      
                      {shipment.routeNumber && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 min-w-[100px]">Route #:</span>
                          <span>
                            {shipment.routeNumber}
                            {getAIMappedField(shipment, 'routeNumber') && 
                              <AIMappingLabel aiField={getAIMappedField(shipment, 'routeNumber')!} />}
                          </span>
                        </div>
                      )}
                      
                      {shipment.vehicleType && (
                        <div className="flex items-center text-sm">
                          <Truck className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 min-w-[100px]">Vehicle Type:</span>
                          <span>
                            {shipment.vehicleType}
                            {getAIMappedField(shipment, 'vehicleType') && 
                              <AIMappingLabel aiField={getAIMappedField(shipment, 'vehicleType')!} />}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Remarks */}
              {shipment.remarks && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Remarks</h4>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        {shipment.remarks}
                        {getAIMappedField(shipment, 'remarks') && 
                          <AIMappingLabel aiField={getAIMappedField(shipment, 'remarks')!} />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Shipment Items */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Items</h4>
                  <button
                    onClick={() => toggleItems(index)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    {expandedItems[index] ? 'Hide Items' : 'Show Items'}
                  </button>
                </div>
                
                {expandedItems[index] && (
                  <ShipmentItemsTable 
                    items={shipment.items} 
                    expanded={true}
                    onToggleItems={() => null}
                  />
                )}
              </div>
              
              {/* Miscellaneous Fields */}
              {shipment.miscellaneousFields && Object.keys(shipment.miscellaneousFields).length > 0 && (
                <div className="mt-4 p-3 border border-blue-100 rounded-md bg-blue-50">
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Additional Fields
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(shipment.miscellaneousFields)
                      .filter(([key]) => key !== 'sheetName') // Filter out sheetName as it's already displayed
                      .map(([key, value], fieldIndex) => {
                        // Check if the value might be an Excel date
                        const stringValue = value?.toString() || '-';
                        const numValue = parseFloat(stringValue);
                        const isLikelyDate = !isNaN(numValue) && numValue > 1 && numValue < 50000;
                        const displayValue = isLikelyDate ? 
                          convertExcelDateToJSDate(numValue) : 
                          stringValue;
                        
                        return (
                          <div key={key} className="p-2 bg-white rounded border border-blue-100">
                            <div className="text-xs font-medium text-gray-500">{key}</div>
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
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 