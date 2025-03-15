import { useState, useEffect } from 'react';
import { useAuth } from '@loadup/shared/hooks/useAuth';
import { User, Role } from '@loadup/shared/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface UserManagementProps {}

const ROLES: Role[] = ['ADMIN', 'DRIVER', 'READ_ONLY'];

export const UserManagement: React.FC<UserManagementProps> = () => {
  const { isAdmin } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedUser(user)}
                  disabled={!isAdmin()}
                >
                  Edit Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update User Role</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select
                    onValueChange={async (role) => {
                      try {
                        setLoading(true);
                        await updateUserRole(user.id, role as Role);
                        toast.success('User role updated successfully');
                        await fetchUsers();
                      } catch (error) {
                        toast.error('Failed to update user role');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    defaultValue={user.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              onClick={() => handleToggleUserStatus(user)}
              disabled={!isAdmin()}
            >
              {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        );
      },
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: Role) => {
    const response = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setLoading(true);
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`User ${newStatus.toLowerCase()} successfully`);
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
      />
    </div>
  );
}; 