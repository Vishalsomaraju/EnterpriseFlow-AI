import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workflow_executions')
    .addColumn('input_snapshot', 'jsonb')
    .addColumn('idempotency_key', 'varchar', (col) => col.unique())
    .addColumn('completed_at', 'timestamp')
    .addColumn('failure_reason', 'text')
    .execute();

  await db.schema
    .alterTable('workflow_execution_history')
    .addColumn('metadata', 'jsonb')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workflow_executions')
    .dropColumn('input_snapshot')
    .dropColumn('idempotency_key')
    .dropColumn('completed_at')
    .dropColumn('failure_reason')
    .execute();

  await db.schema
    .alterTable('workflow_execution_history')
    .dropColumn('metadata')
    .execute();
}
