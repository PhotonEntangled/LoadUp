import { Metadata } from 'next';
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: 'Dashboard - LoadUp Admin',
  description: 'LoadUp Admin Dashboard',
};

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/sign-in');
  }
  
  const userRole = session.user.role || 'customer';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {session.user.name || session.user.email}</h2>
        <p className="text-gray-600 mb-2">
          You are logged in as: <span className="font-medium capitalize">{userRole}</span>
        </p>
        <p className="text-gray-600">
          Email: {session.user.email}
        </p>
      </div>
      
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="User Management" 
            description="Manage users, roles, and permissions"
            link="/dashboard/admin/users"
            icon="👥"
          />
          <DashboardCard 
            title="System Settings" 
            description="Configure system settings and preferences"
            link="/dashboard/admin/settings"
            icon="⚙️"
          />
          <DashboardCard 
            title="Analytics" 
            description="View system analytics and reports"
            link="/dashboard/admin/analytics"
            icon="📊"
          />
        </div>
      )}
      
      {userRole === 'driver' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="My Deliveries" 
            description="View and manage your assigned deliveries"
            link="/dashboard/driver/deliveries"
            icon="🚚"
          />
          <DashboardCard 
            title="Route Planning" 
            description="Plan and optimize your delivery routes"
            link="/dashboard/driver/routes"
            icon="🗺️"
          />
          <DashboardCard 
            title="Earnings" 
            description="Track your earnings and payment history"
            link="/dashboard/driver/earnings"
            icon="💰"
          />
        </div>
      )}
      
      {userRole === 'customer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="My Shipments" 
            description="View and track your shipments"
            link="/dashboard/shipments"
            icon="📦"
          />
          <DashboardCard 
            title="Create Shipment" 
            description="Create a new shipment request"
            link="/dashboard/shipments/new"
            icon="➕"
          />
          <DashboardCard 
            title="Billing" 
            description="View your billing history and invoices"
            link="/dashboard/billing"
            icon="💳"
          />
        </div>
      )}
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
}

function DashboardCard({ title, description, link, icon }: DashboardCardProps) {
  return (
    <a 
      href={link}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  );
} 