# Backend Architecture

## Overview
The backend serves as the central coordinator for EnterpriseFlow AI. It manages state, exposes APIs, and coordinates the execution of various engines (Workflow, Impact) and services (Bob, SecurePush).

## Module Responsibilities

The backend is organized into the following distinct modules:

### 1. Projects
- Create, List, Get, Update, Delete/Archive project metadata.

### 2. Documents
- Handle SOP uploads.
- Store metadata.
- Parse documents and dispatch to extraction services.
- Track extraction status (`UPLOADED`, `PARSING`, `EXTRACTING`, `EXTRACTED`, `VALIDATION_REQUIRED`, `FAILED`).

### 3. Workflows & Blueprints
- Manage the canonical `WorkflowGraph` (nodes, edges, actors, conditions, triggers).
- Convert `WorkflowGraph` into an `AutomationBlueprint`.
- The blueprint contains services, APIs, data entities, business rules, and implementation requirements.

### 4. Implementations & Tests
- Track Bob's implementation builds and code changes.
- Track test suites, test cases, and individual test runs.

### 5. Security & Reviews
- Store security scans and vulnerability findings.
- Manage the governance review lifecycle (approve/reject/request changes).

### 6. Impact
- Integrate with the Impact Engine to trigger and store `ChangeImpact` reports.

## AI vs Deterministic Responsibilities

**The backend must strictly separate AI tasks from deterministic tasks.**

### AI Responsibilities (The Extraction Service)
These services rely on LLMs to interpret unstructured data and produce structured output.
- **Extraction**: Extracting workflows, rules, and actors from PDFs/SOPs.
- **Interpretation**: Interpreting messy business logic.
- **Ambiguity Detection**: Flagging areas where the SOP contradicts itself.
- **Implementation Plan Generation**: Bob determining how to write the code.

### Deterministic Responsibilities (Core Backend)
These services must execute mathematically, without LLMs.
- **Schema Validation**: Rejecting AI outputs that do not match canonical JSON schemas.
- **Rule Execution**: Evaluating business rules (e.g., `invoice.amount > 500000`).
- **Graph Traversal**: Determining the exact flow of a process.
- **Dependency Resolution**: Mapping the links between a rule, code, and tests.
- **Impact Calculation**: Traversing the database relationships to find exactly what is affected by a change.
- **State Management**: Updating the database and broadcasting events via WebSockets.
- **Test Execution**: Parsing test-runner outputs into structured results.
- **Security Results**: Parsing SecurePush results and applying PASS/WARN/BLOCK rules.
