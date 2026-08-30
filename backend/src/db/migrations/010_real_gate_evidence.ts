import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('test_runs')
    .addColumn('stdout', 'text')
    .addColumn('stderr', 'text')
    .execute();

  await db.schema.alterTable('security_scans')
    .addColumn('findings', 'jsonb')
    .addColumn('evidence_path', 'text')
    .addColumn('started_at', 'timestamp')
    .addColumn('completed_at', 'timestamp')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('security_scans')
    .dropColumn('completed_at')
    .dropColumn('started_at')
    .dropColumn('evidence_path')
    .dropColumn('findings')
    .execute();
  await db.schema.alterTable('test_runs')
    .dropColumn('stderr')
    .dropColumn('stdout')
    .execute();
}
