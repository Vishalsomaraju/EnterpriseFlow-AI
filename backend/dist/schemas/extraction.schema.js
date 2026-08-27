"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionOutputSchema = exports.RuleSchema = exports.DecisionSchema = exports.NodeSchema = void 0;
const zod_1 = require("zod");
exports.NodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
});
exports.DecisionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    conditions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RuleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    expression: zod_1.z.string(),
    source_node_id: zod_1.z.string(),
    decision_node_id: zod_1.z.string().optional(),
    target_node_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
});
exports.ExtractionOutputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Workflow name is required'),
    actors: zod_1.z.array(zod_1.z.string()).optional(),
    systems: zod_1.z.array(zod_1.z.string()).optional(),
    steps: zod_1.z.array(exports.NodeSchema).optional(),
    decisions: zod_1.z.array(exports.DecisionSchema).optional(),
    rules: zod_1.z.array(exports.RuleSchema).optional(),
    integrations: zod_1.z.array(zod_1.z.string()).optional(),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    bottlenecks: zod_1.z.array(zod_1.z.string()).optional(),
    acceptance_criteria: zod_1.z.array(zod_1.z.string()).optional(),
});
