"use client";

import { useState, useEffect } from "react";
import { ShipmentData, AIMappedField } from "@/lib/document-processing";
import { AIMappingLabel } from "./AIMappingLabel";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/document-processing";

interface ShipmentFieldProps {
  shipment: ShipmentData;
  fieldName: string;
  value: React.ReactNode;
  showAIIndicator?: boolean;
  className?: string;
  isEditable?: boolean;
  onEdit?: (fieldName: string, value: string) => void;
}

/**
 * Component for displaying a shipment field with optional AI mapping indicator
 * Supports edit mode with different input types based on the field
 */
export const ShipmentField = ({
  shipment,
  fieldName,
  value,
  showAIIndicator = true,
  className = "",
  isEditable = false,
  onEdit
}: ShipmentFieldProps) => {
  const [editValue, setEditValue] = useState<string>(value?.toString() || "");
  
  // Update local state when the value prop changes
  useEffect(() => {
    setEditValue(value?.toString() || "");
  }, [value]);
  
  // Check if this field has AI mapping information
  const getAIMappedField = (shipment: ShipmentData, fieldName: string): AIMappedField | undefined => {
    if (!shipment.aiMappedFields) return undefined;
    return shipment.aiMappedFields.find(field => field.field === fieldName);
  };
  
  const aiField = showAIIndicator ? getAIMappedField(shipment, fieldName) : undefined;
  
  // Handle field change in edit mode
  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    if (onEdit) {
      onEdit(fieldName, newValue);
    }
  };
  
  // Render different input types based on field name
  const renderEditField = () => {
    // Date fields
    if (['promisedShipDate', 'requestDate', 'actualShipDate', 'expectedDeliveryDate'].includes(fieldName)) {
      return (
        <Input 
          type="date" 
          value={editValue !== '-' ? editValue : ''} 
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-1 text-sm h-8" 
        />
      );
    }
    
    // Number fields
    else if (['totalWeight', 'totalValue'].includes(fieldName)) {
      return (
        <Input 
          type="number" 
          value={editValue !== '-' ? editValue.replace(/[^\d.]/g, '') : ''} 
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-1 text-sm h-8" 
          step="0.01"
        />
      );
    }
    
    // Text area fields for longer text
    else if (['remarks', 'shipToAddress'].includes(fieldName)) {
      return (
        <textarea
          value={editValue !== '-' ? editValue : ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-1 text-sm border rounded-md"
          rows={2}
        />
      );
    }
    
    // Default text input for other fields
    else {
      return (
        <Input 
          type="text" 
          value={editValue !== '-' ? editValue : ''} 
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-1 text-sm h-8" 
        />
      );
    }
  };
  
  return (
    <div className={`${className}`}>
      {isEditable ? (
        <div className="w-full">
          {renderEditField()}
          {aiField && <AIMappingLabel aiField={aiField} />}
        </div>
      ) : (
        <div className="flex items-center">
          <span>{value}</span>
          {aiField && <AIMappingLabel aiField={aiField} />}
        </div>
      )}
    </div>
  );
}; 