# Excel Demo Assets

This directory contains sample Excel files for testing the Excel processing functionality of the LoadUp application.

## Files

- `demo-shipments.xlsx`: A sample Excel file containing multiple shipment entries
- `demo-customers.xlsx`: A sample Excel file containing customer data

## Usage

These files are used by the demo setup script to populate the demo environment with sample Excel files for batch processing. They are copied to the appropriate location in the application's storage directory.

## File Structure

### demo-shipments.xlsx

This file should contain the following columns:

- `tracking_number`: Unique identifier for the shipment
- `customer_name`: Name of the customer
- `customer_email`: Email address of the customer
- `description`: Description of the shipment
- `pickup_street`: Street address for pickup
- `pickup_city`: City for pickup
- `pickup_state`: State for pickup
- `pickup_zip`: ZIP code for pickup
- `pickup_country`: Country for pickup
- `pickup_contact_name`: Name of the contact person at pickup location
- `pickup_contact_phone`: Phone number of the contact person at pickup location
- `pickup_contact_email`: Email of the contact person at pickup location
- `delivery_street`: Street address for delivery
- `delivery_city`: City for delivery
- `delivery_state`: State for delivery
- `delivery_zip`: ZIP code for delivery
- `delivery_country`: Country for delivery
- `delivery_contact_name`: Name of the contact person at delivery location
- `delivery_contact_phone`: Phone number of the contact person at delivery location
- `delivery_contact_email`: Email of the contact person at delivery location
- `pickup_date`: Date for pickup (YYYY-MM-DD format)
- `delivery_date`: Date for delivery (YYYY-MM-DD format)

### demo-customers.xlsx

This file should contain the following columns:

- `name`: Customer name
- `email`: Customer email address
- `phone`: Customer phone number
- `company`: Customer company name
- `address`: Customer address
- `city`: Customer city
- `state`: Customer state
- `zip`: Customer ZIP code
- `country`: Customer country

## Replacing Demo Files

To replace these placeholder files with actual test Excel files:

1. Ensure the Excel files follow the structure described above
2. Use realistic data for better demonstration
3. Include multiple entries (at least 5-10) for batch processing demonstration
4. Save the files in XLSX format
5. Replace the files in this directory with your own test Excel files

## Note

The files in this directory are placeholders. Before running the demo, replace them with actual Excel files containing realistic shipment and customer data that can be processed by the system. 