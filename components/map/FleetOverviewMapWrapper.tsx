"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FleetOverviewMap, FleetOverviewMapProps } from './FleetOverviewMap';
// import { useMapStore } from '../../../../packages/shared/src/store/mapStore'; // Removed old store import
import useSimulationStore from '../../lib/store/useSimulationStore'; // Added new store import
import { logger } from '../../utils/logger'; // Import logger
import { Button } from '../ui/button'; // Re-added Button import for ErrorBoundary

/**
 * FleetOverviewMapWrapper
 * 
 * This component wraps the FleetOverviewMap to ensure proper cleanup
 * when the component is unmounted, especially during page navigation.
 * It helps prevent memory leaks and state persistence issues.
 */
export function FleetOverviewMapWrapper(props: FleetOverviewMapProps) {
  // const resetMapState = useMapStore(state => state.resetMapState); // Removed old action
  const resetStore = useSimulationStore(state => state.resetStore); // Added new reset action
  const pathname = usePathname();
  const mountedPathRef = useRef<string>(pathname);
  
  // Track if the component is currently visible
  const isVisible = useRef<boolean>(true);
  
  // Update the visibility state using the visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = document.visibilityState === 'visible';
      
      // If the page becomes hidden, force cleanup to prevent stale state
      if (!isVisible.current) {
        logger.info('FleetOverviewMapWrapper: Page hidden, resetting simulation store');
        resetStore(); // Use new reset action
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetStore]); // Dependency updated
  
  // Reset state when the pathname changes (navigation occurs)
  useEffect(() => {
    if (mountedPathRef.current !== pathname) {
      logger.info(`FleetOverviewMapWrapper: Path changed, resetting simulation store`);
      resetStore(); // Use new reset action
      mountedPathRef.current = pathname;
    }
  }, [pathname, resetStore]); // Dependency updated
  
  // Handle component unmounting
  useEffect(() => {
    // Returning cleanup function that runs on unmount
    return () => {
      logger.info('FleetOverviewMapWrapper: Unmounting, resetting simulation store');
      
      // Reset the map state in the store to prevent stale state
      resetStore(); // Use new reset action
    };
  }, [resetStore]); // Dependency updated
  
  // Generate a unique instance key based on pathname to force remounting
  const instanceKey = `map-instance-${pathname}`;
  
  return (
    <ErrorBoundary>
      {/* Use key prop to force remount when needed */}
      <FleetOverviewMap key={instanceKey} {...props} />
    </ErrorBoundary>
  );
}

/**
 * Error Boundary to catch and handle errors in the map component
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Map component error caught by ErrorBoundary:', { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg h-full flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Map Display Error
          </h3>
          <p className="text-red-600 mb-4 text-center">
            {this.state.error?.message || 'An unknown error occurred rendering the map component.'}
            <br />
            <span className="text-sm text-gray-500">Try refreshing the page or contacting support if the issue persists.</span>
          </p>
          <Button
            variant="destructive"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Attempt to Reload Map
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
} 