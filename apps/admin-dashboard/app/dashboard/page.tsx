"use client";

import { useEffect, useState } from 'react';
import { UserRole } from "@/auth";
import { Card } from "@/components/shared/Card";
import { 
  Truck, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { ClientDate } from "@/components/ui/ClientDate";
import FleetOverviewMapWrapper from "../../../../src/components/map/FleetOverviewMapWrapper";
import { Vehicle as SharedVehicle } from "../../../../packages/shared/src/types/shipment-tracking";
import { convertToAppVehicles } from "../../../../src/utils/vehicleAdapter";
import Link from "next/link";

// Mock data for stats cards
const stats = [
  {
    label: "Active Shipments",
    value: "156",
    icon: Package,
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "Available Trucks",
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

// Mock vehicle data for development
const mockVehicles: SharedVehicle[] = [
  {
    id: "v1",
    name: "T-1001",
    licensePlate: "ABC-123",
    type: "truck",
    currentLocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      timestamp: new Date(),
      heading: 90,
      speed: 30,
    },
  },
  {
    id: "v2",
    name: "T-1002",
    licensePlate: "XYZ-789",
    type: "truck",
    currentLocation: {
      latitude: 41.8781,
      longitude: -87.6298,
      timestamp: new Date(),
      heading: 180,
      speed: 45,
    },
  },
  {
    id: "v3",
    name: "T-1003",
    licensePlate: "DEF-456",
    type: "truck",
    currentLocation: {
      latitude: 34.0522,
      longitude: -118.2437,
      timestamp: new Date(),
      heading: 270,
      speed: 60,
    },
  },
];

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [userName, setUserName] = useState<string>("Admin User");
  const [userEmail, setUserEmail] = useState<string>("admin@loadup.com");
  
  // In a real implementation, we would fetch user data from an API
  // This mock implementation simulates that for the client component
  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = async () => {
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setUserRole(UserRole.ADMIN);
        setUserName("Admin User");
        setUserEmail("admin@loadup.com");
      }, 100);
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: <ClientDate />
        </div>
      </div>
      
      {/* User info card */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Welcome, {userName}</span>
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <span className="font-semibold">Role:</span> {userRole}
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <span className="font-semibold">Email:</span> {userEmail}
        </p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between p-4">
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
      
      {/* Map section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Fleet Overview</h2>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                // Force refresh the map by updating the key prop
                const mapKey = `dashboard-map-${Date.now()}`;
                const mapContainer = document.querySelector('.dashboard-map-container');
                if (mapContainer) {
                  // Force re-render by replacing the container
                  mapContainer.innerHTML = '';
                  // Re-render on next tick
                  setTimeout(() => {
                    const mapWrapper = document.createElement('div');
                    mapWrapper.className = 'h-[500px]';
                    mapWrapper.id = mapKey;
                    mapContainer.appendChild(mapWrapper);
                  }, 100);
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <Link 
              href="/dashboard/map" 
              className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Full Map
            </Link>
          </div>
        </div>
        
        <Card>
          <div className="p-4">
            <div className="h-[500px] dashboard-map-container">
              <FleetOverviewMapWrapper 
                key={`dashboard-map-${Date.now()}`}
                initialVehicles={convertToAppVehicles(mockVehicles)}
                height="100%"
                width="100%"
                showFilters={true}
                refreshInterval={10000}
                onVehicleClick={(vehicle) => console.log('Vehicle clicked:', vehicle)}
              />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Quick actions */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <Link 
          href="/documents" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
        >
          Upload Documents
        </Link>
      </div>
    </div>
  );
} 