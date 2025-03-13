# LoadUp Shipment Data ETL Plan

## Overview
This document outlines the Extract, Transform, Load (ETL) process for standardizing shipment data from various text files into a normalized PostgreSQL database.

## 1. Extraction Phase

### Source Files
- LOADUP ETD files (.txt)
- NIRO OUTSTATION files (.txt)

### Extraction Process
1. Read text files using UTF-8 encoding
2. Parse structured data using column mappings
3. Handle empty lines and subtotals
4. Store raw data in staging tables

### Staging Schema
```sql
CREATE TABLE staging_shipments (
    raw_id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    raw_data JSONB NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING'
);
```

## 2. Transformation Phase

### Data Cleaning Rules
1. **Contact Information**
   - Split multiple contacts into primary/secondary
   - Standardize phone numbers to E.164 format
   - Extract names and roles

2. **Address Standardization**
   - Parse unit numbers and building names
   - Extract postal codes
   - Standardize state names
   - Validate against Malaysian address format

3. **Weight Standardization**
   - Convert all weights to decimal format
   - Standardize to 2 decimal places
   - Handle subtotal rows

### Validation Rules
1. **Phone Numbers**
   - Must be valid Malaysian numbers
   - Must follow E.164 format
   - Primary contact required

2. **Addresses**
   - Required: street, area, state
   - Optional but validated: postal code, unit
   - State must match known Malaysian states

3. **Weights**
   - Must be positive numbers
   - Maximum 99999.99 kg
   - Two decimal place precision

## 3. Loading Phase

### Database Schema

```sql
-- Core shipment information
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    load_number VARCHAR(10) NOT NULL,
    order_number VARCHAR(20) NOT NULL,
    shipment_plan_id VARCHAR(20),
    promised_ship_date DATE NOT NULL,
    request_date DATE NOT NULL,
    actual_delivery_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    weight_kg DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(load_number)
);

-- Contact information
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shipment_id, phone)
);

-- Address information
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    unit VARCHAR(20),
    building VARCHAR(100),
    street VARCHAR(200) NOT NULL,
    area VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shipment_id)
);

-- Audit trail
CREATE TABLE etl_audit_log (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    records_processed INTEGER NOT NULL,
    success_count INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_details TEXT
);
```

### Loading Process
1. Begin transaction
2. Insert core shipment data
3. Insert related contacts
4. Insert address information
5. Update audit logs
6. Commit transaction

### Error Handling
1. Log validation failures
2. Maintain error queue for manual review
3. Support partial commits for valid records
4. Provide rollback mechanisms

## 4. Monitoring & Maintenance

### Performance Monitoring
1. Track processing times
2. Monitor error rates
3. Log validation failures
4. Track data quality metrics

### Maintenance Tasks
1. Archive processed files
2. Clean up staging data
3. Maintain audit logs
4. Update validation rules

### Alert Conditions
1. High error rates (>5%)
2. Processing delays
3. Data quality issues
4. System resource constraints

## 5. Recovery Procedures

### Rollback Process
1. Maintain staging data for 30 days
2. Store original files in backup
3. Log all transformations
4. Support point-in-time recovery

### Manual Intervention
1. Error queue review process
2. Data correction procedures
3. Reprocessing mechanisms
4. Audit trail maintenance 