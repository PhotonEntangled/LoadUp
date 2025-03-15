import pkg from 'pg';
const { Pool } = pkg;

export const createPool = async () => {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'loadup_test',
  });

  // Test the connection
  try {
    const client = await pool.connect();
    await client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

export const closePool = async (pool: pkg.Pool) => {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
}; 