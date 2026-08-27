import { z } from 'zod';
import { AutomationBlueprint } from './types';

// Zod schemas matching the exact Blueprint Types

const BlueprintActorSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional()
});

const BlueprintNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['START', 'INTERMEDIATE', 'DECISION', 'TERMINAL']),
  name: z.string(),
  actor: z.string().optional(),
  automated: z.boolean(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  ruleIds: z.array(z.string())
});

const BlueprintTransitionSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(['DEFAULT', 'BRANCH']),
  condition: z.string().optional()
});

const BlueprintBusinessRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  condition: z.string()
});

const BlueprintIntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
});

export const AutomationBlueprintSchema = z.object({
  schemaVersion: z.literal("1.0"),
  workflow: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string()
  }),
  actors: z.array(BlueprintActorSchema),
  nodes: z.array(BlueprintNodeSchema),
  transitions: z.array(BlueprintTransitionSchema),
  businessRules: z.array(BlueprintBusinessRuleSchema),
  integrations: z.array(BlueprintIntegrationSchema),
  acceptanceCriteria: z.array(z.string())
});

export class BlueprintValidator {
  public static validate(blueprint: any): { isValid: boolean, errors: string[] } {
    const result = AutomationBlueprintSchema.safeParse(blueprint);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }

    const typedBlueprint = result.data as AutomationBlueprint;
    const errors: string[] = [];

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
