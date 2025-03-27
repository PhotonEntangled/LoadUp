"use client";

// Adapted from shadcn/ui toast component
import { useState, useEffect, useContext, createContext, createElement, ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Only render the provider when mounted (client-side)
  if (!isMounted) {
    return createElement(
      ToastContext.Provider,
      { value: { toasts: [], addToast: () => {}, removeToast: () => {} } },
      children
    );
  }

  return createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const toast = (props: Omit<Toast, 'id'>) => {
    context.addToast(props);
  };

  return {
    toast,
    toasts: context.toasts,
    dismiss: context.removeToast,
  };
} 