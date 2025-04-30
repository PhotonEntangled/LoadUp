'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';
import type { ApiShipmentDetail, ApiAddressDetail, ApiShipmentCoreInfo } from '@/types/api';
import type { StaticTrackingDetails } from '@/types/tracking';
import ShipmentCard from '@/components/shipments/ShipmentCard';
import { TrackingMap, TrackingMapRef } from '@/components/map/TrackingMap';
import { TrackingControls } from '@/components/map/TrackingControls';
import { useLiveTrackingStore } from '@/lib/store/useLiveTrackingStore';
import { getShipmentsForDocumentContaining, getStaticTrackingDetails } from '@/lib/actions/trackingActions';

// --- UI & Utils ---
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingPageViewProps {
  initialShipmentId: string;
}

export default function TrackingPageView({ initialShipmentId }: TrackingPageViewProps) {
  const mapRef = useRef<TrackingMapRef>(null);

  // State for fetching/displaying the list of related shipments - USE FULL TYPE
  const [shipmentList, setShipmentList] = useState<ApiShipmentDetail[]>([]); // Updated type
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for the currently selected shipment in the UI list
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(initialShipmentId);

  // State for fetching static details for the *selected* shipment
  const [staticDetails, setStaticDetails] = useState<StaticTrackingDetails | null>(null);
  const [isLoadingStatic, setIsLoadingStatic] = useState(false);
  const [staticError, setStaticError] = useState<string | null>(null);

  // Get actions from the live tracking store
  const { subscribe, unsubscribe } = useLiveTrackingStore(
    useCallback(state => ({ 
      subscribe: state.subscribe,
      unsubscribe: state.unsubscribe
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

  // Callback function for fetching static details and subscribing
  const loadStaticDetailsAndSubscribe = useCallback(async () => {
    if (!selectedShipmentId) return;
    
    logger.info(`[TrackingPageView] Loading static details & subscribing for: ${selectedShipmentId}`);
    setIsLoadingStatic(true);
    setStaticError(null);
    setStaticDetails(null); 
    // Important: Call unsubscribe *before* attempting to fetch/subscribe for a new selection
    // This prevents potential race conditions if selection changes quickly
    unsubscribe(); 

    try {
      const details = await getStaticTrackingDetails(selectedShipmentId);

      // Check if still mounted *after* await
      // (Technically less critical here as state updates handle it, but good practice)

      if (details) {
        setStaticDetails(details); 
        logger.info(`[TrackingPageView] Calling store subscribe for ${selectedShipmentId}`);
        await subscribe(selectedShipmentId, details); 
        setStaticError(null); // Clear error on success
      } else {
        setStaticError(`Static details not found for shipment ${selectedShipmentId}.`);
        setStaticDetails(null);
      }
    } catch (error: any) {
      logger.error(`[TrackingPageView] Error loading static details or subscribing for ${selectedShipmentId}:`, error);
      setStaticError(error.message || 'Failed to load tracking details.');
      setStaticDetails(null);
    } finally {
      // Check mount status less critical here if state updates handle unmount correctly
      setIsLoadingStatic(false);
    }
  }, [selectedShipmentId, subscribe, unsubscribe]); // Dependencies

  // Effect 1: Fetch the list of shipments belonging to the same document
  useEffect(() => {
    let isMounted = true;
    const fetchShipmentList = async () => {
      if (!initialShipmentId) return;
      logger.info(`[TrackingPageView] Fetching shipment list containing: ${initialShipmentId}`);
      setIsLoadingList(true);
      setListError(null);
      try {
        // --- Call actual Server Action --- 
        const list = await getShipmentsForDocumentContaining(initialShipmentId);
        // --- End Server Action Call ---

        if (isMounted) {
          if (list) {
            setShipmentList(list);
            // Verify initialShipmentId still exists in the list - Added Type Annotation
            if (!list.some((s: ApiShipmentDetail) => s.coreInfo.id === initialShipmentId)) { 
                logger.warn(`Initial shipment ID ${initialShipmentId} not found in the fetched list.`);
                // Select the first item if the initial one isn't present
                if (list.length > 0) {
                     setSelectedShipmentId(list[0].coreInfo.id);
                }
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

    return () => { isMounted = false; };
  }, [initialShipmentId]);

  // Effect 2: Trigger fetch/subscribe when selectedShipmentId changes
  useEffect(() => {
    loadStaticDetailsAndSubscribe();

    // Cleanup function (still handled by the store's unsubscribe on component unmount or dependency change)
    // No explicit cleanup needed here now as unsubscribe is called at start of fetch
  }, [loadStaticDetailsAndSubscribe]); // Depend on the callback

  // Handler for selecting a shipment from the list
  // Parameter type is now the full ApiShipmentDetail
  const handleSelectShipment = useCallback((shipment: ApiShipmentDetail) => {
    const newId = shipment?.coreInfo?.id ?? null; // Use coreInfo.id
    logger.debug(`[TrackingPageView] Shipment card clicked: ${newId}`);
    if (newId && newId !== selectedShipmentId) {
      setSelectedShipmentId(newId);
    }
  }, [selectedShipmentId]);

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
      <Accordion type="single" collapsible className="w-full" defaultValue={initialShipmentId}>
        {/* No need to adapt props, ShipmentCard expects ApiShipmentDetail */}
        {shipmentList.map((shipment) => { 
          return (
            <ShipmentCard 
              key={shipment.coreInfo.id}
              shipment={shipment} // Pass the full object directly
              isSelected={shipment.coreInfo.id === selectedShipmentId}
              onSelectShipment={() => handleSelectShipment(shipment)} // Pass full object
              onDownload={() => logger.warn('Download clicked, not implemented in TrackingPageView')}
              onEdit={() => logger.warn('Edit clicked, not implemented in TrackingPageView')}
            />
          );
        })}
      </Accordion>
    );
  };

  const renderMapArea = () => {
    if (isLoadingStatic) {
        return <div className="p-4 flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span> Loading tracking details...</span></div>;
    }
    if (staticError) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full text-red-600">
                <p className="mb-4">Error loading tracking details: {staticError}</p>
                <Button onClick={loadStaticDetailsAndSubscribe} variant="destructive">
                    Retry Load
                </Button>
            </div>
        );
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
    <div className="flex h-full w-full bg-gray-100"> 
      {/* Left Column: Shipment List */}
      <div className="w-1/3 max-w-sm border-r border-gray-300 flex flex-col bg-white overflow-y-auto"> 
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Shipments in Document</h2> 
            {/* Can add document ID here if needed */}
        </div>
        {renderShipmentList()}
      </div>

      {/* Right Column: Map and Controls */}
      <div className="flex-1 flex flex-col relative"> 
        {renderMapArea()}
      </div>
    </div>
  );
} 