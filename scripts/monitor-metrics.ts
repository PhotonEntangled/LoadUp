import axios from 'axios';
import { sql } from 'drizzle-orm';
import { db } from '@loadup/database/drizzle';
import { logger } from '@loadup/shared/logger';
import { z } from 'zod';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

const API_URL = process.env.API_URL || 'https://api.loadup.app';
const CHECK_INTERVAL = 60000; // 1 minute
const MAX_RETRIES = 5;

// Metric schemas
const SystemMetricsSchema = z.object({
  timestamp: z.string(),
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  disk: z.number().min(0).max(100)
});

const DatabaseMetricsSchema = z.object({
  timestamp: z.string(),
  activeConnections: z.number().min(0),
  queryCount: z.number().min(0),
  slowQueries: z.number().min(0)
});

const APIMetricsSchema = z.object({
  timestamp: z.string(),
  requestCount: z.number().min(0),
  errorRate: z.number().min(0).max(100),
  averageResponseTime: z.number().min(0)
});

type SystemMetrics = z.infer<typeof SystemMetricsSchema>;
type DatabaseMetrics = z.infer<typeof DatabaseMetricsSchema>;
type APIMetrics = z.infer<typeof APIMetricsSchema>;

async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const response = await axios.get(`${API_URL}/metrics/system`, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    });
    
    const metrics = {
      timestamp: new Date().toISOString(),
      ...response.data
    };
    
    return SystemMetricsSchema.parse(metrics);
  } catch (error) {
    logger.error('Failed to fetch system metrics:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

async function getDatabaseMetrics(): Promise<DatabaseMetrics> {
  try {
    const [activeConnections, queryCount, slowQueries] = await Promise.all([
      db.execute(sql`SELECT count(*) as count FROM pg_stat_activity`),
      db.execute(sql`SELECT count(*) as count FROM pg_stat_statements`),
      db.execute(sql`SELECT count(*) as count FROM pg_stat_statements WHERE mean_time > 1000`)
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      activeConnections: Number((activeConnections as unknown as Array<{ count: string }>)[0]?.count || 0),
      queryCount: Number((queryCount as unknown as Array<{ count: string }>)[0]?.count || 0),
      slowQueries: Number((slowQueries as unknown as Array<{ count: string }>)[0]?.count || 0)
    };

    return DatabaseMetricsSchema.parse(metrics);
  } catch (error) {
    logger.error('Failed to fetch database metrics:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

async function getAPIMetrics(): Promise<APIMetrics> {
  try {
    const response = await axios.get(`${API_URL}/metrics/api`, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    });
    
    const metrics = {
      timestamp: new Date().toISOString(),
      ...response.data
    };
    
    return APIMetricsSchema.parse(metrics);
  } catch (error) {
    logger.error('Failed to fetch API metrics:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

async function monitorMetrics() {
  let retryCount = 0;
  const metrics: {
    system: SystemMetrics[];
    database: DatabaseMetrics[];
    api: APIMetrics[];
  } = {
    system: [],
    database: [],
    api: []
  };

  logger.info('Starting metrics monitoring...', {
    timestamp: new Date().toISOString(),
    maxRetries: MAX_RETRIES,
    checkInterval: CHECK_INTERVAL
  });

  while (retryCount < MAX_RETRIES) {
    try {
      const [systemMetrics, databaseMetrics, apiMetrics] = await Promise.all([
        getSystemMetrics(),
        getDatabaseMetrics(),
        getAPIMetrics()
      ]);

      metrics.system.push(systemMetrics);
      metrics.database.push(databaseMetrics);
      metrics.api.push(apiMetrics);

      // Log current metrics
      logger.info('System Metrics:', {
        timestamp: systemMetrics.timestamp,
        cpu: `${systemMetrics.cpu}%`,
        memory: `${systemMetrics.memory}%`,
        disk: `${systemMetrics.disk}%`
      });

      logger.info('Database Metrics:', {
        timestamp: databaseMetrics.timestamp,
        activeConnections: databaseMetrics.activeConnections,
        queryCount: databaseMetrics.queryCount,
        slowQueries: databaseMetrics.slowQueries
      });

      logger.info('API Metrics:', {
        timestamp: apiMetrics.timestamp,
        requestCount: apiMetrics.requestCount,
        errorRate: `${apiMetrics.errorRate}%`,
        avgResponseTime: `${apiMetrics.averageResponseTime}ms`
      });

      // Check for critical thresholds
      if (
        systemMetrics.cpu > 80 ||
        systemMetrics.memory > 80 ||
        systemMetrics.disk > 80 ||
        databaseMetrics.slowQueries > 10 ||
        apiMetrics.errorRate > 5
      ) {
        logger.warn('⚠️ Critical thresholds exceeded!', {
          timestamp: new Date().toISOString(),
          metrics: {
            system: systemMetrics,
            database: databaseMetrics,
            api: apiMetrics
          }
        });
      }

      retryCount++;
      if (retryCount < MAX_RETRIES) {
        logger.info(`Waiting ${CHECK_INTERVAL/1000} seconds before next check...`, {
          timestamp: new Date().toISOString(),
          nextRetry: retryCount + 1
        });
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      }
    } catch (error) {
      logger.error('Failed to collect metrics:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        retryCount
      });
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      }
    }
  }

  // Save metrics to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const metricsFile = `metrics-${timestamp}.json`;
  
  try {
    await fs.writeFile(metricsFile, JSON.stringify(metrics, null, 2));
    logger.info(`Metrics saved to ${metricsFile}`, {
      timestamp: new Date().toISOString(),
      fileSize: (await fs.stat(metricsFile)).size
    });
  } catch (error) {
    logger.error('Failed to save metrics file:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      file: metricsFile
    });
  }
}

// Run monitoring if called directly
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

if (process.argv[1] === currentFilePath) {
  monitorMetrics();
} 