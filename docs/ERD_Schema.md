# LoadUp Database Schema Documentation

This document serves as the single source of truth for the LoadUp database schema, based on the Entity-Relationship Diagrams. It includes field names, data types, relationships between tables, and our AI-powered field mapping system.

## AI-Powered Field Mapping

The LoadUp platform employs an AI-powered field mapping system to intelligently map fields from Excel documents to our standardized ERD schema. This approach:

- Reduces the need for hardcoded mappings
- Adapts to different Excel formats automatically
- Provides confidence scores for mappings
- Flags low-confidence mappings for review

### How AI Mapping Works

1. When an Excel file is processed, field names are first checked against our predefined mappings
2. If no match is found, the system calls OpenAI's API (GPT-4o Mini) to find the closest match
3. The AI returns a structured response with a mapped field name and confidence score
4. If confidence is high (>0.9), the mapping is used automatically
5. If confidence is medium (0.7-0.9), the mapping is used but flagged for review
6. If confidence is low (<0.7), the system falls back to basic field normalization

### Example AI Mappings

| Original Excel Field | AI-Mapped Field | Confidence | Used |
|---------------------|-----------------|------------|------|
| Notes | remarks | 0.98 | Yes |
| Phone Contact | contactNumber | 0.92 | Yes |
| Ship-to | shipToCustomer | 0.85 | Yes (flagged for review) |
| Misc. Info | unknown | 0.45 | No (normalized instead) |

## Core Entities

### PickUps

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| PickUpConfigId | uniqueidentifier | Foreign key to PickUpConfigs |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| AddressId | uniqueidentifier | Foreign key to address records |
| CargoStatusId | uniqueidentifier | Foreign key to CargoStatuses |
| PickUpPosition | int | Position in pickup sequence |
| PickUpDate | datetime2 | Scheduled pickup date/time |
| ShipmentWeight | float | Weight of shipment |
| ShipmentVolume | float | Volume of shipment |
| QuantityOfItems | int | Number of items in pickup |
| TotalPalettes | int | Total number of palettes |
| ActivityStatus | int | Status of the activity |
| ItemUnit | uniqueidentifier | Foreign key to ItemUnits |
| ActualDateTimeOfArrival | datetime2 | Actual arrival time |
| ActualDateTimeOfDeparture | datetime2 | Actual departure time |
| EstimatedDateTimeOfArrival | datetime2 | Estimated arrival time |
| EstimatedDateTimeOfDeparture | datetime2 | Estimated departure time |
| CreatedBy | uniqueidentifier | User who created the record |
| ModifiedBy | uniqueidentifier | User who last modified the record |

### DropOffs

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| DropOffConfigId | uniqueidentifier | Foreign key to DropOffConfigs |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| AddressId | uniqueidentifier | Foreign key to address records |
| CargoStatusId | uniqueidentifier | Foreign key to CargoStatuses |
| TripPodId | uniqueidentifier | Foreign key to TripPods |
| DropOffPosition | int | Position in dropoff sequence |
| ShipmentWeight | float | Weight of shipment |
| ShipmentVolume | float | Volume of shipment |
| QuantityOfItems | int | Number of items in dropoff |
| TotalPalettes | int | Total number of palettes |
| ActivityStatus | int | Status of the activity |
| CustomerDeliveryNumber | nvarchar(max) | Customer's delivery reference number |
| ItemUnit | uniqueidentifier | Foreign key to ItemUnits |
| MapToPickUpPosition | int | Related pickup position |
| ActualDateTimeOfArrival | datetime2 | Actual arrival time |
| ActualDateTimeOfDeparture | datetime2 | Actual departure time |
| DropOffDate | datetime2 | Scheduled dropoff date/time |
| EstimatedDateTimeOfArrival | datetime2 | Estimated arrival time |
| EstimatedDateTimeOfDeparture | datetime2 | Estimated departure time |
| CustomerPoNumbers | nvarchar(max) | Customer PO reference numbers |
| CreatedBy | uniqueidentifier | User who created the record |
| ModifiedBy | uniqueidentifier | User who last modified the record |

### PickUpConfigs

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| PickUpConfigGroupId | uniqueidentifier | Foreign key to PickUpConfigGroups |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| PickUpConfigPosition | int | Position in configuration sequence |
| CreatedBy | uniqueidentifier | User who created the record |
| ModifiedBy | uniqueidentifier | User who last modified the record |

