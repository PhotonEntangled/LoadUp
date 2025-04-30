'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SimulationMap, SimulationMapRef } from '../../components/map/SimulationMap';
import { useSimulationStoreContext } from '@/lib/store/useSimulationStoreContext';
import { SimulationStoreApi } from '@/lib/store/useSimulationStore';
import { SimulationInput } from '../../types/simulation';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { ScenarioSelector } from '@/components/simulation/ScenarioSelector';
import { logger } from '../../utils/logger';
import { SimulatedVehicle } from "@/types/vehicles";
import { AlertCircle } from "lucide-react";

export default function SimulationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const mapRef = useRef<SimulationMapRef>(null);

  // --- Access store state via context hook selectors ---
  const isSimulationRunning = useSimulationStoreContext((state: SimulationStoreApi) => state.isSimulationRunning);
  const globalSimulationError = useSimulationStoreContext((state: SimulationStoreApi) => state.errorState['loadSimulation']);
  const loadSimulationFromInput = useSimulationStoreContext((state: SimulationStoreApi) => state.loadSimulationFromInput);

  const handleLoadScenario = async (scenarioId: string) => {
    logger.info(`[SimulationPage] handleLoadScenario called for ID: ${scenarioId}`);
    setIsLoading(true);
    setUiError(null);
    setCurrentScenarioId(scenarioId);

    try {
        logger.info("[SimulationPage] Preparing to call API endpoint");
        
        const response = await fetch('/api/simulation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scenarioFilename: scenarioId }),
        });

        logger.info("[SimulationPage] Fetch call completed, processing response", { status: response.status });

        if (!response.ok) {
            const errorText = await response.text();
            const errorMsg = `API Error (${response.status}): ${response.statusText}. ${errorText}`.trim();
            logger.error('[SimulationPage] API fetch failed with HTTP error', { 
                scenarioId, 
                status: response.status, 
                statusText: response.statusText, 
                body: errorText 
            });
            setCurrentScenarioId(null);
            throw new Error(errorMsg);
        }

        const result = await response.json();
        logger.info("[SimulationPage] Response JSON parsed", { result });

        if (!result.success || !result.scenarioInput) {
            const errorMsg = result.error || `API Error: Operation reported failure or missing scenario input data.`;
            logger.warn('[SimulationPage] API call successful but operation failed or missing data', { scenarioId, error: result.error });
            setCurrentScenarioId(null);
            throw new Error(errorMsg);
        }
        
        logger.info("[SimulationPage] API response OK and success=true, scenarioInput received.");
        
        if (typeof loadSimulationFromInput !== 'function') {
             logger.error("[SimulationPage] Critical Error: loadSimulationFromInput action is not available via context!");
             setCurrentScenarioId(null);
             throw new Error("Internal error: Cannot load simulation state.");
        }
        
        const inputData = result.scenarioInput as SimulationInput;
        logger.debug("[SimulationPage] Calling loadSimulationFromInput with:", inputData);
        await loadSimulationFromInput(inputData);
        logger.info("[SimulationPage] loadSimulationFromInput action invoked.");
        
        setTimeout(() => {
            logger.debug('[SimulationPage] Attempting to trigger map resize via ref...');
            mapRef.current?.triggerResize();
        }, 100); 

    } catch (err: any) { 
        logger.error("[SimulationPage] Error caught in handleLoadScenario:", err);
        setUiError(err.message || 'An unexpected error occurred during loading');
        setCurrentScenarioId(null);
    } finally {
        logger.info("[SimulationPage] Entering finally block");
        setIsLoading(false);
        logger.info("[SimulationPage] setIsLoading(false) executed");
    }
  };

  // Combine local UI error and global simulation error for display
  const displayError = uiError || globalSimulationError;

  // Determine if Scenario Selector should be disabled
  const controlsDisabled = isLoading || isSimulationRunning; 

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b">
        <h1 className="text-xl font-semibold">DEV Simulation</h1>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        
        <div className="lg:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-2">
          <h2 className="text-lg font-medium">Load Test Scenario</h2>

          {displayError && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive border border-destructive/30 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm break-words">{displayError}</p>
            </div>
          )}

          {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading scenario...</p>}
          
          <ScenarioSelector 
            selectedScenarioId={currentScenarioId}
            onScenarioSelect={handleLoadScenario}
            disabled={controlsDisabled}
          />

          <h2 className="text-lg font-medium border-t pt-4 mt-4">Simulation Controls</h2>
          <SimulationControls />

        </div>

        <div className="lg:col-span-2 h-full w-full min-h-[300px] lg:min-h-0 relative">
           {!currentScenarioId && !isLoading && !displayError && (
             <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
               <p className="text-muted-foreground">Select a scenario to load</p>
            </div>
           )}
          <SimulationMap ref={mapRef} />
        </div>
      </div>
    </div>
  );
} 