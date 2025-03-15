"use client";

import { useState } from "react";
import { Card } from "@/components/shared/Card";
import { MapPin, Truck, AlertCircle } from "lucide-react";

export default function MapPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Tracking</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Map View</h2>
            </div>
            <div className="relative">
              {/* Map placeholder for MVP */}
              <div className="h-[600px] bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Map integration will be available in a future update</p>
                  <p className="text-sm text-gray-400">This is a placeholder for the Mapbox integration</p>
                </div>
              </div>
              
              {/* Information overlay */}
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Map Information</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  In the full implementation, this map will show:
                </p>
                <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
                  <li>Real-time driver locations</li>
                  <li>Pickup and delivery points</li>
                  <li>Optimized routes</li>
                  <li>Geofencing notifications</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Active Drivers</h2>
            </div>
            <div className="p-4">
              {/* Driver list placeholder */}
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Driver 1</p>
                    <p className="text-xs text-gray-500">Last updated: Just now</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Driver 2</p>
                    <p className="text-xs text-gray-500">Last updated: 5 min ago</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 rounded-full bg-yellow-100 mr-3">
                    <Truck className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Driver 3</p>
                    <p className="text-xs text-gray-500">Last updated: 15 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Implementation Notes</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                This is a placeholder for the map integration feature. In the full implementation, we will:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
                <li>Integrate with Mapbox API</li>
                <li>Implement real-time location updates</li>
                <li>Create geofencing for pickup/delivery notifications</li>
                <li>Add route optimization</li>
                <li>Implement ETA calculations</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 