### DropOffConfigs

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| DropOffConfigGroupId | uniqueidentifier | Foreign key to DropOffConfigGroups |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| DropOffConfigPosition | int | Position in configuration sequence |
| CreatedBy | uniqueidentifier | User who created the record |
| ModifiedBy | uniqueidentifier | User who last modified the record |

### PickUpConfigGroups

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| TripConfigId | uniqueidentifier | Foreign key to trip configuration |

### DropOffConfigGroups

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| TripConfigId | uniqueidentifier | Foreign key to trip configuration |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |

### CargoStatuses

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| PickUpDropOffId | uniqueidentifier | Related pickup/dropoff ID |
| QuantityOfDamagedItems | int | Number of damaged items |
| QuantityOfLostItems | int | Number of lost items |

### TripPods

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| DropOffId | uniqueidentifier | Foreign key to DropOffs |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| ResourceUriString | nvarchar(max) | Resource URI reference |
| PodReturned | bit | Whether POD has been returned |

### EPods

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| CreatedById | uniqueidentifier | User who created the record |
| ModifiedById | uniqueidentifier | User who last modified the record |
| DropOffId | uniqueidentifier | Foreign key to DropOffs |
| DateCreated | datetime2 | Timestamp of record creation |
| DateModified | datetime2 | Timestamp of last modification |
| Description | nvarchar(200) | Description of the ePOD |
| PodName | nvarchar(500) | Name of the POD |
| ResourceType | nvarchar(100) | Type of resource |
| PodReturned | bit | Whether POD has been returned |

### ItemUnits

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| Description | nvarchar(max) | Description of the item unit |

## Custom Shipment Entities

### Shipments

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| TenantId | uniqueidentifier | Tenant identifier |
| BookingId | uniqueidentifier | Related booking ID |
| ShipmentDateCreated | datetime2 | Timestamp of shipment creation |
| ShipmentDateModified | datetime2 | Timestamp of last shipment modification |
| IsActive | bit | Whether shipment is active |
| ShipmentDescription | nvarchar(max) | Description of shipment |
| ShipmentDocumentNumber | uniqueidentifier | Document reference number |
| ModifiedBy | uniqueidentifier | User who last modified the record |

### CustomShipmentDetails

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| CustomShipmentId | uniqueidentifier | Related custom shipment ID |
| ShipToAddress | nvarchar(max) | Shipping destination address |
| TripId | uniqueidentifier | Related trip ID |
| EarlyInboundDate | datetime2 | Earliest inbound date |
| LateInboundDate | datetime2 | Latest inbound date |
| EarlyOutboundDate | datetime2 | Earliest outbound date |
| LateOutboundDate | datetime2 | Latest outbound date |
| TotalTransportCost | float | Total transport cost |
| TotalTransportDistance | float | Total transport distance |
| TotalTransportDuration | float | Total transport duration |
| TotalTransportSegments | int | Number of transport segments |
| TotalTransportWeight | float | Total transport weight |
| TotalTransportVolume | float | Total transport volume |
| TotalHazardous | bit | Whether shipment contains hazardous materials |
| EquipmentRequirementId | uniqueidentifier | Required equipment ID |
| Manpower | int | Required manpower |
| SpecialEquipment | nvarchar(max) | Special equipment requirements |
| CustomerApproval | uniqueidentifier | Customer approval reference |
| CarrierApproval | uniqueidentifier | Carrier approval reference |
| Profitability | float | Shipment profitability |
| Remarks | nvarchar(max) | Additional remarks/notes |
| TotalInsight | nvarchar(max) | Insight information |
| TotalHazardousAddOnProfile | float | Hazardous material add-on profile |
| TotalInsight2 | float | Additional insight metric |
| HazardousId | uniqueidentifier | Hazardous material reference |

### Trips

