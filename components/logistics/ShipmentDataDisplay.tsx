"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// Temporarily comment out type import for sanity check
// import { ShipmentData } from "@/src/types/shipment"; 
import { ShipmentTableView } from "./shipments/ShipmentTableView";
import { ShipmentCardView } from "./shipments/ShipmentCardView";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "../ui/checkbox";
import { 
  Download, 
  Search, 
  TrendingUp, 
  Package, 
  Scale, 
  MapPin, 
  Calendar,
  Truck,
  Clock,
  Filter,
  Tag,
  AlertCircle,
  PlusSquare,
  Edit,
  Save,
  RotateCcw,
  History,
  FileCheck
} from "lucide-react";
import { SheetSelect } from "../ui/custom-select";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Added quick filter types for logistics purposes
type QuickFilterType = 'all' | 'urgent' | 'delayed' | 'international' | 'domestic' | 'heavyWeight';

// Added types for edit mode
type EditableField = 'loadNumber' | 'orderNumber' | 'poNumber' | 'promisedShipDate' | 
  'requestDate' | 'actualShipDate' | 'expectedDeliveryDate' | 'shipToCustomer' | 
  'shipToAddress' | 'shipToCity' | 'shipToState' | 'shipToZip' | 'shipToCountry' | 
  'contactName' | 'contactNumber' | 'contactEmail' | 'remarks' | 'carrier' | 
  'trackingNumber' | 'routeNumber' | 'vehicleType' | string;

type ShipmentChange = {
  shipmentId: string;
  field: EditableField;
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
  timestamp: Date;
};

interface ShipmentDataDisplayProps {
  shipments: any[]; // Use any temporarily
  onCreateShipment?: (shipment: any) => void;
}

