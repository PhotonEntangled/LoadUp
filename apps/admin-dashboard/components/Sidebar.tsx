import Link from 'next/link';
import { useAuth } from '@loadup/shared/src/hooks/useAuth';

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
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Profile Section */}
        <div className="p-4 border-b">
          <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 