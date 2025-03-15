import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Sidebar = dynamic(() => import('../Sidebar'), { ssr: false });

interface AdminLayoutProps {
  children: React.ReactNode;
}

const publicPaths = ['/sign-in', '/sign-up', '/verify-email', '/reset-password', '/error', '/unauthorized'];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname?.startsWith(`${path}/`) ||
    pathname?.includes('[[...') // Handle catch-all routes
  );

  // For public paths, just render the children without the sidebar
  if (isPublicPath) {
    return <>{children}</>;
  }

  // For authenticated paths, render with sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}; 