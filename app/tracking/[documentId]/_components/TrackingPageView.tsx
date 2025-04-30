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
import { Accordion } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Trackable statuses
const TRACKABLE_STATUSES: (typeof shipmentStatusEnum.enumValues[number])[] = [
  shipmentStatusEnum.enumValues[2], // 'IN_TRANSIT'
  shipmentStatusEnum.enumValues[3], // 'AT_PICKUP'
  shipmentStatusEnum.enumValues[4], // 'AT_DROPOFF'
  // Consider if 'BOOKED' (index 1) should be trackable
];

export default function TrackingPageView({ documentId }: TrackingPageViewProps) {
  const mapRef = useRef<TrackingMapRef>(null);

  // State for fetching/displaying the list of related shipments
  const [shipmentList, setShipmentList] = useState<ApiShipmentDetail[]>([]); 
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for the currently selected shipment ID in the UI list
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null); 

  // State for static details of the *selected* shipment (to pass to map)
  const [selectedStaticDetails, setSelectedStaticDetails] = useState<MapStaticProps | null>(null);
  const [isLoadingSelection, setIsLoadingSelection] = useState(false); // Loading state for selection processing
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Get actions from the live tracking store
  const { subscribe, unsubscribe, trackedShipmentId, subscriptionStatus, subscriptionError } = useLiveTrackingStore(
    useCallback(state => ({ 
      subscribe: state.subscribe,
      unsubscribe: state.unsubscribe,
      trackedShipmentId: state.trackedShipmentId, // Needed to compare with selected
      subscriptionStatus: state.subscriptionStatus, // Needed for loading/error display
      subscriptionError: state.subscriptionError,
    }), [])
  );

  // Get necessary state for display and controls
  const { latestLiveUpdate } = useLiveTrackingStore(
    useCallback(state => ({ latestLiveUpdate: state.latestLiveUpdate }), [])
  );

  // Calculate staleness here, similar to TrackingMap
  const [isStale, setIsStale] = useState(false);
  useEffect(() => {
    const STALE_THRESHOLD_MS = 30000; // 30 seconds
    let staleCheckTimer: NodeJS.Timeout | null = null;

    const checkStaleness = () => {
        let currentIsStale = false;
        if (latestLiveUpdate && typeof latestLiveUpdate.timestamp === 'number') {
            const timeDiff = Date.now() - latestLiveUpdate.timestamp;
            currentIsStale = timeDiff > STALE_THRESHOLD_MS;
        } else {
            currentIsStale = false; // Not stale if no update exists
        }
        setIsStale(currentIsStale);
    };

    checkStaleness(); // Initial check

    // Periodically check even if no new updates arrive
    staleCheckTimer = setInterval(checkStaleness, 5000); // Check every 5 seconds

    return () => {
      if (staleCheckTimer) {
        clearInterval(staleCheckTimer);
      }
    };
  }, [latestLiveUpdate]);

  // Effect 1: Fetch the list of shipments belonging to the same document
  useEffect(() => {
    let isMounted = true;
    const fetchShipmentList = async () => {
      if (!documentId) return; 
      logger.info(`[TrackingPageView] Fetching shipment list for document: ${documentId}`);
      setIsLoadingList(true);
      setListError(null);
      setShipmentList([]); // Clear previous list
      setSelectedShipmentId(null); // Clear selection
      setSelectedStaticDetails(null); // Clear map details
      unsubscribe(); // Unsubscribe if switching documents

      try {
        // --- Call actual Server Action --- 
        const list = await getShipmentsForDocumentContaining(documentId);
        // --- End Server Action Call ---

        if (isMounted) {
          if (list) {
            setShipmentList(list);
            // Optionally, auto-select the first *trackable* shipment
            const firstTrackable = list.find(s => 
                s.coreInfo.status && TRACKABLE_STATUSES.includes(s.coreInfo.status as any) // Type assertion needed due to string type
            );
            if (firstTrackable) {
              // Trigger selection logic for the first trackable item
              // Use a timeout to allow initial render before triggering selection effects
              setTimeout(() => handleSelectShipment(firstTrackable), 0);
            } else {
              logger.info(`[TrackingPageView] No initially trackable shipments found in document ${documentId}.`);
            }
          } else {
            setListError('Could not find related shipments.');
            setShipmentList([]);
          }
        }
      } catch (error: any) {
        logger.error("[TrackingPageView] Error fetching shipment list:", error);
        if (isMounted) {
          setListError(error.message || 'Failed to load shipment list.');
          setShipmentList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingList(false);
        }
      }
    };

    fetchShipmentList();

    // Cleanup on documentId change or unmount
    return () => { 
      isMounted = false; 
      unsubscribe(); // Ensure cleanup when component unmounts or documentId changes
    };
  }, [documentId, unsubscribe]); // Depend on documentId and unsubscribe action

  // Handler for selecting a shipment from the list
  const handleSelectShipment = useCallback(async (shipment: ApiShipmentDetail) => {
    const newId = shipment?.coreInfo?.id ?? null;
    logger.debug(`[TrackingPageView] Shipment card selected: ${newId}`);

    if (!newId) {
        setSelectionError("Invalid shipment selected.");
        return;
    }

    // Prevent re-processing if already selected
    if (newId === selectedShipmentId) {
        logger.debug(`[TrackingPageView] Shipment ${newId} already selected.`);
        return;
    }
    
    setIsLoadingSelection(true);
    setSelectionError(null);
    setSelectedShipmentId(newId);
    setSelectedStaticDetails(null); // Clear previous details immediately
    unsubscribe(); // Unsubscribe from previous selection first

    try {
        // Check if the selected shipment is trackable
        const currentStatus = shipment.coreInfo.status;
        const isTrackable = currentStatus ? TRACKABLE_STATUSES.includes(currentStatus as any) : false; // Type assertion needed

        // Prepare static details needed by the map component
        // Correct path based on ApiShipmentDetail type inspection
        const pickupAddress = shipment.locationDetails?.pickups?.[0]?.address;
        const dropoffAddress = shipment.locationDetails?.dropoffs?.[0]?.address;
        const mapDetails: MapStaticProps = {
            originCoords: pickupAddress && pickupAddress.longitude != null && pickupAddress.latitude != null 
                ? [pickupAddress.longitude, pickupAddress.latitude] 
                : null,
            destinationCoords: dropoffAddress && dropoffAddress.longitude != null && dropoffAddress.latitude != null
                ? [dropoffAddress.longitude, dropoffAddress.latitude]
                : null,
            // Initialize plannedRouteGeometry as null
            plannedRouteGeometry: null, 
        };
        
        // Fetch route geometry if origin/destination exist
        if(mapDetails.originCoords && mapDetails.destinationCoords) {
            try {
                logger.info(`[TrackingPageView] Fetching route geometry for ${newId}...`);
                const routeGeometry = await getRouteGeometryAction(mapDetails.originCoords, mapDetails.destinationCoords);
                if (routeGeometry) {
                    mapDetails.plannedRouteGeometry = routeGeometry;
                    logger.info(`[TrackingPageView] Successfully fetched route geometry for ${newId}.`);
                } else {
                    logger.warn(`[TrackingPageView] Failed to fetch route geometry for ${newId}. Proceeding without route line.`);
                    // Optionally set selectionError here if route is mandatory?
                    // setSelectionError('Failed to calculate route for this shipment.');
                }
            } catch (routeError) {
                logger.error(`[TrackingPageView] Error fetching route geometry for ${newId}:`, routeError);
                // Optionally set selectionError
                // setSelectionError('Error calculating route.');
            }
        }

        setSelectedStaticDetails(mapDetails); // Set details needed for the map (including fetched route or null)

        if (isTrackable) {
            logger.info(`[TrackingPageView] Shipment ${newId} is trackable. Subscribing...`);
            // Assuming subscribe now only needs shipmentId (pending store refactor)
            await subscribe(newId); 
        } else {
            logger.info(`[TrackingPageView] Shipment ${newId} is not trackable (status: ${shipment.coreInfo.status}). Skipping subscription.`);
            // Optionally display a message to the user
        }
         setSelectionError(null); // Clear error on success
    } catch (error: any) {
        logger.error(`[TrackingPageView] Error processing selection for ${newId}:`, error);
        setSelectionError(error.message || 'Failed to process selection.');
        setSelectedStaticDetails(null); // Clear details on error
    } finally {
       setIsLoadingSelection(false);
    }

  }, [selectedShipmentId, subscribe, unsubscribe]); // Dependencies

  // --- Render Logic ---
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
      <Accordion type="single" collapsible className="w-full" value={selectedShipmentId ?? undefined} >
        {shipmentList.map((shipment) => { 
          // Determine if the card should be disabled for selection
          const currentStatus = shipment.coreInfo.status;
          const isTrackable = currentStatus ? TRACKABLE_STATUSES.includes(currentStatus as any) : false; // Type assertion needed
          const isSelected = shipment.coreInfo.id === selectedShipmentId;
          
          return (
            <ShipmentCard 
              key={shipment.coreInfo.id}
              shipment={shipment} 
              isSelected={isSelected}
              // Pass selection handler, wrap in no-op if not trackable
              onSelectShipment={isTrackable ? () => handleSelectShipment(shipment) : () => {}} 
              onDownload={() => logger.warn('Download clicked, not implemented in TrackingPageView')}
              onEdit={() => logger.warn('Edit clicked, not implemented in TrackingPageView')}
            />
          );
        })}
      </Accordion>
    );
  };

  const renderMapArea = () => {
    // Show loading/error related to selection process or subscription status
    if (isLoadingSelection) {
         return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span> Processing selection...</span></div>;
    }
    if (selectionError) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-red-600">
                <p className="mb-4">Error processing selection: {selectionError}</p>
                {/* Add a retry mechanism if applicable, e.g., re-select? */}
            </div>
        );
    }
     // Display subscription errors from the store
    if (subscriptionStatus === 'error' && subscriptionError) {
         return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-red-600">
                <p className="mb-4">Subscription Error: {subscriptionError}</p>
                {/* Consider adding a retry button that calls handleSelectShipment with current selectedShipmentId */}
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

    // Show loading indicator during subscription process
    if (subscriptionStatus === 'subscribing') {
         return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span> Subscribing to live updates...</span></div>;
    }
    
    // Only render map if a shipment is selected AND we have the static details
    if (!selectedShipmentId || !selectedStaticDetails) {
         return <div className="p-4 flex justify-center items-center h-full text-gray-500">Select a trackable shipment from the list to view tracking.</div>;
    }
    
    // TODO: Get Mapbox token securely
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
        return <div className="p-4 text-red-600">Mapbox token is not configured.</div>;
    }

    return (
        <div className="relative h-full w-full">
            <TrackingMap 
                ref={mapRef}
                mapboxToken={mapboxToken}
                // Pass static details needed by the map as props
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
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[minmax(350px,_1fr)_3fr] xl:grid-cols-[minmax(400px,_1fr)_4fr]">
      {/* Left Column: Shipment List */}
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="p-4 font-semibold border-b border-gray-200 dark:border-gray-800">
              Shipments for Document {documentId} 
          </div>
          {/* TODO: Add Search/Filter Bar here if needed */} 
          <div className="flex-grow overflow-y-auto">
            {renderShipmentList()}
          </div>
      </div>

      {/* Right Column: Map & Controls */}
      <div className="flex flex-col h-full overflow-hidden">
          {/* Removed the Controls placeholder - Map Area will render map + controls */} 
          {renderMapArea()}
      </div>
    </div>
  );
} 