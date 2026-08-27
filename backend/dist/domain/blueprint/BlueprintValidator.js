"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueprintValidator = exports.AutomationBlueprintSchema = void 0;
const zod_1 = require("zod");
// Zod schemas matching the exact Blueprint Types
const BlueprintActorSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    role: zod_1.z.string().optional()
});
const BlueprintNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['START', 'INTERMEDIATE', 'DECISION', 'TERMINAL']),
    name: zod_1.z.string(),
    actor: zod_1.z.string().optional(),
    automated: zod_1.z.boolean(),
    inputs: zod_1.z.array(zod_1.z.string()),
    outputs: zod_1.z.array(zod_1.z.string()),
    ruleIds: zod_1.z.array(zod_1.z.string())
});
const BlueprintTransitionSchema = zod_1.z.object({
    sourceId: zod_1.z.string(),
    targetId: zod_1.z.string(),
    type: zod_1.z.enum(['DEFAULT', 'BRANCH']),
    condition: zod_1.z.string().optional()
});
const BlueprintBusinessRuleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    condition: zod_1.z.string()
});
const BlueprintIntegrationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string()
});
exports.AutomationBlueprintSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal("1.0"),
    workflow: zod_1.z.object({
        id: zod_1.z.string(),
        version: zod_1.z.number(),
        name: zod_1.z.string()
    }),
    actors: zod_1.z.array(BlueprintActorSchema),
    nodes: zod_1.z.array(BlueprintNodeSchema),
    transitions: zod_1.z.array(BlueprintTransitionSchema),
    businessRules: zod_1.z.array(BlueprintBusinessRuleSchema),
    integrations: zod_1.z.array(BlueprintIntegrationSchema),
    acceptanceCriteria: zod_1.z.array(zod_1.z.string())
});
class BlueprintValidator {
    static validate(blueprint) {
        const result = exports.AutomationBlueprintSchema.safeParse(blueprint);
        if (!result.success) {
            return {
                isValid: false,
                errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
            };
        }
        const typedBlueprint = result.data;
        const errors = [];
        // Validations: References existing
        const nodeIds = new Set(typedBlueprint.nodes.map(n => n.id));
        const ruleIds = new Set(typedBlueprint.businessRules.map(r => r.id));
        // 1. Transition source and target must exist in nodes
        typedBlueprint.transitions.forEach((t, i) => {
            if (!nodeIds.has(t.sourceId)) {
                errors.push(`transitions[${i}].sourceId '${t.sourceId}' does not exist in nodes.`);
            }
            if (!nodeIds.has(t.targetId)) {
                errors.push(`transitions[${i}].targetId '${t.targetId}' does not exist in nodes.`);
            }
        });
        // 2. Nodes must reference valid rules
        typedBlueprint.nodes.forEach((n, i) => {
            n.ruleIds.forEach(ruleId => {
                if (!ruleIds.has(ruleId)) {
                    errors.push(`nodes[${i}].ruleIds contains '${ruleId}' which does not exist in businessRules.`);
                }
            });
        });
        // 3. Duplicate checks
        if (nodeIds.size !== typedBlueprint.nodes.length) {
            errors.push('Duplicate node IDs detected.');
        }
        if (errors.length > 0) {
            return { isValid: false, errors };
        }
        return { isValid: true, errors: [] };
    }
}
exports.BlueprintValidator = BlueprintValidator;