export default function ShipmentDataDisplay({ 
  shipments, 
  onCreateShipment
}: ShipmentDataDisplayProps) {
  const { toast } = useToast();
  const [displayMode, setDisplayMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShipments, setFilteredShipments] = useState<any[]>(shipments);
  const [selectedSheetName, setSelectedSheetName] = useState<string>("all");
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [showStats, setShowStats] = useState<boolean>(true);
  // New state variables for enhanced features
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  
  // New state variables for edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editableShipments, setEditableShipments] = useState<any[]>([]);
  const [changeHistory, setChangeHistory] = useState<ShipmentChange[]>([]);
  
  // Add check for shipments prop before accessing properties 
  const sheetNames = Array.from(new Set((shipments || []).map(shipment => 
    shipment.miscellaneousFields?.sheetName || 'Unknown'
  )));
  
  // Compute summary statistics
  const statistics = useMemo(() => {
    const safeShipments = shipments || []; // Ensure shipments is an array
    // For all shipments
    const totalWeight = safeShipments.reduce((sum, shipment) => sum + (shipment.totalWeight || 0), 0);
    const totalItems = safeShipments.reduce((sum, shipment) => sum + (shipment.items?.length || 0), 0);
    
    // For filtered shipments
    const filteredWeight = filteredShipments.reduce((sum, shipment) => sum + (shipment.totalWeight || 0), 0);
    const filteredItems = filteredShipments.reduce((sum, shipment) => sum + (shipment.items?.length || 0), 0);
    
    // Sheet distribution
    const sheetDistribution = safeShipments.reduce((acc, shipment) => {
      const sheet = shipment.miscellaneousFields?.sheetName || 'Unknown';
      acc[sheet] = (acc[sheet] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Date range
    const shipDates = safeShipments
      .map(s => s.promisedShipDate ? new Date(s.promisedShipDate).getTime() : 0)
      .filter(d => d > 0);
    
    const earliestDate = shipDates.length > 0 
      ? new Date(Math.min(...shipDates))
      : null;
    
    const latestDate = shipDates.length > 0 
      ? new Date(Math.max(...shipDates))
      : null;
    
    // Determine number of urgent shipments (those with delivery date within 2 days)
    const urgentCount = safeShipments.filter(shipment => {
      if (!shipment.expectedDeliveryDate) return false;
      const deliveryDate = new Date(shipment.expectedDeliveryDate);
      const today = new Date();
      const diffTime = deliveryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0;
    }).length;
    
    // Count international shipments
    const internationalCount = safeShipments.filter(shipment => {
      const countryCode = shipment.shipToCountry || '';
      return countryCode !== '' && countryCode !== 'US' && countryCode !== 'USA';
    }).length;
    
    // Count heavy shipments (over 500kg)
    const heavyShipmentCount = safeShipments.filter(shipment => 
      (shipment.totalWeight || 0) > 500
    ).length;
    
    return {
      totalWeight,
      totalItems,
      filteredWeight,
      filteredItems,
      sheetDistribution,
      earliestDate,
      latestDate,
      urgentCount,
      internationalCount,
      heavyShipmentCount
    };
  }, [shipments, filteredShipments]);
  
  // Apply filters based on search query, selected sheet, and quick filter
  useEffect(() => {
    let result = shipments || []; // Ensure shipments is an array
    
    // Filter by sheet
    if (selectedSheetName !== "all") {
      result = result.filter(shipment => 
        shipment.miscellaneousFields?.sheetName === selectedSheetName
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(shipment => {
        return (
          (shipment.loadNumber?.toLowerCase().includes(query) ?? false) ||
          (shipment.orderNumber?.toLowerCase().includes(query) ?? false) ||
          (shipment.poNumber?.toLowerCase().includes(query) ?? false) ||
          (shipment.shipToCustomer?.toLowerCase().includes(query) ?? false) ||
          (shipment.carrier?.toLowerCase().includes(query) ?? false) ||
          (shipment.remarks?.toLowerCase().includes(query) ?? false)
        );
      });
    }
    
    // Apply quick filters
    if (quickFilter !== 'all') {
      switch (quickFilter) {
        case 'urgent':
          result = result.filter(shipment => {
            if (!shipment.expectedDeliveryDate) return false;
            const deliveryDate = new Date(shipment.expectedDeliveryDate);
            const today = new Date();
            const diffTime = deliveryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 2 && diffDays >= 0;
          });
          break;
        case 'delayed':
          result = result.filter(shipment => {
            if (!shipment.promisedShipDate || !shipment.actualShipDate) return false;
            const promised = new Date(shipment.promisedShipDate);
            const actual = new Date(shipment.actualShipDate);
            return actual > promised;
          });
          break;
        case 'international':
          result = result.filter(shipment => {
            const countryCode = shipment.shipToCountry || '';
            return countryCode !== '' && countryCode !== 'US' && countryCode !== 'USA';
          });
          break;
        case 'domestic':
          result = result.filter(shipment => {
            const countryCode = shipment.shipToCountry || '';
            return countryCode === '' || countryCode === 'US' || countryCode === 'USA';
          });
          break;
        case 'heavyWeight':
          result = result.filter(shipment => (shipment.totalWeight || 0) > 500);
          break;
      }
    }
    
    setFilteredShipments(result);
    
    // Clear selected shipments that are no longer in the filtered results
    setSelectedShipments(prev => prev.filter(
      id => result.some(s => s.loadNumber === id || s.orderNumber === id)
    ));
  }, [shipments, searchQuery, selectedSheetName, quickFilter]);
  
  // Initialize editable shipments when filtered shipments change
  useEffect(() => {
    if (isEditMode) {
      setEditableShipments([...filteredShipments]);
    }
  }, [filteredShipments, isEditMode]);
  
  const handleSelectAll = () => {
    if (selectedShipments.length === filteredShipments.length) {
      // Deselect all
      setSelectedShipments([]);
    } else {
      // Select all
      setSelectedShipments(filteredShipments.map(s => s.loadNumber || s.orderNumber || ''));
    }
  };
  
  const handleSelectShipment = (shipment: any, selected: boolean) => {
    const identifier = shipment.loadNumber || shipment.orderNumber || '';
    if (!identifier) return;
    
    if (selected) {
      setSelectedShipments(prev => [...prev, identifier]);
    } else {
      setSelectedShipments(prev => prev.filter(id => id !== identifier));
    }
  };
  
  const isSelected = (shipment: any) => {
    const identifier = shipment.loadNumber || shipment.orderNumber || '';
    return selectedShipments.includes(identifier);
  };
  
  const handleExportAll = () => {
    // This would use a proper CSV export utility
    alert('Export all functionality would be implemented here');
  };
  
  const handleExportSelected = () => {
    if (selectedShipments.length === 0) {
      alert('Please select shipments to export');
      return;
    }
    
    const selectedShipmentData = filteredShipments.filter(s => 
      isSelected(s)
    );
    
    alert(`Export ${selectedShipmentData.length} selected shipments`);
  };
  
  const handleExportSingle = (shipment: any) => {
    // This would use a proper CSV export utility
    alert(`Export single shipment: ${shipment.loadNumber || shipment.orderNumber || 'unknown'}`);
  };
  
  // Calculate estimated delivery time
  const getEstimatedDeliveryTime = (shipment: any): string => {
    if (!shipment.promisedShipDate) return 'Unknown';
    
    // Simple estimation logic - in a real app this would be more sophisticated
    const distance = calculateDistance(shipment);
    let transitDays: number;
    
    if (distance < 500) transitDays = 1;
    else if (distance < 1000) transitDays = 2;
    else if (distance < 2000) transitDays = 3;
    else transitDays = 5;
    
    // Add carrier-specific adjustments
    if (shipment.carrier?.toLowerCase().includes('express')) {
      transitDays = Math.max(1, transitDays - 1);
    }
    
    // International adds days
    if (shipment.shipToCountry && shipment.shipToCountry !== 'US' && shipment.shipToCountry !== 'USA') {
      transitDays += 3;
    }
    
    // Calculate the estimated delivery date
    const shipDate = new Date(shipment.promisedShipDate);
    shipDate.setDate(shipDate.getDate() + transitDays);
    
    return `Est. ${shipDate.toLocaleDateString()} (${transitDays} days)`;
  };
  
  // Simple distance calculation - would use real mapping service in production
  const calculateDistance = (shipment: any): number => {
    // Mock calculation based on state or ZIP
    const stateDistances: Record<string, number> = {
      'CA': 2000, 'NY': 1500, 'TX': 1000, 'FL': 1200, 'IL': 800
    };
    
    if (shipment.shipToState && shipment.shipToState in stateDistances) {
      return stateDistances[shipment.shipToState];
    }
    
    // Default distance if state not found
    return 1000;
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode - reset editable shipments
      setEditableShipments([]);
    } else {
      // Entering edit mode - copy current filtered shipments
      setEditableShipments([...filteredShipments]);
    }
    setIsEditMode(!isEditMode);
  };
  
  // Handle editing a field
  const handleEditField = (
    shipmentIndex: number, 
    field: EditableField, 
    value: string | number | undefined
  ) => {
    if (!isEditMode) return;
    
    const shipment = editableShipments[shipmentIndex];
    
    // Check if it's a miscellaneous field path (e.g., 'miscellaneousFields.fieldName')
    if (field.startsWith('miscellaneousFields.')) {
      const fieldName = field.split('.')[1];
      const oldValue = shipment.miscellaneousFields?.[fieldName];
      
      // Only record changes if the value actually changed
      if (oldValue !== value) {
        // Create a copy of the editable shipments
        const updatedShipments = [...editableShipments];
        
        // Ensure miscellaneousFields exists
        if (!updatedShipments[shipmentIndex].miscellaneousFields) {
          updatedShipments[shipmentIndex].miscellaneousFields = {};
        }
        
        // Update the field
        updatedShipments[shipmentIndex] = {
          ...updatedShipments[shipmentIndex],
          miscellaneousFields: {
            ...updatedShipments[shipmentIndex].miscellaneousFields,
            [fieldName]: value as any
          }
        };
        
        // Record the change in history
        const change: ShipmentChange = {
          shipmentId: shipment.loadNumber || shipment.orderNumber || `shipment-${shipmentIndex}`,
          field: field as EditableField,
          oldValue,
          newValue: value,
          timestamp: new Date()
        };
        
        setChangeHistory(prev => [change, ...prev]);
        setEditableShipments(updatedShipments);
        
        // Show toast notification
        toast({
          title: "Field Updated",
          description: `"${fieldName}" changed for shipment ${change.shipmentId}`,
          variant: "default",
          duration: 2000
        });
      }
    } else {
      // Handle regular fields (non-miscellaneous)
      const oldValue = shipment[field as keyof any] as string | number | undefined;
      
      // Only record changes if the value actually changed
      if (oldValue !== value) {
        // Create a copy of the editable shipments
        const updatedShipments = [...editableShipments];
        
        // Update the field
        updatedShipments[shipmentIndex] = {
          ...updatedShipments[shipmentIndex],
          [field]: value
        };
        
        // Record the change in history
        const change: ShipmentChange = {
          shipmentId: shipment.loadNumber || shipment.orderNumber || `shipment-${shipmentIndex}`,
          field,
          oldValue,
          newValue: value,
          timestamp: new Date()
        };
        
        setChangeHistory(prev => [change, ...prev]);
        setEditableShipments(updatedShipments);
        
        // Show toast notification
        toast({
          title: "Field Updated",
          description: `"${field}" changed for shipment ${change.shipmentId}`,
          variant: "default",
          duration: 2000
        });
      }
    }
  };
  
  // Save all changes
  const saveAllChanges = () => {
    // Here we would typically send the changes to an API
    // For now, just show a toast and exit edit mode
    toast({
      title: "Changes Saved",
      description: `${changeHistory.length} changes have been saved.`,
      variant: "success"
    });
    
    // In a real app, we would apply the changes to the original shipments
    // and refresh the data from the server
    
    // Exit edit mode
    setIsEditMode(false);
  };
  
  // Revert all changes
  const revertAllChanges = () => {
    setEditableShipments([...filteredShipments]);
    setChangeHistory([]);
    
    toast({
      title: "Changes Reverted",
      description: "All changes have been discarded.",
      variant: "destructive"
    });
  };
  
  // Format timestamp for change history
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Render change history dialog
  const renderChangeHistory = () => {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="ml-2"
        onClick={() => {
          toast({
            title: "Change History",
            description: `${changeHistory.length} changes have been made.`,
            variant: "default"
          });
        }}
      >
        <History className="h-4 w-4 mr-2" />
        History ({changeHistory.length})
      </Button>
    );
  };
  
  return (
    <Card className="p-6 border-4 border-magenta-500">
      <div className="bg-magenta-200 text-magenta-800 p-2 text-center font-bold">SANITY CHECK - IS ShipmentDataDisplay RENDERING?</div>
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-2">
            {selectedShipments.length > 0 ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportSelected}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected ({selectedShipments.length})
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportAll}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
            
            {/* New Edit Mode Toggle */}
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
              className={isEditMode ? "bg-blue-600" : ""}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>
            
            {/* Edit Mode Controls */}
            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveAllChanges}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={revertAllChanges}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revert All
                </Button>
                
                {changeHistory.length > 0 && renderChangeHistory()}
              </>
            )}
          </div>
        </div>
        
        {/* Summary Statistics */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 px-1">
            <Card className="p-3 border-green-100 bg-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Shipments</h3>
                  <div className="text-2xl font-bold text-green-900">
                    {filteredShipments.length}
                    <span className="text-sm font-normal text-green-700 ml-1">
                      of {shipments.length}
                    </span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-green-500 opacity-80" />
              </div>
              <div className="mt-2 text-xs text-green-700">
                {Object.entries(statistics.sheetDistribution)
                  .map(([sheet, count]) => `${sheet}: ${count}`)
                  .join(' • ')
                }
              </div>
              {statistics.urgentCount > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {statistics.urgentCount} urgent
                  </Badge>
                </div>
              )}
            </Card>
            
            <Card className="p-3 border-blue-100 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Total Weight</h3>
                  <div className="text-2xl font-bold text-blue-900">
                    {statistics.filteredWeight.toFixed(2)}
                    <span className="text-sm font-normal text-blue-700 ml-1">
                      kg
                    </span>
                  </div>
                </div>
                <Scale className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
              <div className="mt-2 text-xs text-blue-700">
                {statistics.filteredItems} items in selected shipments
              </div>
              {statistics.heavyShipmentCount > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Truck className="h-3 w-3 mr-1" />
                    {statistics.heavyShipmentCount} heavy shipments
                  </Badge>
                </div>
              )}
            </Card>
            
            <Card className="p-3 border-purple-100 bg-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-purple-800">Date Range</h3>
                  <div className="text-lg font-bold text-purple-900">
                    {statistics.earliestDate ? (
                      <>
                        {statistics.earliestDate.toLocaleDateString()} 
                        {statistics.latestDate && statistics.earliestDate && 
                         statistics.latestDate.getTime() !== statistics.earliestDate.getTime() && (
                          <> to {statistics.latestDate.toLocaleDateString()}</>
                        )}
                      </>
                    ) : (
                      'No dates available'
                    )}
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
              <div className="mt-2 text-xs text-purple-700">
                {selectedSheetName !== 'all' ? `Filtered to ${selectedSheetName}` : 'All regions included'}
              </div>
              {statistics.internationalCount > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    <MapPin className="h-3 w-3 mr-1" />
                    {statistics.internationalCount} international
                  </Badge>
                </div>
              )}
            </Card>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 items-center justify-between px-3">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center rounded-md border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search shipments..."
                className="border-0 p-2 shadow-none focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {sheetNames.length > 1 && (
              <SheetSelect
                sheets={sheetNames}
                value={selectedSheetName}
                onValueChange={setSelectedSheetName}
              />
            )}
            
            {filteredShipments.length > 0 && (
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={selectedShipments.length === filteredShipments.length && filteredShipments.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-gray-600">
                  {selectedShipments.length === 0 
                    ? 'Select All' 
                    : `Selected ${selectedShipments.length}/${filteredShipments.length}`
                  }
                </label>
              </div>
            )}
          </div>
          
          {/* Quick Filter Badges - Inline with surrounding controls */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant={quickFilter === 'all' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setQuickFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant={quickFilter === 'urgent' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-red-100 text-red-700"
                onClick={() => setQuickFilter('urgent')}
              >
                Urgent
              </Badge>
              <Badge 
                variant={quickFilter === 'delayed' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-amber-100 text-amber-700"
                onClick={() => setQuickFilter('delayed')}
              >
                Delayed
              </Badge>
              <Badge 
                variant={quickFilter === 'international' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-blue-100 text-blue-700"
                onClick={() => setQuickFilter('international')}
              >
                International
              </Badge>
              <Badge 
                variant={quickFilter === 'domestic' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-green-100 text-green-700"
                onClick={() => setQuickFilter('domestic')}
              >
                Domestic
              </Badge>
              <Badge 
                variant={quickFilter === 'heavyWeight' ? "default" : "outline"} 
                className="cursor-pointer hover:bg-orange-100 text-orange-700"
                onClick={() => setQuickFilter('heavyWeight')}
              >
                Heavy (500kg+)
              </Badge>
            </div>
          </div>
          
          <Tabs defaultValue="table" className="w-auto" value={displayMode} onValueChange={setDisplayMode}>
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div>
        {filteredShipments.length > 0 ? (
          <>
            {displayMode === "table" ? (
              <ShipmentTableView 
                shipments={isEditMode ? editableShipments : filteredShipments} 
                onDownloadCSV={handleExportSingle}
                selectedItems={selectedShipments}
                onSelectItem={handleSelectShipment}
                isEditMode={isEditMode}
                onEditField={(index: number, field: string, value: string) => 
                  handleEditField(index, field as EditableField, value)
                }
              />
            ) : (
              <ShipmentCardView 
                shipments={isEditMode ? editableShipments : filteredShipments} 
                className=""
              />
            )}
            
            <div className="mt-4 text-sm text-gray-500 px-3">
              Showing {filteredShipments.length} of {shipments.length} shipments
              {selectedSheetName !== "all" && ` from sheet "${selectedSheetName}"`}
              {searchQuery && ` matching "${searchQuery}"`}
              {isEditMode && ` (Edit Mode)`}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {shipments.length > 0 ? (
              <p>No shipments match your search criteria.</p>
            ) : (
              <p>No shipment data available.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 