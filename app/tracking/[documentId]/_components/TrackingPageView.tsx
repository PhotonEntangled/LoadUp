'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';
import type { ApiShipmentDetail, ApiAddressDetail, ApiShipmentCoreInfo } from '@/types/api';
import type { StaticTrackingDetails } from '@/types/tracking';
import ShipmentCard from '@/components/shipments/ShipmentCard';
import { TrackingMap, TrackingMapRef } from '@/components/map/TrackingMap';
import { TrackingControls } from '@/components/map/TrackingControls';
import { useLiveTrackingStore } from '@/lib/store/useLiveTrackingStore';
import { getShipmentsForDocumentContaining, getRouteGeometryAction } from '@/lib/actions/trackingActions';
import { shipmentStatusEnum } from '@/lib/database/schema';

// --- UI & Utils ---
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/formatters";

// Define a type for the static details needed by the map
// Based on TrackingMap potential needs (Task 9.R.4)
type MapStaticProps = {
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  plannedRouteGeometry: GeoJSON.LineString | null; 
};

interface TrackingPageViewProps {
  documentId: string;
}

// Define thresholds
const STALE_THRESHOLD_MS = 30000; // e.g., 30 seconds

// List of statuses considered trackable for initiating live updates
const TRACKABLE_STATUSES = [
    shipmentStatusEnum.enumValues[1], // Idle
    shipmentStatusEnum.enumValues[2], // Assigned
    shipmentStatusEnum.enumValues[3], // Accepted
    shipmentStatusEnum.enumValues[4], // ArrivedAtPickup
    shipmentStatusEnum.enumValues[5], // Loading
    shipmentStatusEnum.enumValues[6], // LoadingComplete
    shipmentStatusEnum.enumValues[7], // EnRoute
    shipmentStatusEnum.enumValues[8], // ArrivedAtDropoff
    shipmentStatusEnum.enumValues[8], // Unloading (Corrected index from 9 to 8)
];

