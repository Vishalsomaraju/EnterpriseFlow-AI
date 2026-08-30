import { readFileSync } from 'fs';
import { join } from 'path';
import type { Invoice, ProcessingResult } from '../invoice/InvoiceProcessor';

interface RouteRule {
  condition: string;
  assignTo: string;
  threshold?: number;
}

export class WorkflowRouter {
  route(invoice: Invoice, _processingResult?: ProcessingResult): string {
    const threshold = this.readRules().approvalThreshold;
    return invoice.amount >= threshold ? 'CFO' : 'Finance Manager';
  }

  getAvailableRoutes(): RouteRule[] {
    const threshold = this.readRules().approvalThreshold;
    return [
      { condition: `amount >= ${threshold}`, assignTo: 'CFO', threshold },
      { condition: `amount < ${threshold}`, assignTo: 'Finance Manager', threshold },
    ];
  }

  loadDynamicRules(): RouteRule[] {
    return this.getAvailableRoutes();
  }

  private readRules(): { approvalThreshold: number } {
    const rulesPath = join(__dirname, '../config/rules.json');
    return JSON.parse(readFileSync(rulesPath, 'utf-8')) as { approvalThreshold: number };
  }
}

export const workflowRouter = new WorkflowRouter();
