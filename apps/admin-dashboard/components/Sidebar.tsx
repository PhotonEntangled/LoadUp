"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Shipments',
    href: '/shipments',
    icon: '📦',
  },
  {
    name: 'Drivers',
    href: '/drivers',
    icon: '🚚',
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: '📄',
  },
  {
    name: 'Tracking',
    href: '/tracking',
    icon: '📍',
  },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Function to get initials from name
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="admin-sidebar w-64 bg-white shadow-lg flex flex-col h-full justify-between">
      <div>
        <div className="logo p-4 border-b flex items-center">
          <div className="mr-2 font-bold text-blue-600 text-2xl">📦</div>
          <h1 className="font-bold text-xl">LoadUp</h1>
        </div>

        <div className="mt-6 flex flex-col gap-2 px-4">
          {navigationItems.map((item) => {
            const isSelected = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link href={item.href} key={item.href}>
                <div
                  className={cn(
                    "flex items-center p-2 rounded-lg transition-colors",
                    isSelected 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="mr-3 text-lg">
                    {item.icon}
                  </div>
                  <p>{item.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="user p-4 border-t flex items-center">
        <Avatar className="mr-3">
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {getInitials(user?.fullName || user?.email || 'LU')}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">{user?.fullName || 'Admin User'}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
} 