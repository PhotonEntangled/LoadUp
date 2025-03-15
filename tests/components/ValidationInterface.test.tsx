import { describe, it, expect, jest } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ValidationInterface from '../../components/document/ValidationInterface';
import React from 'react';

describe('ValidationInterface', () => {
  const mockShipmentData = {
    trackingNumber: '1Z999AA10123456784',
    recipient: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210'
    },
    sender: {
      name: 'Acme Inc.',
      address: '456 Business Ave',
      city: 'Commerce',
      state: 'CA',
      zipCode: '90022'
    },
    weight: '5.2 lbs',
    service: 'Ground',
    confidence: 0.85,
    needsReview: true
  };

  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the shipment data for validation', () => {
    const { getByText, getByTestId } = render(
      <ValidationInterface 
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    expect(getByText('Tracking Number: 1Z999AA10123456784')).toBeDefined();
    expect(getByText('John Doe')).toBeDefined();
    expect(getByText('123 Main St')).toBeDefined();
    expect(getByText('Anytown, CA 90210')).toBeDefined();
    expect(getByText('Acme Inc.')).toBeDefined();
    expect(getByText('456 Business Ave')).toBeDefined();
    expect(getByText('Commerce, CA 90022')).toBeDefined();
    expect(getByText('Weight: 5.2 lbs')).toBeDefined();
    expect(getByText('Service: Ground')).toBeDefined();
    
    // Check confidence indicator
    expect(getByTestId('confidence-indicator')).toBeDefined();
    expect(getByText('85%')).toBeDefined();
  });

  it('should call onApprove when approve button is clicked', () => {
    const { getByText } = render(
      <ValidationInterface 
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(getByText('Approve'));
    expect(mockOnApprove).toHaveBeenCalledWith(mockShipmentData);
  });

  it('should call onReject when reject button is clicked', () => {
    const { getByText } = render(
      <ValidationInterface 
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(getByText('Reject'));
    expect(mockOnReject).toHaveBeenCalled();
  });

  it('should allow editing of shipment data fields', async () => {
    const { getByText, getByLabelText } = render(
      <ValidationInterface 
        shipmentData={mockShipmentData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Click edit button for tracking number
    fireEvent.click(getByText('Edit'));
    
    // Find the tracking number input and change it
    const trackingInput = getByLabelText('Tracking Number');
    fireEvent.change(trackingInput, { target: { value: '1Z999AA10123456999' } });
    
    // Save changes
    fireEvent.click(getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith({
        ...mockShipmentData,
        trackingNumber: '1Z999AA10123456999'
      });
    });
  });

  it('should highlight fields with low confidence', () => {
    const lowConfidenceData = {
      ...mockShipmentData,
      fieldConfidence: {
        trackingNumber: 0.95,
        'recipient.name': 0.45, // Low confidence field
        'recipient.address': 0.92,
        'sender.name': 0.90
      }
    };

    const { getByTestId } = render(
      <ValidationInterface 
        shipmentData={lowConfidenceData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onEdit={mockOnEdit}
      />
    );

    // Check that the low confidence field is highlighted
    const nameField = getByTestId('field-recipient.name');
    expect(nameField.className).toContain('low-confidence');
  });
}); 