"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    // Alter blueprints table to add workflow_version_id and structured payload columns
    // We'll drop version_id and add workflow_version_id with a UNIQUE constraint
    // Note: the constraint name for version_id might be auto-generated.
    // Kysely provides dropColumn which takes care of constraints typically?
    // Let's just drop column and re-add.
    await db.schema
        .alterTable('blueprints')
        .dropColumn('version_id')
        .execute();
    await db.schema
        .alterTable('blueprints')
        .addColumn('workflow_version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull().unique())
        .addColumn('schema_json', 'jsonb', (col) => col.notNull())
        .addColumn('validation_status', 'varchar', (col) => col.notNull().defaultTo('INVALID'))
        .addColumn('validation_errors', 'jsonb')
        .execute();
}
async function down(db) {
    await db.schema
        .alterTable('blueprints')
        .dropColumn('validation_errors')
        .dropColumn('validation_status')
        .dropColumn('schema_json')
        .dropColumn('workflow_version_id')
        .execute();
    await db.schema
        .alterTable('blueprints')
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .execute();
}
