import { db } from '@/lib/database/drizzle';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    // Direct query without using sql tag
    const result = await db.query.users.findFirst();
    console.log('Connection successful!');
    console.log('Found user:', result ? 'Yes' : 'No');
    console.log('Database connection is working correctly!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 