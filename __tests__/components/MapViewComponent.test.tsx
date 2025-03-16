import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
// @ts-ignore - Module resolution issue with file extensions
import { MapView } from '../../apps/admin-dashboard/components/map/MapView.tsx';

describe('MapView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(<MapView />);
    
    // Check for loading spinner
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeTruthy();
  });

  it('renders map placeholder after loading', async () => {
    render(<MapView />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(600);
    
    await waitFor(() => {
      expect(screen.getByText(/Map integration placeholder/)).toBeTruthy();
    });
  });

  it('displays markers when provided', async () => {
    const testMarkers = [
      { id: '1', lat: 40.7128, lng: -74.0060, label: 'New York', type: 'origin' as const },
      { id: '2', lat: 34.0522, lng: -118.2437, label: 'Los Angeles', type: 'destination' as const },
      { id: '3', lat: 41.8781, lng: -87.6298, type: 'driver' as const }
    ];
    
    render(<MapView markers={testMarkers} />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(600);
    
    await waitFor(() => {
      // Check that marker info is displayed
      expect(screen.getByText(/Map would show:/)).toBeTruthy();
      expect(screen.getByText(/origin: New York/)).toBeTruthy();
      expect(screen.getByText(/destination: Los Angeles/)).toBeTruthy();
      expect(screen.getByText(/driver: at 41.8781, -87.6298/)).toBeTruthy();
    });
  });

  it('displays route information when provided', async () => {
    const testRoute = {
      origin: [40.7128, -74.0060],
      destination: [34.0522, -118.2437]
    };
    
    render(<MapView route={testRoute} />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(600);
    
    await waitFor(() => {
      // Check that route info is displayed
      expect(screen.getByText(/Route from \[40.7128, -74.0060\] to \[34.0522, -118.2437\]/)).toBeTruthy();
    });
  });

  it('applies custom className when provided', () => {
    render(<MapView className="custom-class" />);
    
    const mapContainer = document.querySelector('.custom-class');
    expect(mapContainer).toBeTruthy();
  });

  it('uses default center and zoom values when not provided', () => {
    render(<MapView />);
    
    // This is a bit of an implementation detail, but we can check that the component
    // doesn't crash when default values are used
    expect(document.querySelector('.relative')).toBeTruthy();
  });
}); 