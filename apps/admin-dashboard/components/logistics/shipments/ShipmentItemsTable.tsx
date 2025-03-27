"use client";

import { useState } from "react";
import { ShipmentItem } from "@/lib/document-processing";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShipmentItemsTableProps {
  items: ShipmentItem[];
  onToggleItems?: () => void;
  expanded?: boolean;
  className?: string;
}

export const ShipmentItemsTable = ({
  items,
  onToggleItems,
  expanded = false,
  className = ""
}: ShipmentItemsTableProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onToggleItems) {
      onToggleItems();
    }
  };
  
  if (items.length === 0) {
    return <div className={`text-gray-500 italic ${className}`}>No items</div>;
  }
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{items.length} Item{items.length !== 1 ? 's' : ''}</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggle}
          className="h-6 px-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Items
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Items
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left border border-gray-200">Item #</th>
                <th className="p-2 text-left border border-gray-200">Description</th>
                <th className="p-2 text-left border border-gray-200">Lot/Serial</th>
                <th className="p-2 text-left border border-gray-200">Qty</th>
                <th className="p-2 text-left border border-gray-200">UOM</th>
                <th className="p-2 text-left border border-gray-200">Weight</th>
                <th className="p-2 text-left border border-gray-200">Dimensions</th>
                <th className="p-2 text-left border border-gray-200">Special Handling</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, itemIndex) => (
                <tr key={itemIndex} className="border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border border-gray-200">{item.itemNumber || "-"}</td>
                  <td className="p-2 border border-gray-200 max-w-xs truncate" title={item.description}>
                    {item.description || "-"}
                  </td>
                  <td className="p-2 border border-gray-200">{item.lotSerialNumber || "-"}</td>
                  <td className="p-2 border border-gray-200">{item.quantity || "-"}</td>
                  <td className="p-2 border border-gray-200">{item.uom || "-"}</td>
                  <td className="p-2 border border-gray-200">{item.weight ? `${item.weight} kg` : "-"}</td>
                  <td className="p-2 border border-gray-200">{item.dimensions || "-"}</td>
                  <td className="p-2 border border-gray-200">
                    {item.hazardous && <span className="text-red-500 font-medium">Hazardous</span>}
                    {item.specialHandling && (
                      <span className={item.hazardous ? " ml-2" : ""}>
                        {item.specialHandling}
                      </span>
                    )}
                    {!item.hazardous && !item.specialHandling && "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 