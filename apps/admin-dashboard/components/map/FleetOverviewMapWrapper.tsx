"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FleetOverviewMap, FleetOverviewMapProps } from './FleetOverviewMap';
import { useMapStore } from '../../../../packages/shared/src/store/mapStore';

/**
 * FleetOverviewMapWrapper
 * 
 * This component wraps the FleetOverviewMap to ensure proper cleanup
 * when the component is unmounted, especially during page navigation.
 * It helps prevent memory leaks and state persistence issues.
 */
export function FleetOverviewMapWrapper(props: FleetOverviewMapProps) {
  const resetMapState = useMapStore(state => state.resetMapState);
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
        console.log('FleetOverviewMapWrapper: Page hidden, cleaning up map resources');
        resetMapState();
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetMapState]);
  
  // Reset state when the pathname changes (navigation occurs)
  useEffect(() => {
    if (mountedPathRef.current !== pathname) {
      console.log(`FleetOverviewMapWrapper: Path changed from ${mountedPathRef.current} to ${pathname}, cleaning up map state`);
      resetMapState();
      mountedPathRef.current = pathname;
    }
  }, [pathname, resetMapState]);
  
  // Handle component unmounting
  useEffect(() => {
    // Returning cleanup function that runs on unmount
    return () => {
      console.log('FleetOverviewMapWrapper: Unmounting and cleaning up');
      
      // Reset the map state in the store to prevent stale state
      // when the component is remounted
      resetMapState();
      
      // Force garbage collection for mapbox resources if available
      // This helps prevent memory leaks with mapbox
      if (typeof window !== 'undefined' && 'gc' in window) {
        try {
          (window as any).gc();
        } catch (e) {
          console.error('Failed to force garbage collection:', e);
        }
      }
    };
  }, [resetMapState]);
  
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
    console.error('Map component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Map Error
          </h3>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'An unknown error occurred in the map component'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
} 