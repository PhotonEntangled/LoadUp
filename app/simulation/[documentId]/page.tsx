'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Use hook for client components
import { logger } from '@/utils/logger';
// Correct type import based on ShipmentCard.tsx
import type { ApiShipmentDetail } from '@/types/api'; 

// Attempt to import existing ShipmentCard - Adjust path if needed
// Changed to default import based on linter error
// import ShipmentCard from '@/components/shipments/ShipmentCard'; // Removed this comment
// import { StatusBadge } from '@/components/shipments/StatusBadge'; // <<< ADD CORRECT IMPORT // Removed this comment
import ShipmentCard from '@/components/shipments/ShipmentCard';
import { StatusBadge } from '@/components/shipments/StatusBadge';

// Placeholder for actual components - uncomment/adjust later
// import { SimulationMap, SimulationMapRef } from '@/components/map/SimulationMap'; // Removed this comment
// import { SimulationControls } from '@/components/simulation/SimulationControls'; // Removed this comment
import { SimulationMap, SimulationMapRef } from '@/components/map/SimulationMap'; 
import { SimulationControls } from '@/components/simulation/SimulationControls'; 

// --- Store & Actions ---
import { useSimulationStoreContext } from '@/lib/store/useSimulationStoreContext'; 
import { SimulationStoreApi } from '@/lib/store/useSimulationStore'; 
import { getSimulationInputForShipment, startSimulation } from '@/lib/actions/simulationActions';

// Import cn utility
import { cn } from "@/lib/utils";

// Import Accordion component
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, TestTube, MapPin, Calendar, Download, Edit } from "lucide-react"; // Added icons needed for content
import Link from 'next/link'; // Import Link
import { formatDate } from "@/lib/formatters"; // Import formatter
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"; // Import tooltip
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Import dropdown

