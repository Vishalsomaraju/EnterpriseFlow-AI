import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('jobs')
    .addColumn('locked_at', 'timestamp')
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('max_attempts', 'integer', (col) => col.defaultTo(2))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('jobs')
    .dropColumn('max_attempts')
    .dropColumn('updated_at')
    .dropColumn('locked_at')
    .execute();
}
