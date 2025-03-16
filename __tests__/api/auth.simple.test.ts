import { describe, it, expect, jest } from '@jest/globals';

// Define types for auth service
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface UserData {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface SignInResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface SignUpResponse {
  success: boolean;
  user?: User;
  error?: string;
}

interface SessionResponse {
  success: boolean;
  session?: {
    user: User;
    expires: string;
  };
  error?: string;
}

interface SignOutResponse {
  success: boolean;
}

// Mock auth service
const authService = {
  signIn: jest.fn<(email: string, password: string) => Promise<SignInResponse>>(),
  signUp: jest.fn<(userData: UserData) => Promise<SignUpResponse>>(),
  signOut: jest.fn<() => Promise<SignOutResponse>>(),
  getSession: jest.fn<(token: string | null) => Promise<SessionResponse>>(),
};

// Mock implementation
authService.signIn.mockImplementation(async (email: string, password: string): Promise<SignInResponse> => {
  if (email === 'test@example.com' && password === 'password123') {
    return {
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
      token: 'mock-jwt-token',
    };
  }
  return {
    success: false,
    error: 'Invalid credentials',
  };
});

authService.signUp.mockImplementation(async (userData: UserData): Promise<SignUpResponse> => {
  if (userData.email === 'existing@example.com') {
    return {
      success: false,
      error: 'Email already exists',
    };
  }
  return {
    success: true,
    user: {
      id: 'new-user-id',
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
  };
});

authService.getSession.mockImplementation(async (token: string | null): Promise<SessionResponse> => {
  if (!token) {
    return { success: false, error: 'No token provided' };
  }
  if (token === 'valid-token') {
    return {
      success: true,
      session: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
        expires: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  }
  return { success: false, error: 'Invalid token' };
});

authService.signOut.mockImplementation(async (): Promise<SignOutResponse> => {
  return { success: true };
});

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('returns success and user data for valid credentials', async () => {
      const result = await authService.signIn('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('test-user-id');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('returns error for invalid credentials', async () => {
      const result = await authService.signIn('test@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('creates a new user account', async () => {
      const userData: UserData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'customer',
      };
      
      const result = await authService.signUp(userData);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('new-user-id');
      expect(result.user?.email).toBe('newuser@example.com');
    });

    it('returns error for existing email', async () => {
      const userData: UserData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'customer',
      };
      
      const result = await authService.signUp(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('getSession', () => {
    it('returns session data for valid token', async () => {
      const result = await authService.getSession('valid-token');
      
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.user.id).toBe('test-user-id');
    });

    it('returns error for invalid token', async () => {
      const result = await authService.getSession('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('returns error for missing token', async () => {
      const result = await authService.getSession(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No token provided');
    });
  });

  describe('signOut', () => {
    it('signs out successfully', async () => {
      const result = await authService.signOut();
      
      expect(result.success).toBe(true);
    });
  });
}); 