export default function SimulationDocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // <-- GET searchParams
  const documentId = params.documentId as string;
  const mapRef = useRef<SimulationMapRef>(null); 

  // State for fetching shipment list
  const [shipments, setShipments] = useState<ApiShipmentDetail[]>([]); 
  const [isLoadingList, setIsLoadingList] = useState(true); // Renamed for clarity
  const [listError, setListError] = useState<string | null>(null); // Renamed for clarity

  // State for currently selected shipment and simulation loading
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isSimLoading, setIsSimLoading] = useState(false); // New state for sim load
  const [simError, setSimError] = useState<string | null>(null); // New state for sim error

  // ADDED: State for the backend start action
  const [isStartingBackendSim, setIsStartingBackendSim] = useState(false);

  // Access store actions
  const loadSimulationFromInput = useSimulationStoreContext((state: SimulationStoreApi) => state.loadSimulationFromInput);
  // Get sim running state to disable selection while running
  const isSimulationRunning = useSimulationStoreContext((state: SimulationStoreApi) => state.isSimulationRunning);

  // ADDED: Access the necessary store state for the start button logic
  const selectedVehicleId = useSimulationStoreContext((state: SimulationStoreApi) => state.selectedVehicleId); // Re-use selectedShipmentId for this? No, need vehicle state.
  const vehicles = useSimulationStoreContext((state: SimulationStoreApi) => state.vehicles);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId); // Use store's selectedVehicleId

  // Effect for fetching the initial shipment list AND SETTING INITIAL SELECTION
  useEffect(() => {
    // logger.info('[SimulationDocumentPage] useEffect triggered.'); // Removed debug log
    if (documentId) {
      // logger.info(`[SimulationDocumentPage] Mounting for documentId: ${documentId}. Fetching shipments...`); // Removed debug log
      setIsLoadingList(true); // Use list loading state
      setListError(null); 
      
      // Define fetchShipments inside useEffect or ensure stable reference if defined outside
      const fetchShipments = async () => { // Assuming defined inside
        // logger.info('[SimulationDocumentPage] fetchShipments called.'); // Removed debug log
        if (!documentId) {
             // logger.warn('[SimulationDocumentPage] fetchShipments: documentId is null/undefined.'); // Removed debug log
             return; 
        }
        setIsLoadingList(true);
        setListError(null);
        try {
          // CORRECTED: Target the dedicated API endpoint for simulation shipments
          const apiUrl = `/api/simulation/shipments/${documentId}`;
          // logger.info(`[SimulationDocumentPage] Fetching from API: ${apiUrl}`); // Removed debug log
          const response = await fetch(apiUrl);
          // logger.debug(`[SimulationDocumentPage] API response status: ${response.status}`); // Removed debug log

          if (!response.ok) {
            // Check for specific 405 to give a better hint?
            if (response.status === 405) {
                logger.error(`[SimulationDocumentPage] Received 405 from ${apiUrl}. Check if the API route defines a GET handler.`);
            }
            const errorText = await response.text();
            // Construct a more informative error, potentially including a snippet of the response
            const errorDetails = errorText.length > 100 ? errorText.substring(0, 100) + '...' : errorText;
            throw new Error(`API Error (${response.status}): ${response.statusText}. Details: ${errorDetails}`); 
          }

          const data: ApiShipmentDetail[] = await response.json();
          
          if (!Array.isArray(data)) {
             logger.error(`[SimulationDocumentPage] API response from ${apiUrl} was not an array as expected. Received:`, data);
             throw new Error("API returned unexpected data format. Expected an array of shipments.");
          }
          
          if (!data.length) {
            // logger.warn(`[SimulationDocumentPage] API returned success but no data for documentId: ${documentId}`); // Removed debug log
            setShipments([]); 
          } else {
            // logger.info(`[SimulationDocumentPage] Successfully fetched ${data.length} shipments.`); // Removed debug log
            setShipments(data);

            // --- ADDED: Check for initial selection from query param --- 
            const initialSelectedId = searchParams.get('selectedShipment');
            // logger.debug("[SimulationDocumentPage] Checking for initial selection ID from query param:", initialSelectedId); // Removed debug log
            if (initialSelectedId) {
                // Find the shipment in the fetched list
                const initiallySelectedShipment = data.find(s => s?.coreInfo?.id === initialSelectedId);
                if (initiallySelectedShipment) {
                    // logger.info("[SimulationDocumentPage] Found match for initial selection query param. Setting selectedShipmentId state.", initialSelectedId); // Removed debug log
                    // Set the LOCAL state to highlight the item
                    // DO NOT call handleSelectShipment here - sim data should be loaded already
                    setSelectedShipmentId(initialSelectedId);
                    // Optionally, ensure map focuses on this vehicle if needed
                    // mapRef.current?.flyToVehicle(initialSelectedId); // Example
                } else {
                    // logger.warn("[SimulationDocumentPage] Query param 'selectedShipment' provided, but no matching shipment found in the fetched list.", initialSelectedId);
                    // logger.warn("[SimulationDocumentPage] Query param 'selectedShipment' provided, but no matching shipment found in the fetched list.", initialSelectedId); // Removed debug log
                }
            } else {
                 // logger.debug("[SimulationDocumentPage] No 'selectedShipment' query param found."); // Removed debug log
            }
            // --- END: Check for initial selection --- 
          }

        } catch (err: any) {
          logger.error(`[SimulationDocumentPage] Error fetching shipments for documentId: ${documentId}`, err);
          setListError(err.message || 'Failed to fetch shipment data.'); // Use list error state
          setShipments([]); // Clear potentially stale data on error
        } finally {
          setIsLoadingList(false); // Use list loading state
          // logger.debug(`[SimulationDocumentPage] Finished fetching list. isLoadingList: ${false}`); // Removed debug log
        }
      };

      // logger.info('[SimulationDocumentPage] Calling fetchShipments...'); // Removed debug log
      fetchShipments();

      // Existing setTimeout to trigger resize - keep it
      setTimeout(() => {
          // logger.debug('[SimulationDocumentPage] Attempting to trigger map resize via ref...'); // Removed debug log
          mapRef.current?.triggerResize();
      }, 100); 

    } else {
      logger.error('[SimulationDocumentPage] documentId is missing from params');
      setListError('Document ID is missing.'); // Use list error state
      setIsLoadingList(false); // Use list loading state
    }
  }, [documentId, searchParams]); // <-- ADD searchParams dependency

  // Handler for selecting a shipment and initiating simulation load
  const handleSelectShipment = async (shipment: ApiShipmentDetail) => { 
    const idToSelect = shipment?.coreInfo?.id ?? null;
    if (!idToSelect || isSimLoading || isSimulationRunning) { // Prevent selection if already loading/running
        if (!idToSelect) {
             logger.error("[SimulationDocumentPage] Cannot select shipment, missing coreInfo.id");
             setSimError("Cannot select shipment: Missing ID."); // Use sim error state
        }
        return;
    }

    logger.info(`[SimulationDocumentPage] Shipment selected: ${idToSelect}. Initiating simulation load...`);
    setSelectedShipmentId(idToSelect); 
    setSimError(null); // Clear previous sim errors
    setIsSimLoading(true); // Set sim loading state
    
    try {
      // logger.debug(`[SimulationDocumentPage] Calling Server Action: getSimulationInputForShipment(${idToSelect})`); // Removed debug log
      // Type annotation for the result helps, but narrowing is still key
      const result: Awaited<ReturnType<typeof getSimulationInputForShipment>> = await getSimulationInputForShipment(idToSelect);
      // logger.debug("[SimulationDocumentPage] Server Action result:", result); // Removed debug log

      // --- Type Narrowing --- 
      if ('error' in result) { // Check if the error property exists
        throw new Error(result.error || "Server action returned an unspecified error.");
      }
      
      // If we reach here, result MUST be the successful SimulationInput shape
      // Although the explicit type definition for SimulationInput isn't here yet,
      // we know it doesn't have an 'error' property, so this check works.
      // We can now safely access result.data IF the success shape has a data property.
      const simulationInput = result; // Assuming the successful result IS the SimulationInput

      // logger.debug("[SimulationDocumentPage] Calling store action: loadSimulationFromInput with:", simulationInput); // Removed debug log
      await loadSimulationFromInput(simulationInput); 
      // logger.info("[SimulationDocumentPage] Simulation loaded into frontend store."); // Removed debug log
      
      // --- Focus map after loading --- 
      // logger.debug("[SimulationDocumentPage] Attempting to focus map on loaded vehicle:", simulationInput.shipmentId); // Removed debug log
      mapRef.current?.flyToVehicle(simulationInput.shipmentId);

    } catch (err: any) {
      logger.error(`[SimulationDocumentPage] Error handling shipment selection or loading:`, err);
      const errorMessage = err.message || 'Failed to load simulation data.';
      setSimError(errorMessage); // Use sim error state
      toast({ title: "Simulation Load Error", description: errorMessage, variant: "destructive" }); // Add toast
    } finally {
      setIsSimLoading(false); // Clear sim loading state
      // logger.debug(`[SimulationDocumentPage] Finished selecting/loading sim. isSimLoading: ${false}`); // Removed debug log
    }
  };

  // --- ADDED: Handler for the new "Start Backend Simulation" button ---
  const handleStartBackendSimulation = async () => {
    // Use selectedVehicleId from the Zustand store state
    const currentSelectedVehicleId = selectedVehicleId; 
    if (!currentSelectedVehicleId) {
        toast({
            title: "Error",
            description: "No shipment selected in the store to start backend simulation.",
            variant: "destructive",
        });
        return;
    }

    // Get the vehicle state directly from the store to check status
    const vehicleToStart = vehicles.find(v => v.id === currentSelectedVehicleId);

    // Prevent starting if already running or has invalid status from frontend perspective
     if (isSimulationRunning || !vehicleToStart || (vehicleToStart.status !== 'Idle' && vehicleToStart.status !== 'Pending Pickup')) { 
         toast({
            title: "Info",
            description: `Simulation cannot be started from current state (${vehicleToStart?.status ?? 'Unknown'}). Already running or not in a startable state.`, 
         });
         return;
     }
     // ADDED: Explicit check for AWAITING_STATUS
     if (vehicleToStart.status === 'AWAITING_STATUS') {
         toast({
            title: "Info",
            description: "Cannot start simulation for shipments awaiting status.",
         });
         return;
     }


    setIsStartingBackendSim(true);
    setSimError(null); // Clear previous errors

    try {
        logger.info(`[SimulationDocumentPage] Calling Server Action: startSimulation(${currentSelectedVehicleId})`);
        const result = await startSimulation(currentSelectedVehicleId);
        logger.debug("[SimulationDocumentPage] startSimulation Server Action result:", result);

        if (result?.error) {
            throw new Error(result.error);
        }

        toast({
            title: "Success",
            description: `Backend simulation initiated for ${currentSelectedVehicleId}. Ticks will be enqueued shortly.`,
        });
        // Optionally: Update frontend state if needed, though the backend worker handles ticks.
        // e.g., maybe disable this button permanently after successful start?

    } catch (error: any) {
        logger.error(`[SimulationDocumentPage] Error calling startSimulation action:`, error);
        const errorMessage = error.message || "Failed to start backend simulation.";
        setSimError(errorMessage);
        toast({
            title: "Backend Simulation Error",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsStartingBackendSim(false);
    }
};

  // --- END ADDED HANDLER ---

  // Handlers for download/edit (needed for content)
  const handleDownload = (shipment: ApiShipmentDetail, format: string) => {
      logger.info(`[SimulationPage] Download requested for ${shipment?.coreInfo?.id}, format: ${format}`);
      toast({ title: "Info", description: "Download functionality not yet implemented.", variant: "default" });
  };

  const handleEdit = (shipment: ApiShipmentDetail) => {
      logger.info(`[SimulationPage] Edit requested for ${shipment?.coreInfo?.id}`);
      toast({ title: "Info", description: "Edit functionality not yet implemented.", variant: "default" });
  };

  // Determine overall disabled state for selection
  const selectionDisabled = isLoadingList || isSimLoading || isSimulationRunning;

  // --- Render Logic ---
  if (isLoadingList && shipments.length === 0) { 
    return (
        <div className="flex flex-col justify-center items-center h-screen text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading shipments for simulation...</p>
        </div>
    );
  }
  if (listError && shipments.length === 0) { 
    return (
       <div className="flex flex-col justify-center items-center h-screen text-red-500 p-4">
           <h2 className="text-lg font-semibold mb-2">Error Loading Shipments</h2>
           <p className="text-center">{listError}</p>
       </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */} 
      <div className="flex-none p-4 border-b flex justify-between items-center">
        {/* Title and Status */}
        <div>
            <h1 className="text-xl font-semibold">
            Simulation for Document: {documentId} 
            </h1>
            <p className="text-sm text-muted-foreground">
              {shipments.length} shipment(s) found. Select one to simulate.
            </p>
        </div>
        {/* Link to Old Test Scenario Page */} 
        <Link href="/simulation" passHref legacyBehavior>
            <Button variant="outline" size="icon" asChild title="Go to Old Test Scenario Loader">
                <a><TestTube className="h-4 w-4" /></a>
            </Button>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow grid lg:grid-cols-[minmax(380px,_1fr)_3fr] gap-4 p-4">
        
        {/* Left Column: Shipment List - RESTRUCTURED ACCORDION USAGE */} 
        <div className="flex flex-col gap-0 overflow-y-auto pr-2"> {/* Reduced gap */} 
          <Accordion type="single" collapsible className="w-full">
            {shipments.map((shipment) => {
              const coreInfo = shipment.coreInfo ?? {};
              const originAddress = shipment.originAddress;
              const destinationAddress = shipment.destinationAddress;
              const shipmentId = coreInfo.id ?? `no-id-${Math.random()}`;
              const isSelected = selectedShipmentId === shipmentId;
              const isLoadingThis = (isSimLoading && isSelected); // Loading state specific to this item
              const isDisabled = selectionDisabled || !shipment.coreInfo?.id;

              return (
                <AccordionItem 
                  value={shipmentId} 
                  key={shipmentId}
                  className={cn(
                    "border rounded-lg bg-card text-card-foreground mb-2", 
                    // Use ring-inset to avoid clipping by parent overflow/padding
                    isSelected ? "ring-2 ring-primary ring-inset" : "", 
                    isDisabled && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <AccordionTrigger 
                    disabled={isDisabled}
                    className={cn(
                      // Flexbox on trigger to position items and default arrow
                      "flex justify-between items-center w-full", 
                      "p-3 hover:no-underline focus:outline-none focus:ring-0 group data-[state=open]:border-b",
                      isDisabled && "pointer-events-none" 
                    )}
                    aria-label={`Toggle details for shipment ${coreInfo.loadNumber || shipmentId.substring(0,8)}`}
                  >
                     {/* Nested clickable div for selection */}
                     <div 
                       className={cn(
                         "flex-grow flex items-center gap-2 text-left mr-2 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 rounded-sm", 
                         !isDisabled && "cursor-pointer" // Add cursor only if not disabled
                       )}
                       onClick={(e) => {
                         // Apply selection logic ONLY here
                         if (!isDisabled) {
                           e.stopPropagation(); // <<< IMPORTANT: Prevent toggle
                           handleSelectShipment(shipment);
                         }
                       }}
                       // Add keyboard accessibility for selection here too
                       role="button"
                       tabIndex={isDisabled ? -1 : 0}
                       onKeyDown={(e: React.KeyboardEvent) => { if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); handleSelectShipment(shipment); } }}
                       aria-label={`Select shipment ${coreInfo.loadNumber || shipmentId.substring(0,8)}`}
                       aria-disabled={isDisabled}
                     >
                        {/* Header Content moved inside nested div */}
                        <div className="flex-grow">
                           <h2 className="text-sm font-semibold leading-tight" title={coreInfo.loadNumber ? `Load #${coreInfo.loadNumber}` : `Shipment ID: ${shipmentId}`}>
                              {coreInfo.loadNumber 
                                 ? `Load #${coreInfo.loadNumber}` 
                                 : <span className="text-xs text-muted-foreground">ID: {shipmentId.substring(0,8)}...</span>
                              }
                           </h2>
                           {coreInfo.poNumber && 
                           <p className="text-xs text-muted-foreground mt-0.5 truncate" title={`PO #${coreInfo.poNumber}`}>
                              {`PO #${coreInfo.poNumber}`}
                           </p>
                           }
                        </div>
                     </div>
                     {/* Status Badge / Loader remains a direct child of Trigger */}
                     <div className="flex-none flex items-center space-x-2">
                        {isLoadingThis ? (
                           <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                           <StatusBadge status={coreInfo.status} /> 
                        )}
                     </div>
                     {/* AccordionTrigger implicitly renders its default chevron */}
                  </AccordionTrigger>
                  <AccordionContent className="p-3 pt-2 text-sm"> 
                     {/* Details Grid - Rendered inside Content now */} 
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
                              {coreInfo.plannedDeliveryDate ? formatDate(coreInfo.plannedDeliveryDate) : 'N/A'} 
                           </p>
                        </div>
                     </div>
                     {/* Actions - Rendered inside Content now */} 
                     <div className="flex justify-end items-center gap-1 border-t pt-2"> 
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()} title="Download Shipment Options">
                                 <Download className="h-3.5 w-3.5" /> <span className="sr-only">Download</span>
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onSelect={() => handleDownload(shipment, "csv")}>Download as CSV</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleDownload(shipment, "json")}>Download as JSON</DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleEdit(shipment); }} title="Edit Shipment">
                           <Edit className="h-3.5 w-3.5" /> <span className="sr-only">Edit</span>
                        </Button>
                     </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          {shipments.length === 0 && !isLoadingList && (
              <div className="text-center text-muted-foreground py-10">
                  No shipments found for this document.
              </div>
          )}
        </div>

        {/* Right Column: Map and Controls */}
        <div className="flex flex-col gap-4 overflow-hidden">
            {/* <<< ADDED: Simulation Error Display >>> */}
            {simError && (
                <div className="flex-none p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                    <p><span className="font-semibold">Simulation Error:</span> {simError}</p>
                </div>
            )}
            <div className="flex-grow relative rounded-md overflow-hidden border">
                <SimulationMap ref={mapRef} />
                 {/* Loading overlay for Simulation */}
                 {isSimLoading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
            <div className="flex-none">
                <SimulationControls />
            </div>
            <div className="flex-none">
                <div className="flex justify-end items-center gap-1 border-t pt-2">
                    <Button
                        onClick={handleStartBackendSimulation}
                        disabled={isStartingBackendSim || isSimulationRunning || !selectedVehicleId || !selectedVehicle || (selectedVehicle.status !== 'Idle' && selectedVehicle.status !== 'Pending Pickup') || selectedVehicle?.status === 'AWAITING_STATUS'}
                        size="sm"
                        variant="outline"
                    >
                        {isStartingBackendSim ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <TestTube className="mr-2 h-4 w-4" /> // Or some other icon
                        )}
                        Start Backend Sim
                    </Button>
                </div>
                {simError && <p className="text-destructive text-sm mt-2">Error: {simError}</p>} // Added Error prefix
            </div>
        </div>
      </div>
    </div>
  );
} 