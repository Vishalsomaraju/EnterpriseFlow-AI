# EnterpriseFlow — Complete Work Breakdown

## Workstream Overview

| Workstream | What they need to build |
| :--- | :--- |
| **1. Frontend** | All UI/pages, graphs, diffs, dashboards, API integration |
| **2. Backend** | REST APIs, orchestration, auth, validation, jobs/events |
| **3. Workflow Engine** | Canonical workflow graph, rules, dependencies, impact analysis |
| **4. Database** | PostgreSQL schema, migrations, relationships, indexes |
| **5. IBM Bob** | Real repository analysis → implementation → tests → fixes + evidence |
| **6. SecurePush/Security** | Diff scanning → findings → risk → PASS/WARN/BLOCK |
| **7. Demo/Docs/Infra** | Legacy demo repo, reset scripts, Docker, documentation, video |

---

## 1. Frontend — UI

### Pages
- Landing
- Login / Project selection
- Dashboard
- Project Overview
- Document Upload
- Extraction Review
- Workflow Graph
- Business Rules
- Automation Blueprint
- Implementation Plan
- Bob Build / Activity
- Code Changes / Diff
- Test Results
- Security Scan
- Human Review
- Impact Analysis
- Change Details
- Audit / Activity History
- Settings
- Profile

### Major components
- Navbar & Sidebar
- Project switcher
- Status badges
- Workflow graph
- Rule cards
- Blueprint viewer
- Activity timeline
- Bob activity panel
- Code diff viewer
- Test result table
- Security findings & Risk score
- Review panel (Approve / Reject / Request Changes)
- Impact tree & Dependency graph
- Change summary
- Notifications & Loading/error/empty states

### Frontend also needs
- API client
- WebSocket/SSE client
- TypeScript types matching API contracts
- Authentication/session handling
- Responsive layout
- Demo data/reset handling

---

## 2. Backend — APIs + orchestration

### Project APIs
- `GET    /projects`
- `POST   /projects`
- `GET    /projects/:id`
- `PUT    /projects/:id`

### Document APIs
- `POST   /projects/:id/documents`
- `GET    /documents/:id`
- `POST   /documents/:id/extract`
- `GET    /jobs/:id`

### Workflow APIs
- `GET    /workflows/:id`
- `GET    /workflows/:id/graph`
- `GET    /workflows/:id/rules`

### Blueprint APIs
- `POST   /workflows/:id/blueprint`
- `GET    /blueprints/:id`

### Implementation/Bob APIs
- `POST   /blueprints/:id/implement`
- `GET    /builds/:id`
- `GET    /builds/:id/changes`

### Testing APIs
- `POST   /builds/:id/test`
- `GET    /test-runs/:id`

### Security APIs
- `POST   /builds/:id/security-scan`
- `GET    /security-scans/:id`

### Rule/Impact APIs
- `PUT    /rules/:id`
- `POST   /rules/:id/impact`
- `GET    /impact/:id`

### Review APIs
- `POST   /builds/:id/review`
- `POST   /reviews/:id/approve`
- `POST   /reviews/:id/reject`
- `POST   /reviews/:id/request-changes`

### Backend infrastructure
- Request validation, error handling, auth
- Database layer & background jobs
- State-machine orchestration
- WebSocket/SSE events
- Logging, audit events, config, and tests

---

## 3. Workflow Engine — the deterministic brain
*This is not the LLM.*

### Build:
- **Workflow model**: Workflow, WorkflowNode, WorkflowEdge, Actor, Trigger, Condition, Dependency.
- **Business Rule Engine**: Rule definition, validation, evaluation, boundary-condition handling, versioning.
- **Blueprint generation**: `WorkflowGraph` → `AutomationBlueprint` → `ImplementationPlan`
- **Dependency engine**: Track `Rule` → `Workflow node` → `Service` → `Code file` → `Test` → `Documentation`

### Impact Engine
Given: *"Approval threshold changed"*
Calculate exactly: Affected workflow nodes, business rules, code, tests, documentation, and services. Explain why each item is affected.

---

## 4. Database — PostgreSQL
Build the schema + migrations for:
- **Core**: users, projects, project_members, documents
- **Workflow**: workflows, workflow_nodes, workflow_edges, workflow_actors
- **Rules**: business_rules, rule_dependencies
- **Implementation**: blueprints, implementation_plans, builds, build_files, code_changes
- **Validation**: test_suites, test_cases, test_runs, test_results, security_scans, security_findings
- **Governance**: reviews, review_comments, audit_events
- **Impact**: impact_analyses, impact_items

Also includes foreign keys, indexes, constraints, migrations, and seed/demo data.

---

## 5. IBM Bob — very important
The Bob team needs to create a real, demonstrable Bob workflow, operating within the `bob-workspace/`.

### Bob tasks
Bob should:
1. Analyze the legacy repository & architecture.
2. Read the generated implementation plan & plan the changes.
3. Modify the actual code.
4. Generate/update tests & run tests.
5. Fix failures & update documentation.
6. Produce the resulting diff/commits.

### Bob evidence
Capture: Bob prompts, Bob plans, Bob-generated changes, Git diffs, Commits, Tests, Validation results, Documentation changes.
*The important story is: EnterpriseFlow determines what needs to change → Bob actually performs the engineering work.*

---

## 6. SecurePush / Security
Build the adapter, not another security product.
Pipeline: `Bob code diff` → `SecurePush` → `Security findings` → `Severity` → `Risk score` → `PASS / WARN / BLOCK`

Need: SecurePush adapter, scan runner, finding parser, severity mapping, risk calculation, frontend security report, backend tests.

---

## 7. Demo Repository
Build the controlled legacy enterprise application in `demo-repository/` containing:
- Realistic invoice/approval workflow & existing business rules
- Legacy code with deliberate technical problems, security issues, missing tests, and doc gaps
- `scripts/`: `setup-demo.sh`, `reset-demo.sh`, `verify-demo.sh` to ensure the entire demo is reproducible.

---

## 8. Infrastructure
Need: Docker, PostgreSQL, Backend, Frontend, Environment variables.
Files: `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md`.
Plus: TypeScript configuration, package management, linting, formatting, testing, basic CI/checks.

---

## The actual dependency between teams
This is the critical path:

```text
                    MASTER PRD
                        │
                        ▼
              SYSTEM ARCHITECTURE
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       DATABASE     WORKFLOW       API CONTRACT
                      ENGINE           │
          │             │              │
          └─────────────┼──────────────┘
                        ▼
                     BACKEND
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           BOB       SECUREPUSH   FRONTEND
             │          │          │
             └──────────┼──────────┘
                        ▼
                 END-TO-END DEMO
```

## Division of Labor (4 People)

- **Person 1 — Frontend**: All pages + components + API integration + graphs/diff/review/impact UI.
- **Person 2 — Backend + DB**: PostgreSQL + migrations + APIs + orchestration + WebSocket/SSE.
- **Person 3 — Workflow/Impact**: Graph + rules + blueprint + dependency engine + impact analysis.
- **Person 4 — Bob + Demo + Security**: Bob workspace + real Bob implementation + demo repository + SecurePush integration + evidence.

*Everyone helps with integration/testing/video at the end.*

**The critical path is:** DB/schema → Workflow Engine → Backend → Bob/SecurePush → Frontend integration → end-to-end demo.
