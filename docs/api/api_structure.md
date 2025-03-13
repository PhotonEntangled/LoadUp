# LoadUp API Structure

## 🔐 Authentication Endpoints

### `POST /api/auth/login`
- Login with email/password
- Returns JWT token

### `POST /api/auth/register`
- Register new user (customer/driver)
- Validates required fields

### `GET /api/auth/me`
- Get current user profile
- Requires authentication

## 📦 Shipments

### `GET /api/shipments`
- List shipments with pagination
- Query params:
  - `status`: Filter by status
  - `from`: Start date
  - `to`: End date
  - `page`: Page number
  - `limit`: Items per page

### `POST /api/shipments`
- Create new shipment
- Required fields:
  - `pickupAddress`
  - `deliveryAddress`
  - `packageDetails`
  - `scheduledPickupTime`

### `GET /api/shipments/:id`
- Get shipment details
- Includes tracking history

### `PATCH /api/shipments/:id`
- Update shipment status
- Allowed fields:
  - `status`
  - `driverId`
  - `notes`

## 🚚 Drivers

### `GET /api/drivers`
- List available drivers
- Query params:
  - `available`: Filter by availability
  - `vehicleType`: Filter by vehicle type
  - `location`: Filter by proximity

### `PATCH /api/drivers/:id/location`
- Update driver location
- Required fields:
  - `latitude`
  - `longitude`

### `GET /api/drivers/:id/shipments`
- Get driver's assigned shipments
- Includes current and completed

## 📍 Tracking

### `GET /api/tracking/:shipmentId`
- Get real-time shipment location
- Includes status updates

### `POST /api/tracking/:shipmentId`
- Add tracking update
- Required fields:
  - `status`
  - `location`
  - `message`

## 💳 Payments

### `POST /api/payments`
- Process payment for shipment
- Required fields:
  - `shipmentId`
  - `amount`
  - `paymentMethod`

### `POST /api/payments/:id/refund`
- Process refund
- Required fields:
  - `reason`
  - `amount`

## 📄 Documents

### `POST /api/documents/upload`
- Upload shipment document
- Multipart form data
- Processes with OCR

### `GET /api/documents/:shipmentId`
- List documents for shipment
- Includes OCR results

## 📊 Analytics

### `GET /api/analytics/shipments`
- Get shipment statistics
- Query params:
  - `timeframe`: daily/weekly/monthly
  - `status`: Filter by status

### `GET /api/analytics/drivers`
- Get driver performance metrics
- Includes:
  - Delivery success rate
  - Average delivery time
  - Customer ratings 