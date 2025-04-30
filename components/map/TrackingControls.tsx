"use client";

import React, { useCallback } from 'react';
import { MapPin, LocateFixed, MinusSquare, ZoomIn } from 'lucide-react';
import { Button } from '../ui/button';
import { useLiveTrackingStore } from '../../lib/store/useLiveTrackingStore';
import { TrackingMapRef } from './TrackingMap';
import { logger } from '../../utils/logger';
import { cn } from '../../lib/utils';

interface TrackingControlsProps {
  mapRef: React.RefObject<TrackingMapRef | null>;
  className?: string;
  latestTimestamp?: number | null; // Timestamp of the last update
  isStale?: boolean; // Flag indicating if data is considered stale
}

export const TrackingControls: React.FC<TrackingControlsProps> = ({ 
  mapRef,
  className,
  latestTimestamp,
  isStale,
}) => {

  // Get state and actions needed for controls
  const { isFollowingVehicle, setFollowingVehicle } = useLiveTrackingStore(
    useCallback(state => ({ 
        isFollowingVehicle: state.isFollowingVehicle,
        setFollowingVehicle: state.setFollowingVehicle
     }), [])
  );

  const handleZoomToFit = () => {
    logger.debug('[TrackingControls] Zoom to Fit clicked');
    mapRef.current?.zoomToFit();
  };

  const handleToggleFollow = () => {
    const newState = !isFollowingVehicle;
    logger.debug(`[TrackingControls] Toggle Follow clicked. New state: ${newState}`);
    setFollowingVehicle(newState);
  };

  // Helper to format timestamp
  const formatDisplayTimestamp = (timestamp: number): string => {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second: '2-digit' });
  };

  return (
    <div className={cn("absolute bottom-4 right-4 z-10 flex flex-col items-end space-y-2", className)}>
      {/* Timestamp/Stale Status Display */}
      <div className="bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded shadow">
          {isStale ? (
              <span className="text-amber-600">Data Stale (&gt;30s)</span>
          ) : latestTimestamp ? (
              <span>Updated: {formatDisplayTimestamp(latestTimestamp)}</span>
          ) : (
              <span className="text-gray-500">Awaiting data...</span>
          )}
      </div>

      {/* Zoom to Fit Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomToFit}
        title="Zoom to Fit Route"
        aria-label="Zoom to fit route"
        className="bg-white hover:bg-gray-100 text-gray-800 shadow"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>

      {/* Follow Vehicle Toggle Button */}
      <Button
        variant={isFollowingVehicle ? "default" : "outline"} // Change variant based on state
        size="icon"
        onClick={handleToggleFollow}
        title={isFollowingVehicle ? "Stop Following Vehicle" : "Follow Vehicle"}
        aria-label={isFollowingVehicle ? "Stop Following Vehicle" : "Follow Vehicle"}
        className={cn(
            "shadow",
            isFollowingVehicle 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-white hover:bg-gray-100 text-gray-800"
        )}
      >
        {isFollowingVehicle ? <MinusSquare className="h-5 w-5" /> : <LocateFixed className="h-5 w-5" />} 
      </Button>
    </div>
  );
};

TrackingControls.displayName = 'TrackingControls'; 