"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth";

// Navigation items
export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Vehicle Tracking", href: "/tracking-stabilized", icon: "🗺️" },
  { name: "Shipments", href: "/dashboard/shipments", icon: "📦" },
  {
    name: "DEV Simulation",
    href: "/simulation",
    icon: "🧪",
    disabled: true
  },
  { name: "Documents", href: "/documents", icon: "📄" },
  { name: "Customers", href: "/dashboard/customers", icon: "👥" },
  { name: "Drivers", href: "/dashboard/drivers", icon: "🚚" },
  { name: "Reports", href: "/dashboard/reports", icon: "📈" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div
      className={`flex h-full flex-col bg-gray-800 text-white transition-all ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        <div className="flex items-center">
          <span className="text-xl font-bold">
            {isCollapsed ? "LU" : "LoadUp"}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <span className="mr-3 text-lg">🚪</span>
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
} 