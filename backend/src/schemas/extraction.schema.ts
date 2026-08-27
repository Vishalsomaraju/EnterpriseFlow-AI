import { z } from 'zod';

export const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const DecisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(z.string()).optional(),
});

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  expression: z.string(),
  source_node_id: z.string(),
  decision_node_id: z.string().optional(),
  target_node_id: z.union([z.string(), z.array(z.string())]),
});

export const ExtractionOutputSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  actors: z.array(z.string()).optional(),
  systems: z.array(z.string()).optional(),
  steps: z.array(NodeSchema).optional(),
  decisions: z.array(DecisionSchema).optional(),
  rules: z.array(RuleSchema).optional(),
  integrations: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  bottlenecks: z.array(z.string()).optional(),
  acceptance_criteria: z.array(z.string()).optional(),
});

export type ValidatedExtractionOutput = z.infer<typeof ExtractionOutputSchema>;
