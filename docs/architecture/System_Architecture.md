# System Architecture

## Overview
This document defines the canonical architecture for EnterpriseFlow AI.

## Architectural Diagram

```text
                 ┌──────────────┐
                 │   Frontend   │
                 └──────┬───────┘
                        │
                  REST / SSE
                        │
                 ┌──────▼───────┐
                 │    Backend   │
                 └──────┬───────┘
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
 Workflow Engine     PostgreSQL       Services
        │                                │
        │                         ┌──────┴──────┐
        │                         │             │
        ▼                         ▼             ▼
   Impact Engine               Bob         SecurePush
        │                         │             │
        └─────────────────────────┼─────────────┘
                                  ▼
                            Demo Repository
```

## System Boundaries and Component Responsibilities

### 1. Frontend
**Responsibility**: Presenting the state of the system in real-time.
- Visualizes the workflow graph and the impact of changes.
- Consumes REST APIs for synchronous actions and SSE/WebSockets for real-time state updates.
- Exposes approval panels, code diffs, test results, and security findings.

### 2. Backend
**Responsibility**: The central coordinator and API gateway.
- Coordinates the pipeline: extraction -> validation -> blueprint -> plan -> Bob.
- Exposes REST APIs and WebSocket endpoints.
- Manages state for jobs (Extraction, Bob build, Reviews).
- Does not run business rules directly (that belongs to the Workflow Engine).

### 3. Workflow Engine & Impact Engine
**Responsibility**: The deterministic heart of the system.
- Evaluates business rules (e.g., approval thresholds) logically, without LLMs.
- Traverses the Workflow Graph and resolving dependencies.
- The **Impact Engine** calculates the exact source files, tests, and documentation affected by a rule change based on deterministic graph traversal.

### 4. PostgreSQL (Database)
**Responsibility**: The canonical source of truth for all relationships.
- Stores workflows, nodes, business rules, execution state, implementation plans, and impact items.
- Defines rigid foreign keys between rules and the code/tests they affect.

### 5. Services
**Responsibility**: Integrations and specific domains.
- **Bob (IBM Engineering Agent)**: The engineering worker that analyzes, plans, and writes code/tests on the real demo repository.
- **SecurePush**: The security boundary. Scans Bob's code diffs and returns findings, severities, and risk scores.
- **Human Review**: Manages the approval/rejection cycle combining diffs + tests + security + business impact.

### 6. Demo Repository
**Responsibility**: The target application.
- A simulated legacy enterprise application.
- Contains actual code, policies, and tests with deliberate problems (e.g., weak validation, deprecated dependencies).

## Synchronous vs Asynchronous Operations

### Synchronous (REST)
- Creating/Fetching projects
- Fetching canonical states (Workflow Graph, Blueprints)
- Simple mutations (Updating a rule parameter)

### Asynchronous (WebSockets / SSE)
- Document parsing and workflow extraction
- Blueprint generation
- Bob's implementation pipeline (Analyzing -> Planning -> Coding -> Testing)
- Security Scans
- Impact Analysis calculation

## AI vs Deterministic Responsibilities

### AI Responsibilities
- Interpreting messy SOPs/PDFs.
- Extracting workflows, actors, rules, and ambiguities into a structured JSON schema.
- IBM Bob generating implementation plans, writing code, and debugging test failures.

### Deterministic Responsibilities
- Validating the extracted JSON schema.
- Executing business rules mathematically (e.g., `amount > 500000`).
- Traversing the graph to find affected dependencies (Impact Analysis).
- State management and API responses.
- Running tests and executing SecurePush scans.
