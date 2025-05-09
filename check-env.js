const dotenv = require('dotenv');

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('DATABASE_URL:', process.env.DATABASE_URL);
