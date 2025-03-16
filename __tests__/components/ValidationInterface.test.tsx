import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
// @ts-ignore - Module resolution issue with file extensions
import { ValidationInterface } from '../../components/document/ValidationInterface.tsx';

// Mock shipment data for testing
const mockShipmentData = {
  trackingNumber: 'TRACK123456',
  recipient: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345'
  },
  sender: {
    name: 'Jane Smith',
    address: '456 Oak Ave',
    city: 'Othertown',
    state: 'NY',
    zipCode: '67890'
  },
  weight: '5 lbs',
  service: 'Express',
  confidence: 0.85,
  fieldConfidence: {
    'trackingNumber': 0.95,
    'recipient.name': 0.9,
    'recipient.address': 0.85,
    'recipient.city': 0.8,
    'recipient.state': 0.75,
    'recipient.zipCode': 0.65, // Low confidence field
    'sender.name': 0.9,
    'sender.address': 0.85,
    'sender.city': 0.8,
    'sender.state': 0.75,
    'sender.zipCode': 0.7,
    'weight': 0.85,
    'service': 0.9
  }
};

// Mock shipment data with low overall confidence
const mockLowConfidenceData = {
  ...mockShipmentData,
  confidence: 0.6,
  fieldConfidence: {
    ...mockShipmentData.fieldConfidence,
    'trackingNumber': 0.6,
    'recipient.name': 0.5
  }
};

describe('ValidationInterface Component', () => {
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();
  const mockOnEdit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with shipment data', () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Check header
    expect(screen.getByText('Validate Shipment Data')).toBeTruthy();
    expect(screen.getByTestId('confidence-indicator')).toBeTruthy();
    expect(screen.getByText('Overall Confidence:')).toBeTruthy();
    expect(screen.getByText('85%')).toBeTruthy();
    
    // Check shipment data display
    expect(screen.getByText('TRACK123456')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('Anytown, CA 12345')).toBeTruthy();
    expect(screen.getByText('Jane Smith')).toBeTruthy();
    expect(screen.getByText('456 Oak Ave')).toBeTruthy();
    expect(screen.getByText('Othertown, NY 67890')).toBeTruthy();
    expect(screen.getByText('5 lbs')).toBeTruthy();
    expect(screen.getByText('Express')).toBeTruthy();
    
    // Check buttons
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Approve')).toBeTruthy();
    expect(screen.getByText('Reject')).toBeTruthy();
  });

  it('highlights fields with low confidence', () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Check that the zip code field is highlighted (it has confidence < 0.7)
    const zipCodeElement = screen.getByText('12345');
    expect(zipCodeElement.className).toContain('lowConfidence');
  });

  it('shows overall low confidence indicator', () => {
    render(
      <ValidationInterface
        shipmentData={mockLowConfidenceData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    const confidenceIndicator = screen.getByText('60%');
    expect(confidenceIndicator.className).toContain('confidenceLow');
  });

  it('enters edit mode when Edit button is clicked', () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Click Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Check that form inputs are rendered
    expect(screen.getByLabelText('Tracking Number')).toBeTruthy();
    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByLabelText('Address')).toBeTruthy();
    expect(screen.getByLabelText('City')).toBeTruthy();
    expect(screen.getByLabelText('State')).toBeTruthy();
    expect(screen.getByLabelText('Zip Code')).toBeTruthy();
    
    // Check that Save button is rendered
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('updates form values when edited', async () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Click Edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Edit tracking number
    const trackingInput = screen.getByLabelText('Tracking Number');
    fireEvent.change(trackingInput, { target: { value: 'UPDATED123' } });
    
    // Edit recipient name
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save'));
    
    // Check that onEdit was called with updated data
    expect(mockOnEdit).toHaveBeenCalledWith(expect.objectContaining({
      trackingNumber: 'UPDATED123',
      recipient: expect.objectContaining({
        name: 'Updated Name'
      })
    }));
  });

  it('calls onApprove when Approve button is clicked', () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Click Approve button
    fireEvent.click(screen.getByText('Approve'));
    
    // Check that onApprove was called with shipment data
    expect(mockOnApprove).toHaveBeenCalledWith(mockShipmentData);
  });

  it('calls onReject when Reject button is clicked', () => {
    render(
      <ValidationInterface
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );
    
    // Click Reject button
    fireEvent.click(screen.getByText('Reject'));
    
    // Check that onReject was called
    expect(mockOnReject).toHaveBeenCalled();
  });
}); 