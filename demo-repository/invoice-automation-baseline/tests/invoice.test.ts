import { beforeEach, describe, expect, it } from 'vitest';
import { ApprovalGate } from '../src/approval/ApprovalGate';
import { processInvoice, type Invoice } from '../src/invoice/InvoiceProcessor';
import { WorkflowRouter } from '../src/routing/WorkflowRouter';
import { InvoiceValidator } from '../src/validation/InvoiceValidator';

const invoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'inv-001',
  vendor: 'Acme Corp',
  amount: 100000,
  submittedBy: 'finance-team',
  ...overrides,
});

describe('Invoice automation baseline', () => {
  let validator: InvoiceValidator;
  let approvalGate: ApprovalGate;

  beforeEach(() => {
    validator = new InvoiceValidator();
    approvalGate = new ApprovalGate();
  });

  describe('routing', () => {
    it('routes a low-value invoice to Finance Manager', () => {
      const result = processInvoice(invoice({ amount: 200000 }));
      expect(result.assignTo).toBe('Finance Manager');
      expect(result.invoiceId).toBe('inv-001');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('routes an invoice at the ₹5,00,000 threshold to CFO', () => {
      const result = processInvoice(invoice({ amount: 500000 }));
      expect(result.assignTo).toBe('CFO');
      expect(result.requiresSecondaryApproval).toBe(true);
    });

    it('routes a high-value invoice through the workflow router', () => {
      expect(new WorkflowRouter().route(invoice({ amount: 800000 }))).toBe('CFO');
    });
  });

  describe('validation', () => {
    it('accepts a valid vendor and invoice', () => {
      expect(validator.validate(invoice()).valid).toBe(true);
    });

    it.each(['Tata Consultancy Services', 'Infosys'])(
      'accepts known vendor %s',
      (vendor) => {
        expect(validator.validate(invoice({ id: vendor, vendor })).valid).toBe(true);
      },
    );

    it('rejects an unknown vendor with INVALID_VENDOR', () => {
      const result = validator.validate(invoice({ vendor: 'Unknown Supplier' }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('INVALID_VENDOR'))).toBe(true);
    });

    it('rejects a duplicate invoice for the same vendor', () => {
      validator.validate(invoice());
      const result = validator.validate(invoice());
      expect(result.errors.some((error) => error.includes('DUPLICATE_INVOICE'))).toBe(true);
    });

    it('accepts the same invoice ID from a different vendor', () => {
      validator.validate(invoice());
      expect(validator.validate(invoice({ vendor: 'Infosys' })).valid).toBe(true);
    });

    it('requires a purchase order above ₹1,00,000', () => {
      const result = validator.validate(invoice({ amount: 100001 }));
      expect(result.errors.some((error) => error.includes('MISSING_PO'))).toBe(true);
    });

    it('accepts a purchase order for an invoice above ₹1,00,000', () => {
      expect(validator.validate(invoice({ amount: 100001, poNumber: 'PO-1001' })).valid).toBe(true);
    });

    it('allows an invoice at or below ₹1,00,000 without a purchase order', () => {
      expect(validator.validate(invoice({ amount: 100000 })).valid).toBe(true);
    });

    it.each([0, -1])('rejects an amount of %s', (amount) => {
      const result = validator.validate(invoice({ id: `amount-${amount}`, amount }));
      expect(result.errors.some((error) => error.includes('INVALID_AMOUNT'))).toBe(true);
    });
  });

  describe('approval audit', () => {
    it('records vendor, amount, assignee, and timestamp for every decision', () => {
      const currentInvoice = invoice({ id: 'audit-001', amount: 500000 });
      const result = processInvoice(currentInvoice);
      const decision = approvalGate.approve(result, currentInvoice);

      expect(decision.auditEntry.invoiceId).toBe('audit-001');
      expect(decision.auditEntry.actor).toBe('CFO');
      expect(decision.auditEntry.timestamp).toBeInstanceOf(Date);
      expect(decision.auditEntry.metadata).toMatchObject({
        vendor: 'Acme Corp',
        amount: 500000,
        assignTo: 'CFO',
      });
      expect(approvalGate.getAuditEntries()).toHaveLength(1);
    });

    it('requires secondary approval for CFO invoices', () => {
      expect(processInvoice(invoice({ amount: 500000 })).requiresSecondaryApproval).toBe(true);
    });

    it('does not require secondary approval for Finance Manager invoices', () => {
      expect(processInvoice(invoice({ amount: 499999 })).requiresSecondaryApproval).toBe(false);
    });
  });
});
