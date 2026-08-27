# API Contract Gaps

The frontend expects several API calls that are not defined in the canonical backend `API_Contract.md`. 
Below are the proposed endpoints to bridge these gaps.

## 1. Dashboard Statistics
- **Frontend Consumer**: `getDashboardStats()` in Dashboard
- **Required Operation**: Fetch aggregate statistics for the dashboard
- **Proposed Endpoint**: `GET /stats/dashboard`
- **Request Shape**: None
- **Response Shape**: 
```json
{
  "totalWorkflows": "number",
  "activeWorkflows": "number",
  "pendingTasks": "number",
  "bobChanges": "number"
}
```
- **Why it is required**: To render the main dashboard KPI cards.
- **MVP Critical**: Yes.

## 2. Activity Timeline
- **Frontend Consumer**: `getActivity()` in Dashboard / Activity Feed
- **Required Operation**: Fetch recent activity events
- **Proposed Endpoint**: `GET /activity`
- **Request Shape**: None
- **Response Shape**: 
```json
[{
  "id": "string",
  "title": "string",
  "source": "string",
  "timestamp": "string"
}]
```
- **Why it is required**: To display the activity timeline in the dashboard.
- **MVP Critical**: Yes.

## 3. Change Rule
- **Frontend Consumer**: `changeRule(ruleId, updates)`
- **Required Operation**: Update an existing business rule (e.g. changing threshold from 5L to 10L).
- **Proposed Endpoint**: `PATCH /rules/:id`
- **Request Shape**: `{"condition": "string", "action": "string", "description": "string"}`
- **Response Shape**: `200 OK`
- **Why it is required**: Required for the core "wow" demo moment of changing a rule and triggering an impact analysis.
- **MVP Critical**: Yes.

## 4. Workflow Execution Status
- **Frontend Consumer**: `getWorkflowExecution(workflowId)`
- **Required Operation**: Get real-time execution status of an active workflow instance
- **Proposed Endpoint**: `GET /workflows/:id/execution`
- **Request Shape**: None
- **Response Shape**: 
```json
{
  "id": "string",
  "amount": "string",
  "status": "string",
  "steps": [{ "name": "string", "status": "string" }],
  "assignedTo": "string",
  "timeElapsed": "string",
  "history": [{ "event": "string", "timestamp": "string" }]
}
```
- **Why it is required**: To show the current progress of a live workflow.
- **MVP Critical**: Yes.

## 5. Workflow Documentation
- **Frontend Consumer**: `getDocumentation(workflowId)`
- **Required Operation**: Get generated API endpoints and rules doc for a workflow.
- **Proposed Endpoint**: `GET /workflows/:id/documentation`
- **Request Shape**: None
- **Response Shape**: 
```json
{
  "endpoints": [{ "method": "string", "path": "string", "desc": "string", "body": "string" }],
  "rules": [{ "condition": "string", "action": "string" }]
}
```
- **Why it is required**: To display Bob's generated documentation in the UI.
- **MVP Critical**: Yes.

## 6. Build Overview
- **Frontend Consumer**: `getBuildOverview(buildId)`
- **Required Operation**: Get detailed status of a specific Bob build and its stages.
- **Proposed Endpoint**: `GET /builds/:id`
- **Request Shape**: None
- **Response Shape**: 
```json
{
  "id": "string",
  "workflowId": "string",
  "status": "string",
  "stages": [{ "id": "string", "name": "string", "status": "string" }]
}
```
- **Why it is required**: To display the progress of Bob's implementation pipeline.
- **MVP Critical**: Yes.

## 7. Bob Activity & Subagents
- **Frontend Consumer**: `getBobActivity(buildId)` and `getBobSubagents(buildId)`
- **Required Operation**: Fetch Bob's terminal logs/events and subagent statuses.
- **Proposed Endpoint**: `GET /builds/:id/bob-activity` and `GET /builds/:id/subagents`
- **Request Shape**: None
- **Response Shape**: Activity events list and Subagents list.
- **Why it is required**: Required for the Bob build UI screen to show the agent working.
- **MVP Critical**: Yes.

## 8. Build Security Results & Tests
- **Frontend Consumer**: `getSecurityResult(buildId)`, `getTests(workflowId)`
- **Required Operation**: Fetch static analysis and test run results.
- **Proposed Endpoint**: `GET /builds/:id/security` and `GET /builds/:id/tests`
- **Request Shape**: None
- **Response Shape**: Security metrics object, and Array of test runs.
- **Why it is required**: Required for the Review step to show security & test passing.
- **MVP Critical**: Yes.

## 9. Review Summary
- **Frontend Consumer**: `getReviewSummary(workflowId)`
- **Required Operation**: Fetch aggregate summary of changes before human review.
- **Proposed Endpoint**: `GET /workflows/:id/review-summary` or `GET /builds/:id/review-summary`
- **Request Shape**: None
- **Response Shape**: 
```json
{
  "filesChanged": "number",
  "testsPassed": "number",
  "testsFailed": "number",
  "rulesChanged": "number",
  "businessImpact": "string"
}
```
- **Why it is required**: Shows the summary pane on the review page.
- **MVP Critical**: Yes.
