import { useState } from 'react';
// Mock auth hook until the shared package is properly set up
// import { useAuth } from '@loadup/shared/src/hooks/useAuth';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';
  location?: string;
}

// Mock data for development
const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    status: 'AVAILABLE',
    location: 'Chicago, IL'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-987-6543',
    status: 'ON_DELIVERY',
    location: 'New York, NY'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '555-456-7890',
    status: 'OFFLINE'
  }
];

// Mock auth hook
const useAuth = () => {
  return {
    user: { id: '1', name: 'Admin User', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {}
  };
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Management</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Add New Driver
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search drivers..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Location</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{driver.name}</td>
                <td className="py-2 px-4 border-b">{driver.email}</td>
                <td className="py-2 px-4 border-b">{driver.phone}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${
                    driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    driver.status === 'ON_DELIVERY' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{driver.location || 'Unknown'}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 