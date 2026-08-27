"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processInvoice = processInvoice;
function processInvoice(invoice, step) {
    switch (step) {
        case 'VendorValidation':
            if (!invoice.vendorId)
                return 'Rejected';
            return 'DuplicateCheck';
        case 'DuplicateCheck':
            if (invoice.isDuplicate)
                return 'Rejected';
            return 'POMatching';
        case 'POMatching':
            if (!invoice.hasPO)
                return 'ManualReview';
            return 'AmountVerification';
        case 'AmountVerification':
            if (invoice.amount < 500000)
                return 'FinanceManager';
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
