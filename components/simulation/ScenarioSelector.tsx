'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// Define the structure for a scenario
interface Scenario {
  id: string; // Corresponds to the JSON filename
  name: string; // User-friendly name
}

// Hardcoded list of scenarios for now
const availableScenarios: Scenario[] = [
  { id: 'idleStartScenario.json', name: 'Idle Start' },
  { id: 'midTripScenario.json', name: 'Mid-Trip Start' },
  { id: 'atDestinationScenario.json', name: 'At Destination Start' },
  { id: 'awaitingStatusScenario.json', name: 'Awaiting Status Start' },
];

interface ScenarioSelectorProps {
  selectedScenarioId: string | null;
  onScenarioSelect: (scenarioId: string) => void;
  disabled?: boolean; // To disable selection during loading/simulation
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenarioId,
  onScenarioSelect,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {availableScenarios.map((scenario) => (
        <Card 
          key={scenario.id} 
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedScenarioId === scenario.id ? 'border-primary' : ''}`}
          onClick={() => !disabled && onScenarioSelect(scenario.id)}
        >
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">
              {scenario.name}
            </CardTitle>
            {/* Potential place for description or status later */}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}; 