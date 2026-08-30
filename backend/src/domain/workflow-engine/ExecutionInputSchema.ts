import { z } from 'zod';

export const WorkflowExecutionInputSchema = z.object({
  invoiceId: z.string().min(1),
  vendor: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  poNumber: z.string().min(1).optional(),
  reference: z.string().min(1).optional(),
  hasPO: z.boolean().optional(),
  isDuplicate: z.boolean().optional()
}).passthrough();

export type WorkflowExecutionInput = z.infer<typeof WorkflowExecutionInputSchema>;
