import type { Invoice } from '../invoice/InvoiceProcessor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

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

export class InvoiceValidator {
  private readonly seenInvoices = new Set<string>();

  validate(invoice: Invoice): ValidationResult {
    const errors: string[] = [];

    // Basic type validation
    if (!invoice.id || typeof invoice.id !== 'string') {
      errors.push('Invoice ID is required');
    }

    if (!invoice.vendor || typeof invoice.vendor !== 'string') {
      errors.push('Vendor name is required');
    }

    if (typeof invoice.amount !== 'number' || Number.isNaN(invoice.amount)) {
      errors.push('Invoice amount must be a number');
    }

    if (!invoice.submittedBy) {
      errors.push('Submitted by field is required');
    }

    if (invoice.vendor && !KNOWN_VENDORS.includes(invoice.vendor)) {
      errors.push(`INVALID_VENDOR: Unknown vendor ${invoice.vendor}`);
    }

    const invoiceKey = `${invoice.vendor}:${invoice.id}`;
    if (invoice.id && invoice.vendor && this.seenInvoices.has(invoiceKey)) {
      errors.push('DUPLICATE_INVOICE: Invoice has already been submitted');
    }

    if (typeof invoice.amount === 'number' && invoice.amount > 100000 && !invoice.poNumber) {
      errors.push('MISSING_PO: Purchase order is required above ₹1,00,000');
    }

    if (typeof invoice.amount === 'number' && invoice.amount <= 0) {
      errors.push('INVALID_AMOUNT: Amount must be greater than zero');
    }

    if (errors.length === 0) {
      this.seenInvoices.add(invoiceKey);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  reset(): void {
    this.seenInvoices.clear();
  }
}

export const invoiceValidator = new InvoiceValidator();
