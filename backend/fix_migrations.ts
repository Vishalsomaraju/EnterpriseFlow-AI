import { db } from './src/db/index';
import { sql } from 'kysely';

async function run() {
  await sql`UPDATE kysely_migration SET name = REPLACE(name, '.ts', '')`.execute(db);
  await sql`UPDATE kysely_migration SET name = REPLACE(name, '.js', '')`.execute(db);
  console.log('Fixed migrations extensions in DB (stripped extensions)');
  process.exit(0);
}
run();
