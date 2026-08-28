import { readFileSync } from 'fs';
import { join } from 'path';
import type { Invoice, ProcessingResult } from '../invoice/InvoiceProcessor';

interface RouteRule {
  condition: string;
  assignTo: string;
  threshold?: number;
}

/**
 * BASELINE WorkflowRouter — deliberately imperfect.
 *
 * Known deficiencies Bob must fix:
 * 1. Routing rules are hardcoded — should be loaded from rules.json
 * 2. No dynamic rule evaluation (rules cannot be updated without code change)
 * 3. No fallback routing when assignee is unavailable
 * 4. No logging of routing decisions
 */
export class WorkflowRouter {
  // KNOWN DEFICIENCY: Hardcoded routing table — Bob should replace with dynamic rules.json evaluation
  private static readonly ROUTES: RouteRule[] = [
    { condition: 'amount >= threshold', assignTo: 'CFO' },
    { condition: 'amount < threshold', assignTo: 'Finance Manager' },
  ];

  route(invoice: Invoice, processingResult: ProcessingResult): string {
    // KNOWN DEFICIENCY: Simply echoes what InvoiceProcessor already decided
    // A real router should evaluate rules independently from a config source
    return processingResult.assignTo;
  }

  getAvailableRoutes(): RouteRule[] {
    return WorkflowRouter.ROUTES;
  }

  /**
   * KNOWN DEFICIENCY: This method exists but is never called by route().
   * Bob should integrate dynamic rule loading into the routing logic.
   */
  loadDynamicRules(): RouteRule[] {
    try {
      const rulesPath = join(__dirname, '../config/rules.json');
      const rules = JSON.parse(readFileSync(rulesPath, 'utf-8'));
      return [
        { condition: `amount >= ${rules.approvalThreshold}`, assignTo: 'CFO', threshold: rules.approvalThreshold },
        { condition: `amount < ${rules.approvalThreshold}`, assignTo: 'Finance Manager', threshold: rules.approvalThreshold },
      ];
    } catch {
      return WorkflowRouter.ROUTES;
    }
  }
}

export const workflowRouter = new WorkflowRouter();
