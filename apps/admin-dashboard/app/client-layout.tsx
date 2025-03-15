'use client';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { AdminLayout } from "../components/layout/AdminLayout";
import { Providers } from './providers';
import { Session } from 'next-auth';

// This is a client component that includes all the client-side components
export function ClientLayout({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  console.log("ClientLayout rendering", { hasSession: !!session });
  
  return (
    <Providers session={session}>
      <ErrorBoundary>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ErrorBoundary>
    </Providers>
  );
} 