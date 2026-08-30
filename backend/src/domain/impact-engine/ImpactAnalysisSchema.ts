import { z } from 'zod';

export const ImpactAnalysisRequestSchema = z.object({
  expression: z.string().min(1),
  sampleInput: z.record(z.string(), z.unknown()).optional()
});

export type ImpactAnalysisRequest = z.infer<typeof ImpactAnalysisRequestSchema>;

export interface ImpactComponent {
  id: string;
  type: string;
  name: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ImpactAnalysisResponse {
  rule: {
    id: string;
    oldExpression: string;
    newExpression: string;
  };
  directImpact: ImpactComponent[];
  downstreamImpact: ImpactComponent[];
  risk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
  };
  evaluation?: {
    input: any;
    before?: string;
    after?: string;
  };
  semantic?: {
    isThresholdChange: boolean;
    oldThreshold?: number;
    newThreshold?: number;
    delta?: number;
    affectedRange?: string;
    businessImpact: string;
    reviewerChecks: string[];
  };
  affected_files: string[];
  affected_tests: string[];
  affected_nodes: string[];
  affected_docs: string[];
}
