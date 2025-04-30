'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation'; 
import { logger } from '@/utils/logger';
import type { ApiShipmentDetail } from '@/types/api'; 
import ShipmentCard from '@/components/shipments/ShipmentCard';
import { StatusBadge } from '@/components/shipments/StatusBadge';
import { SimulationMap, SimulationMapRef } from '@/components/map/SimulationMap'; 
import { SimulationControls } from '@/components/simulation/SimulationControls'; 

// --- Store, Context, Actions, Types ---
import { useSimulationStoreContext } from '@/lib/store/useSimulationStoreContext'; 
import { SimulationStoreContext } from '@/lib/context/SimulationStoreContext';
import type { SimulationStoreApi } from '@/lib/store/useSimulationStore';
import { getSimulationInputForShipment, startSimulation, stopSimulation } from '@/lib/actions/simulationActions';
import type { SimulatedVehicle } from '@/types/vehicles';
import type { SimulationInput } from '@/types/simulation';

// --- UI & Utils ---
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, TestTube, MapPin, Calendar, Download, Edit, FileText } from "lucide-react";
import Link from 'next/link';
import { formatDate } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from 'zustand';

// --- ADD TYPE GUARD ---
// Type guard to check if the result is the error shape
type LoadResultError = { error: string };
function isLoadError(result: LoadResultError | void): result is LoadResultError {
  return result !== undefined && typeof result === 'object' && 'error' in result;
}
// --- END TYPE GUARD ---

