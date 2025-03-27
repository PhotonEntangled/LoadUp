"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal } from "lucide-react";

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
  group?: string;
}

interface ColumnVisibilityToggleProps {
  columns: ColumnDefinition[];
  visibleColumns: string[];
  onChange: (columns: string[]) => void;
  className?: string;
}

export const ColumnVisibilityToggle = ({
  columns,
  visibleColumns,
  onChange,
  className = ""
}: ColumnVisibilityToggleProps) => {
  const [open, setOpen] = useState(false);
  
  // Group columns by their group property
  const getColumnGroups = () => {
    const groups: Record<string, ColumnDefinition[]> = {
      "General": []
    };
    
    columns.forEach(column => {
      const group = column.group || "General";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(column);
    });
    
    return groups;
  };
  
  const columnGroups = getColumnGroups();
  
  const handleToggleColumn = (columnKey: string) => {
    let newVisibleColumns: string[];
    
    if (visibleColumns.includes(columnKey)) {
      newVisibleColumns = visibleColumns.filter(key => key !== columnKey);
    } else {
      newVisibleColumns = [...visibleColumns, columnKey];
    }
    
    onChange(newVisibleColumns);
  };
  
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onChange(columns.map(col => col.key));
    } else {
      // Keep at least essential columns visible
      onChange(columns.filter(col => col.defaultVisible).map(col => col.key));
    }
  };
  
  const handleResetToDefault = () => {
    onChange(columns.filter(col => col.defaultVisible).map(col => col.key));
  };
  
  const allSelected = visibleColumns.length === columns.length;
  
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Columns</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Visible Columns</h4>
              <div className="flex gap-2">
                <Checkbox 
                  id="selectAll" 
                  checked={allSelected} 
                  onCheckedChange={handleToggleAll}
                />
                <label 
                  htmlFor="selectAll" 
                  className="text-sm cursor-pointer"
                >
                  Select All
                </label>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
              {Object.entries(columnGroups).map(([groupName, groupColumns]) => (
                <div key={groupName} className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-500">{groupName}</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {groupColumns.map(column => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`col-${column.key}`} 
                          checked={visibleColumns.includes(column.key)}
                          onCheckedChange={() => handleToggleColumn(column.key)}
                        />
                        <label 
                          htmlFor={`col-${column.key}`}
                          className="text-sm cursor-pointer"
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetToDefault}
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 