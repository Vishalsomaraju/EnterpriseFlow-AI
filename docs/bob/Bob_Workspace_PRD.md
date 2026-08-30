# Bob Workspace

## Overview
This document defines the operating environment, pipeline, and evidence chain for IBM Bob, the engineering agent responsible for executing Implementation Plans on the target Demo Repository.

## Bob Pipeline

The sequence of Bob's execution must strictly follow this path:

1. **Bob Task Assignment**: Bob receives the Implementation Plan from EnterpriseFlow.
2. **Bob Analysis**: Bob reads the current state of the demo repository to understand the legacy context.
3. **Bob Plan**: Bob generates a step-by-step code modification plan.
4. **Bob Code Changes**: Bob modifies the source code in the demo repository.
5. **Bob-Generated Tests**: Bob writes or updates tests covering the changed business rules (especially boundary conditions).
6. **Test Execution**: Bob runs the test suite. If failures occur, Bob attempts to fix the code/tests up to a maximum retry limit.
7. **Git Diff / Commit**: Bob finalizes the changes into a commit/diff.
8. **EnterpriseFlow Validation**: The diff is sent back to EnterpriseFlow for Human Review and SecurePush scanning.

## Workspace Structure

The `bob-workspace/builds/<build-id>/` directory provides an isolated context
and evidence package for each Bob session. EnterpriseFlow creates this package
but does not write application code into the target repository.

```text
bob-workspace/
└── builds/<build-id>/
    ├── AGENTS.md
    ├── BOB.md
    ├── manifest.json
    ├── blueprint.json
    ├── rules.json
    ├── plans/
    │   └── implementation-plan.md
    ├── activities/
    ├── changes/
    ├── tests/
    ├── security/
    └── documentation/
```

Bob is invoked through the supported local/IDE Bob environment using the
repository path and instructions in `BOB.md`; EnterpriseFlow does not invent a
Bob HTTP API or substitute a deterministic code writer. Evidence is accepted
only when its build and Bob session IDs match `manifest.json`, and repository
change evidence must be present in the target repository Git diff from the
recorded baseline commit.

## Evidence Chain (`BOB.md`)

> [!IMPORTANT]
> Bob's contribution must be demonstrable, not merely claimed. `BOB.md` is the primary artifact proving Bob's work.

`BOB.md` must record:
1. **Repository Analysis**: What Bob found in the legacy codebase.
2. **Implementation Planning**: The specific steps Bob took to fulfill the Implementation Plan.
3. **Code Modification**: Links to the specific files changed.
4. **Test Generation & Debugging**: Proof that Bob wrote boundary tests and successfully debugged failures.
5. **Documentation Updates**: Proof that Bob updated the demo repository's internal docs.

## Engineering Rules (`AGENTS.md`)

Bob must adhere to the following rules when modifying the demo repository:
- **Architecture**: Use TypeScript, preserve existing boundaries, do not modify unrelated modules.
- **Business Rules**: Approval thresholds must be represented in the rule engine; never hardcode business rules in controllers.
- **Testing**: Every business-rule change requires tests, explicitly covering boundary conditions.
- **Security**: Never bypass validation or introduce secrets.
- **Documentation**: Update relevant demo documentation when behavior changes.
