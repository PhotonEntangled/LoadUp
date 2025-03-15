import { NextRequest } from 'next/server';
import { POST as processDocument } from '../../apps/admin-dashboard/app/api/documents/process/route';
import { POST as processExcel } from '../../apps/admin-dashboard/app/api/documents/process-excel/route';

// Mock the Google Cloud Vision API
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    textDetection: jest.fn().mockResolvedValue([
      {
        fullTextAnnotation: {
          text: `
            SHIPPING LABEL
            Tracking: TRACK-TEST-123
            Customer: Test Customer
            Description: Test Shipment
            
            PICKUP:
            123 Main St
            New York, NY 10001
            Contact: John Doe
            Phone: 555-1234
            
            DELIVERY:
            456 Market St
            San Francisco, CA 94103
            Contact: Jane Smith
            Phone: 555-5678
            
            Pickup Date: 2023-03-15
            Delivery Date: 2023-03-20
          `,
        },
      },
    ]),
  })),
}));

// Mock the Excel processing library
jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        '!ref': 'A1:V3',
        A1: { v: 'tracking_number' },
        B1: { v: 'customer_name' },
        C1: { v: 'description' },
        D1: { v: 'pickup_street' },
        E1: { v: 'pickup_city' },
        F1: { v: 'pickup_state' },
        G1: { v: 'pickup_zip' },
        H1: { v: 'pickup_contact_name' },
        I1: { v: 'pickup_contact_phone' },
        J1: { v: 'delivery_street' },
        K1: { v: 'delivery_city' },
        L1: { v: 'delivery_state' },
        M1: { v: 'delivery_zip' },
        N1: { v: 'delivery_contact_name' },
        O1: { v: 'delivery_contact_phone' },
        P1: { v: 'pickup_date' },
        Q1: { v: 'delivery_date' },
        
        A2: { v: 'TRACK-EXCEL-1' },
        B2: { v: 'Excel Customer 1' },
        C2: { v: 'Excel Shipment 1' },
        D2: { v: '123 Excel St' },
        E2: { v: 'Excel City' },
        F2: { v: 'EX' },
        G2: { v: '12345' },
        H2: { v: 'Excel Contact 1' },
        I2: { v: '555-1111' },
        J2: { v: '456 Excel Ave' },
        K2: { v: 'Excel Delivery' },
        L2: { v: 'ED' },
        M2: { v: '54321' },
        N2: { v: 'Excel Recipient 1' },
        O2: { v: '555-2222' },
        P2: { v: '2023-04-01' },
        Q2: { v: '2023-04-05' },
      },
    },
  }),
  utils: {
    sheet_to_json: jest.fn().mockReturnValue([
      {
        tracking_number: 'TRACK-EXCEL-1',
        customer_name: 'Excel Customer 1',
        description: 'Excel Shipment 1',
        pickup_street: '123 Excel St',
        pickup_city: 'Excel City',
        pickup_state: 'EX',
        pickup_zip: '12345',
        pickup_contact_name: 'Excel Contact 1',
        pickup_contact_phone: '555-1111',
        delivery_street: '456 Excel Ave',
        delivery_city: 'Excel Delivery',
        delivery_state: 'ED',
        delivery_zip: '54321',
        delivery_contact_name: 'Excel Recipient 1',
        delivery_contact_phone: '555-2222',
        pickup_date: '2023-04-01',
        delivery_date: '2023-04-05',
      },
    ]),
  },
}));

