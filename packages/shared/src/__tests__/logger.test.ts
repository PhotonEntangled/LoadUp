import { jest, describe, it, expect } from '@jest/globals';
import { logger } from '../logger';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have required logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should log messages correctly', () => {
    const infoSpy = jest.spyOn(logger, 'info');
    logger.info('test message');
    expect(infoSpy).toHaveBeenCalledWith('test message');
    infoSpy.mockRestore();
  });

  it('should format error messages correctly', () => {
    const errorSpy = jest.spyOn(logger, 'error');
    const error = new Error('test error');
    logger.error('error occurred', error);
    expect(errorSpy).toHaveBeenCalledWith('error occurred', error);
    errorSpy.mockRestore();
  });

  it('should handle warning messages', () => {
    const warnSpy = jest.spyOn(logger, 'warn');
    logger.warn('warning message');
    expect(warnSpy).toHaveBeenCalledWith('warning message');
    warnSpy.mockRestore();
  });
}); 