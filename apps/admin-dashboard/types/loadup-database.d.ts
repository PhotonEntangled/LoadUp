declare module '@loadup/database' {
  import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
  import * as schema from '@loadup/database/schema';

  // Define a type for the database instance
  type Database = PostgresJsDatabase<typeof schema>;

  // Export the database instance
  export const db: Database;
} 