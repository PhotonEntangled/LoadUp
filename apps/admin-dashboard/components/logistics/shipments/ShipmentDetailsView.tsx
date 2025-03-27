"use client";

import { ShipmentData, formatDate, AIMappedField } from "@/lib/document-processing";
import { Card } from "@/components/shared/Card";
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  Truck, 
  Info,
  Hash,
  Tag,
  User,
  Mail,
  Globe,
  DollarSign,
  Ruler,
  Clock
} from "lucide-react";
import { AIMappingLabel } from "./AIMappingLabel";
import { ShipmentItemsTable } from "./ShipmentItemsTable";

interface ShipmentDetailsViewProps {
  shipment: ShipmentData;
  className?: string;
}

export const ShipmentDetailsView = ({
  shipment,
  className = ""
}: ShipmentDetailsViewProps) => {
  // Check if a field has AI mapping
  const getAIMappedField = (fieldName: string): AIMappedField | undefined => {
    if (!shipment.aiMappedFields) return undefined;
    return shipment.aiMappedFields.find(field => field.field === fieldName);
  };
  
  // Render field with label and icon
  const renderField = (
    label: string, 
    value: React.ReactNode, 
    icon: React.ReactNode, 
    fieldName?: string
  ) => {
    if (!value) return null;
    
    const aiField = fieldName ? getAIMappedField(fieldName) : undefined;
    
    return (
      <div className="flex items-center text-sm py-2 border-b border-gray-100">
        <div className="text-gray-400 mr-3">{icon}</div>
        <div className="text-gray-600 w-1/4">{label}:</div>
        <div className="font-medium flex items-center">
          {value}
          {aiField && <AIMappingLabel aiField={aiField} />}
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Basic Information</h3>
          <div className="space-y-1">
            {renderField("Load Number", shipment.loadNumber, <Hash className="h-4 w-4" />, "loadNumber")}
            {renderField("Order Number", shipment.orderNumber, <Hash className="h-4 w-4" />, "orderNumber")}
            {renderField("PO Number", shipment.poNumber, <FileText className="h-4 w-4" />, "poNumber")}
            {renderField("Status", shipment.status, <Tag className="h-4 w-4" />, "status")}
          </div>
        </div>
        
        {/* Dates Section */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Dates</h3>
          <div className="space-y-1">
            {renderField("Promised Ship Date", formatDate(shipment.promisedShipDate), <Calendar className="h-4 w-4" />, "promisedShipDate")}
            {renderField("Request Date", formatDate(shipment.requestDate), <Clock className="h-4 w-4" />, "requestDate")}
            {renderField("Actual Ship Date", formatDate(shipment.actualShipDate), <Calendar className="h-4 w-4" />, "actualShipDate")}
            {renderField("Expected Delivery", formatDate(shipment.expectedDeliveryDate), <Calendar className="h-4 w-4" />, "expectedDeliveryDate")}
          </div>
        </div>
        
        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Shipping Information</h3>
          <div className="space-y-1">
            {renderField("Ship To", shipment.shipToCustomer || shipment.shipToArea, <MapPin className="h-4 w-4" />, "shipToCustomer")}
            {renderField("Address", shipment.shipToAddress, <MapPin className="h-4 w-4" />, "shipToAddress")}
            {renderField("City", shipment.shipToCity, <MapPin className="h-4 w-4" />, "shipToCity")}
            {renderField("State", shipment.shipToState, <MapPin className="h-4 w-4" />, "shipToState")}
            {renderField("ZIP Code", shipment.shipToZip, <MapPin className="h-4 w-4" />, "shipToZip")}
            {renderField("Country", shipment.shipToCountry, <Globe className="h-4 w-4" />, "shipToCountry")}
          </div>
        </div>
        
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Contact Information</h3>
          <div className="space-y-1">
            {renderField("Contact Name", shipment.contactName, <User className="h-4 w-4" />, "contactName")}
            {renderField("Contact Number", shipment.contactNumber, <Phone className="h-4 w-4" />, "contactNumber")}
            {renderField("Contact Email", shipment.contactEmail, <Mail className="h-4 w-4" />, "contactEmail")}
          </div>
        </div>
        
        {/* Shipment Details */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Shipment Details</h3>
          <div className="space-y-1">
            {renderField("Total Weight", `${shipment.totalWeight} kg`, <Tag className="h-4 w-4" />, "totalWeight")}
            {renderField("Total Value", shipment.totalValue ? `$${shipment.totalValue}` : undefined, <DollarSign className="h-4 w-4" />, "totalValue")}
            {renderField("Dimensions", shipment.dimensions, <Ruler className="h-4 w-4" />, "dimensions")}
            {renderField("Remarks", shipment.remarks, <Info className="h-4 w-4" />, "remarks")}
          </div>
        </div>
        
        {/* Logistics Information */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Logistics Information</h3>
          <div className="space-y-1">
            {renderField("Carrier", shipment.carrier, <Truck className="h-4 w-4" />, "carrier")}
            {renderField("Tracking Number", shipment.trackingNumber, <Hash className="h-4 w-4" />, "trackingNumber")}
            {renderField("Route Number", shipment.routeNumber, <Truck className="h-4 w-4" />, "routeNumber")}
            {renderField("Vehicle Type", shipment.vehicleType, <Truck className="h-4 w-4" />, "vehicleType")}
          </div>
        </div>
        
        {/* Items Section */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-3">Items ({shipment.items.length})</h3>
          <ShipmentItemsTable items={shipment.items} expanded />
        </div>
        
        {/* AI Mapping Information */}
        {shipment.aiMappedFields && shipment.aiMappedFields.length > 0 && (
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-3">AI Mapping Information</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left border border-gray-200">Field</th>
                    <th className="p-2 text-left border border-gray-200">Original Field</th>
                    <th className="p-2 text-left border border-gray-200">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.aiMappedFields.map((mapping, index) => (
                    <tr key={index} className="border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border border-gray-200">{mapping.field}</td>
                      <td className="p-2 border border-gray-200">{mapping.originalField || '-'}</td>
                      <td className="p-2 border border-gray-200">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          mapping.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                          mapping.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(mapping.confidence * 100)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Metadata Section */}
        {(shipment.createdAt || shipment.updatedAt) && (
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-3">Metadata</h3>
            <div className="space-y-1 text-sm text-gray-500">
              {shipment.createdAt && (
                <div>Created: {new Date(shipment.createdAt).toLocaleString()}</div>
              )}
              {shipment.updatedAt && (
                <div>Last Updated: {new Date(shipment.updatedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 