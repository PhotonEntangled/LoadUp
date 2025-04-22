# LoadUp Database Schema Documentation (Source: ERD Images via GPT)

**Source of Truth:** This document reflects the database schema derived from ERD images (IMG_7059.jpg, IMG_7059 2.jpg) as interpreted by ChatGPT, serving as the canonical reference.

**Note:** This replaces the previous simplified/potentially inaccurate version. Drizzle schema (`src/lib/database/schema.ts`) must be aligned to this structure.

## Image 1: PickUp / DropOff / Cargo Status Flow

### Tables & Fields

*   **`PickUpConfigGroups`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `tripConfigId` (uuid, FK -> TripConfigs.id)
*   **`DropOffConfigGroups`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `tripConfigId` (uuid, FK -> TripConfigs.id)
*   **`PickUpConfigs`**
    *   `id` (uuid, PK)
    *   `pickUpConfigGroupId` (uuid, FK -> PickUpConfigGroups.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `pickUpConfigPosition` (integer)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`DropOffConfigs`**
    *   `id` (uuid, PK)
    *   `dropOffConfigGroupId` (uuid, FK -> DropOffConfigGroups.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `dropOffConfigPosition` (integer)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`PickUps`**
    *   `id` (uuid, PK)
    *   `pickUpConfigId` (uuid, FK -> PickUpConfigs.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `addressId` (uuid) - *FK Target? Addresses Table?*
    *   `cargoStatusId` (uuid, FK -> CargoStatuses.id)
    *   `pickUpPosition` (integer)
    *   `pickUpDate` (timestamp) - *Scheduled/Planned Pickup Time*
    *   `shipmentWeight` (decimal/float)
    *   `shipmentVolume` (decimal/float)
    *   `quantityOfItems` (integer)
    *   `totalPalettes` (integer)
    *   `activityStatus` (integer) - *Enum/Lookup Needed*
    *   `itemUnitId` (uuid, FK -> ItemUnits.id)
    *   `actualDateTimeOfArrival` (timestamp)
    *   `actualDateTimeOfDeparture` (timestamp)
    *   `estimatedDateTimeOfArrival` (timestamp)
    *   `estimatedDateTimeOfDeparture` (timestamp)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`DropOffs`**
    *   `id` (uuid, PK)
    *   `dropOffConfigId` (uuid, FK -> DropOffConfigs.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `addressId` (uuid) - *FK Target? Addresses Table?*
    *   `cargoStatusId` (uuid, FK -> CargoStatuses.id)
    *   `tripPodId` (uuid, FK -> TripPods.id)
    *   `dropOffPosition` (integer)
    *   `shipmentWeight` (decimal/float)
    *   `shipmentVolume` (decimal/float)
    *   `quantityOfItems` (integer)
    *   `totalPalettes` (integer)
    *   `activityStatus` (integer) - *Enum/Lookup Needed*
    *   `customerDeliveryNumber` (text)
    *   `itemUnitId` (uuid, FK -> ItemUnits.id)
    *   `mapToPickUpPosition` (integer) - *Logical link to PickUps.pickUpPosition?*
    *   `actualDateTimeOfArrival` (timestamp)
    *   `actualDateTimeOfDeparture` (timestamp)
    *   `dropOffDate` (timestamp) - *Scheduled/Planned Dropoff Time*
    *   `estimatedDateTimeOfArrival` (timestamp)
    *   `estimatedDateTimeOfDeparture` (timestamp)
    *   `customerPoNumbers` (text)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`ItemUnits`**
    *   `id` (uuid, PK)
    *   `description` (text)
*   **`CargoStatuses`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `pickUpDropOffId` (uuid) - *FK -> PickUps.id or DropOffs.id? Needs clarification.*
    *   `quantityOfDamagedItems` (integer)
    *   `quantityOfLostItems` (integer)
*   **`TripPods`**
    *   `id` (uuid, PK)
    *   `dropOffId` (uuid, FK -> DropOffs.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `resourceUrlString` (text) - *URL/Path to POD file*
    *   `podReturned` (boolean)
*   **`EPods`**
    *   `id` (uuid, PK)
    *   `createdById` (uuid) - *FK Target? Users?*
    *   `modifiedById` (uuid) - *FK Target? Users?*
    *   `dropOffId` (uuid, FK -> DropOffs.id)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `description` (varchar(200))
    *   `blobName` (varchar(500)) - *Storage blob reference*
    *   `resourceType` (varchar(100))
    *   `podReturned` (boolean)

## Image 2: Bookings / Shipments / Trips Schema

### Tables & Fields

*   **`Bookings`**
    *   `id` (uuid, PK)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `tenantId` (uuid) - *FK Target? Tenants Table?*
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `bookingDescription` (text)
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`CustomBookingDetails`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `shipperId` (uuid) - *FK Target? Shippers Table?*
    *   `shipmentId` (uuid) - *FK -> Shipments.id (from this ERD)*
    *   `bookingId` (uuid, FK -> Bookings.id)
    *   `sovylnvoiceNumber` (text)
    *   `loadUpJobNumber` (text)
    *   `plannedPickupDate` (timestamp)
    *   `plannedDeliveryDate` (timestamp)
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`Shipments`** (*Note: This is the ERD version*)
    *   `id` (uuid, PK)
    *   `tenantId` (uuid) - *FK Target? Tenants Table?*
    *   `bookingId` (uuid, FK -> Bookings.id)
    *   `shipmentDateCreated` (timestamp)
    *   `shipmentDateModified` (timestamp)
    *   `isActive` (boolean)
    *   `shipmentDescription` (text)
    *   `shipmentDocumentNumber` (uuid) - *Type mismatch? Should be text/varchar? Refers to what?*
    *   `modifiedBy` (uuid) - *FK Target? Users?*
*   **`CustomShipmentDetails`**
    *   `id` (uuid, PK)
    *   `customBookingDetailsId` (uuid, FK -> CustomBookingDetails.id)
    *   `shipmentId` (uuid, FK -> Shipments.id (ERD version))
    *   `customerDocumentNumber` (text) - *Order #?*
    *   `customerShipmentNumber` (text)
    *   `sovyJobNo` (text)
    *   `totalTransporterRate` (decimal/float)
    *   `totalTransporterManPowerRate` (decimal/float)
    *   `totalTransporterDropPointRate` (decimal/float)
    *   `totalTransporterStagingRate` (decimal/float)
    *   `totalTransporterPhRate` (decimal/float)
    *   `totalTransporterWaitingRate` (decimal/float)
    *   `totalShipperStagingRate` (decimal/float)
    *   `totalShipperPhRate` (decimal/float)
    *   `totalShipperManPowerRate` (decimal/float)
    *   `totalShipperWaitingRate` (decimal/float)
    *   `totalShipperRate` (decimal/float)
    *   `totalTransporterAdditionalRate` (decimal/float)
    *   `stackable` (boolean)
    *   `hazardousId` (uuid, FK -> Hazardous.id)
    *   `equipmentRequirementId` (uuid, FK -> EquipmentRequirements.id)
    *   `manpower` (integer)
    *   `specialRequirement` (text)
    *   `masterTransporterId` (uuid) - *FK Target? Transporters Table?*
    *   `cargoValueId` (uuid, FK -> CargoValues.id)
    *   `podStatus` (timestamp) - *Type mismatch? Status field or Timestamp?*
    *   `remarks` (text)
    *   `totalShipperAdditionalRate` (decimal/float)
    *   `totalShipperDropPointRate` (decimal/float)
    *   `shipToAddress` (text)
    *   `tripId` (uuid, FK -> Trips.id)
    *   `earlyInboundDate` (timestamp)
    *   `lateInboundDate` (timestamp)
    *   `earlyOutboundDate` (timestamp)
    *   `lateOutboundDate` (timestamp)
    *   `totalTransportCost` (decimal/float)
    *   `totalTransportDistance` (decimal/float)
    *   `totalTransportDuration` (decimal/float)
    *   `totalTransportSegments` (integer)
    *   `totalTransportWeight` (decimal/float)
    *   `totalTransportVolume` (decimal/float)
    *   `totalHazardous` (boolean)
    *   `customerApproval` (uuid) - *FK Target?*
    *   `carrierApproval` (uuid) - *FK Target?*
    *   `profitability` (decimal/float)
    *   `totalInsight` (text)
    *   `totalHazardousAddOnProfile` (decimal/float)
    *   `totalInsight2` (decimal/float)
*   **`CustomShipmentDetailDocumentRequirements`** (*Junction Table*)
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `customShipmentDetailId` (uuid, FK -> CustomShipmentDetails.id)
    *   `documentRequirementId` (uuid, FK -> DocumentRequirements.id)
*   **`DocumentRequirements`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `description` (text)
    *   `observation` (text)
*   **`EquipmentRequirements`**
    *   `id` (uuid, PK)
    *   `customShipmentDetailId` (uuid, FK -> CustomShipmentDetails.id)
    *   `leaseOrNonLease` (boolean)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `liftgate` (boolean)
    *   `liftgateQuantity` (integer)
    *   `palletJack` (boolean)
    *   `palletJackQuantity` (integer)
*   **`Hazardous`**
    *   `id` (uuid, PK)
    *   `description` (text)
*   **`CargoValues`**
    *   `id` (uuid, PK)
    *   `description` (text)
    *   `cargoDescriptionId` (uuid, FK -> CargoDescriptions.id)
*   **`CargoDescriptions`**
    *   `id` (uuid, PK)
    *   `description` (text)
*   **`Trips`**
    *   `id` (uuid, PK)
    *   `tenantId` (uuid) - *FK Target? Tenants Table?*
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `tripConfigId` (uuid, FK -> TripConfigs.id)
    *   `material` (text)
    *   `materialType` (text)
    *   `materialTransporter` (uuid) - *FK Target? Transporters Table?*
    *   `sealed` (boolean)
    *   `tripStatus` (text) - *Enum Needed*
    *   `truckId` (uuid, FK -> Trucks.id)
    *   `driverId` (uuid) - *FK -> drivers table (Drizzle)?*
    *   `driverName` (text)
    *   `customerTripSchedule` (uuid) - *FK Target?*
    *   `resourceTrackIds` (text)
    *   `remarks` (text)
    *   `totalInsured` (text) - *Type? Boolean or amount?*
    *   `customTripDetailsId` (uuid, FK -> CustomTripDetails.id)
*   **`CustomTripDetails`**
    *   `id` (uuid, PK)
    *   `createdBy` (uuid) - *FK Target? Users?*
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `typeOfGoods` (text)
    *   `trackAndTraceUrl` (text)
    *   `shipperAdditionalRate` (decimal/float)
    *   `shipperDropPointRate` (decimal/float)
    *   `shipperManPowerRate` (decimal/float)
    *   `shipperPhRate` (decimal/float)
    *   `shipperRate` (decimal/float)
    *   `shipperStagingRate` (decimal/float)
    *   `shipperWaitingRate` (decimal/float)
    *   `transporterAdditionalRate` (decimal/float)
    *   `transporterDropPointRate` (decimal/float)
    *   `transporterManPowerRate` (decimal/float)
    *   `transporterPhRate` (decimal/float)
    *   `transporterRate` (decimal/float)
    *   `transporterStagingRate` (decimal/float)
    *   `transporterWaitingRate` (decimal/float)
*   **`TripConfigs`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `tripId` (uuid, FK -> Trips.id)
*   **`Trucks`**
    *   `id` (uuid, PK)
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `truckLengthId` (uuid, FK -> TruckLengths.id)
    *   `truckSizeId` (uuid, FK -> TruckSizes.id)
    *   `truckTypeId` (uuid, FK -> TruckTypes.id)
    *   `truckBrandId` (uuid, FK -> TruckBrands.id)
    *   `truckModelId` (uuid, FK -> TruckModels.id)
    *   `truckPayloadId` (uuid, FK -> TruckPayloads.id)
    *   `isBonded` (boolean)
    *   `registrationNumber` (text)
    *   `weight` (decimal/float)
    *   `dimension` (text)
    *   `roadTaxExpiryDate` (timestamp)
    *   `inspectionExpiryDate` (timestamp)
*   **`TruckTypes`**, **`TruckPayloads`**, **`TruckModels`**, **`TruckLengths`**, **`TruckBrands`**, **`TruckSizes`**
    *   `id` (uuid, PK)
    *   `description` (text)
*   **`Trailers`**
    *   `id` (uuid, PK)
    *   `transporterId` (uuid) - *FK Target? Transporters Table?*
    *   `dateCreated` (timestamp)
    *   `dateModified` (timestamp)
    *   `trailerSizeId` (uuid, FK -> TrailerSizes.id)
    *   `trailerTypeId` (uuid, FK -> TrailerTypes.id)
    *   `weight` (decimal/float)
    *   `dimension` (decimal/float) - *Type?*
    *   `registrationNumber` (text)
    *   `permitNumber` (text)
    *   `permitExpiryDate` (timestamp)
    *   `inspectionExpiryDate` (timestamp)
*   **`TrailerTypes`**, **`TrailerSizes`**
    *   `id` (uuid, PK)
    *   `description` (text)

## Relationships Summary (from GPT)

*(Included from previous message for completeness)*

**Image 1:**
*   PickUpConfigGroups -> PickUpConfigs
*   DropOffConfigGroups -> DropOffConfigs
*   PickUpConfigs -> PickUps
*   DropOffConfigs -> DropOffs
*   CargoStatuses -> PickUps, DropOffs (via PickUpDropOffId - needs clarification)
*   ItemUnits -> PickUps, DropOffs
*   DropOffs -> TripPods
*   DropOffs -> EPods
*   TripConfigs -> PickUpConfigGroups, DropOffConfigGroups

**Image 2:**
*   Bookings -> CustomBookingDetails, Shipments
*   CustomBookingDetails -> Shipments (?)
*   Shipments -> CustomShipmentDetails
*   CustomShipmentDetails -> CustomShipmentDetailDocumentRequirements, EquipmentRequirements, Hazardous, CargoValues, Trips(?)
*   DocumentRequirements -> CustomShipmentDetailDocumentRequirements
*   CargoDescriptions -> CargoValues
*   TripConfigs -> Trips
*   CustomTripDetails -> Trips
*   Trucks -> Trips
*   TruckTypes, TruckPayloads, TruckModels, TruckLengths, TruckBrands, TruckSizes -> Trucks
*   TrailerTypes, TrailerSizes -> Trailers

*(Note: Some relationships like Trips -> Shipments or FK targets are still inferred or require clarification)*

---

*Self-Correction: Added placeholder comments for ambiguous FK targets and type mismatches identified during transcription.*