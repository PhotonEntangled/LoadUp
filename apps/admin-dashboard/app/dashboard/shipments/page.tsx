'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

// Status badge colors
const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-500',
  'ASSIGNED': 'bg-blue-500',
  'PICKED_UP': 'bg-indigo-500',
  'IN_TRANSIT': 'bg-purple-500',
  'OUT_FOR_DELIVERY': 'bg-cyan-500',
  'DELIVERED': 'bg-green-500',
  'FAILED': 'bg-red-500',
  'CANCELLED': 'bg-gray-500'
};

// Priority badge colors
const priorityColors: Record<string, string> = {
  'low': 'bg-gray-500',
  'medium': 'bg-blue-500',
  'high': 'bg-orange-500',
  'urgent': 'bg-red-500'
};

// Shipment type definition
type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  priority: string;
  customerId: string;
  driverId?: string;
  pickupAddress: {
    city: string;
    state: string;
  };
  deliveryAddress: {
    city: string;
    state: string;
  };
  scheduledPickupTime?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
};

// Filter type definition
type ShipmentFilters = {
  status?: string[];
  priority?: string[];
  search?: string;
  page: number;
  limit: number;
};

export default function ShipmentsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  // State for shipments and loading
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalShipments, setTotalShipments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState<ShipmentFilters>({
    page: 1,
    limit: 10
  });
  
  // State for search input
  const [searchInput, setSearchInput] = useState('');
  
  // Fetch shipments with filters
  const fetchShipments = async () => {
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(status => {
          queryParams.append('status[]', status);
        });
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filters.priority.forEach(priority => {
          queryParams.append('priority[]', priority);
        });
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      
      // Fetch shipments
      const response = await fetch(`/api/shipments?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      
      const data = await response.json();
      
      setShipments(data.data);
      setTotalShipments(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchInput,
      page: 1 // Reset to first page on new search
    }));
  };
  
  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : [status],
      page: 1 // Reset to first page on filter change
    }));
  };
  
  // Handle priority filter change
  const handlePriorityChange = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: priority === 'all' ? undefined : [priority],
      page: 1 // Reset to first page on filter change
    }));
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Navigate to shipment details
  const handleViewShipment = (id: string) => {
    router.push(`/dashboard/shipments/${id}`);
  };
  
  // Navigate to create shipment page
  const handleCreateShipment = () => {
    router.push('/dashboard/shipments/create');
  };
  
  // Fetch shipments when filters change or on initial load
  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchShipments();
    }
  }, [filters, sessionStatus]);
  
  // Redirect if not authenticated
  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (sessionStatus === 'unauthenticated') {
    router.push('/sign-in');
    return null;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shipments</h1>
        
        {/* Only show create button for admins and customers */}
        {(session?.user?.role === 'admin' || session?.user?.role === 'customer') && (
          <Button onClick={handleCreateShipment}>
            <Plus className="h-4 w-4 mr-2" />
            Create Shipment
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Shipment List</CardTitle>
          <CardDescription>
            Manage and track all shipments in the system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by tracking number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Shipments table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No shipments found
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[shipment.status] || 'bg-gray-500'}>
                          {shipment.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[shipment.priority] || 'bg-gray-500'}>
                          {shipment.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.pickupAddress?.city}, {shipment.pickupAddress?.state}
                      </TableCell>
                      <TableCell>
                        {shipment.deliveryAddress?.city}, {shipment.deliveryAddress?.state}
                      </TableCell>
                      <TableCell>
                        {shipment.createdAt ? format(new Date(shipment.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewShipment(shipment.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {shipments.length} of {totalShipments} shipments
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 