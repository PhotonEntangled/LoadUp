import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ShipmentsPage from '@/app/shipments/page';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('ShipmentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'test-shipment-id',
            trackingNumber: 'TRACK123',
            status: 'pending',
            pickupLocation: {
              city: 'New York',
              state: 'NY',
            },
            deliveryLocation: {
              city: 'Boston',
              state: 'MA',
            },
            pickupContact: {
              name: 'John Doe',
            },
            deliveryContact: {
              name: 'Jane Smith',
            },
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      }),
    });
  });

  it('renders the shipments page with title', async () => {
    render(<ShipmentsPage />);
    
    // Check if the title is rendered
    expect(screen.getByText('Shipments')).toBeInTheDocument();
    
    // Check if the create shipment button is rendered
    expect(screen.getByText('Create Shipment')).toBeInTheDocument();
  });

  it('displays loading state while fetching shipments', async () => {
    render(<ShipmentsPage />);
    
    // Check if loading indicator is shown
    expect(screen.getByText('Loading shipments...')).toBeInTheDocument();
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
  });

  it('displays shipments after successful fetch', async () => {
    render(<ShipmentsPage />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
    
    // Check if shipment data is displayed
    expect(screen.getByText('TRACK123')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('Boston, MA')).toBeInTheDocument();
  });

  it('handles search filter changes', async () => {
    render(<ShipmentsPage />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search shipments...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Check if fetch was called with the search parameter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test%20search'),
        undefined
      );
    });
  });

  it('handles status filter changes', async () => {
    render(<ShipmentsPage />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
    
    // Find the status select
    const statusSelect = screen.getByRole('combobox');
    
    // Change the status filter
    fireEvent.change(statusSelect, { target: { value: 'delivered' } });
    
    // Check if fetch was called with the status parameter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=delivered'),
        undefined
      );
    });
  });

  it('displays error message when fetch fails', async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    
    render(<ShipmentsPage />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
    
    // Check if error message is displayed
    expect(screen.getByText('Failed to load shipments. Please try again.')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    render(<ShipmentsPage />);
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shipments...')).not.toBeInTheDocument();
    });
    
    // Find the next page button
    const nextButton = screen.getByText('Next');
    
    // Click the next page button
    fireEvent.click(nextButton);
    
    // Check if fetch was called with the page parameter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        undefined
      );
    });
  });
}); 