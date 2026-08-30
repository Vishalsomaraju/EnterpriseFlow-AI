# Invoice Automation

This is the target repository for the EnterpriseFlow and IBM
Bob demo. It models a legacy invoice approval workflow with separate
validation, processing, routing, and approval modules.

## Approval rule

The approval policy is stored in `src/config/rules.json` and loaded at runtime:

- `amount >= 1,000,000` routes to **CFO** (secondary approval required)
- `amount < 1,000,000` routes to **Finance Manager**

The CFO route requires secondary approval. Approval decisions produce an
in-memory audit entry containing the invoice, vendor, amount, assignee, and
timestamp.

## Run

```bash
npm install
npm run build
npm test
```

The executable test suite covers valid and invalid vendors, duplicate
invoices, purchase orders, low and high values, routing, approval, and audit
behavior. The repository intentionally has no required `it.todo` tests.

## Structure

```text
src/
  approval/ApprovalGate.ts
  config/rules.json
  invoice/InvoiceProcessor.ts
  routing/WorkflowRouter.ts
  validation/InvoiceValidator.ts
tests/invoice.test.ts
```
