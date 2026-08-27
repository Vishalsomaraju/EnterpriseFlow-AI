import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

// Standard connection string setup
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/enterpriseflow';

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString,
    max: 10,
  })
});

export const db = new Kysely<Database>({
  dialect,
});
