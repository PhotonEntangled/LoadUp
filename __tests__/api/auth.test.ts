import { NextRequest } from 'next/server';
import { POST as signIn } from '../../apps/admin-dashboard/app/api/auth/signin/route';
import { POST as signUp } from '../../apps/admin-dashboard/app/api/auth/signup/route';
import { GET as getSession } from '../../apps/admin-dashboard/app/api/auth/session/route';
import { POST as signOut } from '../../apps/admin-dashboard/app/api/auth/signout/route';
import { hash } from 'bcrypt';

// Mock the database
jest.mock('../../packages/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  users: {
    id: 'id',
    email: 'email',
    name: 'name',
    passwordHash: 'password_hash',
    role: 'role',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  sessions: {
    id: 'id',
    userId: 'user_id',
    expiresAt: 'expires_at',
    createdAt: 'created_at',
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password, saltRounds) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(password === hash.replace('hashed_', ''))),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid-token') {
      return { userId: 'test-user-id', exp: Math.floor(Date.now() / 1000) + 3600 };
    }
    if (token === 'expired-token') {
      return { userId: 'test-user-id', exp: Math.floor(Date.now() / 1000) - 3600 };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock the cookies
const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: () => mockCookies,
}));

describe('Authentication API', () => {
  const db = require('../../packages/db').db;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signin', () => {
    it('signs in a user with valid credentials', async () => {
      // Mock the database to return a user
      db.select.mockResolvedValueOnce([
        {
          id: 'test-user-id',
          email: 'test@example.com',
          password_hash: 'hashed_password123',
          name: 'Test User',
          role: 'admin',
        },
      ]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      // Call the API endpoint
      const response = await signIn(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.user.id).toBe('test-user-id');
      expect(responseData.user.email).toBe('test@example.com');
      expect(responseData.user.name).toBe('Test User');
      expect(responseData.user.role).toBe('admin');
      expect(responseData.user.passwordHash).toBeUndefined();

      // Check that the session was created
      expect(db.insert).toHaveBeenCalledWith(expect.any(Object), expect.any(Array));
      
      // Check that the cookie was set
      expect(mockCookies.set).toHaveBeenCalledWith(
        'auth-token',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'strict',
          maxAge: expect.any(Number),
          path: '/',
        })
      );
    });

    it('returns an error for invalid credentials', async () => {
      // Mock the database to return a user
      db.select.mockResolvedValueOnce([
        {
          id: 'test-user-id',
          email: 'test@example.com',
          password_hash: 'hashed_wrongpassword',
          name: 'Test User',
          role: 'admin',
        },
      ]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      // Call the API endpoint
      const response = await signIn(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });

    it('returns an error for non-existent user', async () => {
      // Mock the database to return no user
      db.select.mockResolvedValueOnce([]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      // Call the API endpoint
      const response = await signIn(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/signup', () => {
    it('creates a new user account', async () => {
      // Mock the database to return no existing user
      db.select.mockResolvedValueOnce([]);
      
      // Mock the insert to return the new user ID
      db.insert.mockResolvedValueOnce([{ id: 'new-user-id' }]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: 'customer',
        }),
      });

      // Call the API endpoint
      const response = await signUp(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.user.id).toBe('new-user-id');
      expect(responseData.user.email).toBe('newuser@example.com');
      expect(responseData.user.name).toBe('New User');
      expect(responseData.user.role).toBe('customer');

      // Check that the password was hashed
      expect(hash).toHaveBeenCalledWith('password123', expect.any(Number));
      
      // Check that the user was inserted into the database
      expect(db.insert).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining([
          expect.objectContaining({
            email: 'newuser@example.com',
            name: 'New User',
            role: 'customer',
          }),
        ])
      );
    });

    it('returns an error for existing email', async () => {
      // Mock the database to return an existing user
      db.select.mockResolvedValueOnce([
        {
          id: 'existing-user-id',
          email: 'existing@example.com',
          name: 'Existing User',
          role: 'customer',
        },
      ]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
          role: 'customer',
        }),
      });

      // Call the API endpoint
      const response = await signUp(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Email already in use');
    });

    it('validates required fields', async () => {
      // Create a mock request with missing fields
      const request = new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          // Missing password
          name: 'New User',
          // Missing role
        }),
      });

      // Call the API endpoint
      const response = await signUp(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Missing required fields');
    });
  });

  describe('GET /api/auth/session', () => {
    it('returns the current user session', async () => {
      // Mock the cookies to return a valid token
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' });
      
      // Mock the database to return a user
      db.select.mockResolvedValueOnce([
        {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
      ]);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/session');

      // Call the API endpoint
      const response = await getSession(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.user.id).toBe('test-user-id');
      expect(responseData.user.email).toBe('test@example.com');
      expect(responseData.user.name).toBe('Test User');
      expect(responseData.user.role).toBe('admin');
    });

    it('returns null for no session', async () => {
      // Mock the cookies to return no token
      mockCookies.get.mockReturnValueOnce(null);

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/session');

      // Call the API endpoint
      const response = await getSession(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeNull();
    });

    it('returns null for expired token', async () => {
      // Mock the cookies to return an expired token
      mockCookies.get.mockReturnValueOnce({ value: 'expired-token' });

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/session');

      // Call the API endpoint
      const response = await getSession(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeNull();
    });

    it('returns null for invalid token', async () => {
      // Mock the cookies to return an invalid token
      mockCookies.get.mockReturnValueOnce({ value: 'invalid-token' });

      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/session');

      // Call the API endpoint
      const response = await getSession(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeNull();
    });
  });

  describe('POST /api/auth/signout', () => {
    it('signs out the current user', async () => {
      // Create a mock request
      const request = new NextRequest('http://localhost/api/auth/signout', {
        method: 'POST',
      });

      // Call the API endpoint
      const response = await signOut(request);
      const responseData = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Check that the cookie was deleted
      expect(mockCookies.delete).toHaveBeenCalledWith('auth-token');
    });
  });
}); 