import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workflow_versions')
    .addUniqueConstraint('workflow_versions_workflow_id_version_unique', ['workflow_id', 'version'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workflow_versions')
    .dropConstraint('workflow_versions_workflow_id_version_unique')
    .execute();
}
