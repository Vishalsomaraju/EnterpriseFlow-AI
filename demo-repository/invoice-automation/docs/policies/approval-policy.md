# Invoice Approval Policy

## Overview

This document defines the current approval routing policy for the Acme Corp Invoice Automation system.

## Approval Threshold Rule

**Rule ID:** `invoice-approval-threshold-v2`
**Effective from:** version 2
**Currency:** INR (Indian Rupee)

| Condition | Routing | Secondary Approval Required |
|-----------|---------|----------------------------|
| `amount >= ₹10,00,000` | CFO | Yes |
| `amount < ₹10,00,000` | Finance Manager | No |

## Routing Logic

The threshold is stored in `src/config/rules.json` and loaded at runtime by the invoice processing pipeline. Business rule evaluation is performed deterministically — no hardcoded thresholds exist in controllers.

```
amount >= 1,000,000 INR  →  CFO  (requiresSecondaryApproval: true)
amount <  1,000,000 INR  →  Finance Manager  (requiresSecondaryApproval: false)
```

## Change History

| Version | Threshold | Changed By | Reason |
|---------|-----------|------------|--------|
| v1 | ₹5,00,000 (500,000) | — | Initial baseline policy |
| v2 | ₹10,00,000 (1,000,000) | IBM Bob / EnterpriseFlow | Manager Approval threshold raised per governance review |

## Related Rules

- **Vendor Validation**: All invoices must have a known vendor (see `InvoiceValidator.ts`).
- **Purchase Order**: Invoices above ₹1,00,000 (100,000) require a Purchase Order number.
- **Duplicate Detection**: Invoices with the same vendor and ID are rejected.
