# State Machines

## Overview
EnterpriseFlow AI orchestrates several long-running asynchronous processes. To prevent race conditions and ensure UI consistency, all state transitions must strictly adhere to the following defined state machines.

---

## 1. Document Extraction State Machine

Tracks the lifecycle of an uploaded SOP through AI interpretation and schema validation.

```text
[UPLOADED]
    │
    ▼
[PARSING] (Extracting text from PDF/Doc)
    │
    ▼
[EXTRACTING] (AI is building the WorkflowExtraction JSON)
    │
    ├───> [FAILED] (AI timeout or unrecoverable error)
    │
    ▼
[VALIDATING] (Deterministic JSON schema validation)
    │
    ├───> [VALIDATION_REQUIRED] (Schema valid, but missing human input/ambiguities detected)
    │
    ▼
[COMPLETED] (WorkflowGraph generated)
```

---

## 2. Bob Implementation Pipeline (Builds)

Tracks the lifecycle of IBM Bob executing an Implementation Plan on the demo repository.

```text
[QUEUED]
    │
    ▼
[ANALYZING] (Bob reading demo repository state)
    │
    ▼
[PLANNING] (Bob generating step-by-step code plan)
    │
    ▼
[IMPLEMENTING] (Bob editing source code)
    │
    ▼
[TESTING] (Bob running tests and fixing failures)
    │
    ├───> [FAILED] (Bob could not fix tests after max retries)
    │
    ▼
[COMPLETED] (Code committed, ready for review)
```

---

## 3. Human Review State Machine

Tracks the governance process after Bob completes an implementation.

```text
[PENDING]
    │
    ▼
[IN_REVIEW] (Human is viewing diffs, tests, security, and impact)
    │
    ├───> [REQUEST_CHANGES] (Kicks back to Bob -> [IMPLEMENTING])
    │
    ├───> [REJECTED] (Terminal state)
    │
    ▼
[APPROVED] (Implementation accepted and merged)
```

---

## Real-Time Events

These states are broadcast to the frontend via WebSockets/SSE to update the Activity Timeline component. State updates must be atomic.
