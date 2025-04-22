import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { NeonHttpQueryResultHKT } from 'drizzle-orm/neon-http';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type * as schema from '@/lib/database/schema';

/**
 * Represents the specific transaction type used with Drizzle ORM and the Neon HTTP adapter.
 * Ensures consistency when passing transactions between functions/services.
 */
export type NeonHttpTransaction = PgTransaction<
  NeonHttpQueryResultHKT, 
  typeof schema, 
  ExtractTablesWithRelations<typeof schema>
>;

// Add other shared database types here if needed in the future 