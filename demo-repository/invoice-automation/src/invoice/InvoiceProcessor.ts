import { readFileSync } from 'fs';
import { join } from 'path';

// KNOWN DEFICIENCY: This should load rules.json dynamically.
// Currently uses a hardcoded fallback threshold.
// Bob's task: replace HARDCODED_THRESHOLD with a rules.json read.

interface Rules {
  approvalThreshold: number;
  currency: string;
  version: number;
  ruleId: string;
  condition: string;
}

function loadRules(): Rules {
  try {
    const rulesPath = join(__dirname, '../config/rules.json');
    const content = readFileSync(rulesPath, 'utf-8');
    return JSON.parse(content) as Rules;
  } catch {
    // KNOWN DEFICIENCY: Falls back to hardcoded value — Bob should remove this fallback
    return {
      approvalThreshold: 500000, // HARDCODED_THRESHOLD — replace with rules.json read
      currency: 'INR',
      version: 0,
      ruleId: 'unknown',
      condition: 'amount >= 500000',
    };
  }
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
 * BASELINE InvoiceProcessor — deliberately imperfect.
 *
 * Known deficiencies Bob must fix:
 * 1. No vendor validation (unknown vendors accepted)
 * 2. No duplicate invoice detection
 * 3. No PO number validation for large invoices
 * 4. No audit logging of decisions
 * 5. HARDCODED_THRESHOLD in fallback (should always read from rules.json)
 * 6. Missing requiresSecondaryApproval logic for CFO-routed invoices
 */
export function processInvoice(invoice: Invoice): ProcessingResult {
  const rules = loadRules();
  const threshold = rules.approvalThreshold;

  // KNOWN DEFICIENCY: No vendor validation
  // KNOWN DEFICIENCY: No duplicate check
  // KNOWN DEFICIENCY: No PO matching for amounts > 100000

  if (invoice.amount >= threshold) {
    return {
      invoiceId: invoice.id,
      assignTo: 'CFO',
      reason: `Amount ₹${invoice.amount.toLocaleString('en-IN')} meets or exceeds threshold ₹${threshold.toLocaleString('en-IN')}`,
      requiresSecondaryApproval: false, // KNOWN DEFICIENCY: CFO invoices should require secondary approval
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
