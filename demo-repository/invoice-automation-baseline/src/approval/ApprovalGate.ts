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

export class ApprovalGate {
  private readonly auditEntries: AuditEntry[] = [];

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

    this.auditEntries.push(auditEntry);

    return {
      approved: true,
      approvedBy: result.assignTo,
      reason: result.reason,
      escalatedTo: undefined,
      auditEntry,
    };
  }

  getAuditEntries(): AuditEntry[] {
    return [...this.auditEntries];
  }

  reset(): void {
    this.auditEntries.length = 0;
  }
}

export const approvalGate = new ApprovalGate();
