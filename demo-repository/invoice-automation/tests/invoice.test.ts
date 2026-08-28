import { describe, it, expect } from 'vitest';
import { processInvoice, type Invoice } from '../src/invoice/InvoiceProcessor';
import { invoiceValidator } from '../src/validation/InvoiceValidator';

// ─────────────────────────────────────────────────────────────────────────────
// BASELINE TESTS — These pass before Bob runs
// ─────────────────────────────────────────────────────────────────────────────
describe('Invoice Processing — Baseline (threshold from rules.json)', () => {
  const baseInvoice: Invoice = {
    id: 'inv-baseline-001',
    vendor: 'Acme Corp',
    amount: 200000,
    submittedBy: 'test-user',
  };

  it('routes invoice below threshold to Finance Manager', () => {
    const rulesPath = require('path').join(__dirname, '../src/config/rules.json');
    const rules = JSON.parse(require('fs').readFileSync(rulesPath, 'utf-8'));
    const belowThreshold = rules.approvalThreshold - 50000;

    const result = processInvoice({ ...baseInvoice, amount: belowThreshold });
    expect(result.assignTo).toBe('Finance Manager');
    expect(result.invoiceId).toBe(baseInvoice.id);
  });

  it('routes invoice at or above threshold to CFO', () => {
    const rulesPath = require('path').join(__dirname, '../src/config/rules.json');
    const rules = JSON.parse(require('fs').readFileSync(rulesPath, 'utf-8'));
    const atThreshold = rules.approvalThreshold;

    const result = processInvoice({ ...baseInvoice, amount: atThreshold });
    expect(result.assignTo).toBe('CFO');
  });
});

describe('Invoice Validation — Baseline', () => {
  it('accepts a valid invoice', () => {
    const result = invoiceValidator.validate({
      id: 'inv-001',
      vendor: 'Acme Corp',
      amount: 100000,
      submittedBy: 'finance-team',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invoice with missing ID', () => {
    const result = invoiceValidator.validate({
      id: '',
      vendor: 'Acme Corp',
      amount: 100000,
      submittedBy: 'finance-team',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('ID'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPTANCE TESTS — Bob must implement these (currently todo)
// These acceptance criteria come directly from the automation blueprint.
// ─────────────────────────────────────────────────────────────────────────────
describe('Acceptance Criteria — Bob Implementation Required', () => {
  // Routing tests — threshold driven by rules.json (NOT hardcoded)
  it.todo('routes ₹2,00,000 invoice to Finance Manager (reads threshold from rules.json)');
  it.todo('routes ₹8,00,000 invoice to CFO when threshold is ₹5,00,000 (reads threshold from rules.json)');
  it.todo('routes ₹8,00,000 invoice to Finance Manager when threshold is ₹10,00,000 (reads threshold from rules.json)');
  it.todo('routes ₹12,00,000 invoice to CFO when threshold is ₹10,00,000 (reads threshold from rules.json)');

  // Vendor validation
  it.todo('rejects invoice from unknown vendor with INVALID_VENDOR error');
  it.todo('accepts invoice from known vendor Tata Consultancy Services');
  it.todo('accepts invoice from known vendor Infosys');

  // Duplicate detection
  it.todo('rejects second submission of same invoice ID with DUPLICATE_INVOICE error');
  it.todo('accepts same invoice ID from different vendor as a new invoice');

  // PO validation
  it.todo('rejects invoice above ₹1,00,000 without PO number with MISSING_PO error');
  it.todo('accepts invoice above ₹1,00,000 with valid PO number');
  it.todo('accepts invoice below ₹1,00,000 without PO number');

  // Amount validation
  it.todo('rejects invoice with negative amount');
  it.todo('rejects invoice with zero amount');

  // Audit trail
  it.todo('generates an audit entry for every approved invoice');
  it.todo('includes vendor, amount, and assignee in audit entry');

  // CFO secondary approval
  it.todo('marks CFO-routed invoices as requiresSecondaryApproval = true');
  it.todo('Finance Manager invoices do not require secondary approval');
});
