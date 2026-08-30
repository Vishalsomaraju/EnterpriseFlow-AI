# IBM Bob Build Handoff

This file is a handoff package for the actual IBM Bob engineering session. EnterpriseFlow does not write application code or simulate Bob activity.

## Build identity
- Build: `3c950349-e81e-43e9-84a6-61a203f8a0c1`
- Workflow version: `2b7b77a2-3ef8-4abf-9366-3eae377595ac`
- Blueprint: `76261d90-7c33-4970-b7ff-2a12cae06257`
- Bob session: `bob-sess-3c950349-e81e-43e9-84a6-61a203f8a0c1`
- Repository: `E:\EnterpriseFlow\demo-repository\invoice-automation`
- Baseline commit: `23ab8050c03b53c836da88fcbd0c293cefb8fda9`
- Workspace: `E:\EnterpriseFlow\bob-workspace\builds\3c950349-e81e-43e9-84a6-61a203f8a0c1`

## Bob execution
Open the repository in the supported IBM Bob IDE/local-agent environment. Read `AGENTS.md` and `plans/implementation-plan.md`, then perform the analysis, planning, implementation, testing, and documentation work in the repository itself.

Do not report a stage until it actually happened. Do not submit fabricated activity, plans, diffs, test results, or documentation. The repository must remain the source of truth.

## Evidence endpoints
- Events: POST `http://localhost:3001/api/v1/builds/3c950349-e81e-43e9-84a6-61a203f8a0c1/bob/events`
- Plan: POST `http://localhost:3001/api/v1/builds/3c950349-e81e-43e9-84a6-61a203f8a0c1/bob/plan`
- Changes: POST `http://localhost:3001/api/v1/builds/3c950349-e81e-43e9-84a6-61a203f8a0c1/bob/changes`
- Tests: POST `http://localhost:3001/api/v1/builds/3c950349-e81e-43e9-84a6-61a203f8a0c1/bob/tests`
- Documentation: POST `http://localhost:3001/api/v1/builds/3c950349-e81e-43e9-84a6-61a203f8a0c1/bob/documentation`

Every request must include the exact build ID and Bob session ID above. Changes must be derived from `git diff 23ab8050c03b53c836da88fcbd0c293cefb8fda9..HEAD` or the equivalent working-tree diff, and tests/builds must be run in the repository.

## Blueprint context
- Invoice Received (START)
- Vendor Validation (INTERMEDIATE)
- Duplicate Check (INTERMEDIATE)
- PO Matching (INTERMEDIATE)
- Approval Routing (INTERMEDIATE)
- ERP Update (INTERMEDIATE)
- Audit Log (INTERMEDIATE)
- Amount Verification (DECISION)
