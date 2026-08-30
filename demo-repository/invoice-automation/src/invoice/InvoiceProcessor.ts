import { readFileSync } from 'fs';
import { join } from 'path';

interface Rules {
  approvalThreshold: number;
  currency: string;
  version: number;
  ruleId: string;
  condition: string;
}

function loadRules(): Rules {
  const rulesPath = join(__dirname, '../config/rules.json');
  const content = readFileSync(rulesPath, 'utf-8');
  return JSON.parse(content) as Rules;
}

export interface Invoice {
  id: string;
  vendor: string;
  amount: number;
  poNumber?: string;
  submittedBy: string;
  submittedAt?: Date;
}

export interface ProcessingResult {
  invoiceId: string;
  assignTo: string;
  reason: string;
  requiresSecondaryApproval: boolean;
  timestamp: Date;
}

/**
 * Baseline processor. Validation and persistence remain separate concerns so
 * the legacy workflow can be replaced incrementally.
 */
export function processInvoice(invoice: Invoice): ProcessingResult {
  const rules = loadRules();
  const threshold = rules.approvalThreshold;

  if (invoice.amount >= threshold) {
    return {
      invoiceId: invoice.id,
      assignTo: 'CFO',
      reason: `Amount ₹${invoice.amount.toLocaleString('en-IN')} meets or exceeds threshold ₹${threshold.toLocaleString('en-IN')}`,
      requiresSecondaryApproval: true,
      timestamp: new Date(),
    };
  }

  return {
    invoiceId: invoice.id,
    assignTo: 'Finance Manager',
    reason: `Amount ₹${invoice.amount.toLocaleString('en-IN')} is below threshold ₹${threshold.toLocaleString('en-IN')}`,
    requiresSecondaryApproval: false,
    timestamp: new Date(),
  };
}
