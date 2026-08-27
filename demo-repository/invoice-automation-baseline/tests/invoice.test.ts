import { expect, test, describe } from 'vitest';
import { processInvoice, Invoice } from '../src/engine';

describe('Invoice Engine', () => {
  test('vendor validation requires vendorId', () => {
    const valid: Invoice = { id: '1', vendorId: 'V1', amount: 100, hasPO: true };
    const invalid: Invoice = { id: '2', vendorId: '', amount: 100, hasPO: true };
    
    expect(processInvoice(valid, 'VendorValidation')).toBe('DuplicateCheck');
    expect(processInvoice(invalid, 'VendorValidation')).toBe('Rejected');
  });

  test('duplicate detection rejects duplicates', () => {
    const valid: Invoice = { id: '1', vendorId: 'V1', amount: 100, hasPO: true, isDuplicate: false };
    const dup: Invoice = { id: '2', vendorId: 'V1', amount: 100, hasPO: true, isDuplicate: true };
    
    expect(processInvoice(valid, 'DuplicateCheck')).toBe('POMatching');
    expect(processInvoice(dup, 'DuplicateCheck')).toBe('Rejected');
  });

  test('PO matching routes to manual review if missing PO', () => {
    const valid: Invoice = { id: '1', vendorId: 'V1', amount: 100, hasPO: true };
    const missing: Invoice = { id: '2', vendorId: 'V1', amount: 100, hasPO: false };
    
    expect(processInvoice(valid, 'POMatching')).toBe('AmountVerification');
    expect(processInvoice(missing, 'POMatching')).toBe('ManualReview');
  });

  test('amount verification routes to Finance Manager if < 500k', () => {
    const inv: Invoice = { id: '1', vendorId: 'V1', amount: 499999, hasPO: true };
    expect(processInvoice(inv, 'AmountVerification')).toBe('FinanceManager');
  });

  test('amount verification routes to CFO if >= 500k', () => {
    const inv: Invoice = { id: '1', vendorId: 'V1', amount: 500000, hasPO: true };
    expect(processInvoice(inv, 'AmountVerification')).toBe('CFO');
  });

  test('approval routes to audit logging', () => {
    const inv: Invoice = { id: '1', vendorId: 'V1', amount: 500000, hasPO: true };
    expect(processInvoice(inv, 'CFO')).toBe('AuditLog');
    expect(processInvoice(inv, 'FinanceManager')).toBe('AuditLog');
  });
});
