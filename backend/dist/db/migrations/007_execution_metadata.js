"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
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
async function down(db) {
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
