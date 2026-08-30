# EnterpriseFlow

EnterpriseFlow turns manual business procedures into governed, executable workflows. The demo takes an invoice approval SOP through extraction, graph validation, blueprint generation, an IBM Bob engineering handoff, real repository tests, SecurePush scanning, human review, execution, audit history, and deterministic rule-change impact analysis.

## Architecture

The frontend is a Vite application. The backend is a Fastify/TypeScript service backed by PostgreSQL. Workflow extraction persists versioned nodes, edges, rules, and dependencies. Build gates consume the actual demo-repository Git diff; IBM Bob is an external IDE/local-agent actor and is not simulated by the backend.

## Setup

Requirements: Node.js, npm, PostgreSQL, and access to the supported IBM Bob environment for the implementation step.

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Install dependencies in `backend` and `frontend`.
4. Apply migrations with `cd backend; npm run migrate`.
5. Start the backend on port 3001 and frontend on port 3000.

## Environment variables

`DATABASE_URL` selects PostgreSQL. `PORT` selects the backend port. `CORS_ORIGIN` restricts browser access. `TEST_MODE=real` runs the actual demo tests; `TEST_MODE=demo` is reserved for isolated development tests. `VITE_API_MODE=api` selects the real backend path, while `VITE_API_MODE=mock` explicitly selects the development mock adapter. `VITE_API_URL` is the frontend API base URL.

## Demo repository

The real target repository is `demo-repository/invoice-automation`.

```powershell
cd demo-repository\invoice-automation
npm install
npm test
npm run build
```

## IBM Bob and SecurePush

EnterpriseFlow prepares a build-scoped handoff under `bob-workspace/builds/<build-id>/` containing `BOB.md`, `AGENTS.md`, the blueprint, plan, manifest, and evidence directories. IBM Bob must open the target repository and make the actual code changes. EnterpriseFlow then captures the repository diff, runs the real tests, and sends that diff to SecurePush. Scanner failures fail closed; BLOCK findings cannot be approved.

## Reset and demo flow

Run `scripts\reset-demo.ps1` on Windows or `scripts/reset-demo.sh` in Git Bash/Linux. Reset restores the demo baseline, removes generated Bob workspace data, resets application rows, and reseeds the invoice workflow.

The intended flow is: reset → SOP extraction → graph and rule verification → blueprint → IBM Bob changes → Git diff → real tests → SecurePush → human review → execution → audit trail → rule change from ₹5,00,000 to ₹10,00,000 → impact analysis.

## Known limitations

IBM Bob is an external environment dependency and must be available during the recorded demo. The local Vite proxy rewrites `/api/v1` to the backend's unprefixed routes; production deployments must provide an equivalent routing rule. PostgreSQL connectivity is required for the full lifecycle.
