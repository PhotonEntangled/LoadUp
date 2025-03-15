'use client';

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  // Add debug logging
  console.log("NextAuth Providers component rendering", { hasSession: !!session });
  
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
} 