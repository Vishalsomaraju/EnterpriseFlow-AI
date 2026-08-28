<!-- Build ID: 51a871f7-9e0d-4ed0-bb25-f4401da5d2c5 -->
# Project README

# Invoice Automation — Baseline

> **This is the deliberately imperfect baseline implementation.**
> It exists as the starting point for IBM Bob's implementation task.

## The Problem

Acme Corp's invoice approval process has grown organically over years. The current codebase works for simple cases but has **known deficiencies** that create risk and compliance gaps.

## Known Deficiencies

| # | Deficiency | File | Risk |
|---|---|---|---|
| 1 | No vendor validation — unknown vendors accepted | `src/validation/InvoiceValidator.ts` | HIGH |
| 2 | No duplicate invoice detection | `src/validation/InvoiceValidator.ts` | HIGH |
| 3 | No PO validation for large invoices | `src/validation/InvoiceValidator.ts` | MEDIUM |
| 4 | Negative/zero amounts accepted | `src/validation/InvoiceValidator.ts` | MEDIUM |
| 5 | Audit decisions logged to console only | `src/approval/ApprovalGate.ts` | HIGH |
| 6 | CFO invoices don't require secondary approval | `src/approval/ApprovalGate.ts` | HIGH |
| 7 | WorkflowRouter ignores dynamic rules | `src/routing/WorkflowRouter.ts` | MEDIUM |

## Business Rule

The approval threshold is configured in `src/config/rules.json`.

**Current threshold:** `₹5,00,000`

Invoices at or above the threshold → **CFO**
Invoices below the threshold → **Finance Manager**

> ⚠️ The threshold value in `rules.json` is the **single source of truth**.
> Source code must read it at runtime — never hardcode the threshold.

## Running Tests

```bash
npm install
npm test
```

**Baseline test results:** 4 passing, 17 pending (todo)

Bob's task is to implement all 17 pending acceptance criteria.

## Structure

```
invoice-automation/
├── src/
│   ├── config/
│   │   └── rules.json          ← business rules (single source of truth)
│   ├── invoice/
│   │   └── InvoiceProcessor.ts ← core routing logic
│   ├── approval/
│   │   └── ApprovalGate.ts     ← approval decisions + audit
│   ├── routing/
│   │   └── WorkflowRouter.ts   ← dynamic rule evaluation (incomplete)
│   └── validation/
│       └── InvoiceValidator.ts ← input validation (incomplete)
└── tests/
    └── invoice.test.ts         ← baseline tests + acceptance stubs
```
