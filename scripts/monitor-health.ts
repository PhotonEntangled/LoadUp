import axios from 'axios';
import { sql } from 'drizzle-orm';
import { db } from '@loadup/database/drizzle';
import { logger } from '@loadup/shared/logger';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const API_URL = process.env.API_URL || 'https://api.loadup.app';
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 10;

// Health check response schema
const HealthCheckSchema = z.object({
  timestamp: z.string(),
  api: z.boolean(),
  database: z.boolean(),
  responseTime: z.number(),
  errors: z.array(z.string())
});

type HealthCheck = z.infer<typeof HealthCheckSchema>;

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    logger.error('Database health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

async function checkAPI(): Promise<{ success: boolean; responseTime: number; errors: string[] }> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status === 200
    });
    
    const responseTime = Date.now() - startTime;
    return {
      success: true,
      responseTime,
      errors
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
    errors.push(errorMessage);
    
    logger.error('API health check failed:', {
      error: errorMessage,
      responseTime,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      responseTime,
      errors
    };
  }
}

async function monitorHealth() {
  let retryCount = 0;
  const healthChecks: HealthCheck[] = [];

  logger.info('Starting health monitoring...', {
    timestamp: new Date().toISOString(),
    maxRetries: MAX_RETRIES,
    checkInterval: CHECK_INTERVAL
  });

  while (retryCount < MAX_RETRIES) {
    const timestamp = new Date().toISOString();
    
    try {
      const [apiCheck, databaseCheck] = await Promise.all([
        checkAPI(),
        checkDatabase()
      ]);

      const healthCheck: HealthCheck = {
        timestamp,
        api: apiCheck.success,
        database: databaseCheck,
        responseTime: apiCheck.responseTime,
        errors: apiCheck.errors
      };

      // Validate health check data
      const validatedCheck = HealthCheckSchema.parse(healthCheck);
      healthChecks.push(validatedCheck);

      // Log current status
      logger.info('Health Check Status:', {
        timestamp,
        api: validatedCheck.api ? '✅' : '❌',
        database: validatedCheck.database ? '✅' : '❌',
        responseTime: `${validatedCheck.responseTime}ms`,
        errors: validatedCheck.errors.length ? validatedCheck.errors : 'None'
      });

      // If both checks pass, we can exit
      if (validatedCheck.api && validatedCheck.database) {
        logger.info('✅ All health checks passed successfully!', {
          timestamp,
          totalChecks: healthChecks.length
        });
        process.exit(0);
      }
    } catch (error) {
      logger.error('Error during health check:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        retryCount
      });
    }

    retryCount++;
    if (retryCount < MAX_RETRIES) {
      logger.info(`Waiting ${CHECK_INTERVAL/1000} seconds before next check...`, {
        timestamp,
        nextRetry: retryCount + 1
      });
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  // If we get here, we've exceeded max retries
  logger.error('❌ Health monitoring failed after maximum retries', {
    timestamp: new Date().toISOString(),
    totalChecks: healthChecks.length,
    lastCheck: healthChecks[healthChecks.length - 1]
  });
  process.exit(1);
}

// Run monitoring if called directly
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

if (process.argv[1] === currentFilePath) {
  monitorHealth();
} 