import { z } from 'zod';

export const BobIdentitySchema = z.object({
  build_id: z.string().uuid(),
  bob_session_id: z.string(),
  event_id: z.string()
});

export const BobEventSchema = BobIdentitySchema.extend({
  event_type: z.enum([
    'REPOSITORY_ANALYZED',
    'PLAN_CREATED',
    'IMPLEMENTING',
    'CHANGES_RECEIVED',
    'TESTS_RECEIVED'
  ]),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional()
});

export const BobSubagentSchema = z.object({
  name: z.string(),
  task: z.string()
});

export const BobPlanSchema = BobIdentitySchema.extend({
  summary: z.string(),
  plan_json: z.record(z.any()),
  subagents: z.array(BobSubagentSchema).optional()
});

export const BobChangedFileSchema = z.object({
  file_path: z.string(),
  change_type: z.enum(['added', 'modified', 'deleted']),
  diff: z.string().optional()
});

export const BobChangesSchema = BobIdentitySchema.extend({
  change_set_id: z.string(),
  files: z.array(BobChangedFileSchema)
});

export const BobTestResultSchema = BobIdentitySchema.extend({
  test_run_id: z.string(),
  name: z.string(),
  total_tests: z.number().int().min(0),
  passed: z.number().int().min(0),
  failed: z.number().int().min(0),
  duration_ms: z.number().int().min(0),
  status: z.enum(['Passed', 'Failed'])
});
