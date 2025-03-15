import { useAuthStore } from '../store/authStore';
import type { UserRole, User } from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading,
    setUser,
    setToken,
    logout 
  } = useAuthStore();

  const hasRole = (requiredRole: UserRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const isAdmin = () => hasRole('admin');
  const isDriver = () => hasRole('driver');

  const checkAccess = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    logout,
    hasRole,
    isAdmin,
    isDriver,
    checkAccess,
  };
};

export default useAuth; 