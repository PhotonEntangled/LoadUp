# LoadUp Database Schema

## 🔑 Enums

### `user_role`
- `ADMIN`
- `DRIVER`
- `CUSTOMER`

### `shipment_status`
- `PENDING`
- `PICKED_UP`
- `IN_TRANSIT`
- `DELIVERED`
- `FAILED`
- `CANCELLED`

### `payment_status`
- `PENDING`
- `PAID`
- `FAILED`
- `REFUNDED`

### `vehicle_type`
- `VAN`
- `TRUCK`
- `BIKE`
- `CAR`

## 📊 Tables

### `users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `email` | `varchar(255)` | Unique email |
| `password` | `text` | Hashed password |
| `fullName` | `varchar(255)` | User's full name |
| `role` | `user_role` | User's role |
| `phone` | `varchar(20)` | Contact number |
| `profileImage` | `text` | Profile image URL |
| `isActive` | `boolean` | Account status |
| `lastLoginAt` | `timestamp` | Last login time |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Update timestamp |

### `drivers`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `userId` | `uuid` | References users.id |
| `licenseNumber` | `varchar(50)` | Driver's license |
| `vehicleType` | `vehicle_type` | Type of vehicle |
| `vehiclePlate` | `varchar(20)` | Vehicle plate number |
| `currentLocation` | `jsonb` | Current lat/long |
| `isAvailable` | `boolean` | Availability status |
| `rating` | `decimal(3,2)` | Average rating |
| `totalDeliveries` | `integer` | Total deliveries |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Update timestamp |

### `shipments`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `trackingNumber` | `varchar(50)` | Unique tracking number |
| `customerId` | `uuid` | References users.id |
| `driverId` | `uuid` | References drivers.id |
| `status` | `shipment_status` | Current status |
| `pickupAddress` | `jsonb` | Pickup location |
| `deliveryAddress` | `jsonb` | Delivery location |
| `packageDetails` | `jsonb` | Package information |
| `scheduledPickupTime` | `timestamp` | Scheduled pickup |
| `actualPickupTime` | `timestamp` | Actual pickup |
| `estimatedDeliveryTime` | `timestamp` | Estimated delivery |
| `actualDeliveryTime` | `timestamp` | Actual delivery |
| `paymentStatus` | `payment_status` | Payment status |
| `amount` | `decimal(10,2)` | Shipment cost |
| `notes` | `text` | Additional notes |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Update timestamp |

### `tracking_updates`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `shipmentId` | `uuid` | References shipments.id |
| `status` | `shipment_status` | Update status |
| `location` | `jsonb` | Update location |
| `message` | `text` | Status message |
| `createdAt` | `timestamp` | Update timestamp |

### `documents`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `shipmentId` | `uuid` | References shipments.id |
| `type` | `varchar(50)` | Document type |
| `url` | `text` | Document URL |
| `processedData` | `jsonb` | OCR results |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Update timestamp |

### `payments`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `shipmentId` | `uuid` | References shipments.id |
| `amount` | `decimal(10,2)` | Payment amount |
| `status` | `payment_status` | Payment status |
| `stripePaymentId` | `varchar(255)` | Stripe payment ID |
| `refundId` | `varchar(255)` | Refund ID |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Update timestamp |

## 🔗 Relationships

1. `users` ←(1:1)→ `drivers`
   - One user can be one driver (if role is DRIVER)

2. `users` ←(1:M)→ `shipments`
   - One user can have many shipments (as customer)

3. `drivers` ←(1:M)→ `shipments`
   - One driver can have many shipments

4. `shipments` ←(1:M)→ `tracking_updates`
   - One shipment can have many tracking updates

5. `shipments` ←(1:M)→ `documents`
   - One shipment can have many documents

6. `shipments` ←(1:M)→ `payments`
   - One shipment can have many payments

## 📈 Indexes

1. `users`
   - `email` (UNIQUE)
   - `role` (B-TREE)

2. `drivers`
   - `userId` (FOREIGN KEY)
   - `isAvailable` (B-TREE)
   - `currentLocation` (GiST for geospatial)

3. `shipments`
   - `trackingNumber` (UNIQUE)
   - `customerId` (FOREIGN KEY)
   - `driverId` (FOREIGN KEY)
   - `status` (B-TREE)
   - `paymentStatus` (B-TREE)

4. `tracking_updates`
   - `shipmentId` (FOREIGN KEY)
   - `createdAt` (B-TREE)

5. `documents`
   - `shipmentId` (FOREIGN KEY)
   - `type` (B-TREE)

6. `payments`
   - `shipmentId` (FOREIGN KEY)
   - `status` (B-TREE)
   - `stripePaymentId` (UNIQUE) 