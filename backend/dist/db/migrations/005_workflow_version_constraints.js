"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema
        .alterTable('workflow_versions')
        .addUniqueConstraint('workflow_versions_workflow_id_version_unique', ['workflow_id', 'version'])
        .execute();
}
async function down(db) {
    await db.schema
        .alterTable('workflow_versions')
        .dropConstraint('workflow_versions_workflow_id_version_unique')
        .execute();
}
