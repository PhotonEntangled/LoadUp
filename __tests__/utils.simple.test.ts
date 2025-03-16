import { describe, it, expect } from '@jest/globals';

// Simple utility functions for testing
const utils = {
  sum: (a: number, b: number): number => a + b,
  multiply: (a: number, b: number): number => a * b,
  capitalize: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
  isValidEmail: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
};

describe('Utility Functions', () => {
  describe('sum', () => {
    it('adds two numbers correctly', () => {
      expect(utils.sum(1, 2)).toBe(3);
      expect(utils.sum(-1, 1)).toBe(0);
      expect(utils.sum(0, 0)).toBe(0);
    });
  });
  
  describe('multiply', () => {
    it('multiplies two numbers correctly', () => {
      expect(utils.multiply(2, 3)).toBe(6);
      expect(utils.multiply(-2, 3)).toBe(-6);
      expect(utils.multiply(0, 5)).toBe(0);
    });
  });
  
  describe('capitalize', () => {
    it('capitalizes a string correctly', () => {
      expect(utils.capitalize('hello')).toBe('Hello');
      expect(utils.capitalize('WORLD')).toBe('World');
      expect(utils.capitalize('javaScript')).toBe('Javascript');
    });
    
    it('handles empty strings', () => {
      expect(utils.capitalize('')).toBe('');
    });
  });
  
  describe('isValidEmail', () => {
    it('validates email addresses correctly', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
      expect(utils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(utils.isValidEmail('invalid-email')).toBe(false);
      expect(utils.isValidEmail('missing@domain')).toBe(false);
    });
  });
}); 