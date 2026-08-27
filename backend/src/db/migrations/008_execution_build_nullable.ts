import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the NOT NULL constraint on build_id in workflow_executions.
  // Executions can be triggered independently of a Bob build (standalone runtime).
  await sql`ALTER TABLE workflow_executions ALTER COLUMN build_id DROP NOT NULL`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Re-add NOT NULL (only safe if all rows have a build_id)
  await sql`ALTER TABLE workflow_executions ALTER COLUMN build_id SET NOT NULL`.execute(db);
}
