import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

console.log(`Attempting to connect using URL: ${connectionString.replace(/:([^:@\/]+)@/, ':[REDACTED]@')}...`); // Log URL safely

async function testConnection() {
  let sql;
  try {
    // Try connecting WITH explicit SSL option
    sql = postgres(connectionString, {
      max: 1, // Use only one connection for testing
      idle_timeout: 5, // Short timeout
      connect_timeout: 10, // Connection timeout (seconds)
      ssl: 'require', // Explicitly require SSL
      onnotice: (notice) => console.warn(`⚠️ Postgres Notice: ${notice.message}`),
    });

    console.log('🔄 Initializing connection (with explicit SSL)...');
    // Perform a simple query to force connection and authentication
    await sql`SELECT 1`;
    console.log('✅ Connection successful!');

  } catch (error) {
    console.error('❌ Connection failed:', error);
    // Log specific properties if it's a PostgresError
    if (error.severity && error.code) {
        console.error(`   Severity: ${error.severity}`);
        console.error(`   Code: ${error.code}`);
    }
  } finally {
    if (sql) {
      console.log('🚪 Closing connection...');
      await sql.end();
      console.log('🚪 Connection closed.');
    }
  }
}

testConnection(); 