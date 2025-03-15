import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  getUserMetadata,
  updateUserRole
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => {
  const mockSupabase = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      admin: {
        updateUserById: jest.fn(),
      },
    },
  };
  
  return {
    supabase: mockSupabase,
    signUpUser: jest.requireActual('@/lib/supabase').signUpUser,
    signInUser: jest.requireActual('@/lib/supabase').signInUser,
    signOutUser: jest.requireActual('@/lib/supabase').signOutUser,
    getCurrentUser: jest.requireActual('@/lib/supabase').getCurrentUser,
    getUserMetadata: jest.requireActual('@/lib/supabase').getUserMetadata,
    updateUserRole: jest.requireActual('@/lib/supabase').updateUserRole,
  };
});

describe('Supabase Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpUser', () => {
    it('should call supabase.auth.signUp with correct parameters', async () => {
      const mockResponse = { data: { user: { id: '123' } }, error: null };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        companyId: 'COMP123',
        role: 'driver' as const,
      };

      const result = await signUpUser(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            company_id: 'COMP123',
            role: 'driver',
          },
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should use default role if not provided', async () => {
      const mockResponse = { data: { user: { id: '123' } }, error: null };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await signUpUser(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            company_id: undefined,
            role: 'customer',
          },
        },
      });
    });
  });

  describe('signInUser', () => {
    it('should call supabase.auth.signInWithPassword with correct parameters', async () => {
      const mockResponse = { data: { user: { id: '123' } }, error: null };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await signInUser(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signOutUser', () => {
    it('should call supabase.auth.signOut', async () => {
      const mockResponse = { error: null };
      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockResponse);

      const result = await signOutUser();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({ error: null });
    });
  });

  describe('getCurrentUser', () => {
    it('should call supabase.auth.getUser and return the user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const result = await getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserMetadata', () => {
    it('should call supabase.auth.getUser and return user metadata', async () => {
      const mockMetadata = { full_name: 'Test User', role: 'admin' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { user_metadata: mockMetadata } },
      });

      const result = await getUserMetadata();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockMetadata);
    });

    it('should return undefined if user is null', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await getUserMetadata();

      expect(result).toBeUndefined();
    });
  });

  describe('updateUserRole', () => {
    it('should call supabase.auth.admin.updateUserById with correct parameters', async () => {
      const mockResponse = { data: { user: { id: '123' } }, error: null };
      (supabase.auth.admin.updateUserById as jest.Mock).mockResolvedValue(mockResponse);

      const userId = '123';
      const role = 'admin' as const;

      const result = await updateUserRole(userId, role);

      expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith(
        userId,
        { user_metadata: { role } }
      );
      expect(result).toEqual(mockResponse);
    });
  });
}); 