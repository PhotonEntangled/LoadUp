"use client";

import { Toast as ToastType } from './use-toast';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simple utility function to conditionally join class names
const cn = (...classes: (string | boolean | undefined | null | {[key: string]: boolean})[]) => {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return cls;
    })
    .flat()
    .join(' ');
};

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all transform",
        "border border-gray-200",
        {
          "translate-y-0 opacity-100": isVisible,
          "translate-y-2 opacity-0": !isVisible,
          "bg-red-50 border-red-200": toast.variant === "destructive",
          "bg-green-50 border-green-200": toast.variant === "success",
          "bg-yellow-50 border-yellow-200": toast.variant === "warning",
        }
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="mt-1 text-sm text-gray-500">{toast.description}</div>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-4 flex-shrink-0 rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 