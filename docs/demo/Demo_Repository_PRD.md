# Demo Repository

## Overview
This document defines the exact demo scenario and the structure of the simulated legacy enterprise application. The Demo Repository is the target codebase that IBM Bob operates on to prove the end-to-end functionality of EnterpriseFlow AI.

## Business Scenario: Invoice Approval

The Demo Repository simulates a legacy Invoice application.

### Existing Workflow
1. Invoice Received
2. Vendor Validation
3. Amount Check
4. Manager Approval
5. Finance Approval
6. Payment

### Existing Business Rules
- **R1**: All invoices require Vendor Validation.
- **R2**: `amount > 500000` requires Manager Approval.
- **R3**: `amount > 1000000` requires Finance Approval.

## Deliberate Problems

The repository must contain these specific, known problems for Bob to fix:
1. **Deprecated dependency**: e.g., an outdated version of `axios` or `lodash`.
2. **Weak input validation**: e.g., missing type checking on the invoice amount.
3. **Hardcoded threshold**: The ₹500,000 threshold is hardcoded in a controller instead of a rule engine.
4. **Missing boundary tests**: Tests exist for ₹400,000 and ₹600,000, but not exactly ₹500,000, ₹499,999, or ₹500,001.
5. **Poor documentation**: Missing or outdated API/policy docs.

## Expected Bob Execution

When the user extracts the SOP and asks Bob to implement the rule changes (e.g., updating the Manager Approval threshold to ₹1,000,000), Bob is expected to produce the following:

### Expected Changes
- **File A** (`src/approval/controller.ts`): Remove the hardcoded threshold.
- **File B** (`src/rules/approval-rules.ts`): Implement the threshold using the deterministic rule engine.
- **File C** (`docs/policies/approval-policy.md`): Update the documentation to reflect the new threshold.

### Expected Tests
- **Test A**: `amount = 999999` (Manager Approval bypassed)
- **Test B**: `amount = 1000000` (Manager Approval required)
- **Test C**: `amount = 1000001` (Manager Approval required)

### Expected Impact Analysis
When Rule R2 is changed, the Impact Engine MUST deterministically output:
- **3 source files**
- **4 tests**
- **1 workflow node**
- **2 docs**

## Demo Reset Mechanism

To ensure the demo is reproducible, the demo repository includes a suite of reset scripts.

```text
demo-repository/
└── scripts/
    ├── setup-demo.sh
    ├── reset-demo.sh
    └── verify-demo.sh
```

- **`reset-demo.sh`**: Restores the exact starting state of the codebase (including re-injecting the deliberate problems).
- **`verify-demo.sh`**: Confirms the environment is ready before recording the demo:
  - ✓ Repository clean
  - ✓ Dependencies available
  - ✓ Tests available
  - ✓ Known vulnerabilities present
  - ✓ Business rules loaded
  - ✓ Demo scenario ready
