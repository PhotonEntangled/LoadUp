import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the toBeInTheDocument matcher
import DriverDashboard from '../../apps/admin-dashboard/app/dashboard/driver/page';
import { useRouter } from 'next/navigation';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: () => '/dashboard/driver',
}));

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('DriverDashboard Component', () => {
  const mockRouter = {
    push: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        shipments: [
          {
            id: '1',
            trackingNumber: 'TRACK-001',
            status: 'assigned',
            description: 'Test Shipment 1',
            pickupLocation: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
            },
            deliveryLocation: {
              street: '456 Market St',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94103',
            },
            pickupDate: '2023-03-15T10:00:00Z',
            deliveryDate: '2023-03-20T14:00:00Z',
          },
          {
            id: '2',
            trackingNumber: 'TRACK-002',
            status: 'in_transit',
            description: 'Test Shipment 2',
            pickupLocation: {
              street: '789 Broadway',
              city: 'Boston',
              state: 'MA',
              zipCode: '02116',
            },
            deliveryLocation: {
              street: '101 Pine St',
              city: 'Seattle',
              state: 'WA',
              zipCode: '98101',
            },
            pickupDate: '2023-03-10T09:00:00Z',
            deliveryDate: '2023-03-18T13:00:00Z',
          },
        ],
      }),
    });
  });

  it('renders the driver dashboard', async () => {
    render(<DriverDashboard />);
    
    expect(screen.getByText(/Driver Dashboard/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/shipments/driver', expect.any(Object));
    });
  });

  it('displays assigned shipments', async () => {
    render(<DriverDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/TRACK-001/i)).toBeInTheDocument();
      expect(screen.getByText(/TRACK-002/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Shipment 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Shipment 2/i)).toBeInTheDocument();
    });
  });

  it('allows filtering shipments by status', async () => {
    render(<DriverDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/TRACK-001/i)).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.change(statusFilter, { target: { value: 'in_transit' } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shipments/driver?status=in_transit'),
        expect.any(Object)
      );
    });
  });

  it('allows updating shipment status', async () => {
    render(<DriverDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/TRACK-001/i)).toBeInTheDocument();
    });
    
    const updateButtons = screen.getAllByText(/Update Status/i);
    fireEvent.click(updateButtons[0]);
    
    const statusSelect = screen.getByLabelText(/New Status/i);
    fireEvent.change(statusSelect, { target: { value: 'in_transit' } });
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/shipments/1/status', {
        method: 'PUT',
        headers: expect.any(Object),
        body: JSON.stringify({ status: 'in_transit' }),
      });
    });
  });

  it('navigates to shipment details when clicked', async () => {
    render(<DriverDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/TRACK-001/i)).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText(/View Details/i);
    fireEvent.click(viewButtons[0]);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/shipments/1');
  });

  it('displays loading state while fetching shipments', () => {
    render(<DriverDashboard />);
    
    expect(screen.getByText(/Loading shipments/i)).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<DriverDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading shipments/i)).toBeInTheDocument();
    });
  });
}); 