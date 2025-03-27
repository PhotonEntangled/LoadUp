import { NextRequest, NextResponse } from 'next/server';
// import { ShipmentService } from '@loadup/database/services/shipmentService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Mock implementation
    const mockDocuments = [
      {
        id: "doc1",
        shipmentId: id,
        type: "bill_of_lading",
        filename: "bol_123456.pdf",
        url: "https://example.com/documents/bol_123456.pdf",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: "doc2",
        shipmentId: id,
        type: "invoice",
        filename: "invoice_123456.pdf",
        url: "https://example.com/documents/invoice_123456.pdf",
        uploadedAt: new Date().toISOString(),
      }
    ];
    
    return NextResponse.json({ documents: mockDocuments });
  } catch (error) {
    console.error(`Error fetching documents for shipment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing file or document type' },
        { status: 400 }
      );
    }
    
    // Mock implementation
    const mockDocument = {
      id: `doc${Date.now()}`,
      shipmentId: id,
      type,
      filename: file.name,
      url: `https://example.com/documents/${file.name}`,
      uploadedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({ document: mockDocument }, { status: 201 });
  } catch (error) {
    console.error(`Error uploading document for shipment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 