"use client";

import * as React from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "./select";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  label,
  icon = null,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
}: CustomSelectProps) {
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
        </label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "w-full border-gray-300 bg-white shadow-sm text-gray-900",
            "focus:ring-2 focus:ring-primary focus:border-primary",
            "rounded-md px-3 py-2 text-sm font-medium",
            "flex items-center justify-between",
            "opacity-100",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
        >
          <div className="flex-1 truncate">
            <SelectValue placeholder={placeholder} />
          </div>
          {icon !== null && (
            <div className="ml-2 flex-shrink-0">
              {icon}
            </div>
          )}
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-white border border-gray-200 shadow-md rounded-md overflow-hidden",
            "text-gray-900 z-50",
            "opacity-100",
            contentClassName
          )}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                "py-2 px-3 text-sm cursor-pointer hover:bg-gray-100",
                "focus:bg-gray-100 focus:text-gray-900",
                "flex items-center justify-between",
                "opacity-100",
                value === option.value && "bg-primary/10 font-medium"
              )}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SheetSelect({
  sheets,
  value,
  onValueChange,
  className,
}: {
  sheets: string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const options = [
    { value: "all", label: "All Sheets" },
    ...sheets.map((sheet) => ({ value: sheet, label: sheet })),
  ];

  return (
    <div className="flex items-center gap-2">
      <Layers className="h-4 w-4 shrink-0 text-gray-500" />
      <CustomSelect
        options={options}
        value={value}
        onValueChange={onValueChange}
        placeholder="Select Sheet"
        className={className}
        triggerClassName="min-w-[180px] bg-white opacity-100"
        contentClassName="bg-white opacity-100"
      />
    </div>
  );
} 