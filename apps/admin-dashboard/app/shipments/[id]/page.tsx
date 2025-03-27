"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import { 
  Truck, 
  Package, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRole } from "@/auth";

// Shipment type definition
type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  customerId: string;
  driverId?: string;
  description?: string;
  weight?: string;
  dimensions?: string;
  packageCount?: string;
  pickupLocation: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  pickupContact: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
  };
  pickupDate?: string;
  pickupInstructions?: string;
  deliveryLocation: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryContact: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
  };
  deliveryDate?: string;
  deliveryInstructions?: string;
  priority?: string;
  cost?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    id: string;
    status: string;
    notes?: string;
    createdAt: string;
    updatedBy: string;
  }>;
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const shipmentId = params.id as string;

  // Fetch shipment details
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/shipments/${shipmentId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Shipment not found");
          } else if (response.status === 403) {
            throw new Error("You don't have permission to view this shipment");
          } else {
            throw new Error("Failed to fetch shipment details");
          }
        }
        
        const data = await response.json();
        setShipment(data);
      } catch (error) {
        console.error("Error fetching shipment:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId) {
      fetchShipment();
    }
  }, [shipmentId]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus || !shipment) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update shipment status");
      }
      
      const updatedShipment = await response.json();
      setShipment(updatedShipment);
      setShowStatusUpdate(false);
      setNewStatus("");
      setStatusNotes("");
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating shipment status:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setUpdating(false);
    }
  };

  // Get available status options based on current status and user role
  const getAvailableStatusOptions = () => {
    if (!shipment || !session?.user?.role) return [];
    
    const currentStatus = shipment.status;
    const userRole = session.user.role;
    
    if (userRole === "admin") {
      // Admins can set any status
      return [
        { value: "PENDING", label: "Pending" },
        { value: "ASSIGNED", label: "Assigned" },
        { value: "PICKED_UP", label: "Picked Up" },
        { value: "IN_TRANSIT", label: "In Transit" },
        { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { value: "DELIVERED", label: "Delivered" },
        { value: "FAILED", label: "Failed" },
        { value: "CANCELLED", label: "Cancelled" },
      ];
    } else if (userRole === "driver") {
      // Drivers can only update to logical next statuses
      switch (currentStatus) {
        case "ASSIGNED":
          return [
            { value: "PICKED_UP", label: "Picked Up" },
            { value: "FAILED", label: "Failed" },
          ];
        case "PICKED_UP":
          return [
            { value: "IN_TRANSIT", label: "In Transit" },
            { value: "FAILED", label: "Failed" },
          ];
        case "IN_TRANSIT":
          return [
            { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
            { value: "FAILED", label: "Failed" },
          ];
        case "OUT_FOR_DELIVERY":
          return [
            { value: "DELIVERED", label: "Delivered" },
            { value: "FAILED", label: "Failed" },
          ];
        default:
          return [];
      }
    } else if (userRole === UserRole.USER) {
      // Customers can only cancel pending or assigned shipments
      if (["PENDING", "ASSIGNED"].includes(currentStatus)) {
        return [{ value: "CANCELLED", label: "Cancelled" }];
      }
      return [];
    }
    
    return [];
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "PICKED_UP":
        return "bg-indigo-100 text-indigo-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge class
  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Check if user can update status
  const canUpdateStatus = () => {
    if (!session?.user?.role || !shipment) return false;
    
    const userRole = session.user.role;
    const currentStatus = shipment.status;
    
    if (userRole === "admin") return true;
    
    if (userRole === "driver" && shipment.driverId === session.user.id) {
      return ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(currentStatus);
    }
    
    if (userRole === UserRole.USER && shipment.customerId === session.user.id) {
      return ["PENDING", "ASSIGNED"].includes(currentStatus);
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-12 w-12 text-primary-500 animate-spin mb-4" />
        <p className="text-gray-500 text-lg">Loading shipment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/shipments">
            <button className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Back to Shipments</span>
            </button>
          </Link>
        </div>
        
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/shipments")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return to Shipments
          </button>
        </Card>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/shipments">
            <button className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Back to Shipments</span>
            </button>
          </Link>
        </div>
        
        <Card className="p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested shipment could not be found.</p>
          <button 
            onClick={() => router.push("/shipments")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return to Shipments
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/shipments">
            <button className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Back to Shipments</span>
            </button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {canUpdateStatus() && (
            <button 
              onClick={() => setShowStatusUpdate(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Edit className="h-5 w-5" />
              <span>Update Status</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Success message */}
      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Shipment status updated successfully
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {/* Shipment overview */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Shipment #{shipment.trackingNumber}
            </h1>
            <div className="flex items-center space-x-3">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                  shipment.status
                )}`}
              >
                {shipment.status.replace(/_/g, " ")}
              </span>
              
              {shipment.priority && (
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(
                    shipment.priority
                  )}`}
                >
                  Priority: {shipment.priority.charAt(0).toUpperCase() + shipment.priority.slice(1)}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            <div>Created: {formatDate(shipment.createdAt)}</div>
            <div>Last Updated: {formatDate(shipment.updatedAt)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipment details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Shipment Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {shipment.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Description</div>
                    <div className="text-gray-900">{shipment.description}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {shipment.weight && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Weight</div>
                      <div className="text-gray-900">{shipment.weight}</div>
                    </div>
                  )}
                  
                  {shipment.dimensions && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Dimensions</div>
                      <div className="text-gray-900">{shipment.dimensions}</div>
                    </div>
                  )}
                  
                  {shipment.packageCount && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Package Count</div>
                      <div className="text-gray-900">{shipment.packageCount}</div>
                    </div>
                  )}
                  
                  {shipment.cost && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">Cost</div>
                      <div className="text-gray-900">${shipment.cost}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pickup Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-1 text-primary-500" />
                Pickup Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">
                    {shipment.pickupLocation.street}<br />
                    {shipment.pickupLocation.city}, {shipment.pickupLocation.state} {shipment.pickupLocation.zipCode}<br />
                    {shipment.pickupLocation.country}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Contact</div>
                  <div className="text-gray-900">
                    {shipment.pickupContact.name}<br />
                    {shipment.pickupContact.phone}
                    {shipment.pickupContact.email && <><br />{shipment.pickupContact.email}</>}
                    {shipment.pickupContact.company && <><br />{shipment.pickupContact.company}</>}
                  </div>
                </div>
                
                {shipment.pickupDate && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Scheduled Date</div>
                    <div className="text-gray-900">{formatDate(shipment.pickupDate)}</div>
                  </div>
                )}
                
                {shipment.pickupInstructions && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Instructions</div>
                    <div className="text-gray-900">{shipment.pickupInstructions}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Delivery Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="h-5 w-5 mr-1 text-primary-500" />
                Delivery Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">
                    {shipment.deliveryLocation.street}<br />
                    {shipment.deliveryLocation.city}, {shipment.deliveryLocation.state} {shipment.deliveryLocation.zipCode}<br />
                    {shipment.deliveryLocation.country}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Contact</div>
                  <div className="text-gray-900">
                    {shipment.deliveryContact.name}<br />
                    {shipment.deliveryContact.phone}
                    {shipment.deliveryContact.email && <><br />{shipment.deliveryContact.email}</>}
                    {shipment.deliveryContact.company && <><br />{shipment.deliveryContact.company}</>}
                  </div>
                </div>
                
                {shipment.deliveryDate && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Scheduled Date</div>
                    <div className="text-gray-900">{formatDate(shipment.deliveryDate)}</div>
                  </div>
                )}
                
                {shipment.deliveryInstructions && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Instructions</div>
                    <div className="text-gray-900">{shipment.deliveryInstructions}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status History */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-1 text-primary-500" />
                Status History
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                {shipment.statusHistory && shipment.statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {shipment.statusHistory.map((history) => (
                      <div key={history.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                history.status
                              )}`}
                            >
                              {history.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(history.createdAt)}
                          </div>
                        </div>
                        {history.notes && (
                          <div className="mt-2 text-sm text-gray-700">
                            {history.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No status history available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Shipment Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a status</option>
                  {getAvailableStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  placeholder="Add any notes about this status update..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowStatusUpdate(false);
                    setNewStatus("");
                    setStatusNotes("");
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                  className={`px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors ${
                    !newStatus || updating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {updating ? (
                    <span className="flex items-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </span>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 