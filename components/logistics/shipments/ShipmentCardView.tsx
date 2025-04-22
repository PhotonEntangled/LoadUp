"use client";

import React, { useState } from "react";
// Restore type import - we still need to find the correct path eventually
import { ShipmentData } from "@/types/shipment"; 
import ShipmentCard from '@/components/shipments/ShipmentCard';

interface ShipmentCardViewProps {
  shipments: ShipmentData[]; // Restore type
  className?: string;
}

export const ShipmentCardView = ({
  shipments,
  className = "",
}: ShipmentCardViewProps) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCardExpansion = (shipmentId: string) => {
    setExpandedCards(prev => ({ 
      ...prev,
      [shipmentId]: !prev[shipmentId] 
    }));
  };

  if (!shipments || shipments.length === 0) {
    return <div className={`text-center py-8 text-gray-500 ${className}`}>No shipments to display.</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {shipments.map((shipment, index) => {
        const cardId = shipment.loadNumber || shipment.orderNumber || `shipment-${index}`;
        return (
          <ShipmentCard
            key={cardId}
            // TODO: Fix type mismatch properly. ShipmentCard expects ApiShipmentDetail?
            shipment={shipment as any} // TEMPORARY: Cast to any to unblock build
            isSelected={false}
            onSelectShipment={() => { console.log("Select shipment clicked in CardView - placeholder"); }}
            onDownload={() => { console.warn('Download action not implemented in CardView'); }} 
            onEdit={() => { console.warn('Edit action not implemented in CardView'); }} 
          />
        );
      })}
    </div>
  );
};
