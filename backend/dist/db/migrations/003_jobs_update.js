"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await db.schema
        .alterTable('jobs')
        .addColumn('locked_at', 'timestamp')
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo((0, kysely_1.sql) `now()`))
        .addColumn('max_attempts', 'integer', (col) => col.defaultTo(2))
        .execute();
}
async function down(db) {
    await db.schema
        .alterTable('jobs')
        .dropColumn('max_attempts')
        .dropColumn('updated_at')
        .dropColumn('locked_at')
        .execute();
}
