# IBM Bob Build Handoff

This file is a handoff package for the actual IBM Bob engineering session. EnterpriseFlow does not write application code or simulate Bob activity.

## Build identity
- Build: `c21b51b9-4916-4a4c-b438-778b9e5cc536`
- Workflow version: `5c91bc9a-5fff-4ad7-89e3-2dc81aa450e2`
- Blueprint: `2b584048-2b98-44f2-8dca-3f6c606dc1b8`
- Bob session: `bob-sess-c21b51b9-4916-4a4c-b438-778b9e5cc536`
- Repository: `E:\EnterpriseFlow\demo-repository\invoice-automation`
- Baseline commit: `23ab8050c03b53c836da88fcbd0c293cefb8fda9`
- Workspace: `E:\EnterpriseFlow\bob-workspace\builds\c21b51b9-4916-4a4c-b438-778b9e5cc536`

## Bob execution
Open the repository in the supported IBM Bob IDE/local-agent environment. Read `AGENTS.md` and `plans/implementation-plan.md`, then perform the analysis, planning, implementation, testing, and documentation work in the repository itself.

Do not report a stage until it actually happened. Do not submit fabricated activity, plans, diffs, test results, or documentation. The repository must remain the source of truth.

## Evidence endpoints
- Events: POST `http://localhost:3001/api/v1/builds/c21b51b9-4916-4a4c-b438-778b9e5cc536/bob/events`
- Plan: POST `http://localhost:3001/api/v1/builds/c21b51b9-4916-4a4c-b438-778b9e5cc536/bob/plan`
- Changes: POST `http://localhost:3001/api/v1/builds/c21b51b9-4916-4a4c-b438-778b9e5cc536/bob/changes`
- Tests: POST `http://localhost:3001/api/v1/builds/c21b51b9-4916-4a4c-b438-778b9e5cc536/bob/tests`
- Documentation: POST `http://localhost:3001/api/v1/builds/c21b51b9-4916-4a4c-b438-778b9e5cc536/bob/documentation`

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