| Field | Type | Description |
|-------|------|-------------|
| Id | uniqueidentifier | Primary key |
| TenantId | uniqueidentifier | Tenant identifier |
| TripId | uniqueidentifier | Trip identifier |
| DateCreated | datetime2 | Timestamp of trip creation |
| DateModified | datetime2 | Timestamp of last trip modification |
| TripConfigId | uniqueidentifier | Trip configuration reference |
| Material | nvarchar(max) | Material being transported |
| MaterialType | nvarchar(max) | Type of material |
| MaterialTransporter | uniqueidentifier | Transporter reference |
| Sealed | bit | Whether shipment is sealed |
| TripStatus | nvarchar(max) | Status of the trip |
| TruckId | uniqueidentifier | Truck reference |
| DriverId | uniqueidentifier | Driver reference |
| DriverName | nvarchar(max) | Name of the driver |
| CustomerTripSchedule | uniqueidentifier | Customer trip schedule reference |
| ResourceTrackIds | nvarchar(max) | Resource tracking IDs |
| Remarks | nvarchar(max) | Additional remarks/notes |
| TotalInsured | nvarchar(max) | Insurance information |

## Relationships

### Primary Relationships

1. **PickUps** are configured by **PickUpConfigs**
   - PickUps.PickUpConfigId → PickUpConfigs.Id

2. **DropOffs** are configured by **DropOffConfigs** 
   - DropOffs.DropOffConfigId → DropOffConfigs.Id

3. **PickUpConfigs** belong to **PickUpConfigGroups**
   - PickUpConfigs.PickUpConfigGroupId → PickUpConfigGroups.Id

4. **DropOffConfigs** belong to **DropOffConfigGroups**
   - DropOffConfigs.DropOffConfigGroupId → DropOffConfigGroups.Id

5. **TripPods** are linked to **DropOffs**
   - TripPods.DropOffId → DropOffs.Id

6. **EPods** are linked to **DropOffs**
   - EPods.DropOffId → DropOffs.Id

### Secondary Relationships

1. **DropOffs** can reference **CargoStatuses**
   - DropOffs.CargoStatusId → CargoStatuses.Id

2. **PickUps** can reference **CargoStatuses**
   - PickUps.CargoStatusId → CargoStatuses.Id

3. **DropOffs** can reference **ItemUnits**
   - DropOffs.ItemUnit → ItemUnits.Id

4. **PickUps** can reference **ItemUnits**
   - PickUps.ItemUnit → ItemUnits.Id

## Key Fields for AI-Driven Mapping

When processing shipment data from Excel files, the AI system prioritizes mapping to these fields:

### Essential Shipment Fields
- **Load Number** → Maps to `CustomShipmentDetails.ShipmentDocumentNumber`
- **Order Number** → Maps to `DropOffs.CustomerDeliveryNumber`
- **Promised Ship Date** → Maps to `PickUps.PickUpDate`
- **Request Date** → Maps to related date fields in PickUps/DropOffs
- **Ship To Customer** → Maps to destination info in CustomShipmentDetails
- **Ship To Address** → Maps to `CustomShipmentDetails.ShipToAddress`
- **Ship To State** → Component of the ShipToAddress
- **Contact Number** → Related to customer contact information
- **PO Number** → Maps to `DropOffs.CustomerPoNumbers`
- **Remarks** → Maps to `CustomShipmentDetails.Remarks`

### Item-Level Fields
- **Item Number**
- **Description**
- **Lot/Serial Number**
- **Quantity** → Maps to `QuantityOfItems` in PickUps/DropOffs
- **UOM** → Related to `ItemUnits`
- **Weight** → Maps to `ShipmentWeight` in PickUps/DropOffs

## Data Type Standards

- **Dates**: All dates should be stored as `datetime2` format
- **Numeric Values**: Use appropriate types (int, float) based on the field requirements
- **Text**: Use `nvarchar` for text fields, with `nvarchar(max)` for unbounded text
- **IDs**: Use `uniqueidentifier` for all entity IDs
- **Boolean Values**: Use `bit` type for boolean fields

## AI Field Mapping Logic

The AI-powered field mapping follows these steps to determine the best field match:

1. **Direct Mapping**: Try to find an exact match in our predefined mappings
2. **Case-Insensitive Mapping**: Try to find a case-insensitive match
3. **AI Mapping**: Use OpenAI to determine the best match based on field name semantics
4. **Confidence Evaluation**: Evaluate the confidence score of the AI mapping
5. **Fallback Normalization**: If confidence is low, use basic normalization rules

### AI Confidence Thresholds

- **High Confidence** (>0.9): Use AI mapping without review
- **Medium Confidence** (0.7-0.9): Use AI mapping but flag for review
- **Low Confidence** (<0.7): Fall back to basic normalization

This schema documentation serves as the definitive reference for field mappings in the LoadUp application. All data processing, transformation, and display should align with the field names and data types defined in this document. 