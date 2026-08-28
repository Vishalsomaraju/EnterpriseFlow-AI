# IBM Bob — Build Context

## Identity
- **Build ID:** build-1787912646223
- **Bob Session ID:** bob-sess-1787912646223  ← include this in ALL evidence POST requests
- **Workflow:** Auto-Extracted Workflow (ID: 0b077677-ab45-4c88-80ba-12029ebe4f49)
- **Repository:** E:\EnterpriseFlow\demo-repository\invoice-automation

## Evidence Submission API

After each stage, POST evidence to EnterpriseFlow so it can track your progress:

### POST http://localhost:3001/api/v1/builds/build-1787912646223/bob/events
Lifecycle updates (REPOSITORY_ANALYZED, PLAN_CREATED, IMPLEMENTING, etc.)
```json
{
  "build_id": "build-1787912646223",
  "bob_session_id": "bob-sess-1787912646223",
  "event_id": "unique-event-id",
  "event_type": "REPOSITORY_ANALYZED",
  "message": "Analyzed 4 source files, identified 6 deficiencies"
}
```

### POST http://localhost:3001/api/v1/builds/build-1787912646223/bob/plan
Your implementation plan and subagents:
```json
{
  "build_id": "build-1787912646223",
  "bob_session_id": "bob-sess-1787912646223",
  "event_id": "plan-event-id",
  "summary": "Implement invoice automation acceptance criteria",
  "plan_json": { "steps": [...] },
  "subagents": [
    { "name": "ValidationAgent", "task": "Implement vendor validation and duplicate detection" },
    { "name": "RoutingAgent", "task": "Implement dynamic rule-based routing" },
    { "name": "AuditAgent", "task": "Implement structured audit logging" },
    { "name": "TestAgent", "task": "Implement acceptance test suite" }
  ]
}
```

### POST http://localhost:3001/api/v1/builds/build-1787912646223/bob/changes
Git diff of your changes (per file):
```json
{
  "build_id": "build-1787912646223",
  "bob_session_id": "bob-sess-1787912646223",
  "event_id": "changes-event-id",
  "change_set_id": "changeset-001",
  "files": [
    { "file_path": "src/validation/InvoiceValidator.ts", "change_type": "modified", "diff": "..." }
  ]
}
```

### POST http://localhost:3001/api/v1/builds/build-1787912646223/bob/tests
Test run results:
```json
{
  "build_id": "build-1787912646223",
  "bob_session_id": "bob-sess-1787912646223",
  "event_id": "tests-event-id",
  "test_run_id": "run-001",
  "name": "Invoice Automation Suite",
  "total_tests": 21,
  "passed": 21,
  "failed": 0,
  "duration_ms": 1200,
  "status": "Passed"
}
```

### POST http://localhost:3001/api/v1/builds/build-1787912646223/bob/documentation
Generated documentation:
```json
{
  "build_id": "build-1787912646223",
  "bob_session_id": "bob-sess-1787912646223",
  "event_id": "docs-event-id",
  "artifacts": [
    { "title": "Invoice Automation — Implementation Notes", "content": "...", "path": "docs/IMPLEMENTATION.md", "artifact_type": "README" }
  ]
}
```
