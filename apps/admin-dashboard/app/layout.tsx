import { useAuth } from '@loadup/shared/src/hooks/useAuth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const Sidebar = dynamic(() => import('../components/Sidebar'), { ssr: false });

const publicPaths = ['/sign-in', '/sign-up'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const pathname = window.location.pathname;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return children;
  }

  // Redirect unauthenticated users to sign in
  if (!isAuthenticated) {
    redirect('/sign-in');
    return null;
  }

  // Redirect non-admin users
  if (!isAdmin()) {
    redirect('/unauthorized');
    return null;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 