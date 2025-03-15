-- Create shipment status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
        CREATE TYPE shipment_status AS ENUM ('pending', 'processing', 'in_transit', 'delivered', 'cancelled');
    END IF;
END $$;

-- Create shipment priority enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_priority') THEN
        CREATE TYPE shipment_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

-- Create shipments table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT NOT NULL UNIQUE,
    status shipment_status NOT NULL DEFAULT 'pending',
    priority shipment_priority NOT NULL DEFAULT 'medium',
    
    customer_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    
    description TEXT,
    weight TEXT,
    dimensions TEXT,
    package_count TEXT,
    
    pickup_location JSONB NOT NULL,
    pickup_contact JSONB NOT NULL,
    pickup_date TIMESTAMP,
    pickup_instructions TEXT,
    
    delivery_location JSONB NOT NULL,
    delivery_contact JSONB NOT NULL,
    delivery_date TIMESTAMP,
    delivery_instructions TEXT,
    
    cost TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create shipment_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status shipment_status NOT NULL,
    location JSONB,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create shipment_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipment_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_driver_id ON shipments(driver_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_documents_shipment_id ON shipment_documents(shipment_id); 