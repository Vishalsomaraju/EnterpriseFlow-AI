import type { Invoice, ProcessingResult } from '../invoice/InvoiceProcessor';

export interface ApprovalDecision {
  approved: boolean;
  approvedBy: string;
  reason: string;
  escalatedTo?: string;
  auditEntry: AuditEntry;
}

export interface AuditEntry {
  invoiceId: string;
  action: string;
  actor: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * BASELINE ApprovalGate — deliberately imperfect.
 *
 * Known deficiencies Bob must fix:
 * 1. No escalation path when Finance Manager is unavailable
 * 2. No secondary approval requirement for CFO-routed invoices
 * 3. Audit entries not persisted anywhere (logged to console only)
 * 4. No time-based SLA tracking
 */
export class ApprovalGate {
  approve(result: ProcessingResult, invoice: Invoice): ApprovalDecision {
    const auditEntry: AuditEntry = {
      invoiceId: invoice.id,
      action: 'APPROVAL_DECISION',
      actor: result.assignTo,
      timestamp: new Date(),
      metadata: {
        amount: invoice.amount,
        vendor: invoice.vendor,
        assignTo: result.assignTo,
        reason: result.reason,
      },
    };

    // KNOWN DEFICIENCY: Console.log is not a real audit log
    console.log(`[AUDIT] Invoice ${invoice.id} routed to ${result.assignTo}`, auditEntry);

    return {
      approved: true,
      approvedBy: result.assignTo,
      reason: result.reason,
      // KNOWN DEFICIENCY: No escalation logic
      escalatedTo: undefined,
      auditEntry,
    };
  }
}

export const approvalGate = new ApprovalGate();
