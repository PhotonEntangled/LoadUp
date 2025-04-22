import { create } from 'zustand';
import { ShipmentData } from '@/types/shipment';

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  status: 'Processing' | 'Processed' | 'Failed';
  shipments: ShipmentData[];
}

interface DocumentState {
  // Documents and shipments
  documents: Document[];
  processedShipments: ShipmentData[];
  isProcessing: boolean;
  
  // Action flags
  redirectAfterUpload: boolean;
  
  // Actions
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  setProcessedShipments: (shipments: ShipmentData[]) => void;
  clearProcessedShipments: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setRedirectAfterUpload: (redirect: boolean) => void;
  saveProcessedShipments: (name: string, type: string) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  documents: [],
  processedShipments: [],
  isProcessing: false,
  redirectAfterUpload: false,
  
  // Actions
  addDocument: (document: Document) => 
    set((state: DocumentState) => ({ 
      documents: [document, ...state.documents] 
    })),
    
  removeDocument: (id: string) => 
    set((state: DocumentState) => ({ 
      documents: state.documents.filter(doc => doc.id !== id) 
    })),
    
  setProcessedShipments: (shipments: ShipmentData[]) => 
    set(() => ({ 
      processedShipments: shipments,
      isProcessing: false
    })),
    
  clearProcessedShipments: () => 
    set(() => ({ 
      processedShipments: [] 
    })),
    
  setIsProcessing: (isProcessing: boolean) => 
    set(() => ({ 
      isProcessing 
    })),
    
  setRedirectAfterUpload: (redirect: boolean) => 
    set(() => ({ 
      redirectAfterUpload: redirect 
    })),
    
  saveProcessedShipments: (name: string, type: string) => {
    const { processedShipments, documents } = get();
    
    if (processedShipments.length === 0) {
      console.warn("Attempted to save empty shipments");
      return;
    }
    
    try {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name,
        type,
        uploadDate: new Date(),
        status: 'Processed',
        shipments: [...processedShipments] // Create a copy to avoid reference issues
      };
      
      // Update state with new document and reset processed shipments
      set((state: DocumentState) => ({
        documents: [newDocument, ...state.documents],
        processedShipments: [],
        redirectAfterUpload: true
      }));
      
      // Save to localStorage for persistence (in a real app, this would be an API call)
      try {
        const existingDocs = localStorage.getItem('loadup_documents');
        const parsedDocs = existingDocs ? JSON.parse(existingDocs) : [];
        const updatedDocs = [newDocument, ...parsedDocs];
        localStorage.setItem('loadup_documents', JSON.stringify(updatedDocs));
      } catch (storageError) {
        console.error("Failed to save to localStorage:", storageError);
      }
    } catch (error) {
      console.error("Error saving processed shipments:", error);
      throw error; // Re-throw to allow handling in the component
    }
  }
}));

// Initialize the store with documents from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedDocuments = localStorage.getItem('loadup_documents');
    if (savedDocuments) {
      const parsedDocuments = JSON.parse(savedDocuments);
      
      // Convert string dates back to Date objects
      const formattedDocuments = parsedDocuments.map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      }));
      
      useDocumentStore.setState({ documents: formattedDocuments });
    }
  } catch (error) {
    console.error("Failed to load documents from localStorage:", error);
  }
} 