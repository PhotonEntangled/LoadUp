"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea"; // Path incorrect, removed for now
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShipmentData, AIMappedField, ShipmentItem } from "@/types/shipment";
import { ShipmentField } from "./ShipmentField";
import { ShipmentItemsTable } from "./ShipmentItemsTable";
import { AIMappingLabel } from "./AIMappingLabel";
import ShipmentCard from "@/components/shipments/ShipmentCard";
import { formatDate } from "@/lib/formatters";
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

interface ShipmentDetailsViewProps {
  shipment: ShipmentData;
  className?: string;
}

export const ShipmentDetailsView = ({
  shipment,
  className = ""
}: ShipmentDetailsViewProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getAIMappedField = (fieldName: string): AIMappedField | undefined => {
    return shipment.parsingMetadata?.aiMappedFields?.find(f => f.field === fieldName);
  };

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const handleDownload = (shipmentData: ShipmentData, format: string) => {
    console.log(`Placeholder: Download ${shipmentData.loadNumber} as ${format}`);
  };

  const handleEdit = (shipmentData: ShipmentData) => {
    console.log(`Placeholder: Edit ${shipmentData.loadNumber}`);
  };

  return (
    <Card className={` ${className}`}>
      <ShipmentCard 
        // TODO: Fix type mismatch properly. ShipmentCard expects ApiShipmentDetail?
        shipment={shipment as any} // TEMPORARY: Cast to any to unblock build
        isSelected={false}
        onSelectShipment={() => {}}
        onDownload={handleDownload}
        onEdit={handleEdit}
      />

      {shipment.parsingMetadata?.aiMappedFields && Object.keys(shipment.parsingMetadata.aiMappedFields).length > 0 && (
        <div className="p-6 mt-4 border-t border-border">
          <h3 className="text-lg font-medium border-b pb-2 mb-3">AI Mapping Information</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left border border-gray-200 font-semibold">Field</th>
                  <th className="p-2 text-left border border-gray-200 font-semibold">Original Field</th>
                  <th className="p-2 text-left border border-gray-200 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(shipment.parsingMetadata.aiMappedFields).map((mapping: AIMappedField, index: number) => (
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

      {(shipment.createdAt || shipment.updatedAt) && (
        <div className="p-6 mt-4 border-t border-border">
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
    </Card>
  );
};