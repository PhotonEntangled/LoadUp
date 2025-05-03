'use client';

import React from 'react';
// import { SessionProvider } from 'next-auth/react'; // Commented out
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
  // session?: any; // Removed session prop as SessionProvider is commented out
}

export function Providers({ children }: ProvidersProps) {
  return (
    // <SessionProvider session={session}> // Commented out SessionProvider wrapper
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    // </SessionProvider> // Commented out SessionProvider wrapper
  );
} 