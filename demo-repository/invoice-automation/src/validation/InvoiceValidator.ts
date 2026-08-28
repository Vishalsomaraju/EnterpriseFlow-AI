import type { Invoice } from '../invoice/InvoiceProcessor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// KNOWN DEFICIENCY: This list is hardcoded — Bob should load from a config/database
const KNOWN_VENDORS = [
  'Acme Corp',
  'Tata Consultancy Services',
  'Infosys',
  'Wipro',
  'HCL Technologies',
  'Tech Mahindra',
  'Cognizant',
  'Capgemini',
];

/**
 * BASELINE InvoiceValidator — deliberately imperfect.
 *
 * Known deficiencies Bob must fix:
 * 1. Vendor validation exists but uses a hardcoded list (should be configurable)
 * 2. No duplicate invoice ID detection (seen IDs not tracked)
 * 3. No PO number validation for invoices above ₹1,00,000
 * 4. Amount range not validated (negative amounts accepted)
 * 5. No date validation (backdated invoices accepted)
 */
export class InvoiceValidator {
  validate(invoice: Invoice): ValidationResult {
    const errors: string[] = [];

    // Basic type validation
    if (!invoice.id || typeof invoice.id !== 'string') {
      errors.push('Invoice ID is required');
    }

    if (!invoice.vendor || typeof invoice.vendor !== 'string') {
      errors.push('Vendor name is required');
    }

    if (typeof invoice.amount !== 'number') {
      errors.push('Invoice amount must be a number');
    }

    if (!invoice.submittedBy) {
      errors.push('Submitted by field is required');
    }

    // KNOWN DEFICIENCY: Vendor validation is present but incomplete
    // It doesn't reject unknown vendors — it only warns
    if (invoice.vendor && !KNOWN_VENDORS.includes(invoice.vendor)) {
      // KNOWN DEFICIENCY: Should return an error, not just push a warning-level message
      // Bob should change this to: errors.push(`Unknown vendor: ${invoice.vendor}`)
      console.warn(`[WARN] Unrecognized vendor: ${invoice.vendor}`);
    }

    // KNOWN DEFICIENCY: No duplicate detection — seenIds not implemented
    // Bob should add: if (this.seenIds.has(invoice.id)) errors.push('Duplicate invoice ID')

    // KNOWN DEFICIENCY: No PO validation for large invoices
    // Bob should add: if (invoice.amount > 100000 && !invoice.poNumber) errors.push('PO required')

    // KNOWN DEFICIENCY: Negative amounts not rejected
    // Bob should add: if (invoice.amount <= 0) errors.push('Amount must be positive')

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const invoiceValidator = new InvoiceValidator();
