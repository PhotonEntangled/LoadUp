import ShipmentDetailPage from "@/components/shipment-detail-page"

export default function Page({ params }: { params: { documentId: string } }) {
  return <ShipmentDetailPage documentId={params.documentId} />
}
