import { useState, useEffect, ReactNode } from 'react';
// Mock auth hook until the shared package is properly set up
// import { useAuth } from '@loadup/shared/hooks/useAuth';
// import { User, Role } from '@loadup/shared/types';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';

// Mock Dialog components since they're not available
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  return <div className="relative">{children}</div>;
};

const DialogTrigger = ({ asChild, children }: { asChild?: boolean; children: ReactNode }) => {
  return <>{children}</>;
};

const DialogContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children }: { children: ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

const DialogTitle = ({ children }: { children: ReactNode }) => {
  return <h2 className="text-xl font-semibold">{children}</h2>;
};

// Mock Label component
const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => {
  return <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">{children}</label>;
};

// Define local types
type Role = 'admin' | 'manager' | 'user';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Mock auth hook
const useAuth = () => {
  return {
    user: { id: '1', name: 'Admin User', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    isAdmin: () => true
  };
};

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2023-01-15T00:00:00Z',
    lastLogin: '2023-06-01T10:30:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah@example.com',
    role: 'manager',
    createdAt: '2023-02-20T00:00:00Z',
    lastLogin: '2023-05-28T14:45:00Z',
    isActive: true
  },
  {
    id: '3',
    name: 'Mike User',
    email: 'mike@example.com',
    role: 'user',
    createdAt: '2023-03-10T00:00:00Z',
    lastLogin: '2023-05-30T09:15:00Z',
    isActive: true
  },
  {
    id: '4',
    name: 'Lisa Inactive',
    email: 'lisa@example.com',
    role: 'user',
    createdAt: '2023-01-05T00:00:00Z',
    lastLogin: '2023-04-15T11:20:00Z',
    isActive: false
  }
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as Role,
    password: '',
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddUser = () => {
    // Simulate adding a user
    const user: User = {
      id: `${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    setUsers([...users, user]);
    setShowAddUserDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
    });
  };

  // Define columns with proper typing for DataTable
  const columns = [
    {
      accessorKey: 'name' as keyof User,
      header: 'Name',
    },
    {
      accessorKey: 'email' as keyof User,
      header: 'Email',
    },
    {
      accessorKey: 'role' as keyof User,
      header: 'Role',
      cell: ({ row }: { row: { original: User } }) => (
        <span className="capitalize">{row.original.role}</span>
      ),
    },
    {
      accessorKey: 'lastLogin' as keyof User,
      header: 'Last Login',
      cell: ({ row }: { row: { original: User } }) => (
        row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleDateString() : 'Never'
      ),
    },
    {
      accessorKey: 'isActive' as keyof User,
      header: 'Status',
      cell: ({ row }: { row: { original: User } }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          {isAdmin() && (
            <Button variant="outline" size="sm" className="text-red-500">
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Management</CardTitle>
          {isAdmin() && (
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
              <DialogTrigger asChild>
                <Button>Add User</Button>
              </DialogTrigger>
              {showAddUserDialog && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        className="p-2 border rounded"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        {isAdmin() && <option value="admin">Admin</option>}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddUser}>Add User</Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </CardContent>
    </Card>
  );
} 