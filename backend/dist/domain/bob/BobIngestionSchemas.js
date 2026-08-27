"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BobTestResultSchema = exports.BobChangesSchema = exports.BobChangedFileSchema = exports.BobPlanSchema = exports.BobSubagentSchema = exports.BobEventSchema = exports.BobIdentitySchema = void 0;
const zod_1 = require("zod");
exports.BobIdentitySchema = zod_1.z.object({
    build_id: zod_1.z.string().uuid(),
    bob_session_id: zod_1.z.string(),
    event_id: zod_1.z.string()
});
exports.BobEventSchema = exports.BobIdentitySchema.extend({
    event_type: zod_1.z.enum([
        'REPOSITORY_ANALYZED',
        'PLAN_CREATED',
        'IMPLEMENTING',
        'CHANGES_RECEIVED',
        'TESTS_RECEIVED'
    ]),
    message: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().datetime().optional()
});
exports.BobSubagentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    task: zod_1.z.string()
});
exports.BobPlanSchema = exports.BobIdentitySchema.extend({
    summary: zod_1.z.string(),
    plan_json: zod_1.z.record(zod_1.z.any()),
    subagents: zod_1.z.array(exports.BobSubagentSchema).optional()
});
exports.BobChangedFileSchema = zod_1.z.object({
    file_path: zod_1.z.string(),
    change_type: zod_1.z.enum(['added', 'modified', 'deleted']),
    diff: zod_1.z.string().optional()
});
exports.BobChangesSchema = exports.BobIdentitySchema.extend({
    change_set_id: zod_1.z.string(),
    files: zod_1.z.array(exports.BobChangedFileSchema)
});
exports.BobTestResultSchema = exports.BobIdentitySchema.extend({
    test_run_id: zod_1.z.string(),
    name: zod_1.z.string(),
    total_tests: zod_1.z.number().int().min(0),
    passed: zod_1.z.number().int().min(0),
    failed: zod_1.z.number().int().min(0),
    duration_ms: zod_1.z.number().int().min(0),
    status: zod_1.z.enum(['Passed', 'Failed'])
});
