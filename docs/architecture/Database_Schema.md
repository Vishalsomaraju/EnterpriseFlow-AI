# Database Schema

## Overview
The PostgreSQL database serves as the canonical source of truth for the entire system. It must enforce rigid foreign keys and constraints to enable deterministic impact analysis.

## Core Tables

### `projects`
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `created_at` (TIMESTAMP)

### `documents`
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key -> `projects.id`, ON DELETE CASCADE)
- `status` (ENUM: UPLOADED, PARSING, EXTRACTING, EXTRACTED, VALIDATION_REQUIRED, FAILED)
- `file_url` (VARCHAR)

## Workflow Tables

### `workflows`
- `id` (UUID, Primary Key)
- `document_id` (UUID, Foreign Key -> `documents.id`)

### `workflow_nodes`
- `id` (UUID, Primary Key)
- `workflow_id` (UUID, Foreign Key -> `workflows.id`, ON DELETE CASCADE)
- `type` (VARCHAR, Required)
- `name` (VARCHAR, Required)

### `business_rules`
- `id` (UUID, Primary Key)
- `workflow_id` (UUID, Foreign Key -> `workflows.id`, ON DELETE CASCADE)
- `name` (VARCHAR, Required)
- `description` (TEXT)
- `expression` (TEXT, Required) - e.g., "amount > 500000"

## The Dependency Graph (Critical for Impact Analysis)

This is the most important structure for enabling deterministic impact analysis.

### `rule_dependencies`
This polymorphic table maps a business rule directly to the code, tests, and docs that implement it.
- `id` (UUID, Primary Key)
- `business_rule_id` (UUID, Foreign Key -> `business_rules.id`, ON DELETE CASCADE)
- `target_type` (ENUM: SOURCE_FILE, TEST_FILE, DOC_FILE, WORKFLOW_NODE, Required)
- `target_id` (VARCHAR, Required) - The path to the file or the UUID of the workflow node.

> [!IMPORTANT]
> The Impact Engine relies entirely on the `rule_dependencies` table. It must NEVER ask an LLM to "guess" affected components. It must run a SQL query against this table.

## Implementation Tables

### `blueprints`
- `id` (UUID, Primary Key)
- `workflow_id` (UUID, Foreign Key -> `workflows.id`)

### `builds` (Bob's Execution)
- `id` (UUID, Primary Key)
- `blueprint_id` (UUID, Foreign Key -> `blueprints.id`)
- `status` (ENUM: QUEUED, ANALYZING, PLANNING, IMPLEMENTING, TESTING, COMPLETED, FAILED)

## Validation Tables

### `test_runs`
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key -> `builds.id`, ON DELETE CASCADE)
- `total_tests` (INTEGER)
- `passed` (INTEGER)
- `failed` (INTEGER)

### `security_scans`
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key -> `builds.id`, ON DELETE CASCADE)
- `risk_score` (INTEGER)
- `status` (ENUM: PASS, WARN, BLOCK)

## Governance Tables

### `reviews`
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key -> `builds.id`)
- `status` (ENUM: PENDING, IN_REVIEW, APPROVED, REJECTED, REQUEST_CHANGES)
