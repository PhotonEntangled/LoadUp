import env from '../config/env.js';

// Function to notify the team of health check issues
const notifyTeam = (message: string) => {
  // In a production environment, this would send to a notification service
  console.error(`[HEALTH CHECK ALERT] ${message}`);
  
  // Example: Send to Slack webhook
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   fetch(process.env.SLACK_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text: `[HEALTH CHECK ALERT] ${message}` })
  //   }).catch(error => console.error('Failed to send Slack notification:', error));
  // }
};

// Run health checks
export const runHealthChecks = async () => {
  console.log('Running automated health checks...');
  const baseUrl = `http://localhost:${env.port}`;
  
  // Check API health endpoint
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json() as { status: string };
    
    if (healthData.status !== 'ok') {
      console.error('Health check failed:', healthData);
      notifyTeam('Health check failed');
    } else {
      console.log('Health check passed');
    }
  } catch (error) {
    console.error('Health check error:', error);
    notifyTeam('Health check error');
  }
  
  // Check shipments endpoint
  try {
    const shipmentsResponse = await fetch(`${baseUrl}/api/shipments`);
    const shipmentsData = await shipmentsResponse.json() as { success: boolean, data: any[] };
    
    if (!shipmentsData.success) {
      console.error('Shipments endpoint failed:', shipmentsData);
      notifyTeam('Shipments endpoint failed');
    } else {
      console.log('Shipments endpoint passed');
    }
  } catch (error) {
    console.error('Shipments endpoint error:', error);
    notifyTeam('Shipments endpoint error');
  }
  
  // Check drivers endpoint
  try {
    const driversResponse = await fetch(`${baseUrl}/api/drivers`);
    const driversData = await driversResponse.json() as { success: boolean, data: any[] };
    
    if (!driversData.success) {
      console.error('Drivers endpoint failed:', driversData);
      notifyTeam('Drivers endpoint failed');
    } else {
      console.log('Drivers endpoint passed');
    }
  } catch (error) {
    console.error('Drivers endpoint error:', error);
    notifyTeam('Drivers endpoint error');
  }
  
  // Check database connection
  try {
    const dbCheckResponse = await fetch(`${baseUrl}/health/db`);
    const dbCheckData = await dbCheckResponse.json() as { success: boolean, database: string };
    
    if (!dbCheckData.success) {
      console.error('Database connection check failed:', dbCheckData);
      notifyTeam('Database connection check failed');
    } else {
      console.log('Database connection check passed');
    }
  } catch (error) {
    console.error('Database connection check error:', error);
    notifyTeam('Database connection check error');
  }
};

// Schedule health checks
export const scheduleHealthChecks = (intervalMinutes = 5) => {
  // Run health checks immediately
  runHealthChecks();
  
  // Schedule health checks to run at the specified interval
  const intervalMs = intervalMinutes * 60 * 1000;
  const interval = setInterval(runHealthChecks, intervalMs);
  
  return {
    stop: () => clearInterval(interval),
    runNow: runHealthChecks
  };
}; 