// Mock the database
jest.mock('../../packages/db', () => ({
  db: {
    insert: jest.fn().mockResolvedValue([{ id: 'test-document-id' }]),
    select: jest.fn().mockResolvedValue([]),
  },
  documents: {
    id: 'id',
    content: 'content',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

describe('Document Processing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/documents/process', () => {
    it('processes an image document using OCR', async () => {
      // Create a mock FormData with an image file
      const formData = new FormData();
      const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      const imageFile = new File([imageBlob], 'test-document.jpg', { type: 'image/jpeg' });
      formData.append('file', imageFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processDocument(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.trackingNumber).toBe('TRACK-TEST-123');
      expect(responseData.data.customer).toBe('Test Customer');
      expect(responseData.data.description).toBe('Test Shipment');
      expect(responseData.data.pickupLocation).toBeDefined();
      expect(responseData.data.pickupLocation.street).toBe('123 Main St');
      expect(responseData.data.pickupLocation.city).toBe('New York');
      expect(responseData.data.pickupLocation.state).toBe('NY');
      expect(responseData.data.deliveryLocation).toBeDefined();
      expect(responseData.data.deliveryLocation.street).toBe('456 Market St');
      expect(responseData.data.deliveryLocation.city).toBe('San Francisco');
      expect(responseData.data.deliveryLocation.state).toBe('CA');
    });

    it('returns an error for invalid file types', async () => {
      // Create a mock FormData with an invalid file
      const formData = new FormData();
      const textBlob = new Blob(['This is not an image'], { type: 'text/plain' });
      const textFile = new File([textBlob], 'test-document.txt', { type: 'text/plain' });
      formData.append('file', textFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processDocument(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid file type. Only image files are supported.');
    });

    it('handles OCR processing errors', async () => {
      // Mock the Google Cloud Vision API to throw an error
      require('@google-cloud/vision').ImageAnnotatorClient.mockImplementationOnce(() => ({
        textDetection: jest.fn().mockRejectedValue(new Error('OCR processing failed')),
      }));

      // Create a mock FormData with an image file
      const formData = new FormData();
      const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
      const imageFile = new File([imageBlob], 'test-document.jpg', { type: 'image/jpeg' });
      formData.append('file', imageFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processDocument(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Error processing document: OCR processing failed');
    });
  });

  describe('POST /api/documents/process-excel', () => {
    it('processes an Excel file with shipment data', async () => {
      // Create a mock FormData with an Excel file
      const formData = new FormData();
      const excelBlob = new Blob(['fake excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const excelFile = new File([excelBlob], 'test-shipments.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      formData.append('file', excelFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process-excel', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processExcel(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.length).toBe(1);
      expect(responseData.data[0].trackingNumber).toBe('TRACK-EXCEL-1');
      expect(responseData.data[0].customer).toBe('Excel Customer 1');
      expect(responseData.data[0].description).toBe('Excel Shipment 1');
      expect(responseData.data[0].pickupLocation).toBeDefined();
      expect(responseData.data[0].pickupLocation.street).toBe('123 Excel St');
      expect(responseData.data[0].pickupLocation.city).toBe('Excel City');
      expect(responseData.data[0].pickupLocation.state).toBe('EX');
      expect(responseData.data[0].deliveryLocation).toBeDefined();
      expect(responseData.data[0].deliveryLocation.street).toBe('456 Excel Ave');
      expect(responseData.data[0].deliveryLocation.city).toBe('Excel Delivery');
      expect(responseData.data[0].deliveryLocation.state).toBe('ED');
    });

    it('returns an error for invalid file types', async () => {
      // Create a mock FormData with an invalid file
      const formData = new FormData();
      const textBlob = new Blob(['This is not an Excel file'], { type: 'text/plain' });
      const textFile = new File([textBlob], 'test-document.txt', { type: 'text/plain' });
      formData.append('file', textFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process-excel', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processExcel(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid file type. Only Excel files are supported.');
    });

    it('handles Excel processing errors', async () => {
      // Mock the Excel library to throw an error
      require('xlsx').read.mockImplementationOnce(() => {
        throw new Error('Excel processing failed');
      });

      // Create a mock FormData with an Excel file
      const formData = new FormData();
      const excelBlob = new Blob(['fake excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const excelFile = new File([excelBlob], 'test-shipments.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      formData.append('file', excelFile);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/documents/process-excel', {
        method: 'POST',
        body: formData,
      });

      // Call the API endpoint
      const response = await processExcel(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Error processing Excel file: Excel processing failed');
    });
  });
}); 