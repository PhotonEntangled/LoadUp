import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ShipmentsPage() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold mb-4">Shipments</h1>
        <p className="text-gray-500 mb-6">View shipment details by selecting a document from the Documents page.</p>
        <Button asChild>
          <Link href="/documents">Go to Documents</Link>
        </Button>
      </div>
    </div>
  )
}

