# Engineering Instructions

## Objective
Implement the invoice approval workflow represented by the EnterpriseFlow blueprint. Preserve the existing TypeScript module boundaries and make the real repository compile and pass its tests.

## Repository and build identity
- Repository: `E:\EnterpriseFlow\demo-repository\invoice-automation`
- Build: `c21b51b9-4916-4a4c-b438-778b9e5cc536`
- Workflow version: `5c91bc9a-5fff-4ad7-89e3-2dc81aa450e2`
- Baseline commit: `23ab8050c03b53c836da88fcbd0c293cefb8fda9`
- Expected build command: `npm run build`
- Expected test command: `npm test`

## Rule context
- Rule ID: `2b7b77a2-3ef8-4abf-9366-3eae377595ac-RULE-1_v2`
- Condition: `amount >= 1000000`
- Threshold: `1000000 INR`

## Required implementation
1. Analyze the baseline before editing.
2. Implement the affected modules from the implementation plan.
3. Keep approval rules in configuration/rule-engine code, not UI or controllers.
4. Add or update executable boundary tests.
5. Update relevant documentation.
6. Run `npm run build` and `npm test`.
7. Capture the real diff and submit evidence using the endpoints in `BOB.md`.

## Security requirements
- Validate external input and business-rule boundaries.
- Do not use `eval` or execute user-controlled commands.
- Do not add credentials or secrets.
- Preserve an auditable record of approval decisions.

## Blueprint
- Invoice Received (START)
- Vendor Validation (INTERMEDIATE)
- Duplicate Check (INTERMEDIATE)
- PO Matching (INTERMEDIATE)
- Approval Routing (INTERMEDIATE)
- ERP Update (INTERMEDIATE)
- Audit Log (INTERMEDIATE)
- Amount Verification (DECISION)
