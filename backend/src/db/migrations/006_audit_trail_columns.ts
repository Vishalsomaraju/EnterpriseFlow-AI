import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('activity_events')
    .addColumn('actor', 'varchar')
    .addColumn('entity_type', 'varchar')
    .addColumn('entity_id', 'varchar')
    .addColumn('workflow_version', 'varchar')
    .addColumn('metadata', 'jsonb')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('activity_events')
    .dropColumn('actor')
    .dropColumn('entity_type')
    .dropColumn('entity_id')
    .dropColumn('workflow_version')
    .dropColumn('metadata')
    .execute();
}
