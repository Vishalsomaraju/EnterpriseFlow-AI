# EnterpriseFlow

EnterpriseFlow connects business process documentation to governed, testable, and executable workflow software.

---

## Table of Contents

1. [What is EnterpriseFlow?](#1-what-is-enterpriseflow)
2. [Core Features](#2-core-features)
3. [Semantic Business Impact Analysis](#3-semantic-business-impact-analysis)
4. [Architecture](#4-architecture)
5. [End-to-End Workflow](#5-end-to-end-workflow)
6. [How IBM Bob Was Used](#6-how-ibm-bob-was-used)
7. [IBM Bob Build Lifecycle in EnterpriseFlow](#7-ibm-bob-build-lifecycle-in-enterpriseflow)
8. [Security and Governance](#8-security-and-governance)
9. [Project Structure](#9-project-structure)
10. [Prerequisites](#10-prerequisites)
11. [Installation and Setup](#11-installation-and-setup)
12. [Running Locally](#12-running-locally)
13. [Demo Workflow](#13-demo-workflow)
14. [Testing and Validation](#14-testing-and-validation)
15. [Demo Repository](#15-demo-repository)
16. [Documentation](#16-documentation)
17. [Limitations / Scope](#17-limitations--scope)
18. [Submission / IBM Bob Note](#18-submission--ibm-bob-note)

---

## 1. What is EnterpriseFlow?

### The Problem

Enterprise processes frequently start as Standard Operating Procedures (SOPs) or other business documents. Translating those documents into working software is a manual, error-prone task:

- Developers must read, interpret, and re-implement business intent as code.
- Business rule changes — such as raising an approval threshold from ₹5,00,000 to ₹10,00,000 — appear as simple edits but carry downstream operational, security, and compliance consequences.
- There is no governed connection between the business document that describes a rule and the software that enforces it.
- Changes pass through code review without understanding what business behaviour actually changed.

### The Solution

EnterpriseFlow provides a governed lifecycle that links business documents to executable software through a structured pipeline:

```
SOP / Business Document
  → Workflow Extraction        (AI-assisted: actors, steps, rules, transitions)
  → Workflow Analysis          (structured view of the extracted workflow)
  → Workflow Graph             (state-machine visual graph)
  → Business Rules             (inspectable, versioned rule conditions)
  → Semantic Business Impact Analysis  (deterministic rule-change evaluation)
  → Blueprint                  (structured implementation specification)
  → IBM Bob Build Handoff      (workspace prepared for Bob's engineering session)
  → Code Changes / Evidence    (real repository diff captured)
  → Test Execution             (tests run against the actual repository)
  → Security Validation        (SecurePush static scan on the diff)
  → Human Review Gate          (approve or reject before execution)
  → Workflow Execution         (runtime execution with audit context)
  → Audit Trail                (full event history)
```

EnterpriseFlow is designed to provide a **governed lifecycle**, not just a code generator. At every stage, the system maintains traceability between the business intent and the software implementing it.

---

## 2. Core Features

| Feature | Description |
|---|---|
| **SOP-based workflow creation** | Create workflows by providing a document or starting with a named draft |
| **Workflow extraction** | AI-assisted extraction of actors, steps, decision nodes, rules, and systems from documents |
| **Workflow analysis** | Structured view of the extracted workflow with actors, systems, and bottlenecks |
| **State-machine workflow graph** | Visual node/edge graph rendered with `@xyflow/react` (React Flow) |
| **Business rules** | Inspectable, versioned rule conditions stored per workflow version |
| **Semantic Business Impact Analysis** | Deterministic threshold parser computing delta, affected range, and plain-language business impact for compatible rule changes |
| **Dependency / impact graph** | Visual graph of nodes directly and downstream-affected by a rule change |
| **Rule versioning with optimistic concurrency** | Rule changes create new workflow versions; `baseVersion` conflict detection prevents concurrent overwrites |
| **Blueprint generation** | Structured implementation specification derived from the workflow version |
| **Bob workspace / build lifecycle** | `BobWorkspaceManager` prepares a scoped handoff with `BOB.md`, `AGENTS.md`, manifest, blueprint, and implementation plan |
| **Code change tracking** | Repository diff captured and persisted per build |
| **Test execution** | Tests run against the real demo repository; results stored per build |
| **Security / SecurePush validation** | Pattern-based static analyser scans the actual git diff for hardcoded secrets, eval usage, SQL injection patterns, and more |
| **Human review gate** | Approve or reject a build after reviewing diff, tests, and security findings |
| **Runtime workflow execution** | Execute an approved workflow version; execution history recorded |
| **Audit trail** | Full event history per workflow and build |
| **Draft workflow lifecycle** | Newly created workflows start as valid `DRAFT` versions rather than immediately failing |
| **Real database-backed data** | PostgreSQL; no hardcoded display values masquerading as real data |
| **Skeleton loading, empty states, and error states** | Consistent UI states across all pages using shared `States` components |

---

## 3. Semantic Business Impact Analysis

### Why it exists

When a business rule changes — for example, raising an invoice approval threshold — the technical dependency graph can tell you *which nodes and files are affected*. It cannot tell you *what the business change actually means*: how many invoices are now evaluated differently, what the financial range is, and what a reviewer should check.

EnterpriseFlow adds a deterministic **Semantic Business Impact** layer on top of the dependency graph to answer those questions without guessing.

### Example

Consider changing the approval threshold rule:

```
amount < 500000   →   amount < 1000000
```

For this type of simple threshold expression, the system deterministically calculates:

| Field | Value |
|---|---|
| Old threshold | ₹5,00,000 |
| New threshold | ₹10,00,000 |
| Delta | +₹5,00,000 |
| Affected range | ₹5,00,000 – ₹10,00,000 |
| Business impact | Invoices between ₹5,00,000 and ₹10,00,000 will now evaluate differently under the new rule |
| Reviewer checks | Verify that increasing the threshold does not bypass compliance checks; confirm downstream systems can handle increased volume |

This tells a reviewer not just that "downstream nodes are affected" but precisely what business change has occurred and what to verify.

### Safe fallback for complex expressions

The parser (`RuleEvaluator.parseExpression`) intentionally returns `null` for:

- Compound expressions (`&&`, `||`)
- Non-numeric comparisons
- Equality/inequality operators
- Any other expression it cannot safely interpret

When the parser returns `null`, the semantic layer is not calculated. The dependency graph impact is still shown. The system **falls back safely rather than guessing** about the meaning of complex or ambiguous expressions.

### No LLM required

The semantic impact calculation is **fully deterministic**. It does not make any AI or API call. It is a pure function over two parsed threshold expressions.

---

## 4. Architecture

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 8 | Build tool and dev server |
| `@xyflow/react` (React Flow) | Workflow graph and impact graph rendering |
| TanStack Query | Server state and cache management |
| React Router v7 | Client-side routing |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|---|---|
| TypeScript | Language |
| Fastify 5 | HTTP framework |
| Kysely | Type-safe PostgreSQL query builder |
| Zod | Schema validation |
| Vitest | Test runner |

Key service domains:

- `WorkflowService` — workflow and version lifecycle
- `WorkflowGraphService` — graph resolution per version
- `RuleService` — rule evaluation, impact analysis, versioned rule changes
- `BlueprintService` — blueprint generation from workflow versions
- `BobWorkspaceManager` — build workspace preparation and manifest generation
- `LifecycleOrchestrator` — build pipeline state machine (changes → security → testing → review)
- `EvidenceWriter` — persists Bob evidence to the build workspace filesystem
- `SecurePushClient` + `StaticAnalyser` — pattern-based security scan of the actual git diff
- `WorkflowExecutionService` — runtime execution
- `AuditService` — event history
- `DashboardService` — activity feed

### Persistence

PostgreSQL with versioned migrations (Kysely). Key tables:

| Table | Contents |
|---|---|
| `projects` | Top-level projects |
| `workflows` | Workflows within projects |
| `workflow_versions` | Versioned snapshots (DRAFT, EXTRACTED, APPROVED) |
| `workflow_nodes` / `workflow_edges` | Graph structure per version |
| `workflow_actors` / `workflow_systems` | Actors and systems per version |
| `business_rules` | Rule conditions per version |
| `rule_dependencies` | Polymorphic dependency map (rules → nodes, files, tests, docs) |
| `blueprints` | Generated implementation blueprints |
| `builds` | Build records with status state machine |
| `build_plans` / `build_changes` | Plan and diff evidence per build |
| `bob_activity_events` | Bob session events per build |
| `test_runs` | Test results per build |
| `security_scans` | Security scan results per build |
| `reviews` | Human review decisions |
| `workflow_executions` | Runtime execution records |
| `activity_events` | System-wide audit events |
| `jobs` | Async job records |

### Architecture Diagram

```mermaid
flowchart TD
    FE["Frontend\nReact / TypeScript / Vite"]
    BE["Backend\nFastify / TypeScript"]
    PG[("PostgreSQL")]
    WE["Workflow Engine\nRule Evaluator\nGraph Normalizer"]
    IE["Impact Engine\nSemantic Analysis\nDependency Traversal"]
    BOB["IBM Bob\nexternal IDE/agent"]
    SP["SecurePush\nStaticAnalyser"]
    DR["Demo Repository\ndemo-repository/invoice-automation"]
    BW["Bob Workspace\nbob-workspace/builds/{id}/"]

    FE -- "REST / SSE" --> BE
    BE --> PG
    BE --> WE
    BE --> IE
    BE --> BW
    BOB -- "opens repo, runs tests,\nsubmits evidence" --> DR
    BOB -- "evidence endpoints" --> BE
    DR -- "git diff" --> SP
    SP -- "findings + verdict" --> BE
    BE -- "review gate" --> FE
```

---

## 5. End-to-End Workflow

### User journey

1. **Create / open a workflow** — provide a name and optionally describe the SOP being automated.
2. **Upload / provide an SOP** — attach a business document for AI-assisted extraction, or proceed as a draft.
3. **Extract and analyze** — the extraction pipeline produces actors, steps, decision nodes, systems, and rules from the document.
4. **View the workflow graph** — a state-machine graph shows the nodes and transitions derived from the extraction.
5. **Inspect business rules** — rules are displayed with their conditions and version context.
6. **Propose a rule change** — enter a new expression for a rule (e.g., `amount < 1000000`).
7. **Review impact analysis** — two things are shown:
   - **Technical dependency impact**: which workflow nodes, source files, test files, and docs are registered as dependents of this rule (driven by the `rule_dependencies` table — no LLM guessing).
   - **Semantic business impact**: for compatible threshold expressions, a deterministic calculation of old/new threshold, delta, affected range, and reviewer recommendations.
8. **Generate / view the blueprint** — a structured implementation specification is created for the new workflow version.
9. **Start the Bob build lifecycle** — EnterpriseFlow prepares a scoped workspace under `bob-workspace/builds/{build-id}/` containing `BOB.md`, `AGENTS.md`, `manifest.json`, `blueprint.json`, and an implementation plan. The build enters `WAITING_FOR_BOB` state.
10. **IBM Bob performs engineering work** — IBM Bob opens the target repository (`demo-repository/invoice-automation`), reads the handoff, and makes actual code changes, writes tests, and runs the build.
11. **Evidence submitted** — Bob submits activity, plan, code changes (git diff), and test results to the evidence endpoints defined in `manifest.json`.
12. **Security validation** — `SecurePushClient` runs `git diff` against the baseline commit and passes the diff through `StaticAnalyser`. Pattern rules detect hardcoded secrets, `eval()` usage, SQL concatenation, and more. `BLOCK` findings fail the build immediately.
13. **Test execution** — the test runner executes `npm test` in the demo repository and records pass/fail results per build.
14. **Human review gate** — a reviewer sees the diff, test results, security findings, and business impact before approving or rejecting.
15. **Execute the approved workflow** — an approved build can be executed; execution history is recorded.
16. **Inspect the audit trail** — every significant event is recorded to `activity_events` and `bob_activity_events`, providing a traceable history.

---

## 6. How IBM Bob Was Used

IBM Bob was used as the **primary AI-assisted development environment** throughout the EnterpriseFlow project. This section documents that usage honestly.

### Codebase Understanding

Before making changes, Bob was used to inspect and understand the existing full-stack codebase: frontend page structure, backend API routes, database schema, workflow state management, graph representation, rule handling, build pipeline, and existing API integrations.

This was especially important when changes needed to cross multiple layers — for example, a frontend form submission that required a matching backend route, new database columns, and updated TypeScript types.

### Feature Implementation

Bob assisted with implementation across the full stack:

- **Frontend**: creating and modifying React pages, building shared components (`States.tsx`, `Badge`, `Card`, `PageHeader`, build components), connecting pages to backend APIs via TanStack Query hooks, routing setup.
- **Backend**: REST API routes in Fastify, workflow persistence logic, project and workflow creation, workflow version management, graph resolution, business rule processing, build-related APIs, test and security APIs, review and execution functionality.
- **API integration**: aligning frontend query/mutation hooks with backend route contracts, resolving type mismatches between API responses and TypeScript interfaces.
- **Workflow graph**: implementing `WorkflowGraphService`, graph normalization, handling DRAFT versus EXTRACTED states.
- **Rule engine**: `RuleEvaluator`, `RuleService.analyzeRuleImpact`, `RuleService.changeRule` with optimistic concurrency.
- **Impact analysis**: deterministic threshold parser, semantic impact layer, dependency traversal.
- **Build lifecycle**: `BobWorkspaceManager`, `LifecycleOrchestrator`, `EvidenceWriter`, `SecurePushClient`, `StaticAnalyser`.
- **Testing**: writing and fixing backend integration tests and unit tests.
- **UI improvements**: skeleton loading states, empty states, error states, removal of fabricated metrics.

### AI-Assisted Debugging

One of the most valuable uses of Bob was tracing bugs across multiple application layers (frontend → API → backend services → database → workflow state) rather than only fixing the visible symptom.

**Example — Draft Workflow Lifecycle:**

During final validation, a newly created workflow would reach the Analysis page but would fail at the Graph stage because no workflow version had been persisted during project creation. The fix required:

1. Reproducing the creation flow end-to-end.
2. Tracing the frontend navigation through Analysis → Graph.
3. Inspecting the API response from `GET /workflows/:id/graph`.
4. Checking what was actually persisted in `workflows` and `workflow_versions`.
5. Identifying that project creation was persisting only the project, not initializing a workflow and draft version.
6. Updating `project.routes.ts` and `WorkflowService` to create the workflow and a `DRAFT` version atomically during project creation.
7. Updating `WorkflowGraphService` to return a valid empty-graph response for `DRAFT` versions rather than an error.
8. Adding the `draft_workflow_lifecycle.test.ts` integration test suite.
9. Re-running the full test suite and typecheck to confirm no regressions.

### Semantic Impact Development

Bob was used to implement the deterministic threshold parser (`RuleEvaluator.parseExpression`), the semantic impact calculation in `RuleService.analyzeRuleImpact`, the frontend rendering of semantic impact fields on the Impact Analysis page, and unit tests covering boundary behavior.

### Product Polish

In the final development phase, Bob was used to:

- Replace static loading text with reusable skeleton components (`SkeletonBox`, `SkeletonText`, `SkeletonMetrics`, `SkeletonCard`, `SkeletonTable`, `SkeletonList`, `SkeletonCanvas`).
- Add explicit empty states for pages that have no data yet (e.g., draft workflows, builds that have not yet received evidence).
- Add error states with retry actions and navigation options.
- Replace hardcoded display values (fake coverage percentages, static user names, dummy metrics) with real database-backed data or appropriate empty states.
- Ensure UI consistency across pages.

### Testing and Validation

Bob was used during:

- Writing backend unit tests (rule engine, extraction pipeline, negative paths).
- Writing integration tests (E2E lifecycle, draft workflow lifecycle, API contract).
- Investigating test failures and resolving the underlying issues.
- Running `tsc --noEmit` and fixing TypeScript errors.
- Running production builds (`tsc`, `vite build`).
- API endpoint validation.
- Manual end-to-end workflow traversal.

**IBM Bob did not autonomously build the entire project.** It was used as an AI-assisted engineering environment. Features were implemented iteratively: plan → implement → run → observe → debug → refine → validate.

---

## 7. IBM Bob Build Lifecycle in EnterpriseFlow

This section documents EnterpriseFlow's project-specific Bob integration — the components that prepare, track, and validate the IBM Bob engineering handoff.

### `BobWorkspaceManager`

**Location:** [`backend/src/services/build/BobWorkspaceManager.ts`](backend/src/services/build/BobWorkspaceManager.ts)

Creates a scoped filesystem workspace under `bob-workspace/builds/{build-id}/` for each build. The workspace contains:

| File | Contents |
|---|---|
| `BOB.md` | Bob session identity, evidence endpoints, and strict instructions not to fabricate activity |
| `AGENTS.md` | Engineering instructions: objective, repository path, rule context, security requirements, blueprint |
| `manifest.json` | Build ID, workflow/version/blueprint IDs, Bob session ID, baseline commit hash, evidence endpoint URLs |
| `blueprint.json` | Full workflow blueprint JSON |
| `rules.json` | Business rule context (threshold, currency, condition) |
| `plans/implementation-plan.md` | Step-by-step implementation plan with affected modules |

The workspace also creates empty subdirectories for `activities/`, `changes/`, `tests/`, `security/`, and `documentation/` where evidence is written.

### `LifecycleOrchestrator`

**Location:** [`backend/src/services/build/LifecycleOrchestrator.ts`](backend/src/services/build/LifecycleOrchestrator.ts)

Drives the build state machine after evidence arrives:

1. **`onChangesReceived`**: Runs `SecurePushClient.scanChanges` against the actual git diff. A `BLOCK` verdict fails the build immediately and records a `SECURE_PUSH_FAILED` event. `PASS`/`WARN` advances the build to `TESTING` and dispatches a test job.
2. **`onTestsReceived`**: Checks test results; all-pass advances to `VALIDATED` → documentation generation → `READY_FOR_REVIEW`. Any failure sets status to `FAILED`.

### `EvidenceWriter`

**Location:** [`backend/src/services/build/EvidenceWriter.ts`](backend/src/services/build/EvidenceWriter.ts)

Writes Bob's submitted evidence to the build workspace with full build/workflow/session provenance:

- `writePlan` → `plans/submitted-plan.json`
- `writeActivity` → `activities/activity_{event_id}.json`
- `writeChange` → `changes/diff_{file_path}.patch`
- `writeTestRun` → `tests/test_run_{id}.json`
- `writeSecurity` → `security/security-scan.json`
- `writeDocumentation` → `documentation/{title}.md`

### `SecurePushClient` + `StaticAnalyser`

**Locations:** [`backend/src/services/build/adapters/SecurePushClient.ts`](backend/src/services/build/adapters/SecurePushClient.ts), [`backend/src/services/build/adapters/StaticAnalyser.ts`](backend/src/services/build/adapters/StaticAnalyser.ts)

`SecurePushClient` reads the manifest's baseline commit and runs `git diff {baseline}` against the actual demo repository. It passes the diff to `StaticAnalyser`, which applies pattern-based rules to every added line:

| Severity | Rules |
|---|---|
| CRITICAL | Hardcoded passwords, secrets, API keys, credentials |
| HIGH | `eval()` calls, `exec()`/`spawn()` with non-literal args, SQL concatenation |
| MEDIUM | `console.log` with sensitive terms, async functions without try/catch, `Math.random()` for security purposes |
| LOW | TODO/FIXME/HACK comments, remaining `console.log` |

Risk score = `critical × 25 + high × 10 + medium × 3 + low × 1`, capped at 100. Any critical finding or risk score > 50 → `BLOCK`.

### `ImplementationJobHandler`

**Location:** [`backend/src/jobs/build/ImplementationJobHandler.ts`](backend/src/jobs/build/ImplementationJobHandler.ts)

The async job handler that orchestrates workspace preparation. It:

1. Creates a `builds` record with status `BLUEPRINT_VALIDATED`.
2. Calls `BobWorkspaceManager.generateWorkspace`.
3. Sets build status to `WAITING_FOR_BOB`.
4. Records a `WORKSPACE_CREATED` activity event.

It explicitly does not simulate Bob activity or write application code. The next state transition can only happen when real evidence arrives from the Bob session.

---

## 8. Security and Governance

### Security Validation

The `StaticAnalyser` scans every added line in the real git diff. It does not scan unchanged context lines. Findings are classified CRITICAL → LOW and a weighted risk score is computed.

### Fail-Closed Behavior

A `BLOCK` verdict from SecurePush immediately sets the build to `FAILED`. There is no path to continue a blocked build. `BLOCK` findings cannot be approved by a human reviewer because the build never reaches `READY_FOR_REVIEW`.

### Human Review Gate

Only builds that pass security scanning and have all tests passing reach `READY_FOR_REVIEW`. A human reviewer sees the code diff, test results, security findings, and business impact before making an approve/reject decision.

### Versioning

Rule changes create new `workflow_versions` with a cloned set of nodes, edges, rules, actors, and systems. The `baseVersion` field in the change request implements optimistic concurrency control — a stale base version returns HTTP 409 Conflict.

### Audit Events

All significant state transitions are recorded to `activity_events`. Build-specific events are recorded to `bob_activity_events`. These provide a traceable record of what happened at each stage, what Bob's session produced, and what decision was made at human review.

### Why This Matters for Enterprise Workflow Changes

A business rule change that looks like a two-character edit (e.g., `500000` → `1000000`) can affect financial risk thresholds, compliance controls, approval routing, downstream audit requirements, and external system integrations. EnterpriseFlow ensures that change is not treated as an isolated code edit but as a governed lifecycle event with traceable impact, tested evidence, security review, and human sign-off.

---

## 9. Project Structure

```
EnterpriseFlow/
├── frontend/                       # Vite + React + TypeScript
│   └── src/
│       ├── api/                    # API client, realApi, service adapter
│       ├── components/             # Shared UI components
│       │   ├── build/              # Build pipeline, code diff, test result
│       │   ├── nodes/              # WorkflowNode, ImpactNode (React Flow)
│       │   ├── edges/              # WorkflowEdge (React Flow)
│       │   └── States.tsx          # Skeleton, ErrorState, EmptyState
│       ├── hooks/                  # TanStack Query hooks (queries, mutations)
│       ├── pages/                  # Page components
│       │   ├── build/              # BobBuildLayout, BobBuildOverview, BobPlan, BobChanges
│       │   ├── WorkflowGraph.tsx
│       │   ├── ImpactAnalysis.tsx
│       │   ├── WorkflowAnalysis.tsx
│       │   ├── Blueprint.tsx
│       │   ├── Tests.tsx
│       │   ├── ChangeReview.tsx
│       │   ├── WorkflowExecution.tsx
│       │   └── AuditTrail.tsx
│       ├── router/                 # React Router configuration
│       └── types/                  # Shared TypeScript types
│
├── backend/                        # Fastify + TypeScript + Kysely
│   └── src/
│       ├── db/                     # Database connection and migrations
│       │   └── migrations/         # 001–010 versioned migration files
│       ├── domain/
│       │   ├── blueprint/          # BlueprintGenerator, BlueprintValidator
│       │   ├── bob/                # BobEvidenceService, BobIngestionSchemas
│       │   ├── impact-engine/      # ImpactAnalysisSchema
│       │   ├── rule-engine/        # RuleChangeSchema
│       │   └── workflow-engine/    # RuleEvaluator, GraphNormalizer, GraphValidator
│       ├── jobs/
│       │   ├── build/              # ImplementationJobHandler
│       │   ├── execution/          # ExecutionJobHandler
│       │   ├── extraction/         # ExtractionJobHandler
│       │   ├── security/           # SecurityScanJobHandler
│       │   └── tests/              # TestingJobHandler
│       ├── routes/
│       │   ├── projects/           # project.routes, document.routes
│       │   ├── workflows/          # workflow.routes
│       │   ├── rules/              # rule.routes
│       │   ├── blueprints/         # blueprint.routes
│       │   ├── builds/             # build.routes, bob-evidence.routes
│       │   ├── reviews/            # review.routes
│       │   ├── executions/         # execution.routes
│       │   └── activity/           # dashboard.routes
│       └── services/
│           ├── build/              # BobWorkspaceManager, LifecycleOrchestrator, EvidenceWriter
│           │   └── adapters/       # SecurePushClient, StaticAnalyser
│           ├── graph/              # WorkflowGraphService
│           ├── rules/              # RuleService
│           ├── workflow/           # WorkflowService, WorkflowNormalizer
│           └── workflow-extraction/# ExtractionService, AIClient
│
├── demo-repository/
│   ├── invoice-automation/         # Target repo for IBM Bob (has its own Git history)
│   └── invoice-automation-baseline/ # Baseline snapshot for reset
│
├── bob-workspace/                  # Generated build workspaces
│   └── builds/{build-id}/          # Per-build handoff packages (created at runtime)
│
├── scripts/
│   ├── reset-demo.ps1              # Windows demo reset
│   └── reset-demo.sh               # Unix demo reset
│
├── docs/                           # Project documentation
│   ├── IBM_BOB_USAGE.md
│   ├── BOB.md
│   ├── architecture/
│   ├── bob/
│   ├── api/
│   └── security/
│
├── docker-compose.yml              # PostgreSQL container
└── .env.example                    # Root environment template
```

---

## 10. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js | Used for both frontend and backend; version constraints set by dependencies (TypeScript 7 in backend, TypeScript ~6 in frontend) |
| npm | Package management |
| PostgreSQL | Required for the backend; `docker-compose.yml` provides a ready-to-use container |
| Git | Required for the `SecurePushClient` diff and demo-repository reset |
| IBM Bob | Required for the implementation step of the governed build lifecycle (external to this repository) |

---

## 11. Installation and Setup

```bash
git clone <repository-url>
cd EnterpriseFlow
```

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install demo repository dependencies

```bash
cd demo-repository/invoice-automation
npm install
```

### 4. Configure environment variables

**Backend** — copy and edit:

```bash
cp backend/.env.example backend/.env
```

Set `DATABASE_URL` to your PostgreSQL connection string, for example:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/enterprise_flow
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
TEST_MODE=real
BACKEND_BASE_URL=http://localhost:3001/api/v1
```

**Frontend** — copy and edit:

```bash
cp frontend/.env.example frontend/.env
```

Default values:

```
VITE_API_MODE=api
VITE_API_URL=/api/v1
```

### 5. Start PostgreSQL

Using Docker:

```bash
docker-compose up -d
```

Or use an existing PostgreSQL instance and set `DATABASE_URL` accordingly.

### 6. Run database migrations

```bash
cd backend
npm run migrate
```

### 7. Reset and seed the demo (optional, for demo walkthrough)

**Windows PowerShell:**

```powershell
.\scripts\reset-demo.ps1
```

**Git Bash / Linux / macOS:**

```bash
./scripts/reset-demo.sh
```

This restores the demo repository baseline, removes generated Bob workspace data, resets relevant application rows, and reseeds the invoice workflow.

---

## 12. Running Locally

### Start the backend

```bash
cd backend
npm run dev
```

Backend runs at **http://localhost:3001**

### Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at **http://localhost:3000**

The Vite dev server proxies `/api/v1` to the backend, so no CORS configuration is needed during local development.

---

## 13. Demo Workflow

The recommended demo sequence for judges:

### 1. Reset

Run `scripts/reset-demo.ps1` (Windows) or `scripts/reset-demo.sh` (Unix) to restore the demo to a clean baseline.

### 2. Navigate

| Step | URL | What to observe |
|---|---|---|
| Dashboard | `/app/dashboard` | Activity feed, workflow summary |
| Workflows | `/app/workflows` | List of workflows |
| Create Workflow | `/app/workflows/new` | Create from name or SOP |
| Analysis | `/app/workflows/:id/analysis` | Extracted actors, steps, systems |
| Workflow Graph | `/app/workflows/:id/graph` | State-machine node/edge graph |
| Impact Analysis | `/app/workflows/:id/impact` | Rule selector, propose change, view impact |
| Blueprint | `/app/workflows/:id/blueprint` | Implementation specification |
| Build | `/app/workflows/:id/build` | Bob workspace status, activity, plan |
| Build > Changes | `/app/workflows/:id/build/changes` | Code diff from Bob session |
| Tests | `/app/workflows/:id/tests` | Test run results |
| Review | `/app/workflows/:id/review` | Diff + security + approve/reject |
| Execution | `/app/workflows/:id/execution` | Execute approved workflow |
| Audit Trail | `/app/workflows/:id/audit` | Full event history |

### 3. Semantic Rule Change Demo

On the Impact Analysis page, change the rule from:

```
amount < 500000
```

to:

```
amount < 1000000
```

**What the judge should observe:**

- The technical dependency graph shows which workflow nodes, source files, and test files are registered as dependents.
- The semantic panel shows:
  - Old threshold: ₹5,00,000
  - New threshold: ₹10,00,000
  - Delta: +₹5,00,000
  - Affected range: ₹5,00,000 – ₹10,00,000
  - Business impact explanation
  - Reviewer recommendations
- This is computed deterministically — no AI call is made.

---

## 14. Testing and Validation

### Backend

```bash
cd backend

# Run tests
npm test

# Typecheck
npm run typecheck

# Production build
npm run build
```

Test files:

| File | Coverage |
|---|---|
| `backend/tests/ruleEngine.test.ts` | Rule engine boundary behavior |
| `backend/tests/extraction.test.ts` | Extraction pipeline, Zod validation |
| `backend/tests/draft_workflow_lifecycle.test.ts` | Create → Draft → Analysis → Graph lifecycle |
| `backend/tests/e2e_full_lifecycle.test.ts` | Full E2E lifecycle + invariant audit |
| `backend/tests/db.test.ts` | Database integrity |
| `backend/src/tests/api-contract.test.ts` | API contract validation |
| `backend/src/tests/negative-paths.test.ts` | Error and edge-case paths |

### Frontend

```bash
cd frontend

# Run tests
npm test

# Typecheck
npm run build   # tsc -b && vite build

# Lint
npm run lint
```

> **Note:** The backend integration tests (`e2e_full_lifecycle.test.ts`, `draft_workflow_lifecycle.test.ts`) require a running PostgreSQL instance with `DATABASE_URL` configured and migrations applied.

---

## 15. Demo Repository

`demo-repository/invoice-automation` is a standalone TypeScript project representing a legacy enterprise invoice automation application. It is the **target repository** for IBM Bob's engineering work.

It contains:

- `src/` — invoice processing, approval routing, validation, and audit source code
- `tests/` — executable test suite (`npm test` using Vitest)
- `docs/` — internal documentation
- Its own Git history (separate from the main EnterpriseFlow repository)

When EnterpriseFlow prepares a Bob workspace, it records the current `HEAD` commit of this repository as the baseline. After Bob makes changes, `SecurePushClient` runs `git diff {baseline}` to produce the diff that feeds the static security scanner.

`demo-repository/invoice-automation-baseline` is the clean snapshot used by the reset scripts to restore the demo to a known state before each walkthrough.

---

## 16. Documentation

| Document | Path | Contents |
|---|---|---|
| IBM Bob Usage | [`docs/IBM_BOB_USAGE.md`](docs/IBM_BOB_USAGE.md) | Detailed account of how IBM Bob was used during development |
| Bob Workspace PRD | [`docs/bob/Bob_Workspace_PRD.md`](docs/bob/Bob_Workspace_PRD.md) | Bob workspace design, pipeline, and evidence chain |
| BOB.md | [`docs/BOB.md`](docs/BOB.md) | Bob contribution summary for the demo |
| System Architecture | [`docs/architecture/System_Architecture.md`](docs/architecture/System_Architecture.md) | Architecture overview and component responsibilities |
| Backend Architecture | [`docs/architecture/Backend_Architecture.md`](docs/architecture/Backend_Architecture.md) | Backend service and layer design |
| Database Schema | [`docs/architecture/Database_Schema.md`](docs/architecture/Database_Schema.md) | Table definitions and dependency graph design |
| State Machines | [`docs/architecture/State_Machines.md`](docs/architecture/State_Machines.md) | Workflow and build state machine diagrams |
| API Contract | [`docs/api/API_Contract.md`](docs/api/API_Contract.md) | REST API endpoint documentation |
| SecurePush Integration | [`docs/security/SecurePush_Integration.md`](docs/security/SecurePush_Integration.md) | Security scan integration details |
| Master PRD | [`docs/EnterpriseFlow_Master_PRD.md`](docs/EnterpriseFlow_Master_PRD.md) | Product requirements document |
| Demo Repository PRD | [`docs/demo/Demo_Repository_PRD.md`](docs/demo/Demo_Repository_PRD.md) | Demo repository design and purpose |

---

## 17. Limitations / Scope

- **Semantic impact analysis covers only simple threshold expressions.** The parser handles expressions of the form `field operator number` where the operator is `<`, `<=`, `>`, or `>=`. Compound expressions, string comparisons, and equality checks do not receive semantic interpretation — the system falls back to dependency-only impact display.

- **IBM Bob is an external dependency.** The build lifecycle enters `WAITING_FOR_BOB` state and waits for evidence submitted from the actual IBM Bob engineering session. EnterpriseFlow cannot proceed through the full build lifecycle without Bob performing real work in the demo repository.

- **The demo repository is a contained example.** It is an invoice automation application designed for the demo. It does not represent a full production enterprise codebase.

- **Workflow extraction uses a mocked AI client in test mode.** The `MockAIClient` is used when `TEST_MODE` is set for isolated tests. The real `AIClient` is used in normal operation.

- **EnterpriseFlow is a governed lifecycle demonstration.** It is not a fully autonomous enterprise deployment platform, and it does not replace human judgement at the review gate.

---

## 18. Submission / IBM Bob Note

IBM Bob was used throughout the entire development lifecycle of EnterpriseFlow as the AI-assisted engineering environment for:

- **Codebase understanding** — inspecting and comprehending the full-stack architecture before making changes
- **Implementation** — frontend, backend, API integration, workflow graph, rule engine, impact analysis, build lifecycle
- **Debugging** — tracing issues across frontend, API, backend, database, and workflow state layers
- **Testing** — writing tests, fixing failures, typecheck, production builds, regression verification
- **Product refinement** — skeleton loading, empty/error states, data integrity, UI consistency
- **Final validation** — manual end-to-end walkthrough and automated check confirmation

The repository contains detailed documentation of this usage:

- [`docs/IBM_BOB_USAGE.md`](docs/IBM_BOB_USAGE.md) — comprehensive account of how Bob was used across development phases
- [`docs/BOB.md`](docs/BOB.md) — Bob contribution summary
- [`docs/bob/Bob_Workspace_PRD.md`](docs/bob/Bob_Workspace_PRD.md) — the Bob workspace design built into EnterpriseFlow itself

EnterpriseFlow also implements a first-class IBM Bob build lifecycle as a product feature: the `BobWorkspaceManager`, `LifecycleOrchestrator`, `EvidenceWriter`, `SecurePushClient`, and `StaticAnalyser` components form a complete governed handoff from EnterpriseFlow to Bob and back, with real evidence capture, security scanning of Bob's actual code changes, and a human review gate before execution.
