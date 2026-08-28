# IBM Bob — Engineering Instructions

## Mission
Implement the full acceptance criteria for the Acme Corp Invoice Automation workflow.
The repository has a working baseline with **6 known deficiencies** — your job is to fix them all.

## Repository
```
../demo-repository/invoice-automation/
├── src/
│   ├── config/rules.json          ← SINGLE SOURCE OF TRUTH — read at runtime
│   ├── invoice/InvoiceProcessor.ts
│   ├── approval/ApprovalGate.ts
│   ├── routing/WorkflowRouter.ts
│   └── validation/InvoiceValidator.ts
└── tests/
    └── invoice.test.ts            ← implement the it.todo() stubs
```

## CRITICAL: Single Source of Truth for Business Rules
The approval threshold is **₹10,00,000** (1000000).
It lives in `src/config/rules.json → approvalThreshold`.

**You MUST:**
- Read the threshold from `rules.json` at runtime
- NEVER hardcode the threshold value in source code
- When writing tests, load the threshold from `rules.json` too

## Workflow Blueprint
- **Submit Invoice** (START)
- **Finance Manager** (INTERMEDIATE)
- **CFO** (TERMINAL)

## Acceptance Criteria — ALL must pass as Vitest tests

### Routing (reads from rules.json)
- invoice amount ₹2,00,000 → Finance Manager (below threshold ₹10,00,000)
- invoice amount ₹8,00,000 → CFO (at or above threshold ₹10,00,000)
- threshold change must immediately affect routing (because code reads rules.json at runtime)

### Vendor Validation
- invoice from unknown vendor → rejected with error "INVALID_VENDOR: <vendor>"
- invoice from known vendor (e.g. Acme Corp, TCS, Infosys) → accepted

### Duplicate Detection
- second submission of same invoice ID → rejected with "DUPLICATE_INVOICE: <id>"
- same ID from different vendors is still a duplicate

### PO Validation
- invoice amount > ₹1,00,000 without PO number → rejected with "MISSING_PO"
- invoice amount > ₹1,00,000 with valid PO number → accepted
- invoice amount ≤ ₹1,00,000 without PO → accepted

### Amount Validation
- amount ≤ 0 → rejected with "INVALID_AMOUNT"

### Audit Trail
- every approval decision must produce an AuditEntry with: invoiceId, actor, timestamp, amount
- CFO-routed invoices must have requiresSecondaryApproval = true

## Implementation Guidelines
1. Fix all KNOWN DEFICIENCY comments in the source files
2. Implement all `it.todo()` stubs in `tests/invoice.test.ts`
3. Run `npm test` — all tests (including the new ones) must pass
4. After changes: `git add -A && git commit -m "bob: implement invoice automation acceptance criteria"`
5. Submit evidence via the Evidence Submission API in BOB.md

## Security Constraints
- Validate all inputs (type + business rules)
- No eval(), no exec() with user-controlled input
- No hardcoded credentials
- All decisions must produce an immutable audit entry

## Build ID for Evidence: build-1787912646223
## Bob Session ID for Evidence: bob-sess-1787912646223
