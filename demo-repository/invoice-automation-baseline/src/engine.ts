export interface Invoice {
  id: string;
  vendorId: string;
  amount: number;
  hasPO: boolean;
  poNumber?: string;
  isDuplicate?: boolean;
}

export type RoutingResult =
  | 'VendorValidation'
  | 'DuplicateCheck'
  | 'POMatching'
  | 'AmountVerification'
  | 'FinanceManager'
  | 'CFO'
  | 'ManualReview'
  | 'Rejected'
  | 'Approved'
  | 'AuditLog';

export function processInvoice(invoice: Invoice, step: RoutingResult): RoutingResult {
  switch (step) {
    case 'VendorValidation':
      if (!invoice.vendorId) return 'Rejected';
      return 'DuplicateCheck';

    case 'DuplicateCheck':
      if (invoice.isDuplicate) return 'Rejected';
      return 'POMatching';

    case 'POMatching':
      if (!invoice.hasPO) return 'ManualReview';
      return 'AmountVerification';

    case 'AmountVerification':
      if (invoice.amount < 500000) return 'FinanceManager';
      return 'CFO';

    case 'FinanceManager':
    case 'CFO':
      return 'AuditLog';

    case 'ManualReview':
      // Manual review might resolve PO issue and send to amount verification
      return 'AmountVerification';

    case 'AuditLog':
      return 'Approved';

    default:
      return 'Rejected';
  }
}
