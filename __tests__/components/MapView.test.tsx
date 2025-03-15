import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../apps/admin-dashboard/app/dashboard/map/page';

describe('MapView Component', () => {
  it('renders the map page', () => {
    render(<MapPage />);
    
    expect(screen.getByText(/Map View/i)).toBeInTheDocument();
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
  });

  it('displays the map placeholder message', () => {
    render(<MapPage />);
    
    expect(screen.getByText(/Real-time tracking will be available in a future update/i)).toBeInTheDocument();
  });

  it('shows the map container', () => {
    render(<MapPage />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveClass('bg-gray-200');
  });
}); 