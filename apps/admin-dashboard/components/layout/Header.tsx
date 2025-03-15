"use client";

import { useAuth } from "@/lib/hooks/useAuth";

const Header = ({ title = "Dashboard", description = "Monitor all of your shipments and drivers here" }) => {
  const { user } = useAuth();
  
  return (
    <header className="admin-header p-6 bg-white shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {title}
        </h2>
        <p className="text-base text-slate-500">
          {description}
        </p>
      </div>

      {/* Search component can be added here */}
    </header>
  );
};

export default Header; 