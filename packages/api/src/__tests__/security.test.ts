import express from 'express';
import request from 'supertest';
import { configureSecurityMiddleware, validatePassword, sanitizeOutput, securityConstants } from '../config/security';

describe('Security Configuration', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    configureSecurityMiddleware(app);
    
    // Test endpoint
    app.post('/api/test', (req, res) => {
      res.json({ message: 'success' });
    });
  });

  describe('Rate Limiting', () => {
    it('should limit requests after threshold', async () => {
      const requests = Array(101).fill(null);
      
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/api/test')
          .expect(200);
      }

      await request(app)
        .post('/api/test')
        .expect(429);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(404); // Route doesn't exist but headers should be set

      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-xss-protection']).toBe('0');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Weak')).toBe(false);
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('NoSpecialChar123')).toBe(false);
      expect(validatePassword('nouppercasechar123!')).toBe(false);
    });

    it('should enforce minimum length', () => {
      expect(validatePassword('Short1!')).toBe(false);
      expect(validatePassword('LongEnoughPass123!')).toBe(true);
    });
  });

  describe('Data Sanitization', () => {
    it('should remove sensitive fields', () => {
      const data = {
        id: 1,
        username: 'test',
        password: 'secret',
        refreshToken: 'token',
        resetToken: 'reset',
        email: 'test@example.com'
      };

      const sanitized = sanitizeOutput(data);

      expect(sanitized).toHaveProperty('id');
      expect(sanitized).toHaveProperty('username');
      expect(sanitized).toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).not.toHaveProperty('refreshToken');
      expect(sanitized).not.toHaveProperty('resetToken');
    });
  });

  describe('Security Constants', () => {
    it('should have proper security constants defined', () => {
      expect(securityConstants.PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(12);
      expect(securityConstants.MAX_LOGIN_ATTEMPTS).toBeGreaterThan(0);
      expect(securityConstants.LOGIN_LOCKOUT_TIME).toBeGreaterThan(0);
      expect(securityConstants.JWT_EXPIRY).toBeDefined();
      expect(securityConstants.REFRESH_TOKEN_EXPIRY).toBeDefined();
    });
  });
}); 