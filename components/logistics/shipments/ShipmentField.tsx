"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { AIMappingLabel } from "./AIMappingLabel";
import { Input } from "@/components/ui/input";
import { ShipmentData, AIMappedField } from "@/types/shipment";
import { formatDate } from "@/lib/formatters";

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
  const [editValue, setEditValue] = useState<string>("");

  // Update local state when the value prop changes
  useEffect(() => {
    // Handle potential date objects or other types
    if (value instanceof Date) {
        // Format date for input type="date" which expects YYYY-MM-DD
        setEditValue(value.toISOString().split('T')[0]);
    } else {
        setEditValue(value?.toString() || "");
    }
  }, [value]);

  // Check if this field has AI mapping information
  const getAIMappedField = (): AIMappedField | undefined => {
    // Access via parsingMetadata
    if (!shipment.parsingMetadata?.aiMappedFields) return undefined;
    // Assuming aiMappedFields is an array now
    const fieldsArray: AIMappedField[] = shipment.parsingMetadata.aiMappedFields;
    return fieldsArray.find((f: AIMappedField) => f.field === fieldName);
  };

  const aiMappedField = getAIMappedField();

  // Handle field change in edit mode
  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    if (onEdit) {
      onEdit(fieldName, newValue);
    }
  };

  // Render different input types based on field name
  const renderEditField = () => {
    // Determine input type based on field name or expected value type
    let inputType: React.HTMLInputTypeAttribute = "text";
    if (fieldName.toLowerCase().includes('date')) {
      inputType = "date";
    } else if (fieldName.toLowerCase().includes('weight') || fieldName.toLowerCase().includes('value')) {
      inputType = "number";
    } else if (fieldName.toLowerCase().includes('email')) {
       inputType = "email";
    } else if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number') && !fieldName.toLowerCase().includes('order') && !fieldName.toLowerCase().includes('tracking') && !fieldName.toLowerCase().includes('route')) {
       inputType = "tel";
    }

    const currentValue = editValue ?? ''; // Ensure value is a string

    // Use textarea for remarks or address
    if (['remarks', 'shipToAddress'].includes(fieldName)) {
      return (
        <textarea
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-1 text-sm border rounded-md h-auto min-h-[40px]" // Adjusted height
          rows={2}
        />
      );
    }

    // Use number input for specific fields
    if (inputType === "number") {
       return (
         <Input
           type="number"
           value={currentValue.replace(/[^\d.]/g, '')} // Keep only numbers and dots
           onChange={(e) => handleChange(e.target.value)}
           className="w-full p-1 text-sm h-8"
           step="any" // Allow decimals
         />
       );
     }

    // Default input for other types
    return (
      <Input
        type={inputType}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-1 text-sm h-8"
      />
    );
  };

  // Function to format display value (e.g., dates)
  const formatDisplayValue = (val: React.ReactNode): React.ReactNode => {
      if (val instanceof Date) {
          return formatDate(val.toISOString()); // Use utility if val is Date object
      }
      if (fieldName.toLowerCase().includes('date') && typeof val === 'string' && val) {
          return formatDate(val); // Attempt to format if it looks like a date string
      }
      return val ?? '-'; // Fallback display
  };


  return (
    <div className={`${className} flex items-center`}>
      {isEditable ? (
        <div className="w-full flex items-center">
          {renderEditField()}
          {aiMappedField && <span className="ml-2 flex-shrink-0"><AIMappingLabel aiField={aiMappedField} /></span>}
        </div>
      ) : (
        <>
          <span>{formatDisplayValue(value)}</span>
          {aiMappedField && <span className="ml-2"><AIMappingLabel aiField={aiMappedField} /></span>}
        </>
      )}
    </div>
  );
};