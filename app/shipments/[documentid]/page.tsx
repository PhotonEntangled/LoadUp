"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { MapPinned, Search, X, RefreshCw, ExternalLink, AlertCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ShipmentCard from "@/components/shipments/ShipmentCard";
import ShipmentDetailView from "@/components/shipments/ShipmentDetailView";
import type { ApiShipmentDetail } from "@/types/api";
import { notFound, useRouter } from 'next/navigation';
import { logger } from "@/utils/logger";
import { StaticRouteMap } from "@/components/map/StaticRouteMap";
import type { Feature, LineString, Point } from 'geojson';
import { getSimulationInputForShipment } from '@/lib/actions/simulationActions';
import { SimulationStoreContext } from '@/lib/context/SimulationStoreContext';
import type { SimulationStoreApi } from '@/lib/store/useSimulationStore';
import { toast } from "@/hooks/use-toast";
import { Accordion } from "@/components/ui/accordion";
import { getShipmentLastKnownLocation } from '@/lib/actions/shipmentActions';
import { startSimulation } from '@/lib/actions/simulationActions';
import Link from "next/link";

// Simple debounce hook
function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (...args: any[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );
}

export default function Page({ params }: { params: { documentid: string } }) {
    const { documentid } = params;
    const router = useRouter();

    // --- State Management ---
    const [shipments, setShipments] = useState<ApiShipmentDetail[]>([]);
    const [selectedShipment, setSelectedShipment] = useState<ApiShipmentDetail | null>(null);
    const [filteredShipments, setFilteredShipments] = useState<ApiShipmentDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true); // General page loading
    const [error, setError] = useState<string | null>(null); // General page error
    const [isSimLoading, setIsSimLoading] = useState<boolean>(false); // Loading state for simulation start button
    const [isRefreshingLocation, setIsRefreshingLocation] = useState<boolean>(false); // State for refresh LKL button

    // Store Access
    const storeApi = useContext(SimulationStoreContext);

    // State for map-specific data
    const [currentRouteGeometry, setCurrentRouteGeometry] = useState<Feature<LineString> | null>(null);
    const [currentLastPosition, setCurrentLastPosition] = useState<Feature<Point> | null>(null);
    const [currentLastBearing, setCurrentLastBearing] = useState<number | null>(null);
    const [mapDataLoading, setMapDataLoading] = useState<boolean>(false); // State for loading map geometry/LKL
    const [mapError, setMapError] = useState<string | null>(null); // Specific error for map data fetch

    // Helper to safely extract coordinates
    const getCoordinates = useCallback((addressData: ApiShipmentDetail['originAddress'] | ApiShipmentDetail['destinationAddress']): [number, number] | undefined => {
        if (addressData && typeof addressData.longitude === 'number' && typeof addressData.latitude === 'number') {
            return [addressData.longitude, addressData.latitude];
        }
        return undefined;
    }, []);

    // Helper to convert lat/lon/timestamp to GeoJSON Point Feature
    const createPositionFeature = useCallback((lat: number | null, lon: number | null, timestamp: string | null): Feature<Point> | null => {
        logger.debug(`[createPositionFeature] Input - Lat: ${lat}, Lon: ${lon}, Timestamp: ${timestamp}`);
        if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
            const feature: Feature<Point> = {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lon, lat] },
                properties: { timestamp: timestamp },
            };
            logger.debug('[createPositionFeature] Created feature:', feature);
            return feature;
        }
        logger.debug('[createPositionFeature] Returning null (invalid lat/lon).');
        return null;
    }, []);

    // Function to Fetch Route Geometry
    const fetchRouteGeometry = useCallback(async (originCoords: [number, number], destCoords: [number, number]) => {
        logger.info(`[ShipmentPage] Fetching route geometry for ${originCoords} -> ${destCoords}`);
        setMapDataLoading(true);
        setMapError(null);
        setCurrentRouteGeometry(null); // Clear previous route

        try {
            const apiUrl = `/api/maps/directions?originLon=${originCoords[0]}&originLat=${originCoords[1]}&destLon=${destCoords[0]}&destLat=${destCoords[1]}`;
            const res = await fetch(apiUrl);

            if (!res.ok) {
                let errorMsg = `Failed to fetch route geometry. Status: ${res.status}`;
                try {
                    const errorJson = await res.json();
                    errorMsg = errorJson.error || errorMsg;
                } catch { /* Ignore if body isn't JSON */ }
                throw new Error(errorMsg);
            }

            const geometry: Feature<LineString>['geometry'] = await res.json();
            
            // Reconstruct the Feature object
            const routeFeature: Feature<LineString> = {
                type: "Feature",
                properties: {},
                geometry: geometry 
            };

            if (routeFeature.geometry?.type === 'LineString' && routeFeature.geometry.coordinates.length > 0) {
                 setCurrentRouteGeometry(routeFeature);
                 logger.info("[ShipmentPage] Successfully fetched and set route geometry.");
            } else {
                 throw new Error("Invalid route geometry received from API.");
            }

        } catch (err) {
            logger.error("[ShipmentPage] Error fetching route geometry:", err);
            setMapError(err instanceof Error ? err.message : "Failed to load route.");
            setCurrentRouteGeometry(null); // Ensure route is cleared on error
        } finally {
            setMapDataLoading(false);
        }
    }, []);

    // Initial Data Fetching
    useEffect(() => {
        const fetchShipments = async () => {
            setLoading(true);
            setError(null);
            setSelectedShipment(null);
            setCurrentRouteGeometry(null);
            setCurrentLastPosition(null);
            setCurrentLastBearing(null);
            logger.debug(`Fetching shipments for document ID: ${documentid}`);
            try {
                const res = await fetch(`/api/shipments?documentId=${documentid}`);
                if (!res.ok) {
                    if (res.status === 404) {
                         logger.warn(`No shipments found for documentId: ${documentid}`);
                         setShipments([]);
                         setFilteredShipments([]);
                         setSelectedShipment(null);
                         // Optionally set an error: setError("No shipments found for this document.");
                    } else {
                        throw new Error(`Failed to fetch shipments: ${res.status} ${res.statusText}`);
                    }
                } else {
                     const data: ApiShipmentDetail[] = await res.json();
                     logger.debug('[fetchShipments] Raw data received from API:', data);
    
                     if (!Array.isArray(data)) {
                          throw new Error(`API did not return an array. Received: ${JSON.stringify(data)}`);
                     }
    
                     logger.debug(`Fetched ${data.length} shipments for document ${documentid}`);
                     setShipments(data);
                     setFilteredShipments(data);
                     if (data.length > 0) {
                         const initialSelected = data[0];
                         setSelectedShipment(initialSelected);

                         // Process initial last known location
                         logger.debug('[fetchShipments] Processing initial LKL for:', {
                             id: initialSelected?.coreInfo?.id,
                             lat: initialSelected?.coreInfo?.lastKnownLatitude,
                             lon: initialSelected?.coreInfo?.lastKnownLongitude,
                             ts: initialSelected?.coreInfo?.lastKnownTimestamp
                         });
                         const initialPosition = createPositionFeature(
                             initialSelected.coreInfo.lastKnownLatitude,
                             initialSelected.coreInfo.lastKnownLongitude,
                             initialSelected.coreInfo.lastKnownTimestamp
                         );
                         const initialBearing = initialSelected.coreInfo.lastKnownBearing;
                         setCurrentLastBearing(initialBearing);
                         logger.info(`[ShipmentPage] Initial bearing set from fetch: ${initialBearing}`);
                         setCurrentLastPosition(initialPosition);
                         if (initialPosition) {
                            logger.info("[ShipmentPage] Initial last known position set from fetch.", initialPosition);
                         } else {
                            logger.info(`[ShipmentPage] No initial last known position found in fetched data for shipment ID: ${initialSelected.coreInfo.id}. Lat: ${initialSelected.coreInfo.lastKnownLatitude}, Lon: ${initialSelected.coreInfo.lastKnownLongitude}`);
                         }

                         // Trigger initial map data fetch if coordinates are valid
                         const initialOriginCoords = getCoordinates(initialSelected.originAddress);
                         const initialDestCoords = getCoordinates(initialSelected.destinationAddress);
                         if (initialOriginCoords && initialDestCoords) {
                            fetchRouteGeometry(initialOriginCoords, initialDestCoords);
                         } else {
                             logger.warn("Initial shipment missing valid coordinates for route fetching.");
                         }

                     } else {
                         setSelectedShipment(null);
                         logger.warn(`Zero shipments returned for documentId: ${documentid}`);
                     }
                }
            } catch (err) {
                logger.error("Error fetching shipment data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                setShipments([]);
                setFilteredShipments([]);
                setSelectedShipment(null);
            } finally {
                setLoading(false);
            }
        };

        fetchShipments();
    }, [documentid, getCoordinates, fetchRouteGeometry, createPositionFeature]);
    
    // Fetch Map Data When Selected Shipment Changes
     useEffect(() => {
        if (!selectedShipment) {
            setCurrentRouteGeometry(null);
            setCurrentLastPosition(null);
            setCurrentLastBearing(null);
            setMapError(null);
            return; 
        }

        const originCoords = getCoordinates(selectedShipment.originAddress);
        const destCoords = getCoordinates(selectedShipment.destinationAddress);

        if (originCoords && destCoords) {
            fetchRouteGeometry(originCoords, destCoords);
        } else {
            logger.warn("Selected shipment missing valid coordinates for route fetching.");
            setCurrentRouteGeometry(null);
            setCurrentLastPosition(null);
            setCurrentLastBearing(null);
            setMapError("Missing coordinates for route.");
        }

        // Process last known location on selection change
        if (selectedShipment) {
            logger.debug('[Selection Effect] Processing LKL for selected:', {
                id: selectedShipment?.coreInfo?.id,
                lat: selectedShipment?.coreInfo?.lastKnownLatitude,
                lon: selectedShipment?.coreInfo?.lastKnownLongitude,
                ts: selectedShipment?.coreInfo?.lastKnownTimestamp
            });
            const newPosition = createPositionFeature(
                selectedShipment.coreInfo.lastKnownLatitude,
                selectedShipment.coreInfo.lastKnownLongitude,
                selectedShipment.coreInfo.lastKnownTimestamp
            );
            const newBearing = selectedShipment.coreInfo.lastKnownBearing;
            setCurrentLastBearing(newBearing);
            logger.info(`[ShipmentPage] Bearing updated on selection change: ${newBearing}`);
            setCurrentLastPosition(newPosition);
             if (newPosition) {
                 logger.info("[ShipmentPage] Last known position updated on selection change.", newPosition);
             } else {
                 const shipmentId = selectedShipment.coreInfo.id ?? 'UNKNOWN_ID';
                 logger.info(`[ShipmentPage] No last known position found for newly selected shipment ID: ${shipmentId}. Lat: ${selectedShipment.coreInfo.lastKnownLatitude}, Lon: ${selectedShipment.coreInfo.lastKnownLongitude}`);
             }
        } else {
             setCurrentLastPosition(null); // Clear if no shipment selected
        }

    }, [selectedShipment, getCoordinates, fetchRouteGeometry, createPositionFeature]);

    // Search/Filtering
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredShipments(shipments);
            return;
        }
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        const filtered = shipments.filter((shipment) => {
            const containsSearchTerm = (value: any): boolean => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'object') {
                    return Object.values(value).some(containsSearchTerm);
                }
                return String(value).toLowerCase().includes(normalizedSearchTerm);
            };

            return containsSearchTerm(shipment);
        });

        setFilteredShipments(filtered);
    }, [searchTerm, shipments]);

    // --- Event Handlers ---
    const handleSearchChange = useDebounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, 300);

    const handleDownload = (shipment: ApiShipmentDetail, format: string) => {
        logger.info(`Downloading shipment ${shipment.coreInfo.id} as ${format}`);
        toast({ title: "Info", description: "Download functionality not yet implemented.", variant: "default" });
    };
    const handleEdit = (shipment: ApiShipmentDetail) => {
        logger.debug(`Editing shipment ${shipment.coreInfo.id}`);
        toast({ title: "Info", description: "Edit functionality not yet implemented.", variant: "default" });
    };

    const handleRefreshLocation = useCallback(async () => {
        if (!selectedShipment) {
            toast({ title: "Info", description: "No shipment selected to refresh.", variant: "default" });
            return;
        }
        logger.info(`[ShipmentPage] Refreshing location for shipment: ${selectedShipment.coreInfo.id}`);
        setIsRefreshingLocation(true);
        try {
            const result = await getShipmentLastKnownLocation(selectedShipment.coreInfo.id);
            if (result.error) {
                throw new Error(result.error);
            }
            setCurrentLastPosition(result.position);
            setCurrentLastBearing(result.bearing);
            logger.info(`[ShipmentPage] Bearing refreshed successfully: ${result.bearing}`);
            if (result.position) {
                 toast({ title: "Success", description: `Location updated to ${result.timestamp ? new Date(result.timestamp).toLocaleString() : 'latest'}.`, variant: "default" });
                 logger.info(`[ShipmentPage] Location refreshed successfully. Position:`, result.position);
            } else {
                 toast({ title: "Info", description: "No updated location found for this shipment.", variant: "default" });
                 logger.info(`[ShipmentPage] No location data returned after refresh.`);
            }

        } catch (err) {
            logger.error("[ShipmentPage] Error refreshing location:", err);
            toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to refresh location.", variant: "destructive" });
        } finally {
            setIsRefreshingLocation(false);
        }
    }, [selectedShipment]);

    const handleViewTracking = async (shipmentId: string, documentId: string) => {
        logger.info(`Shipment Page: View Tracking clicked for shipment ${shipmentId} in doc ${documentId}`);
        setIsSimLoading(true);
        setError(null); 
        
        try {
            // 1. Fetch the simulation input data using the server action
            const simulationInputResult = await getSimulationInputForShipment(shipmentId);

            if ('error' in simulationInputResult) {
                throw new Error(`Failed to get simulation input: ${simulationInputResult.error}`);
            }
            
            logger.info('[handleViewTracking] Received SimulationInput:', simulationInputResult);

            // 2. Call the startSimulation server action with the fetched input
            const startResult = await startSimulation(simulationInputResult);

            if (startResult.error) {
                throw new Error(`Failed to start simulation: ${startResult.error}`);
            }

            if (!startResult.data || !startResult.vehicleId) {
                throw new Error('Simulation started but returned no vehicle data or ID.');
            }
            const vehicleDataFromServer = startResult.data;
            logger.info('[handleViewTracking] Simulation start successful. Received vehicle data from server.', { vehicleId: startResult.vehicleId });

            // 3. Update the simulation store with the vehicle data from the server
            if (!storeApi) {
                throw new Error("Simulation store context is not available.");
            }
            const setVehicleAction = storeApi.getState().setVehicleFromServer;

            if (typeof setVehicleAction !== 'function') {
                 logger.error('[handleViewTracking] setVehicleFromServer action is not available via context!', { storeState: storeApi.getState() });
                 throw new Error('Simulation state update action failed.');
            }

            // Call the action with the data received from the server
            setVehicleAction(vehicleDataFromServer);
            logger.info(`Shipment Page: Set vehicle state in client store using server data for ${shipmentId}.`);

            // 4. Navigate to the simulation page
            logger.info(`Shipment Page: Navigating to simulation page...`);
            router.push(`/simulation/${documentId}?selectedShipmentId=${startResult.vehicleId}`);

        } catch (err) {
            logger.error('Shipment Page: Error preparing or starting simulation:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Failed to start tracking: ${errorMessage}`);
            toast({ title: "Error Starting Tracking", description: errorMessage, variant: "destructive" });
        } finally {
            setIsSimLoading(false); 
        }
    };

    // --- Render Logic ---

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading shipment data...</p></div>;
    }

    if (error) {
        return (
           <div className="flex flex-col justify-center items-center h-screen text-red-500 p-4">
               <h2 className="text-lg font-semibold mb-2">Error Loading Shipments</h2>
               <p className="text-center">{error}</p>
           </div>
        );
    }
    
    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!mapboxAccessToken) {
      logger.error('Shipment Page: NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN is not defined!');
      return (
        <div className="flex justify-center items-center h-screen text-orange-500">
          <p>Map configuration error: Access token is missing.</p>
        </div>
      );
    }

    const originCoords = selectedShipment ? getCoordinates(selectedShipment.originAddress) : undefined;
    const destinationCoords = selectedShipment ? getCoordinates(selectedShipment.destinationAddress) : undefined;

    const showTrackingButton = selectedShipment && 
                             selectedShipment.coreInfo.status !== 'DELIVERED' && 
                             selectedShipment.coreInfo.status !== 'CANCELLED' &&
                             selectedShipment.coreInfo.status !== 'AWAITING_STATUS';
                             
    if (!loading && shipments.length === 0) {
         return (
            <div className="flex flex-col justify-center items-center h-screen text-muted-foreground p-4">
                <MapPinned className="h-12 w-12 mb-4" />
                <h2 className="text-lg font-semibold mb-2">No Shipments Found</h2>
                <p className="text-center">No shipments are associated with Document ID: {documentid}</p>
            </div>
         );
    }

    return (
        <div className="container mx-auto p-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(340px,_1fr)_2fr] gap-4 h-full">
                {/* Left Column: Shipment List */}
                <div className="space-y-4 overflow-y-auto h-full pl-2 pr-2"> 
                    <div className="flex justify-between items-center mb-1 md:mb-2">
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">Shipments</h1>
                            <p className="text-xs text-muted-foreground">
                                Doc ID: {documentid} • {shipments.length} found
                            </p>
                        </div>
                    </div>
                    <div className="relative mb-4">
                        <Input
                            type="text"
                            placeholder="Search shipments..."
                            className="pl-10 pr-10 bg-card border-input w-full"
                            onChange={handleSearchChange}
                            defaultValue={searchTerm}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {searchTerm && (
                            <button
                                className="absolute inset-y-0 right-3 flex items-center"
                                onClick={() => setSearchTerm("")}
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Shipment Card List - Wrapped in Accordion */}
                     <Accordion type="single" collapsible className="w-full space-y-2">
                    {filteredShipments.length > 0 ? (
                        filteredShipments.map((shipment) => (
                             <ShipmentCard
                                key={shipment.coreInfo.id}
                                shipment={shipment}
                                isSelected={selectedShipment?.coreInfo.id === shipment.coreInfo.id}
                                onSelectShipment={setSelectedShipment}
                                onDownload={handleDownload}
                                onEdit={handleEdit}
                             />
                         ))
                     ) : (
                        <div className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-card text-center mt-4">
                            <Search className="h-8 w-8 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No shipments found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mb-3">
                                No shipments match &quot;{searchTerm}&quot;. Try adjusting your search.
                            </p>
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                                Clear Search
                            </Button>
                        </div>
                    )}
                    </Accordion>

                </div>

                {/* Right Column: Map Preview & Details */}
                <div className="space-y-4 overflow-y-auto h-full pl-2"> 
                    {selectedShipment ? (
                        <>
                    {/* Map Preview Section */}
                    <div className="bg-card p-4 rounded-lg shadow w-full">
                        <div className="mt-4 w-full rounded-lg overflow-hidden h-[400px]">
                                    {(() => {
                                        const originCoords = getCoordinates(selectedShipment.originAddress);
                                        const destCoords = getCoordinates(selectedShipment.destinationAddress);
                                        const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

                                        if (!mapboxAccessToken) {
                                            return <div className="aspect-video bg-destructive/10 text-destructive flex items-center justify-center rounded"><AlertCircle className="mr-2 h-5 w-5"/> Map token missing.</div>;
                                        }

                                        if (mapError) {
                                            return <div className="aspect-video bg-destructive/10 text-destructive flex items-center justify-center rounded"><AlertCircle className="mr-2 h-5 w-5"/> Error loading map data.</div>;
                                        } else if (mapDataLoading) {
                                            return <div className="aspect-video bg-muted/50 flex items-center justify-center rounded animate-pulse">Loading Map...</div>;
                                        } else if (originCoords && destCoords) { 
                                            return (
                                                 <div className="relative w-full h-full">
                                                <StaticRouteMap
                                                    mapboxToken={mapboxAccessToken}
                                                    originCoordinates={originCoords}
                                                    destinationCoordinates={destCoords}
                                                    routeGeometry={currentRouteGeometry}
                                                    lastKnownPosition={(() => { 
                                                        logger.debug('[Render] Passing lastKnownPosition to StaticRouteMap:', currentLastPosition);
                                                        return currentLastPosition; 
                                                    })()}
                                                    lastKnownBearing={currentLastBearing}
                                                          className="w-full h-full rounded"
                                                      />
                                                      {/* Map Overlay Buttons Container */}
                                                     <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                                                         {/* Refresh Button */}
                                                          <Button 
                                                              variant="outline" 
                                                              size="icon" 
                                                              onClick={handleRefreshLocation} 
                                                              disabled={!selectedShipment || isRefreshingLocation}
                                                              title="Refresh Last Known Location"
                                                              className="bg-card hover:bg-muted"
                                                          >
                                                             {isRefreshingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                          </Button>
                                                          {/* Other potential overlay buttons */}
                                                     </div> 
                                                 </div>
                                            );
                                        } else { 
                                            return (
                                                <div className="aspect-video flex items-center justify-center h-full bg-muted border border-border rounded-lg">
                                                    <p className="text-muted-foreground text-sm text-center px-4">
                                                        Map preview unavailable: Missing origin/destination coordinates.
                                                    </p>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                        </div>

                            {/* Prominent Action Buttons */}
                        {showTrackingButton && (
                            <div className="mt-4 flex justify-center gap-2"> 
                                {/* Simulate Button */} 
                                <Button 
                                        onClick={() => {
                                            logger.debug('[ShipmentPage Button onClick] Simulate Triggered!');
                                            if (selectedShipment?.coreInfo?.id) {
                                                logger.info(`[ShipmentPage Button onClick] Calling handleViewTracking (for simulation) for: ${selectedShipment.coreInfo.id}`);
                                                handleViewTracking(selectedShipment.coreInfo.id, documentid);
                                            } else {
                                                logger.warn('[ShipmentPage Button onClick] Cannot call handleViewTracking: selectedShipment or ID missing.');
                                            }
                                        }} 
                                    variant="secondary"
                                    size="sm"
                                    disabled={isSimLoading}
                                    title="Start or view simulation for this shipment"
                                >
                                    {isSimLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                    <ExternalLink className="mr-2 h-4 w-4" /> 
                                    )}
                                    {isSimLoading ? "Loading..." : "Simulate"}
                                </Button>
                                
                                {/* Live Tracking Button */} 
                                <Link href={`/tracking/${documentid}?selectedShipmentId=${selectedShipment?.coreInfo?.id}`} passHref legacyBehavior>
                                    <Button asChild variant="secondary" size="sm" title="View live tracking for this shipment (if available)">
                                        <a href={`/tracking/${documentid}?selectedShipmentId=${selectedShipment?.coreInfo?.id}`}>
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Track Live
                                        </a>
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Shipment Details View */}
                            <ShipmentDetailView shipment={selectedShipment} />
                        </>
                        ) : (
                            <div className="bg-card p-6 rounded-lg shadow flex items-center justify-center">
                                <p className="text-muted-foreground\">Select a shipment to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

