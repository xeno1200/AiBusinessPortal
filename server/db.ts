import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Required for Neon serverless driver
neonConfig.webSocketConstructor = ws;

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create drizzle database instance with schema
export const db = drizzle(pool, { schema });