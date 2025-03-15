import { cn } from './utils';

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('base-class', 'additional-class')).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    expect(cn('base', { 'is-active': isActive })).toBe('base is-active');
  });

  it('should handle falsy conditions', () => {
    const isDisabled = false;
    expect(cn('base', { 'is-disabled': isDisabled })).toBe('base');
  });
}); 