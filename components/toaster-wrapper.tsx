'use client';

import { Toaster } from "@/components/ui/toaster";

/**
 * A simple client component wrapper around the Shadcn UI Toaster.
 * This ensures the Toaster and its internal useToast hook are definitively
 * managed within the client boundary when used in server components like layouts.
 */
export function ToasterWrapper() {
  return <Toaster />;
} 