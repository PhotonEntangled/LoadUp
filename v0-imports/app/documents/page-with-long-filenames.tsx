// This is a test page to demonstrate the fixed layout with long filenames
import ShipmentSlipsPage from "../../documents-page"

// Sample data with long filenames to test the layout
const documentsWithLongFilenames = [
  {
    id: "doc-1",
    filename: "march_shipments_international_logistics_report_2025.csv",
    dateParsed: "2025-03-25",
    shipments: 24,
    status: "Processed",
  },
  {
    id: "doc-2",
    filename: "international_orders_from_multiple_warehouses_consolidated_export.xlsx",
    dateParsed: "2025-03-27",
    shipments: 18,
    status: "Processing",
  },
  {
    id: "doc-3",
    filename: "domestic_deliveries_quarterly_summary_Q1_2025.csv",
    dateParsed: "2025-03-28",
    shipments: 42,
    status: "Processed",
  },
  {
    id: "doc-4",
    filename: "express_shipments_priority_handling_special_instructions.xlsx",
    dateParsed: "2025-03-29",
    shipments: 15,
    status: "Error",
  },
  {
    id: "doc-5",
    filename: "warehouse_transfers_inventory_management_system_export.csv",
    dateParsed: "2025-03-29",
    shipments: 8,
    status: "Processed",
  },
]

export default function DocumentsPageWithLongFilenames() {
  return <ShipmentSlipsPage documents={documentsWithLongFilenames} />
}
