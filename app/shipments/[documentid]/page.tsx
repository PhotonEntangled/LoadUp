"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { MapPinned, Search, X, RefreshCw, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
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

    // --- State Management (Real Data) ---
    const [shipments, setShipments] = useState<ApiShipmentDetail[]>([]); // Initialize empty
    const [selectedShipment, setSelectedShipment] = useState<ApiShipmentDetail | null>(null); // Initialize null
    const [filteredShipments, setFilteredShipments] = useState<ApiShipmentDetail[]>([]); // Initialize empty
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true); // Start true for real fetch
    const [error, setError] = useState<string | null>(null);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [isSimLoading, setIsSimLoading] = useState<boolean>(false); // Loading state for simulation prep
    const [isRefreshingLocation, setIsRefreshingLocation] = useState<boolean>(false); // State for refresh button

    // CORRECTED STORE ACCESS: Use direct context
    const storeApi = useContext(SimulationStoreContext);

    // State for map-specific geometry (fetched based on selectedShipment)
    const [currentRouteGeometry, setCurrentRouteGeometry] = useState<Feature<LineString> | null>(null); // Initialize null
    const [currentLastPosition, setCurrentLastPosition] = useState<Feature<Point> | null>(null); // Initialize null
    const [mapDataLoading, setMapDataLoading] = useState<boolean>(false); // State for loading map geo data
    const [mapError, setMapError] = useState<string | null>(null); // Specific error for map data fetch

    // Helper to safely extract coordinates
    const getCoordinates = useCallback((addressData: ApiShipmentDetail['originAddress'] | ApiShipmentDetail['destinationAddress']): [number, number] | undefined => {
        if (addressData && typeof addressData.longitude === 'number' && typeof addressData.latitude === 'number') {
            return [addressData.longitude, addressData.latitude];
        }
        return undefined;
    }, []); // Empty dependency array as it's a pure function of its args

    // Helper to convert lat/lon/timestamp to GeoJSON Point Feature
    const createPositionFeature = useCallback((lat: number | null, lon: number | null, timestamp: string | null): Feature<Point> | null => {
        if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lon, lat] },
                properties: { timestamp: timestamp },
            };
        }
        return null;
    }, []); // Wrap in useCallback with empty dependency array

    // --- Function to Fetch Route Geometry ---
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

            const geometry: Feature<LineString>['geometry'] = await res.json(); // API returns just the geometry object
            
            // Reconstruct the Feature object for the state
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
    }, []); // No dependencies needed as it uses args

    // --- Data Fetching (Re-enabled for PHASE 2) ---
    useEffect(() => {
        const fetchShipments = async () => {
            setLoading(true);
            setError(null);
            setSelectedShipment(null); // Clear previous selection
            setCurrentRouteGeometry(null); // Clear previous map data
            setCurrentLastPosition(null);  // Clear previous map data
            logger.debug(`Fetching shipments for document ID: ${documentid}`);
            try {
                const res = await fetch(`/api/shipments?documentId=${documentid}`);
                if (!res.ok) {
                    if (res.status === 404) {
                         logger.warn(`No shipments found for documentId: ${documentid}`);
                         // Handle not found specifically - maybe set an error message
                         // Or allow rendering with "No shipments found" state
                         setShipments([]);
                         setFilteredShipments([]);
                         setSelectedShipment(null);
                         // Optionally set a specific error state: setError("No shipments found for this document.");
                    } else {
                        throw new Error(`Failed to fetch shipments: ${res.status} ${res.statusText}`);
                    }
                } else {
                     const data: ApiShipmentDetail[] = await res.json();
    
                     if (!Array.isArray(data)) {
                          throw new Error(`API did not return an array. Received: ${JSON.stringify(data)}`);
                     }
    
                     logger.debug(`Fetched ${data.length} shipments for document ${documentid}`);
                     setShipments(data);
                     setFilteredShipments(data);
                     if (data.length > 0) {
                         const initialSelected = data[0];
                         setSelectedShipment(initialSelected);

                         // --- PROCESS INITIAL LAST KNOWN LOCATION ---
                         const initialPosition = createPositionFeature(
                             initialSelected.coreInfo.lastKnownLatitude,
                             initialSelected.coreInfo.lastKnownLongitude,
                             initialSelected.coreInfo.lastKnownTimestamp
                         );
                         setCurrentLastPosition(initialPosition);
                         if (initialPosition) {
                            logger.info("[ShipmentPage] Initial last known position set from fetch.", initialPosition);
                         } else {
                            logger.info("[ShipmentPage] No initial last known position found in fetched data.");
                         }
                         // --- END PROCESS INITIAL LAST KNOWN LOCATION ---

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
                setShipments([]); // Clear shipments on error
                setFilteredShipments([]);
                setSelectedShipment(null);
            } finally {
                setLoading(false);
            }
        };

        fetchShipments();
    }, [documentid, getCoordinates, fetchRouteGeometry, createPositionFeature]); // Dependencies
    
    // --- Fetch Map Data When Selected Shipment Changes ---
     useEffect(() => {
        // Clear old route and error when selection is null
        if (!selectedShipment) {
            setCurrentRouteGeometry(null);
            setCurrentLastPosition(null);
            setMapError(null);
            return; 
        }

        const originCoords = getCoordinates(selectedShipment.originAddress);
        const destCoords = getCoordinates(selectedShipment.destinationAddress);

        if (originCoords && destCoords) {
            fetchRouteGeometry(originCoords, destCoords);
        } else {
            // Clear map data if new selection lacks coords
            logger.warn("Selected shipment missing valid coordinates for route fetching.");
            setCurrentRouteGeometry(null);
            setCurrentLastPosition(null); 
            setMapError("Missing coordinates for route."); // Set map-specific error
        }

        // --- PROCESS LAST KNOWN LOCATION ON SELECTION CHANGE ---
        if (selectedShipment) {
            const newPosition = createPositionFeature(
                selectedShipment.coreInfo.lastKnownLatitude,
                selectedShipment.coreInfo.lastKnownLongitude,
                selectedShipment.coreInfo.lastKnownTimestamp
            );
            setCurrentLastPosition(newPosition);
             if (newPosition) {
                 logger.info("[ShipmentPage] Last known position updated on selection change.", newPosition);
             } else {
                 logger.info("[ShipmentPage] No last known position found for newly selected shipment.");
             }
        } else {
             setCurrentLastPosition(null); // Clear if no shipment selected
        }
        // --- END PROCESS LAST KNOWN LOCATION ON SELECTION CHANGE ---

    }, [selectedShipment, getCoordinates, fetchRouteGeometry, createPositionFeature]); // Dependencies

    // --- Search/Filtering (Keep as is) ---
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
        console.log(`Editing shipment ${shipment.coreInfo.id}`);
        toast({ title: "Info", description: "Edit functionality not yet implemented.", variant: "default" });
    };

    const toggleCardExpansion = (shipmentId: string) => {
        setExpandedCards((prev) => ({
            ...prev,
            [shipmentId]: !prev[shipmentId],
        }));
    };

    // --- RE-IMPLEMENTED REFRESH LOCATION HANDLER ---
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
    }, [selectedShipment]); // Dependency: selectedShipment
    // --- END RE-IMPLEMENTED REFRESH LOCATION HANDLER ---

    const handleViewTracking = async (shipmentId: string, documentId: string) => {
        logger.info(`Shipment Page: View Tracking clicked for shipment ${shipmentId} in doc ${documentId}`);
        setIsSimLoading(true);
        setError(null); 
        
        try {
            // Fetch the simulation input data using the server action
            const simulationInputResult = await getSimulationInputForShipment(shipmentId);

            if ('error' in simulationInputResult) {
                throw new Error(simulationInputResult.error);
            }
            
            console.log('[handleViewTracking] Received SimulationInput from Server Action:', simulationInputResult);
            logger.info('[handleViewTracking] Status from Server Action:', simulationInputResult.initialStatus);

            // CORRECTED STORE ACCESS:
            if (!storeApi) { // Check if context value is available
                throw new Error("Simulation store context is not available.");
            }
            // Access action via getState() on the context value
            const loadAction = storeApi.getState().loadSimulationFromInput; 

            if (typeof loadAction !== 'function') { 
                 logger.error('[handleViewTracking] loadSimulationFromInput action is not available via context!', { storeState: storeApi.getState() });
                 throw new Error('Simulation loading action failed.');
            }

            // Load data into the store using the action obtained via context
            await loadAction(simulationInputResult); 

            logger.info(`Shipment Page: Simulation data loaded for ${shipmentId}, navigating...`);
            // Navigate to the simulation page for the specific document
            router.push(`/simulation/${documentId}?selectedShipmentId=${shipmentId}`);

        } catch (err) {
            logger.error('Shipment Page: Error preparing or loading simulation:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Failed to load simulation: ${errorMessage}`); 
        } finally {
            setIsSimLoading(false); 
        }
    };

    // --- Render Logic ---

    // Render loading state
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading shipment data...</p></div>;
    }

    // Render error state
    if (error) {
        return (
           <div className="flex flex-col justify-center items-center h-screen text-red-500 p-4">
               <h2 className="text-lg font-semibold mb-2">Error Loading Shipments</h2>
               <p className="text-center">{error}</p>
               {/* Optionally add a retry button here */}
           </div>
        );
    }
    
    // Check for Mapbox token after loading/error checks
    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!mapboxAccessToken) {
      logger.error('Shipment Page: NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN is not defined!');
      return (
        <div className="flex justify-center items-center h-screen text-orange-500">
          <p>Map configuration error: Access token is missing.</p>
        </div>
      );
    }

    // Get coords from the currently selected REAL shipment
    const originCoords = selectedShipment ? getCoordinates(selectedShipment.originAddress) : undefined;
    const destinationCoords = selectedShipment ? getCoordinates(selectedShipment.destinationAddress) : undefined;

    // Determine if tracking button should be shown based on REAL data
    const showTrackingButton = selectedShipment && 
                             selectedShipment.coreInfo.status !== 'DELIVERED' && 
                             selectedShipment.coreInfo.status !== 'CANCELLED' &&
                             selectedShipment.coreInfo.status !== 'AWAITING_STATUS'; // <<< ADDED: Don't show button if awaiting status
                             
    // Handle case where no shipments were found for the document
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
        // Revert container: Let it size naturally, remove flex/height
        <div className="container mx-auto p-4 h-full"> {/* Add h-full to allow grid to expand */} 
            {/* Main Grid Layout */}
            {/* Remove explicit height/overflow, let main layout scroll handle it */}
            {/* Adjusted grid again for better balance: Restore 1fr for left col */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(340px,_1fr)_2fr] gap-4 h-full"> {/* Use h-full to fill container */} 
                {/* Left Column: Shipment List */}
                {/* Keep h-full and overflow, REMOVED md:col-span-1 as it's implied by grid definition */}
                <div className="space-y-4 overflow-y-auto h-full pl-2 pr-2"> 
                    {/* Search Input and Header Info */}
                    {/* (Assuming header/search should be within the scrollable column) */}
                    <div className="flex justify-between items-center mb-1 md:mb-2"> {/* Reduced margin */} 
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">Shipments</h1> {/* Adjusted size */} 
                            <p className="text-xs text-muted-foreground"> {/* Adjusted size */} 
                                Doc ID: {documentid} • {shipments.length} found
                            </p>
                        </div>
                    </div>
                    <div className="relative mb-4"> {/* Added margin bottom */} 
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

                    {/* RESTORED: Shipment Card List - WRAPPED IN ACCORDION */}
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
                        // Message when search yields no results but shipments exist
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
                {/* Keep h-full and overflow, REMOVED md:col-span-2 as it's implied */}
                <div className="space-y-4 overflow-y-auto h-full pl-2"> 
                    {/* Conditional rendering based on selected shipment */}
                    {selectedShipment ? (
                        <>
                    {/* Map Preview Section */}
                    <div className="bg-card p-4 rounded-lg shadow w-full">
                        {/* Map Container */}
                        <div className="mt-4 w-full rounded-lg overflow-hidden"> {/* Removed fixed height */}
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
                                                <StaticRouteMap
                                                    mapboxToken={mapboxAccessToken}
                                                    originCoordinates={originCoords}
                                                    destinationCoordinates={destCoords}
                                                    routeGeometry={currentRouteGeometry}
                                                    lastKnownPosition={currentLastPosition}
                                                    className="w-full aspect-video rounded"
                                                />
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

                            {/* Prominent View Tracking Button -- RE-CHECKED JSX */}
                        {showTrackingButton && (
                            <div className="mt-4 flex justify-center"> 
                                <Button 
                                        // Restore original onClick:
                                        onClick={() => {
                                            // Keep previous logging here for now:
                                            logger.info('[ShipmentPage Button onClick] Triggered!'); 
                                            console.log('[ShipmentPage Button onClick] Triggered!');
                                            if (selectedShipment?.coreInfo?.id) {
                                                logger.info(`[ShipmentPage Button onClick] Calling handleViewTracking for: ${selectedShipment.coreInfo.id}`);
                                                handleViewTracking(selectedShipment.coreInfo.id, documentid);
                                            } else {
                                                logger.warn('[ShipmentPage Button onClick] Cannot call handleViewTracking: selectedShipment or ID missing.');
                                            }
                                        }} 
                                    variant="secondary"
                                    size="sm"
                                    disabled={isSimLoading}
                                >
                                    {isSimLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    )}
                                    {isSimLoading ? "Loading Simulation..." : "View Live Tracking / Simulation"}
                                </Button>
                            </div>
                        )}

                        {/* Shipment Details View */}
                            <ShipmentDetailView shipment={selectedShipment} />
                        </>
                        ) : (
                            <div className="bg-card p-6 rounded-lg shadow flex items-center justify-center">
                                <p className="text-muted-foreground">Select a shipment to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

