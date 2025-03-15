import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the toBeInTheDocument matcher
import MapPage from '../../apps/admin-dashboard/app/dashboard/map/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard/map',
}));

describe('MapPage', () => {
  it('renders the map page with title', () => {
    render(<MapPage />);
    
    // Check if the title is rendered
    expect(screen.getByText('Live Tracking')).toBeInTheDocument();
  });

  it('displays map placeholder', () => {
    render(<MapPage />);
    
    // Check if the map placeholder is displayed
    expect(screen.getByText('Map View')).toBeInTheDocument();
    expect(screen.getByText('Map integration will be available in a future update')).toBeInTheDocument();
  });

  it('displays implementation notes', () => {
    render(<MapPage />);
    
    // Check if implementation notes are displayed
    expect(screen.getByText('Implementation Notes')).toBeInTheDocument();
    expect(screen.getByText('This is a placeholder for the map integration feature. In the full implementation, we will:')).toBeInTheDocument();
    
    // Check if the implementation list items are displayed
    const listItems = [
      'Integrate with Mapbox API',
      'Implement real-time location updates',
      'Create geofencing for pickup/delivery notifications',
      'Add route optimization',
      'Implement ETA calculations'
    ];
    
    listItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('displays active drivers section', () => {
    render(<MapPage />);
    
    // Check if active drivers section is displayed
    expect(screen.getByText('Active Drivers')).toBeInTheDocument();
    
    // Check if driver entries are displayed
    expect(screen.getByText('Driver 1')).toBeInTheDocument();
    expect(screen.getByText('Driver 2')).toBeInTheDocument();
    expect(screen.getByText('Driver 3')).toBeInTheDocument();
    
    // Check if last updated times are displayed
    expect(screen.getByText('Last updated: Just now')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 5 min ago')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 15 min ago')).toBeInTheDocument();
  });

  it('displays map information overlay', () => {
    render(<MapPage />);
    
    // Check if map information overlay is displayed
    expect(screen.getByText('Map Information')).toBeInTheDocument();
    expect(screen.getByText('In the full implementation, this map will show:')).toBeInTheDocument();
    
    // Check if the information list items are displayed
    const infoItems = [
      'Real-time driver locations',
      'Pickup and delivery points',
      'Optimized routes',
      'Geofencing notifications'
    ];
    
    infoItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
}); 