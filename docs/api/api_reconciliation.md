# API Reconciliation Matrix

This matrix reconciles the frontend service requirements against the backend API contracts and schemas. Every frontend API call must map to exactly one backend contract.

| Frontend Hook / Call | Required Operation | Backend Endpoint Contract | Schema Required | Status | Notes |
|----------------------|--------------------|---------------------------|-----------------|--------|-------|
| `getProjects()` | List projects | `GET /projects` | `projects` | ✓ Matched | Defined in `API_Contract.md` |
| `createProject(name)` | Create a project | `POST /projects` | `projects` | ✓ Matched | Defined in `API_Contract.md` |
| `extractDocument(id)` | Trigger extraction | `POST /documents/:id/extract` | `jobs`, `documents` | ⚠ Missing DB | Contract exists, but `jobs` table missing in DB schema |
| `getJob(id)` | Check async job | `GET /jobs/:id` | `jobs` | ⚠ Missing DB | Contract exists, but `jobs` table missing in DB schema |
| `getWorkflowGraph(id)` | Get node/edge graph | `GET /workflows/:id/graph`| `workflow_nodes`, `edges` | ✓ Matched | Edges need clear DB rep (or derived from nodes) |
| `implementBlueprint(id)` | Trigger Bob build | `POST /blueprints/:id/implement`| `jobs`, `builds` | ⚠ Missing DB | `jobs` missing |
| `getBuildChanges(id)` | Get Bob's git diff | `GET /builds/:id/changes` | `builds`, artifacts | ✓ Matched | Defined in `API_Contract.md` |
| `runTests(buildId)` | Trigger test suite | `POST /builds/:id/test` | `jobs`, `test_runs` | ⚠ Missing DB | `jobs` missing |
| `runSecurityScan(id)`| Trigger SecurePush | `POST /builds/:id/security-scan`| `jobs`, `security_scans`| ⚠ Missing DB | `jobs` missing |
| `analyzeRuleImpact(id)`| Calculate rule impact| `POST /rules/:id/impact` | `rule_dependencies` | ✓ Matched | Defined in `API_Contract.md`. Needs ImpactService. |
| `approveReview(id)` | Approve build review | `POST /reviews/:id/approve`| `reviews` | ✓ Matched | Defined in `API_Contract.md` |
| `rejectReview(id)` | Reject build review | `POST /reviews/:id/reject` | `reviews` | ✓ Matched | Defined in `API_Contract.md` |
| `getDashboardStats()` | Dashboard KPIs | `GET /stats/dashboard` | Aggregates | ⚠ Missing API | Added to `API_GAPS.md` |
| `getActivity()` | Timeline events | `GET /activity` | `activity_events` | ⚠ Missing DB/API| Added to `API_GAPS.md`. DB schema missing `activity_events` |
| `changeRule(id)` | Update business rule | `PATCH /rules/:id` | `business_rules` | ⚠ Missing API | Crucial for demo flow. Added to `API_GAPS.md` |
| `getWorkflowExecution(id)`| Live workflow state | `GET /workflows/:id/execution`| `workflow_executions` | ⚠ Missing DB/API| Added to `API_GAPS.md`. DB missing `workflow_executions` |
| `getDocumentation(id)` | Fetch generated docs | `GET /workflows/:id/documentation`| Artifacts / Docs | ⚠ Missing API | Added to `API_GAPS.md` |
| `getBuildOverview(id)` | Fetch build stages | `GET /builds/:id` | `builds` | ⚠ Missing API | Added to `API_GAPS.md` |
| `getBobActivity(id)` | Fetch Bob logs/events| `GET /builds/:id/bob-activity`| `activity_events` | ⚠ Missing DB/API| Added to `API_GAPS.md`. Needed for Bob UI |
| `getBobSubagents(id)` | Fetch Bob subagents | `GET /builds/:id/subagents`| `jobs` or subagent table| ⚠ Missing API | Added to `API_GAPS.md` |
| `getCodeDiff(id)` | Fetch raw diff patch | `GET /builds/:id/diff` or similar| Artifacts | ✗ Conflicting | `API_Contract.md` has `/changes` but frontend expects `getCodeDiff`. Reconcile to `/changes`. |
| `getSecurityResult(id)`| Fetch SecurePush result| `GET /builds/:id/security`| `security_scans` | ⚠ Missing API | Added to `API_GAPS.md` |
| `getTests(workflowId)` | Fetch test run results| `GET /builds/:id/tests` | `test_runs` | ⚠ Missing API | Added to `API_GAPS.md`. Note frontend parameter is workflowId vs buildId. Must fix on one side. |
| `getReviewSummary(id)` | Fetch review KPIs | `GET /workflows/:id/review-summary`| Aggregates | ⚠ Missing API | Added to `API_GAPS.md` |

## Reconciliation Action Items
1. **Database Schema Enhancements**: Add `jobs`, `activity_events`, and `workflow_executions` tables.
2. **Endpoint Standardization**: Ensure all gaps defined in `API_GAPS.md` are scaffolded into the backend with proper route controllers.
3. **Frontend Drift Fixes**: Adjust the frontend mock/service to strictly use the agreed `buildId` vs `workflowId` parameters where appropriately identified above (e.g. `getTests` should likely use `buildId` like other build artifacts).
