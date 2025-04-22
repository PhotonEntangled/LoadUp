"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation'; // Assuming usage if this is a page component routed via [id]
import { Loader2, Search, MapPinned, AlertCircle as ErrorIcon } from 'lucide-react'; // Use common icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ShipmentCard from '@/components/shipments/ShipmentCard'; // Ensure path is correct
// import { ShipmentData } from '@/types/shipment'; // OLD TYPE
import { ApiShipmentDetail } from '@/types/api'; // NEW TYPE
import { useDebounce } from '@/hooks/use-debounce'; // Assuming useDebounce hook exists

// Placeholder for Map Preview component if refactored later
// For now, logic is inline
// import MapPreview from './MapPreview'; 

interface ShipmentDetailPageContentProps {
  documentId: string;
}

const ShipmentDetailPageContent: React.FC<ShipmentDetailPageContentProps> = ({ documentId }) => {
  const [shipments, setShipments] = useState<ApiShipmentDetail[]>([]); // Use ApiShipmentDetail
  const [selectedShipment, setSelectedShipment] = useState<ApiShipmentDetail | null>(null); // Use ApiShipmentDetail
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredShipments, setFilteredShipments] = useState<ApiShipmentDetail[]>([]); // Use ApiShipmentDetail
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search input

  // Data Fetching Function
  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // console.log(`[DetailPage] Fetching shipments for document ID: ${documentId}`); // DEBUG
    try {
      const response = await fetch(`/api/shipments?documentId=${documentId}`);
      // console.log(`[DetailPage] API Response Status: ${response.status}`); // DEBUG
      if (!response.ok) {
        const errorData = await response.text();
        // console.error(`[DetailPage] API Error Response Text: ${errorData}`); // DEBUG
        throw new Error(`Failed to fetch shipments (${response.status}): ${errorData}`);
      }
      const data: ApiShipmentDetail[] = await response.json(); // Use ApiShipmentDetail
      // console.log(`[DetailPage] Received data from API:`, JSON.stringify(data, null, 2)); // DEBUG
      setShipments(data);
      // Select the first shipment by default if data is available
      if (data.length > 0) {
        setSelectedShipment(data[0]);
      } else {
        setSelectedShipment(null);
      }
    } catch (err) {
      console.error("Error fetching shipments:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setShipments([]); // Clear shipments on error
      setSelectedShipment(null);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  // Initial data fetch
  useEffect(() => {
    if (documentId) {
      fetchShipments();
    } else {
      // Handle case where documentId might not be available initially
      setIsLoading(false);
      setError("Document ID is missing.");
    }
  }, [documentId, fetchShipments]);

  // Filtering Logic
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredShipments(shipments);
      return;
    }

    const normalizedSearchTerm = debouncedSearchTerm.toLowerCase().trim();

    const filtered = shipments.filter((shipment) => {
      // Helper function to check if a value contains the search term
      const containsSearchTerm = (value: any): boolean => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(normalizedSearchTerm);
      };

      // Check searchable fields using the ApiShipmentDetail structure
      return (
        containsSearchTerm(shipment.coreInfo.loadNumber) ||
        containsSearchTerm(shipment.coreInfo.orderNumber) ||
        containsSearchTerm(shipment.coreInfo.poNumber) ||
        containsSearchTerm(shipment.coreInfo.status) ||
        containsSearchTerm(shipment.originAddress?.rawInput) ||
        containsSearchTerm(shipment.originAddress?.name) ||
        containsSearchTerm(shipment.originAddress?.city) ||
        containsSearchTerm(shipment.originAddress?.stateProvince) || // Use stateProvince
        containsSearchTerm(shipment.destinationAddress?.rawInput) ||
        containsSearchTerm(shipment.destinationAddress?.name) ||
        containsSearchTerm(shipment.destinationAddress?.city) ||
        containsSearchTerm(shipment.destinationAddress?.stateProvince) || // Use stateProvince
        containsSearchTerm(shipment.recipient?.contactName) || // Check recipient contact name
        containsSearchTerm(shipment.customDetails?.transporter?.carrierName) || // Check carrier name
        containsSearchTerm(shipment.metadata.remarks) || // Check remarks
        shipment.items?.some(
          (item) =>
            containsSearchTerm(item.sku) || // Use sku if available
            containsSearchTerm(item.description) ||
            containsSearchTerm(item.lotSerialNumber) // Also check lotSerialNumber if present
        )
      );
    });

    setFilteredShipments(filtered);
    // console.log(`[DetailPage] Filtered shipments before render:`, JSON.stringify(filteredShipments, null, 2)); // DEBUG
  }, [debouncedSearchTerm, shipments]);

  // Event Handlers
  const toggleCardExpansion = (shipmentIdentifier: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [shipmentIdentifier]: !prev[shipmentIdentifier],
    }));
  };

  const handleDownload = (shipment: ApiShipmentDetail, format: string) => { // Use ApiShipmentDetail
    // TODO: Implement actual download logic
    console.log(`Downloading shipment ${shipment.coreInfo.loadNumber} as ${format}`);
    alert(`Download functionality for ${format} not yet implemented.`);
  };
  
  const handleEdit = (shipment: ApiShipmentDetail) => { // Use ApiShipmentDetail
    // TODO: Implement actual edit logic (e.g., navigate or open modal)
     console.log(`Edit shipment: ${shipment.coreInfo.loadNumber}`);
     alert(`Edit functionality not yet implemented.`);
  };

  // The Corrected JSX Return Block
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight dark:text-foreground">
          Shipments for Document ID:
          <span className="text-primary ml-2 font-mono text-xl">{documentId}</span>
        </h2>
        {/* Add back button or breadcrumbs if needed */}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
         <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 border border-destructive text-destructive rounded-lg">
            <ErrorIcon className="h-12 w-12 mb-2" />
            <h3 className="text-lg font-medium">Failed to load shipments</h3>
            <p className="mt-1">Error: {error}</p>
            <Button onClick={fetchShipments} variant="destructive" className="mt-4">Try Again</Button>
       </div>
      )}

      {/* Content Area - Only render if not loading and no error */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Shipment List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search within these shipments..."
                  className="pl-8 border dark:bg-input dark:border-input dark:text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Shipment List - Render based on filteredShipments */}
            {filteredShipments.length > 0 ? (
              <div className="space-y-4">
                 {filteredShipments.map((shipment) => {
                  // Generate identifier for state management
                  // Use coreInfo.id if available, fallback otherwise
                  const shipmentIdentifier = shipment.coreInfo.id || shipment.coreInfo.loadNumber || `${shipment.coreInfo.orderNumber}-${shipment.coreInfo.poNumber}` || `ship-${Math.random()}`;
                  return (
                    <ShipmentCard
                      key={shipmentIdentifier} 
                      shipment={shipment} // Pass the full shipment object (now correctly typed)
                      isSelected={selectedShipment?.coreInfo.id === shipment.coreInfo.id} // Select based on coreInfo.id
                      onSelectShipment={setSelectedShipment} // Pass selection handler
                      onDownload={handleDownload}   // Pass download handler
                      onEdit={handleEdit} // Pass edit handler
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-muted dark:bg-muted rounded-lg border dark:border-border">
                No shipments found {searchTerm ? "matching your search" : "for this document"}.
              </div>
            )}
         </div>

          {/* Right Column: Map Preview (Updated) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-card border border-border rounded-lg p-4 flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height as needed */}
              <h3 className="text-lg font-semibold mb-1">Map Preview</h3>
               <p className="text-sm text-muted-foreground mb-4">
                 {selectedShipment ? `Showing route for Load #${selectedShipment.coreInfo.loadNumber}` : "Select a shipment"}
               </p>
              
              {selectedShipment ? (
                <>
                  <div className="bg-muted rounded-lg border border-border overflow-hidden h-[300px] mb-4 relative flex items-center justify-center">
                    {/* Simple placeholder line */}
                    <div className="absolute left-0 right-0 top-1/2 flex items-center justify-between px-8">
                      <div className="h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-200/30 z-10" title="Origin"></div>
                      <div className="h-1 bg-indigo-400/70 flex-1 mx-4"></div>
                      <div className="h-4 w-4 rounded-full bg-red-500 ring-4 ring-red-200/30 z-10" title="Destination"></div>
                    </div>
                     <span className="text-muted-foreground font-medium">Map Preview Area</span>
                  </div>
                  {/* Origin/Destination Text (Updated) */}
                   <div className="space-y-2 mb-4 text-sm">
                     <div className="flex items-center">
                       <div className="h-3 w-3 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                       <span className="text-xs text-foreground truncate" title={selectedShipment?.originAddress?.rawInput ?? ''}>
                         {selectedShipment?.originAddress?.name || selectedShipment?.originAddress?.rawInput || "Origin N/A"}
                       </span>
                     </div>
                     <div className="flex items-center">
                       <div className="h-3 w-3 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
                       <span className="text-xs text-foreground truncate" title={selectedShipment?.destinationAddress?.rawInput ?? ''}>
                         {selectedShipment?.destinationAddress?.name || selectedShipment?.destinationAddress?.rawInput || "Destination N/A"}
                       </span>
                     </div>
                   </div>
                   {/* Add other preview details if needed */}
                  <Button size="sm" className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => alert('Open Full Tracking not implemented yet.')}>
                    Open Full Tracking
                  </Button>
                </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-muted rounded-lg border border-border border-dashed">
                      <MapPinned className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Select a shipment to view its route</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetailPageContent; // Export the component