import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentProcessing from '../../apps/admin-dashboard/app/documents/page';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API calls
global.fetch = jest.fn();

describe('DocumentProcessing Component', () => {
  const mockRouter = {
    push: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  it('renders the document processing page', () => {
    render(<DocumentProcessing />);
    
    expect(screen.getByText(/Document Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose File/i)).toBeInTheDocument();
  });

  it('handles image upload and processing', async () => {
    render(<DocumentProcessing />);
    
    const fileInput = screen.getByLabelText(/Choose File/i);
    const file = new File(['dummy content'], 'test-document.jpg', { type: 'image/jpeg' });
    
    await userEvent.upload(fileInput, file);
    
    expect(screen.getByText(/test-document.jpg/i)).toBeInTheDocument();
    
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/documents/process', expect.any(Object));
    });
  });

  it('displays error message on upload failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Failed to process document' }),
    });
    
    render(<DocumentProcessing />);
    
    const fileInput = screen.getByLabelText(/Choose File/i);
    const file = new File(['dummy content'], 'test-document.jpg', { type: 'image/jpeg' });
    
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to process document/i)).toBeInTheDocument();
    });
  });

  it('handles Excel file upload and processing', async () => {
    render(<DocumentProcessing />);
    
    // Switch to Excel tab
    const excelTab = screen.getByRole('tab', { name: /Excel Upload/i });
    fireEvent.click(excelTab);
    
    const fileInput = screen.getByLabelText(/Choose File/i);
    const file = new File(['dummy content'], 'test-shipments.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    await userEvent.upload(fileInput, file);
    
    expect(screen.getByText(/test-shipments.xlsx/i)).toBeInTheDocument();
    
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/documents/process-excel', expect.any(Object));
    });
  });

  it('allows creating shipments from processed documents', async () => {
    // Mock successful document processing response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          customer: 'Test Customer',
          description: 'Test Shipment',
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
        },
      }),
    });
    
    render(<DocumentProcessing />);
    
    const fileInput = screen.getByLabelText(/Choose File/i);
    const file = new File(['dummy content'], 'test-document.jpg', { type: 'image/jpeg' });
    
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Shipment/i)).toBeInTheDocument();
    });
    
    const createShipmentButton = screen.getByRole('button', { name: /Create Shipment/i });
    fireEvent.click(createShipmentButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/shipments', expect.any(Object));
      expect(mockRouter.push).toHaveBeenCalledWith('/shipments');
    });
  });

  it('allows validating and correcting extracted data', async () => {
    // Mock successful document processing response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          customer: 'Test Customer',
          description: 'Test Shipment',
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
        },
      }),
    });
    
    render(<DocumentProcessing />);
    
    const fileInput = screen.getByLabelText(/Choose File/i);
    const file = new File(['dummy content'], 'test-document.jpg', { type: 'image/jpeg' });
    
    await userEvent.upload(fileInput, file);
    
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
    });
    
    // Edit the customer name
    const customerInput = screen.getByLabelText(/Customer/i);
    fireEvent.change(customerInput, { target: { value: 'Corrected Customer Name' } });
    
    const saveButton = screen.getByRole('button', { name: /Save Corrections/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Corrected Customer Name/i)).toBeInTheDocument();
    });
  });
}); 