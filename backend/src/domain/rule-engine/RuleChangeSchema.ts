import { z } from 'zod';

export const RuleChangeRequestSchema = z.object({
  baseVersion: z.number(),
  expression: z.string().min(1)
});

export type RuleChangeRequest = z.infer<typeof RuleChangeRequestSchema>;
