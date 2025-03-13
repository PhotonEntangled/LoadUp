"use client";

import { Card } from "@/components/shared/Card";
import { 
  Truck, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";

const stats = [
  {
    label: "Active Shipments",
    value: "156",
    icon: Package,
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "Available Drivers",
    value: "28",
    icon: Truck,
    trend: "-3",
    trendUp: false,
  },
  {
    label: "Total Customers",
    value: "1,203",
    icon: Users,
    trend: "+5%",
    trendUp: true,
  },
  {
    label: "Revenue (MTD)",
    value: "$45.2K",
    icon: TrendingUp,
    trend: "+18%",
    trendUp: true,
  },
  {
    label: "Delayed Shipments",
    value: "3",
    icon: Clock,
    trend: "-2",
    trendUp: true,
  },
  {
    label: "Issues Reported",
    value: "5",
    icon: AlertTriangle,
    trend: "+2",
    trendUp: false,
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      stat.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  stat.trendUp ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <stat.icon
                  className={`h-5 w-5 ${
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 