import React, { useState } from 'react';
import { ShipmentData } from '../../services/ocr/DocumentParser';

interface ValidationInterfaceProps {
  shipmentData: ShipmentData & { fieldConfidence?: Record<string, number> };
  onApprove: (data: ShipmentData) => void;
  onReject: () => void;
  onEdit: (data: ShipmentData) => void;
}

/**
 * Component for validating and editing OCR-extracted shipment data
 */
const ValidationInterface: React.FC<ValidationInterfaceProps> = ({
  shipmentData,
  onApprove,
  onReject,
  onEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ShipmentData>(shipmentData);
  
  // Confidence threshold for highlighting fields that need review
  const LOW_CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Handles changes to form fields
   */
  const handleChange = (field: string, value: string) => {
    // Handle nested fields (e.g., 'recipient.name')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedData({
        ...editedData,
        [parent]: {
          ...editedData[parent as keyof ShipmentData] as any,
          [child]: value
        }
      });
    } else {
      setEditedData({
        ...editedData,
        [field]: value
      });
    }
  };

  /**
   * Saves edited data
   */
  const handleSave = () => {
    setIsEditing(false);
    onEdit(editedData);
  };

  /**
   * Determines if a field has low confidence
   */
  const hasLowConfidence = (fieldName: string): boolean => {
    if (!shipmentData.fieldConfidence) return false;
    const confidence = shipmentData.fieldConfidence[fieldName];
    return confidence !== undefined && confidence < LOW_CONFIDENCE_THRESHOLD;
  };

  /**
   * Formats confidence as percentage
   */
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div style={styles.validationInterface}>
      <div style={styles.header}>
        <h2>Validate Shipment Data</h2>
        <div style={styles.confidenceIndicator} data-testid="confidence-indicator">
          <span>Overall Confidence:</span>
          <span style={shipmentData.confidence < LOW_CONFIDENCE_THRESHOLD ? styles.confidenceLow : styles.confidenceHigh}>
            {formatConfidence(shipmentData.confidence)}
          </span>
        </div>
      </div>

      <div style={styles.content}>
        {isEditing ? (
          <form className="edit-form">
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="trackingNumber">Tracking Number</label>
              <input
                id="trackingNumber"
                type="text"
                value={editedData.trackingNumber}
                onChange={(e) => handleChange('trackingNumber', e.target.value)}
                style={{...styles.input, ...(hasLowConfidence('trackingNumber') ? styles.inputLowConfidence : {})}}
              />
            </div>

            <h3>Recipient</h3>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="recipientName">Name</label>
              <input
                id="recipientName"
                type="text"
                value={editedData.recipient.name}
                onChange={(e) => handleChange('recipient.name', e.target.value)}
                style={{...styles.input, ...(hasLowConfidence('recipient.name') ? styles.inputLowConfidence : {})}}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="recipientAddress">Address</label>
              <input
                id="recipientAddress"
                type="text"
                value={editedData.recipient.address}
                onChange={(e) => handleChange('recipient.address', e.target.value)}
                style={{...styles.input, ...(hasLowConfidence('recipient.address') ? styles.inputLowConfidence : {})}}
              />
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="recipientCity">City</label>
                <input
                  id="recipientCity"
                  type="text"
                  value={editedData.recipient.city}
                  onChange={(e) => handleChange('recipient.city', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('recipient.city') ? styles.inputLowConfidence : {})}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="recipientState">State</label>
                <input
                  id="recipientState"
                  type="text"
                  value={editedData.recipient.state}
                  onChange={(e) => handleChange('recipient.state', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('recipient.state') ? styles.inputLowConfidence : {})}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="recipientZipCode">Zip Code</label>
                <input
                  id="recipientZipCode"
                  type="text"
                  value={editedData.recipient.zipCode}
                  onChange={(e) => handleChange('recipient.zipCode', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('recipient.zipCode') ? styles.inputLowConfidence : {})}}
                />
              </div>
            </div>

            <h3>Sender</h3>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="senderName">Name</label>
              <input
                id="senderName"
                type="text"
                value={editedData.sender.name}
                onChange={(e) => handleChange('sender.name', e.target.value)}
                style={{...styles.input, ...(hasLowConfidence('sender.name') ? styles.inputLowConfidence : {})}}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="senderAddress">Address</label>
              <input
                id="senderAddress"
                type="text"
                value={editedData.sender.address}
                onChange={(e) => handleChange('sender.address', e.target.value)}
                style={{...styles.input, ...(hasLowConfidence('sender.address') ? styles.inputLowConfidence : {})}}
              />
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="senderCity">City</label>
                <input
                  id="senderCity"
                  type="text"
                  value={editedData.sender.city}
                  onChange={(e) => handleChange('sender.city', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('sender.city') ? styles.inputLowConfidence : {})}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="senderState">State</label>
                <input
                  id="senderState"
                  type="text"
                  value={editedData.sender.state}
                  onChange={(e) => handleChange('sender.state', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('sender.state') ? styles.inputLowConfidence : {})}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="senderZipCode">Zip Code</label>
                <input
                  id="senderZipCode"
                  type="text"
                  value={editedData.sender.zipCode}
                  onChange={(e) => handleChange('sender.zipCode', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('sender.zipCode') ? styles.inputLowConfidence : {})}}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="weight">Weight</label>
                <input
                  id="weight"
                  type="text"
                  value={editedData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('weight') ? styles.inputLowConfidence : {})}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="service">Service</label>
                <input
                  id="service"
                  type="text"
                  value={editedData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  style={{...styles.input, ...(hasLowConfidence('service') ? styles.inputLowConfidence : {})}}
                />
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="button" 
                style={{...styles.button, ...styles.buttonSecondary}} 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                style={{...styles.button, ...styles.buttonPrimary}} 
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="shipment-details">
            <div style={styles.detailGroup}>
              <h3 style={styles.detailGroupHeading}>Tracking Information</h3>
              <p data-testid="field-trackingNumber" style={hasLowConfidence('trackingNumber') ? styles.lowConfidence : {}}>
                <strong>Tracking Number:</strong> {shipmentData.trackingNumber}
              </p>
              <p data-testid="field-service" style={hasLowConfidence('service') ? styles.lowConfidence : {}}>
                <strong>Service:</strong> {shipmentData.service}
              </p>
              <p data-testid="field-weight" style={hasLowConfidence('weight') ? styles.lowConfidence : {}}>
                <strong>Weight:</strong> {shipmentData.weight}
              </p>
            </div>

            <div style={styles.detailGroup}>
              <h3 style={styles.detailGroupHeading}>Recipient</h3>
              <p data-testid="field-recipient.name" style={hasLowConfidence('recipient.name') ? styles.lowConfidence : {}}>
                {shipmentData.recipient.name}
              </p>
              <p data-testid="field-recipient.address" style={hasLowConfidence('recipient.address') ? styles.lowConfidence : {}}>
                {shipmentData.recipient.address}
              </p>
              <p>
                <span data-testid="field-recipient.city" style={hasLowConfidence('recipient.city') ? styles.lowConfidence : {}}>
                  {shipmentData.recipient.city}
                </span>
                {', '}
                <span data-testid="field-recipient.state" style={hasLowConfidence('recipient.state') ? styles.lowConfidence : {}}>
                  {shipmentData.recipient.state}
                </span>
                {' '}
                <span data-testid="field-recipient.zipCode" style={hasLowConfidence('recipient.zipCode') ? styles.lowConfidence : {}}>
                  {shipmentData.recipient.zipCode}
                </span>
              </p>
            </div>

            <div style={styles.detailGroup}>
              <h3 style={styles.detailGroupHeading}>Sender</h3>
              <p data-testid="field-sender.name" style={hasLowConfidence('sender.name') ? styles.lowConfidence : {}}>
                {shipmentData.sender.name}
              </p>
              <p data-testid="field-sender.address" style={hasLowConfidence('sender.address') ? styles.lowConfidence : {}}>
                {shipmentData.sender.address}
              </p>
              <p>
                <span data-testid="field-sender.city" style={hasLowConfidence('sender.city') ? styles.lowConfidence : {}}>
                  {shipmentData.sender.city}
                </span>
                {', '}
                <span data-testid="field-sender.state" style={hasLowConfidence('sender.state') ? styles.lowConfidence : {}}>
                  {shipmentData.sender.state}
                </span>
                {' '}
                <span data-testid="field-sender.zipCode" style={hasLowConfidence('sender.zipCode') ? styles.lowConfidence : {}}>
                  {shipmentData.sender.zipCode}
                </span>
              </p>
            </div>

            {shipmentData.needsReview && (
              <div style={styles.reviewNotice}>
                <p>This shipment needs review due to low confidence or missing information.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div style={styles.actions}>
          <button 
            style={{...styles.button, ...styles.buttonSecondary}} 
            onClick={onReject}
          >
            Reject
          </button>
          <button 
            style={{...styles.button, ...styles.buttonSecondary}} 
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button 
            style={{...styles.button, ...styles.buttonPrimary}} 
            onClick={() => onApprove(shipmentData)}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
};

// Component styles
const styles = {
  validationInterface: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  confidenceIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  confidenceHigh: {
    color: 'green',
    fontWeight: 'bold',
  },
  confidenceLow: {
    color: 'red',
    fontWeight: 'bold',
  },
  content: {
    marginBottom: '20px',
  },
  detailGroup: {
    marginBottom: '20px',
  },
  detailGroupHeading: {
    marginBottom: '10px',
    color: '#333',
  },
  lowConfidence: {
    backgroundColor: 'rgba(255, 200, 200, 0.3)',
    padding: '2px 4px',
    borderRadius: '3px',
    borderLeft: '3px solid red',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  inputLowConfidence: {
    borderColor: '#ffcccc',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  buttonPrimary: {
    backgroundColor: '#4285F4',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#f1f1f1',
    color: '#333',
  },
  reviewNotice: {
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
    padding: '10px 15px',
    marginTop: '20px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
};

export default ValidationInterface; 