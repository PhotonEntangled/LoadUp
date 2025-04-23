"use client"

import { useState } from "react"
import {
  BarChart3,
  Box,
  ClipboardList,
  FileText,
  Home,
  Map,
  Package,
  Search,
  Settings,
  Truck,
  Upload,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for shipment slips
const shipmentSlips = [
  {
    id: 1,
    filename: "march_shipments.csv",
    dateParsed: "2025-03-25",
    shipments: 24,
    status: "Processed",
  },
  {
    id: 2,
    filename: "international_orders.xlsx",
    dateParsed: "2025-03-27",
    shipments: 18,
    status: "Processing",
  },
  {
    id: 3,
    filename: "domestic_deliveries.csv",
    dateParsed: "2025-03-28",
    shipments: 42,
    status: "Processed",
  },
  {
    id: 4,
    filename: "express_shipments.xlsx",
    dateParsed: "2025-03-29",
    shipments: 15,
    status: "Error",
  },
  {
    id: 5,
    filename: "warehouse_transfers.csv",
    dateParsed: "2025-03-29",
    shipments: 8,
    status: "Processed",
  },
]

export default function Dashboard() {
  const [filter, setFilter] = useState("all")

  // Filter shipments based on selected filter
  const filteredSlips =
    filter === "all"
      ? shipmentSlips
      : shipmentSlips.filter((slip) => slip.status.toLowerCase() === filter.toLowerCase())

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Package className="h-6 w-6" />
            <span className="text-xl">LogiTrack</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Home className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <FileText className="h-4 w-4" />
                Shipment Slips
              </a>
            </Button>
            <Button variant="secondary" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <ClipboardList className="h-4 w-4" />
                Shipments
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Truck className="h-4 w-4" />
                Carriers
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Map className="h-4 w-4" />
                Tracking
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Box className="h-4 w-4" />
                Inventory
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <BarChart3 className="h-4 w-4" />
                Reports
              </a>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Users className="h-4 w-4" />
                Users
              </a>
            </Button>
            <Separator className="my-2" />
            <Button variant="ghost" className="justify-start gap-2 px-2" asChild>
              <a href="#">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button variant="outline" size="icon" className="md:hidden">
            <Package className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search shipments..."
                  className="w-full appearance-none bg-background pl-8 md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="outline" size="sm" className="ml-auto gap-1">
            <Upload className="h-4 w-4" />
            Upload Slip
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">Shipment Slips</h1>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSlips.map((slip) => (
                <Card key={slip.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-medium">{slip.filename}</CardTitle>
                      <StatusBadge status={slip.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date Parsed:</span>
                        <span>{formatDate(slip.dateParsed)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shipments:</span>
                        <span className="font-medium">{slip.shipments}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="default">
                      View Shipments
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper component for status badges
function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "processed":
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
    case "processing":
      return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
    case "error":
      return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
