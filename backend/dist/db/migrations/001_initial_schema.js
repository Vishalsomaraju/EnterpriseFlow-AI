"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    // projects
    await db.schema
        .createTable('projects')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // workflows
    await db.schema
        .createTable('workflows')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('project_id', 'uuid', (col) => col.references('projects.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // documents
    await db.schema
        .createTable('documents')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('project_id', 'uuid', (col) => col.references('projects.id').onDelete('cascade').notNull())
        .addColumn('workflow_id', 'uuid', (col) => col.references('workflows.id').onDelete('set null'))
        .addColumn('filename', 'varchar', (col) => col.notNull())
        .addColumn('mime_type', 'varchar', (col) => col.notNull())
        .addColumn('storage_path', 'varchar', (col) => col.notNull())
        .addColumn('extraction_status', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // workflow_versions
    await db.schema
        .createTable('workflow_versions')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('workflow_id', 'uuid', (col) => col.references('workflows.id').onDelete('cascade').notNull())
        .addColumn('version', 'integer', (col) => col.notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // workflow_nodes
    await db.schema
        .createTable('workflow_nodes')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('type', 'varchar', (col) => col.notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('kind', 'varchar')
        .addColumn('pos_x', 'integer')
        .addColumn('pos_y', 'integer')
        .execute();
    // workflow_edges
    await db.schema
        .createTable('workflow_edges')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('source_id', 'varchar', (col) => col.notNull())
        .addColumn('target_id', 'varchar', (col) => col.notNull())
        .addColumn('label', 'varchar')
        .addColumn('is_branch', 'boolean', (col) => col.defaultTo(false))
        .execute();
    // workflow_actors
    await db.schema
        .createTable('workflow_actors')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('role', 'varchar')
        .execute();
    // workflow_systems
    await db.schema
        .createTable('workflow_systems')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('description', 'text')
        .execute();
    // business_rules
    await db.schema
        .createTable('business_rules')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar')
        .addColumn('description', 'text')
        .addColumn('condition', 'text', (col) => col.notNull())
        .addColumn('action', 'text')
        .addColumn('node_id', 'varchar')
        .execute();
    // rule_dependencies (Intentionally polymorphic target_id)
    await db.schema
        .createTable('rule_dependencies')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('business_rule_id', 'varchar', (col) => col.references('business_rules.id').onDelete('cascade').notNull())
        .addColumn('target_type', 'varchar', (col) => col.notNull())
        .addColumn('target_id', 'varchar', (col) => col.notNull())
        .execute();
    // blueprints
    await db.schema
        .createTable('blueprints')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // builds
    await db.schema
        .createTable('builds')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('blueprint_id', 'uuid', (col) => col.references('blueprints.id').onDelete('cascade').notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // build_plans
    await db.schema
        .createTable('build_plans')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('summary', 'text')
        .addColumn('plan_json', 'jsonb')
        .addColumn('version', 'integer', (col) => col.defaultTo(1))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // build_subagents
    await db.schema
        .createTable('build_subagents')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('task', 'text')
        .addColumn('status', 'varchar')
        .addColumn('started_at', 'timestamp')
        .addColumn('completed_at', 'timestamp')
        .addColumn('result', 'text')
        .execute();
    // bob_activity_events
    await db.schema
        .createTable('bob_activity_events')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('event_type', 'varchar', (col) => col.notNull())
        .addColumn('message', 'text', (col) => col.notNull())
        .addColumn('metadata', 'jsonb')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // build_changes
    await db.schema
        .createTable('build_changes')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('file_path', 'varchar', (col) => col.notNull())
        .addColumn('change_type', 'varchar', (col) => col.notNull())
        .addColumn('diff', 'text')
        .execute();
    // test_runs
    await db.schema
        .createTable('test_runs')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('total_tests', 'integer')
        .addColumn('passed', 'integer')
        .addColumn('failed', 'integer')
        .addColumn('duration_ms', 'integer')
        .addColumn('name', 'varchar')
        .addColumn('status', 'varchar')
        .execute();
    // security_scans
    await db.schema
        .createTable('security_scans')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('risk_score', 'integer')
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('critical', 'integer')
        .addColumn('high', 'integer')
        .addColumn('medium', 'integer')
        .addColumn('low', 'integer')
        .execute();
    // documentation_artifacts
    await db.schema
        .createTable('documentation_artifacts')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('title', 'varchar', (col) => col.notNull())
        .addColumn('content', 'text', (col) => col.notNull())
        .execute();
    // reviews
    await db.schema
        .createTable('reviews')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').onDelete('cascade').notNull())
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').onDelete('cascade').notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('reviewer', 'varchar')
        .addColumn('decision', 'varchar')
        .addColumn('comments', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // workflow_executions
    await db.schema
        .createTable('workflow_executions')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('version_id', 'uuid', (col) => col.references('workflow_versions.id').notNull())
        .addColumn('build_id', 'uuid', (col) => col.references('builds.id').notNull())
        .addColumn('approved_review_id', 'uuid', (col) => col.references('reviews.id'))
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('amount', 'varchar')
        .addColumn('assigned_to', 'varchar')
        .addColumn('time_elapsed', 'varchar')
        .addColumn('started_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // workflow_execution_history
    await db.schema
        .createTable('workflow_execution_history')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('execution_id', 'varchar', (col) => col.references('workflow_executions.id').onDelete('cascade').notNull())
        .addColumn('event', 'varchar', (col) => col.notNull())
        .addColumn('timestamp', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // jobs
    await db.schema
        .createTable('jobs')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('type', 'varchar', (col) => col.notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .addColumn('progress', 'integer')
        .addColumn('resource_type', 'varchar')
        .addColumn('resource_id', 'varchar')
        .addColumn('error_code', 'varchar')
        .addColumn('error_message', 'text')
        .addColumn('stage', 'varchar')
        .addColumn('attempt', 'integer', (col) => col.defaultTo(1))
        .addColumn('retryable', 'boolean', (col) => col.defaultTo(false))
        .addColumn('started_at', 'timestamp')
        .addColumn('completed_at', 'timestamp')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
    // activity_events (System audit events)
    await db.schema
        .createTable('activity_events')
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('title', 'varchar')
        .addColumn('message', 'text')
        .addColumn('source', 'varchar')
        .addColumn('event_type', 'varchar')
        .addColumn('agent', 'varchar')
        .addColumn('status', 'varchar')
        .addColumn('project_id', 'uuid', (col) => col.references('projects.id'))
        .addColumn('timestamp', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .execute();
}
async function down(db) {
    await db.schema.dropTable('activity_events').execute();
    await db.schema.dropTable('jobs').execute();
    await db.schema.dropTable('workflow_execution_history').execute();
    await db.schema.dropTable('workflow_executions').execute();
    await db.schema.dropTable('reviews').execute();
    await db.schema.dropTable('documentation_artifacts').execute();
    await db.schema.dropTable('security_scans').execute();
    await db.schema.dropTable('test_runs').execute();
    await db.schema.dropTable('build_changes').execute();
    await db.schema.dropTable('bob_activity_events').execute();
    await db.schema.dropTable('build_subagents').execute();
    await db.schema.dropTable('build_plans').execute();
    await db.schema.dropTable('builds').execute();
    await db.schema.dropTable('blueprints').execute();
    await db.schema.dropTable('rule_dependencies').execute();
    await db.schema.dropTable('business_rules').execute();
    await db.schema.dropTable('workflow_systems').execute();
    await db.schema.dropTable('workflow_actors').execute();
    await db.schema.dropTable('workflow_edges').execute();
    await db.schema.dropTable('workflow_nodes').execute();
    await db.schema.dropTable('workflow_versions').execute();
    await db.schema.dropTable('documents').execute();
    await db.schema.dropTable('workflows').execute();
    await db.schema.dropTable('projects').execute();
}
