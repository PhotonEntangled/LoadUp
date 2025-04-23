"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot } from "lucide-react";
import { AIMappedField } from "@/types/shipment";

interface AIMappingLabelProps {
  aiField: AIMappedField;
}

/**
 * AI Field Mapping Label component for indicating AI-mapped fields
 */
export const AIMappingLabel = ({ aiField }: AIMappingLabelProps) => {
  // Determine color based on confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800 border-green-300";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };
  
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };
  
  const colorClass = getConfidenceColor(aiField.confidence);
  const confidenceLabel = getConfidenceLabel(aiField.confidence);
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClass} border ml-2`}>
            <Bot className="h-3 w-3 mr-1" />
            AI
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">AI-Mapped Field</p>
            <p>Original: &quot;{aiField.originalField}&quot;</p>
            <p>Mapped to: &quot;{aiField.field}&quot;</p>
            <p>Confidence: {confidenceLabel} ({Math.round(aiField.confidence * 100)}%)</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 