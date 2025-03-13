import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import { db } from '../packages/database/src/drizzle';
import { logger } from '../packages/shared/src/logger';

const execAsync = promisify(exec);

interface DeploymentMetrics {
  timestamp: string;
  status: string;
  errorRate: number;
  responseTime: number;
  activeConnections: number;
}

async function checkDatabaseMigrations(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments'
      );
    `);
    return result[0].exists;
  } catch (error) {
    logger.error('Database migration check failed:', error);
    return false;
  }
}

async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://api.loadup.app/health');
    return response.status === 200;
  } catch (error) {
    logger.error('API health check failed:', error);
    return false;
  }
}

async function monitorMetrics(duration: number = 300000): Promise<DeploymentMetrics[]> {
  const metrics: DeploymentMetrics[] = [];
  const interval = 60000; // 1 minute
  const iterations = duration / interval;

  for (let i = 0; i < iterations; i++) {
    try {
      const response = await fetch('https://api.loadup.app/metrics');
      const data = await response.json();
      
      metrics.push({
        timestamp: new Date().toISOString(),
        status: 'healthy',
        errorRate: data.errorRate,
        responseTime: data.responseTime,
        activeConnections: data.activeConnections
      });
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      metrics.push({
        timestamp: new Date().toISOString(),
        status: 'error',
        errorRate: -1,
        responseTime: -1,
        activeConnections: -1
      });
    }

    if (i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  return metrics;
}

async function deploy() {
  try {
    logger.info('Starting deployment process...');

    // Step 1: Run database migrations
    logger.info('Running database migrations...');
    await execAsync('npm run migrate');
    
    const migrationsOk = await checkDatabaseMigrations();
    if (!migrationsOk) {
      throw new Error('Database migrations failed');
    }

    // Step 2: Build the application
    logger.info('Building application...');
    await execAsync('npm run build');

    // Step 3: Deploy to Railway
    logger.info('Deploying to Railway...');
    await execAsync('railway up --service loadup-beta');

    // Step 4: Wait for deployment to stabilize
    logger.info('Waiting for deployment to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Step 5: Check API health
    logger.info('Checking API health...');
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      throw new Error('API health check failed');
    }

    // Step 6: Monitor deployment
    logger.info('Monitoring deployment metrics...');
    const metrics = await monitorMetrics();

    // Step 7: Analyze metrics
    const errorRates = metrics.map(m => m.errorRate).filter(rate => rate >= 0);
    const avgErrorRate = errorRates.reduce((a, b) => a + b, 0) / errorRates.length;
    const avgResponseTime = metrics
      .map(m => m.responseTime)
      .filter(time => time >= 0)
      .reduce((a, b) => a + b, 0) / errorRates.length;

    if (avgErrorRate > 0.01) { // More than 1% error rate
      throw new Error(`High error rate detected: ${avgErrorRate * 100}%`);
    }

    if (avgResponseTime > 500) { // More than 500ms average response time
      logger.warn(`High average response time: ${avgResponseTime}ms`);
    }

    logger.info('Deployment completed successfully!');
    logger.info(`Average Error Rate: ${(avgErrorRate * 100).toFixed(2)}%`);
    logger.info(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);

  } catch (error) {
    logger.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deploy();
} 