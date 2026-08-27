"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    // Alter test_runs table
    await db.schema
        .alterTable('test_runs')
        .addColumn('skipped', 'integer')
        .addColumn('repository_path', 'varchar')
        .addColumn('commit_hash', 'varchar')
        .addColumn('started_at', 'timestamp')
        .addColumn('completed_at', 'timestamp')
        .addColumn('exit_code', 'integer')
        .execute();
    // Create test_results table
    await db.schema
        .createTable('test_results')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('test_run_id', 'varchar', (col) => col.references('test_runs.id').onDelete('cascade').notNull())
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('test_name', 'varchar', (col) => col.notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('duration_ms', 'integer')
        .addColumn('error_output', 'text')
        .addColumn('timestamp', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // Alter documentation_artifacts
    await db.schema
        .alterTable('documentation_artifacts')
        .addColumn('path', 'varchar')
        .addColumn('artifact_type', 'varchar')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
}
async function down(db) {
    await db.schema
        .alterTable('documentation_artifacts')
        .dropColumn('path')
        .dropColumn('artifact_type')
        .dropColumn('created_at')
        .execute();
    await db.schema.dropTable('test_results').execute();
    await db.schema
        .alterTable('test_runs')
        .dropColumn('skipped')
        .dropColumn('repository_path')
        .dropColumn('commit_hash')
        .dropColumn('started_at')
        .dropColumn('completed_at')
        .dropColumn('exit_code')
        .execute();
}