export default function TrackingPageView({ documentId }: TrackingPageViewProps) {
  const mapRef = useRef<TrackingMapRef>(null);

  // State for the list of shipments
  const [shipmentList, setShipmentList] = useState<ApiShipmentDetail[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for the selected shipment and its static details
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [selectedStaticDetails, setSelectedStaticDetails] = useState<MapStaticProps | null>(null);
  const [isLoadingSelection, setIsLoadingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Zustand store hooks
  const subscribe = useLiveTrackingStore((state) => state.subscribe);
  const unsubscribe = useLiveTrackingStore((state) => state.unsubscribe);
  const latestLiveUpdate = useLiveTrackingStore((state) => state.latestLiveUpdate);
  const subscriptionStatus = useLiveTrackingStore((state) => state.subscriptionStatus);
  const subscriptionError = useLiveTrackingStore((state) => state.subscriptionError);

  // State for data staleness
  const [isStale, setIsStale] = useState(false);

  // --- Derived State: Calculate staleness based on latest update ---
  useEffect(() => {
    const checkStaleness = () => {
      if (!latestLiveUpdate?.timestamp) {
        setIsStale(true); // Consider stale if no timestamp
        return;
      }
      const timeDiff = Date.now() - latestLiveUpdate.timestamp;
      setIsStale(timeDiff > STALE_THRESHOLD_MS);
    };

    checkStaleness(); // Initial check
    const intervalId = setInterval(checkStaleness, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval
  }, [latestLiveUpdate?.timestamp]);

  // --- Effects ---
  
  // Effect to fetch the shipment list when the documentId changes
  useEffect(() => {
    let isMounted = true;
    const fetchShipmentList = async () => {
      if (!documentId) {
        setListError("Document ID is missing.");
        setIsLoadingList(false);
        return;
      }
      logger.info(`[TrackingPageView] Fetching shipment list for document: ${documentId}`);
      setIsLoadingList(true);
      setListError(null);
      setShipmentList([]); // Clear previous list
      setSelectedShipmentId(null); // Clear selection
      setSelectedStaticDetails(null);
      unsubscribe(); // Unsubscribe if switching documents

      try {
        const result = await getShipmentsForDocumentContaining(documentId);
        if (isMounted) {
          if (result) {
            setShipmentList(result);
            logger.info(`[TrackingPageView] Fetched ${result.length} shipments.`);
            // Check if any are initially trackable (optional, for logging/initial state)
            const initiallyTrackable = result.some(s => s.coreInfo.status && TRACKABLE_STATUSES.includes(s.coreInfo.status as any));
            if (!initiallyTrackable) {
                logger.info(`[TrackingPageView] No initially trackable shipments found in document ${documentId}.`);
            }
          } else {
            setShipmentList([]);
            setListError('Failed to fetch shipments or none found.');
          }
        }
      } catch (error: any) {
        logger.error("[TrackingPageView] Error fetching shipment list:", error);
        if (isMounted) {
          setListError(error.message || "Failed to load shipments.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingList(false);
        }
      }
    };

    fetchShipmentList();

    return () => { 
      isMounted = false; 
      unsubscribe(); 
    };
  }, [documentId, unsubscribe]); 

  // Handler for selecting a shipment from the list
  const handleSelectShipment = useCallback(async (shipment: ApiShipmentDetail) => {
    const newId = shipment?.coreInfo?.id ?? null;
    logger.debug(`[TrackingPageView] Shipment card selected: ${newId}`);

    if (!newId) {
        setSelectionError("Invalid shipment selected.");
        return;
    }

    if (newId === selectedShipmentId) {
        logger.debug(`[TrackingPageView] Shipment ${newId} already selected.`);
        return;
    }
    
    setIsLoadingSelection(true);
    setSelectionError(null);
    setSelectedShipmentId(newId);
    setSelectedStaticDetails(null);
    unsubscribe();

    try {
        const currentStatus = shipment.coreInfo.status;
        const isTrackable = currentStatus ? TRACKABLE_STATUSES.includes(currentStatus as any) : false;
        const pickupAddress = shipment.locationDetails?.pickups?.[0]?.address;
        const dropoffAddress = shipment.locationDetails?.dropoffs?.[0]?.address;
        const mapDetails: MapStaticProps = {
            originCoords: pickupAddress && pickupAddress.longitude != null && pickupAddress.latitude != null 
                ? [pickupAddress.longitude, pickupAddress.latitude] 
                : null,
            destinationCoords: dropoffAddress && dropoffAddress.longitude != null && dropoffAddress.latitude != null
                ? [dropoffAddress.longitude, dropoffAddress.latitude]
                : null,
            plannedRouteGeometry: null, 
        };
        
        if(mapDetails.originCoords && mapDetails.destinationCoords) {
            try {
                logger.info(`[TrackingPageView] Fetching route geometry for ${newId}...`);
                const routeGeometry = await getRouteGeometryAction(mapDetails.originCoords, mapDetails.destinationCoords);
                if (routeGeometry) {
                    mapDetails.plannedRouteGeometry = routeGeometry;
                    logger.info(`[TrackingPageView] Successfully fetched route geometry for ${newId}.`);
                } else {
                    logger.warn(`[TrackingPageView] Failed to fetch route geometry for ${newId}. Proceeding without route line.`);
                }
            } catch (routeError) {
                logger.error(`[TrackingPageView] Error fetching route geometry for ${newId}:`, routeError);
            }
        }

        setSelectedStaticDetails(mapDetails);

        if (isTrackable) {
            logger.info(`[TrackingPageView] Shipment ${newId} is trackable. Subscribing...`);
            await subscribe(newId); 
        } else {
            logger.info(`[TrackingPageView] Shipment ${newId} is not trackable (status: ${shipment.coreInfo.status}). Skipping subscription.`);
        }
         setSelectionError(null); 
    } catch (error: any) {
        logger.error(`[TrackingPageView] Error processing selection for ${newId}:`, error);
        setSelectionError(error.message || 'Failed to process selection.');
        setSelectedStaticDetails(null); 
    } finally {
       setIsLoadingSelection(false);
    }

  }, [selectedShipmentId, subscribe, unsubscribe]);

  // --- Render Functions ---
  const renderShipmentList = () => {
    if (isLoadingList) {
      return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (listError) {
      return <div className="p-4 text-red-600">Error loading shipments: {listError}</div>;
    }
    if (shipmentList.length === 0) {
      return <div className="p-4 text-gray-500">No related shipments found.</div>;
    }
    return (
      <Accordion type="single" collapsible className="w-full space-y-2">
        {shipmentList.map((shipment) => { 
          const shipmentId = shipment.coreInfo.id;
          const currentStatus = shipment.coreInfo.status;
          const isTrackable = currentStatus ? TRACKABLE_STATUSES.includes(currentStatus as any) : false;
          const isSelected = shipmentId === selectedShipmentId;
          const isDisabled = !isTrackable || isLoadingSelection; 

          // Get address details for content
          const originAddress = shipment.locationDetails?.pickups?.[0]?.address;
          const destinationAddress = shipment.locationDetails?.dropoffs?.[0]?.address;
          const deliveryDate = shipment.coreInfo.plannedDeliveryDate;

          return (
            <AccordionItem 
              value={shipmentId} 
              key={shipmentId}
              className={cn(
                "border rounded-lg bg-card text-card-foreground", 
                isSelected ? "ring-2 ring-primary ring-inset" : "", 
                isDisabled && "opacity-60 cursor-not-allowed"
              )}
            >
               <AccordionTrigger 
                 disabled={isDisabled}
                 className={cn(
                   "flex justify-between items-center w-full p-3 hover:no-underline focus:outline-none group data-[state=open]:border-b",
                   isDisabled && "pointer-events-none"
                 )}
                 onClick={(e) => {
                    if (!isDisabled) {
                        handleSelectShipment(shipment);
                    } else {
                        e.preventDefault();
                    }
                 }}
                 role="button"
                 tabIndex={isDisabled ? -1 : 0}
                 aria-label={isSelected ? `Selected Shipment ${shipment.coreInfo.loadNumber || shipmentId.substring(0,8)}` : `Select Shipment ${shipment.coreInfo.loadNumber || shipmentId.substring(0,8)}`}
                 aria-disabled={isDisabled}
               >
                  <div className="flex-grow flex items-center gap-2 text-left mr-2">
                     <div className="flex-grow">
                        <h2 className="text-sm font-semibold leading-tight" title={shipment.coreInfo.loadNumber ? `Load #${shipment.coreInfo.loadNumber}` : `Shipment ID: ${shipmentId}`}>
                           {shipment.coreInfo.loadNumber 
                              ? `Load #${shipment.coreInfo.loadNumber}` 
                              : <span className="text-xs text-muted-foreground">ID: {shipmentId.substring(0,8)}...</span>
                           }
                        </h2>
                        {shipment.coreInfo.poNumber && 
                        <p className="text-xs text-muted-foreground mt-0.5 truncate" title={`PO #${shipment.coreInfo.poNumber}`}>
                           {`PO #${shipment.coreInfo.poNumber}`}
                        </p>
                        }
                     </div>
                  </div>
                  <div className="flex-none flex items-center space-x-2">
                     {isLoadingSelection && isSelected ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                     ) : (
                        <StatusBadge status={shipment.coreInfo.status ?? "UNKNOWN"} /> 
                     )}
                  </div>
               </AccordionTrigger>
               <AccordionContent className="p-3 pt-2 text-sm border-t">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3"> 
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs truncate">
                                    {originAddress?.city && originAddress?.stateProvince
                                    ? `${originAddress.city}, ${originAddress.stateProvince}`
                                    : originAddress?.fullAddress || "N/A"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start"><p>{originAddress?.fullAddress || 'N/A'}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</p>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs truncate">
                                    {destinationAddress?.city && destinationAddress?.stateProvince
                                    ? `${destinationAddress.city}, ${destinationAddress.stateProvince}`
                                    : destinationAddress?.fullAddress || "N/A"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start"><p>{destinationAddress?.fullAddress || 'N/A'}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Delivery Date</p>
                        <p className="text-xs"> 
                          {deliveryDate ? formatDate(deliveryDate) : 'N/A'} 
                        </p>
                    </div>
                 </div>
               </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };
  
  // Define mapboxToken here, outside renderMapArea
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  // Define mapStyle consistently with Simulation page
  const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/standard'; 

  const renderMapArea = () => {
    if (isLoadingSelection) {
         return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span> Processing selection...</span></div>;
    }
    if (selectionError) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-red-600">
                <p className="mb-4">Error processing selection: {selectionError}</p>
            </div>
        );
    }
     if (subscriptionStatus === 'error' && subscriptionError) {
         return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-red-600">
                <p className="mb-4">Subscription Error: {subscriptionError}</p>
                {selectedShipmentId && shipmentList.find(s => s.coreInfo.id === selectedShipmentId) && (
                    <Button 
                       onClick={() => handleSelectShipment(shipmentList.find(s => s.coreInfo.id === selectedShipmentId)!)} 
                       variant="destructive"
                    >
                        Retry Subscription
                    </Button>
                )}
            </div>
        );
    }

    if (subscriptionStatus === 'subscribing') {
         return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span> Subscribing to live updates...</span></div>;
    }
    
    // Check map token availability first
    if (!mapboxToken) {
        logger.error("[TrackingPageView] Mapbox token is not configured.");
        return <div className="p-4 text-red-600">Map configuration error.</div>;
    }
    // Check map style availability (added check)
    if (!mapStyle) {
        logger.error("[TrackingPageView] Mapbox style URL is not configured.");
        return <div className="p-4 text-red-600">Map configuration error.</div>;
    }

    // Check if ready to render map (selection made and static details loaded)
    if (!selectedShipmentId || !selectedStaticDetails) {
         return <div className="p-4 flex justify-center items-center h-full text-gray-500">Select a trackable shipment from the list to view tracking.</div>;
    }

    // Render the map and controls
    // Null checks for selectedStaticDetails are implicitly handled by the check above
    return (
        <div className="relative h-full w-full">
            <TrackingMap 
                ref={mapRef}
                mapboxToken={mapboxToken} 
                mapStyle={mapStyle}
                originCoords={selectedStaticDetails.originCoords} 
                destinationCoords={selectedStaticDetails.destinationCoords} 
                plannedRouteGeometry={selectedStaticDetails.plannedRouteGeometry} 
                className="h-full w-full"
            />
            <TrackingControls 
                mapRef={mapRef} 
                latestTimestamp={latestLiveUpdate?.timestamp} 
                isStale={isStale} 
            />
        </div>
    );
  }

  // --- Main Layout ---
  return (
    // Ensure the top-level container takes full height and uses flex column layout
    <div className="flex flex-col h-[calc(100vh-var(--header-height))] overflow-hidden"> 
      {/* Use a flex-grow container for the main content area */}
      <div className="flex flex-1 overflow-hidden"> 
        {/* Left Column: Shipment List - Ensure it scrolls vertically */}
        {/* Add max-width and allow vertical scrolling */}
        <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-y-auto"> 
          {/* Header Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800"> 
            <h1 className="text-lg font-semibold">Shipments for Document</h1>
            <p className="text-xs text-muted-foreground truncate" title={documentId}>{documentId}</p>
          </div>
          {/* Shipment List Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {renderShipmentList()}
          </div>
        </div>

        {/* Right Column: Map Area - Make it take remaining space and handle its own potential overflow */}
        {/* Use flex-1 to grow and min-w-0 to prevent pushing out */}
        <div className="flex-1 flex flex-col min-w-0 h-full"> 
          {renderMapArea()}
        </div>
      </div>
    </div>
  );
} 