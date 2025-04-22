"use client";

import { useToast } from './use-toast';
import { Toast } from './toast';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export function Toasts() {
  const { toasts, dismiss } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    // Safely access document only on the client side
    if (typeof document !== 'undefined') {
      setPortalContainer(document.body);
    }
    return () => setIsMounted(false);
  }, []);
  
  // Don't render anything on the server or if not mounted
  if (!isMounted || !portalContainer) return null;
  
  // Create a portal to render toasts at the top level of the DOM
  return createPortal(
    <div className="fixed top-0 right-0 p-4 w-full md:max-w-sm z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        // Map the incoming variant to the variants supported by the Toast component
        const targetVariant = toast.variant === 'destructive' ? 'destructive' : 'default';
        
        return (
          <Toast 
            key={toast.id} 
            {...toast}
            variant={targetVariant}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toast.id);
              }
            }}
          />
        );
      })}
    </div>,
    portalContainer
  );
} 