export default function SimulationDocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // <-- GET searchParams
  const documentId = params.documentId as string;
  const mapRef = useRef<SimulationMapRef>(null); 
  const router = useRouter(); // Get router instance

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

  // <<< ADDED BACK: Get storeApi from context >>>
  const storeApi = useContext(SimulationStoreContext);
  if (!storeApi) {
    throw new Error('SimulationStoreContext is not available');
  }

  // --- Use useStore with context and selectors --- 
  const loadSimulationFromInput = useStore(storeApi, (state) => state.loadSimulationFromInput);
  const isSimulationRunning = useStore(storeApi, (state) => state.isSimulationRunning);
  const selectedVehicleId = useStore(storeApi, (state) => state.selectedVehicleId);
  const vehicles = useStore(storeApi, (state) => state.vehicles);
  const startGlobalSimulation = useStore(storeApi, (state) => state.startGlobalSimulation);
  // --- END: Use useStore with context and selectors --- 

  // --- FIX: Get selected ID for comparison OUTSIDE the handler --- 
  const currentStoreSelectedId = useStore(storeApi, (state) => state.selectedVehicleId);

  const selectedVehicle: SimulatedVehicle | undefined = selectedVehicleId ? vehicles[selectedVehicleId] : undefined;

  // <<< RE-ADDED & MODIFIED: useEffect hook for auto-starting LOCAL simulation animation >>>
  useEffect(() => {
    // Auto-start LOCAL animation only when selection changes to an 'En Route' vehicle
    // or when the selected vehicle's status CHANGES to 'En Route'.
    // Relies on startGlobalSimulation action having its own check to prevent duplicates.
    if (selectedVehicle && selectedVehicle.status === 'En Route') {
      logger.info(`[SimulationDocumentPage Auto-Start Effect] Conditions met for vehicle ${selectedVehicleId} (Status: En Route). Attempting to start LOCAL simulation loop.`);
      // Check if the action function exists before calling
      if (typeof startGlobalSimulation === 'function') {
          startGlobalSimulation(); // Calls the LOCAL store action to start setInterval (idempotent check inside)
      } else {
           logger.error('[SimulationDocumentPage Auto-Start Effect] startGlobalSimulation action is not available on the store!');
      }
    }
    // Removed isSimulationRunning dependency to prevent restarting immediately after stop.
    // Effect now triggers primarily on selection/status change.
  }, [selectedVehicleId, selectedVehicle?.status]); 

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
          // <<< ENHANCED LOGGING >>>
          logger.error(`[SimulationDocumentPage] Error fetching shipments for documentId: ${documentId}`, {
            errorMessage: err.message,
            errorStack: err.stack,
            errorObject: err, // Log the full error object
            documentId: documentId // Add context
          });
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
    
        if (!idToSelect) {
        logger.error("[handleSelectShipment] Clicked shipment has no ID.");
        toast({
          title: "Selection Error",
          description: "Could not identify the selected shipment.",
          variant: "destructive",
        });
        return;
    }

    // --- FIX: Use the value obtained outside the handler --- 
    // const currentStoreSelectedId = useStore(store, (state) => state.selectedVehicleId); 
    
    // Set local state regardless to update UI highlight
    setSelectedShipmentId(idToSelect); 

    if (idToSelect === currentStoreSelectedId) {
        logger.info(`[handleSelectShipment] Shipment ${idToSelect} is already selected in the store. Skipping simulation reload.`);
        return; 
    }

    // If it's a *new* selection, proceed with loading/resetting simulation state
    logger.info(`[handleSelectShipment] New shipment selected: ${idToSelect}. Loading simulation data...`);
    setIsSimLoading(true);
    setSimError(null);

    try {
      // Call server action to get structured input
      const simInputResult = await getSimulationInputForShipment(idToSelect);

      // Check for error before accessing data
      if ('error' in simInputResult || !simInputResult) { 
        throw new Error(simInputResult?.error || 'Failed to retrieve simulation input data.');
      }
      // Now TypeScript knows simInputResult is of type SimulationInput
      const simulationInputData: SimulationInput = simInputResult; 
      
      // Check if loadSimulationFromInput function exists before calling
      if (typeof loadSimulationFromInput === 'function') {
         // Call store action to load data
         const loadResult = await loadSimulationFromInput(simulationInputData); 
         
         // --- FIX: Use the type guard --- 
         if (isLoadError(loadResult)) {
             // Now TypeScript *knows* loadResult is LoadResultError
             throw new Error(loadResult.error);
         }
         // --- END FIX ---

         logger.info(`[handleSelectShipment] Successfully loaded simulation state for ${idToSelect} into store.`);
      } else {
           logger.error('[handleSelectShipment] loadSimulationFromInput action is not available on the store!');
           throw new Error("Internal error: Simulation loading function not available.");
      }

    } catch (error: any) {
      // Local state setting preserved as requested.
      // Keyed state management would ideally happen within loadSimulationFromInput.
      logger.error(`[handleSelectShipment] Error loading simulation for ${idToSelect}:`, {
        errorMessage: error.message,
        errorStack: error.stack,
        errorObject: error,
        shipmentId: idToSelect // Add context
      });
      setSimError(error.message || 'Failed to load simulation data.');
      toast({
        title: "Simulation Load Error",
        description: error.message || 'Could not load simulation data for the selected shipment.',
        variant: "destructive",
      });
    } finally {
      setIsSimLoading(false);
    }
  };

  // <<< KEPT handleStartBackendSimulation as requested >>>
  // This handler appears to trigger the backend simulation start explicitly.
  // Its necessity compared to the useEffect hook reacting to selection might need future review,
  // but we preserve it for now to avoid breaking potential existing workflows.
  const handleStartBackendSimulation = async () => {
    logger.info("[SimulationDocumentPage] handleStartBackendSimulation triggered.");
    if (!selectedVehicleId) {
        toast({ title: "Error", description: "No vehicle selected.", variant: "destructive" });
        return;
    }

    // Check if the simulation *worker* is already active for this shipment
    // This prevents starting it twice from this UI if KV state somehow persists
    // TODO: Ideally, add a check `isSimulationActiveInKV(selectedVehicleId)`
    // For now, we rely on the button being disabled/status checks.

    setIsStartingBackendSim(true);
    setSimError(null); // Clear previous errors

    try {
        // 1. Get the simulation input required by startSimulation
        logger.info(`[SimulationDocumentPage] Fetching simulation input for: ${selectedVehicleId}`);
        const simulationInputResult = await getSimulationInputForShipment(selectedVehicleId);

        // --- TYPE CHECK: Ensure we have SimulationInput, not an error object ---
        if ('error' in simulationInputResult) {
            throw new Error(`Failed to get simulation input: ${simulationInputResult.error}`);
        }
        // --- END TYPE CHECK ---
        
        logger.debug("[SimulationDocumentPage] Successfully fetched simulation input.");

        // 2. Call the actual startSimulation server action
        // Now we know simulationInputResult is of type SimulationInput
        logger.info(`[SimulationDocumentPage] Calling Server Action: startSimulation with input for ${selectedVehicleId}`);
        const result = await startSimulation(simulationInputResult);
        logger.debug("[SimulationDocumentPage] startSimulation Server Action result:", result);

        if (result?.error) {
            throw new Error(result.error);
        }

        toast({
            title: "Success",
            description: `Backend simulation initiated for ${selectedVehicleId}. Ticks should start shortly.`,
        });
        // Optionally: Update frontend state immediately if needed,
        //             e.g., optimistically set status to 'En Route'?
        //             Or disable the start button permanently?

    } catch (error: any) {
        logger.error(`[SimulationDocumentPage] Error starting backend simulation:`, {
            errorMessage: error.message,
            errorStack: error.stack,
            errorObject: error,
            shipmentId: selectedVehicleId // Add context
        });
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

  // Handlers for download/edit (needed for content)
  const handleDownload = (shipment: ApiShipmentDetail, format: string) => {
      logger.info(`[SimulationPage] Download requested for ${shipment?.coreInfo?.id}, format: ${format}`);
      toast({ title: "Info", description: "Download functionality not yet implemented.", variant: "default" });
  };

  const handleEdit = (shipment: ApiShipmentDetail) => {
      logger.info(`[SimulationPage] Edit requested for ${shipment?.coreInfo?.id}`);
      toast({ title: "Info", description: "Edit functionality not yet implemented.", variant: "default" });
  };

  // <<< ADDED: Handler for Reset Simulation (client-side only) >>>
  const handleResetSimulation = useCallback(() => {
    logger.warn('[SimulationDocumentPage] Reset Simulation button clicked. Resetting client store ONLY.');
    // Get resetStore action from the context
    const resetStoreAction = storeApi.getState().resetStore;
    if (typeof resetStoreAction === 'function') {
        resetStoreAction();
    } else {
        logger.error('[handleResetSimulation] resetStore action not found on store!');
    }
    // Clear local UI selection state as well
    setSelectedShipmentId(null);
    // Clear URL param by navigating without the `selectedShipment` query param
    router.push(`/simulation/${documentId}`, { scroll: false });
    // REMOVED: Backend stopSimulation call to make this purely client-side reset
    // if (selectedVehicleId) {
    //   logger.info(`[handleResetSimulation] Attempting to stop backend simulation for ${selectedVehicleId}...`);
    //   stopSimulation(selectedVehicleId) // Fire-and-forget backend stop
    //     .catch(err => logger.error(`[handleResetSimulation] Error during backend stop call:`, err));
    // }
  }, [storeApi, router, documentId]); // Dependencies

  // <<< ADDED COMMENT explaining initialization logic >>>
  // This useEffect hook runs once on client mount.
  // It sets the `isInitialized` flag in the Zustand store.
  // This flag can be used by UI components (like SimulationControls)
  // to ensure they are only enabled after the store has been hydrated
  // and is ready on the client, preventing hydration mismatches or
  // enabling controls before the store state is accurate.
  useEffect(() => {
    // Check added to avoid unnecessary setState if component somehow re-mounts
    // after initialization.
    if (!storeApi.getState().isInitialized) {
        logger.debug('[SimulationDocumentPage] Client mount detected, setting store isInitialized = true');
        storeApi.setState({ isInitialized: true });
    }
  }, [storeApi]); // Run once on mount

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
        {/* --- ADDED BUTTON --- */}
        <div className="flex items-center gap-2"> 
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/shipments/${documentId}`)}
            title="View Shipment Details Page"
            disabled={!documentId} // Disable if documentId is missing
          >
             <FileText className="mr-2 h-4 w-4" /> 
             View Details
          </Button>
          {/* --- END ADDED BUTTON --- */}
        
          {/* Link to Old Test Scenario Page - Keep for now if needed */}
        <Link href="/simulation" passHref legacyBehavior>
            <Button variant="outline" size="icon" asChild title="Go to Old Test Scenario Loader">
                <a><TestTube className="h-4 w-4" /></a>
            </Button>
        </Link>
        </div> 
      </div>

      {/* Main Content Area */}
      <div className="flex-grow grid lg:grid-cols-[minmax(380px,_1fr)_3fr] gap-4 p-4 overflow-hidden">
        
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

        {/* Right Column: Map & Controls */}
        <div className="flex flex-col gap-4 overflow-y-auto">
           <SimulationMap ref={mapRef} className="flex-grow h-full w-full" /> 
           <SimulationControls />
           <div className="flex-none">
                <div className="flex justify-end items-center gap-1 border-t pt-2">
                    <Button
                        onClick={handleStartBackendSimulation}
                        // Simplified: Disabled if loading/running OR no vehicle OR vehicle is NOT Idle.
                        // The check for !== 'Idle' implicitly covers 'AWAITING_STATUS' and all other non-startable states.
                        disabled={isStartingBackendSim || isSimulationRunning || !selectedVehicleId || !selectedVehicle || selectedVehicle.status !== 'Idle'}
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
                    <Button
                        onClick={handleResetSimulation}
                        disabled={isStartingBackendSim || isSimulationRunning} // Disable if backend start is loading or sim is running
                        size="sm"
                        variant="destructive"
                    >
                       Reset Client Sim
                    </Button>
                </div>
                {simError && <p className="text-destructive text-sm mt-2">Error: {simError}</p>} 
            </div>
        </div>
      </div>
    </div>
  );
} 