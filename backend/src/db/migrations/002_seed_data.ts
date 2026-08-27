import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Project
  const [project] = await db
    .insertInto('projects')
    .values({
      name: 'Invoice Approval Automation',
    })
    .returning('id')
    .execute();
  const projectId = project.id;

  // 2. Workflow
  const [workflow] = await db
    .insertInto('workflows')
    .values({
      project_id: projectId,
      name: 'Invoice Approval',
    })
    .returning('id')
    .execute();
  const workflowId = workflow.id;

  // 3. Document
  const [document] = await db
    .insertInto('documents')
    .values({
      project_id: projectId,
      workflow_id: workflowId,
      filename: 'invoice-approval-SOP.pdf',
      mime_type: 'application/pdf',
      storage_path: 's3://enterprise-flow/docs/invoice-approval-SOP.pdf',
      extraction_status: 'COMPLETED',
    })
    .returning('id')
    .execute();
  const documentId = document.id;

  // 4. Workflow Version
  const [version] = await db
    .insertInto('workflow_versions')
    .values({
      workflow_id: workflowId,
      version: 1,
      status: 'ACTIVE',
    })
    .returning('id')
    .execute();
  const versionId = version.id;

  // 5. Actors
  const actors = [
    { name: 'Employee', role: 'Submitter' },
    { name: 'Finance Manager', role: 'Approver Level 1' },
    { name: 'CFO', role: 'Approver Level 2' },
  ];
  for (const actor of actors) {
    await db.insertInto('workflow_actors').values({ version_id: versionId, ...actor }).execute();
  }

  // 6. Systems
  const systems = [
    { name: 'Email', description: 'Internal communication and notifications' },
    { name: 'PO System', description: 'Purchase Order Tracking System' },
    { name: 'ERP', description: 'Enterprise Resource Planning software' },
  ];
  for (const system of systems) {
    await db.insertInto('workflow_systems').values({ version_id: versionId, ...system }).execute();
  }

  // 7. Nodes
  const nodes = [
    { id: 'NODE-invoice-received', type: 'TRIGGER', name: 'Invoice Received', kind: 'trigger', pos_x: 100, pos_y: 100 },
    { id: 'NODE-vendor-validation', type: 'SYSTEM_TASK', name: 'Vendor Validation', kind: 'task', pos_x: 300, pos_y: 100 },
    { id: 'NODE-duplicate-check', type: 'SYSTEM_TASK', name: 'Duplicate Check', kind: 'task', pos_x: 500, pos_y: 100 },
    { id: 'NODE-po-matching', type: 'SYSTEM_TASK', name: 'PO Matching', kind: 'task', pos_x: 700, pos_y: 100 },
    { id: 'NODE-amount-verification', type: 'DECISION', name: 'Amount Verification', kind: 'decision', pos_x: 900, pos_y: 100 },
    { id: 'NODE-approval-routing', type: 'HUMAN_TASK', name: 'Approval Routing', kind: 'task', pos_x: 1100, pos_y: 100 },
    { id: 'NODE-erp-update', type: 'SYSTEM_TASK', name: 'ERP Update', kind: 'task', pos_x: 1300, pos_y: 100 },
    { id: 'NODE-audit-log', type: 'SYSTEM_TASK', name: 'Audit Log', kind: 'task', pos_x: 1500, pos_y: 100 },
  ];
  for (const node of nodes) {
    await db.insertInto('workflow_nodes').values({ version_id: versionId, ...node }).execute();
  }

  // 8. Edges
  const edges = [
    { id: 'EDGE-1', source_id: 'NODE-invoice-received', target_id: 'NODE-vendor-validation' },
    { id: 'EDGE-2', source_id: 'NODE-vendor-validation', target_id: 'NODE-duplicate-check' },
    { id: 'EDGE-3', source_id: 'NODE-duplicate-check', target_id: 'NODE-po-matching' },
    { id: 'EDGE-4', source_id: 'NODE-po-matching', target_id: 'NODE-amount-verification' },
    { id: 'EDGE-5', source_id: 'NODE-amount-verification', target_id: 'NODE-approval-routing' },
    { id: 'EDGE-6', source_id: 'NODE-approval-routing', target_id: 'NODE-erp-update' },
    { id: 'EDGE-7', source_id: 'NODE-erp-update', target_id: 'NODE-audit-log' },
  ];
  for (const edge of edges) {
    await db.insertInto('workflow_edges').values({ version_id: versionId, ...edge }).execute();
  }

  // 9. Rules
  const [rule1] = await db
    .insertInto('business_rules')
    .values({
      id: 'RULE-manager-approval',
      version_id: versionId,
      name: 'Manager Approval Rule',
      description: 'Route to Finance Manager if amount is less than 500,000 INR',
      condition: 'amount < 500000',
      action: 'assign_to("Finance Manager")',
      node_id: 'NODE-amount-verification',
    })
    .returning('id')
    .execute();

  const [rule2] = await db
    .insertInto('business_rules')
    .values({
      id: 'RULE-cfo-approval',
      version_id: versionId,
      name: 'CFO Approval Rule',
      description: 'Route to CFO if amount is greater than or equal to 500,000 INR',
      condition: 'amount >= 500000',
      action: 'assign_to("CFO")',
      node_id: 'NODE-amount-verification',
    })
    .returning('id')
    .execute();

  // 10. Rule Dependencies (Polymorphic targets)
  await db
    .insertInto('rule_dependencies')
    .values([
      { business_rule_id: rule1.id, target_type: 'WORKFLOW_NODE', target_id: 'NODE-approval-routing' },
      { business_rule_id: rule1.id, target_type: 'SOURCE_FILE', target_id: 'src/services/approvalService.ts' },
      { business_rule_id: rule1.id, target_type: 'TEST_FILE', target_id: 'tests/approvalService.test.ts' },
      { business_rule_id: rule1.id, target_type: 'DOC_FILE', target_id: 'docs/approval-rules.md' },
      { business_rule_id: rule2.id, target_type: 'WORKFLOW_NODE', target_id: 'NODE-approval-routing' },
      { business_rule_id: rule2.id, target_type: 'SOURCE_FILE', target_id: 'src/services/approvalService.ts' },
    ])
    .execute();

  // 11. Blueprint
  const [blueprint] = await db
    .insertInto('blueprints')
    .values({
      workflow_version_id: versionId,
      schema_json: JSON.stringify({}),
    })
    .returning('id')
    .execute();
  const blueprintId = blueprint.id;

  // 12. Build
  const [build] = await db
    .insertInto('builds')
    .values({
      blueprint_id: blueprintId,
      status: 'COMPLETED',
    })
    .returning('id')
    .execute();
  const buildId = build.id;

  // 13. Build Plan
  await db
    .insertInto('build_plans')
    .values({
      build_id: buildId,
      summary: 'Implementation plan for Invoice Approval rules and routing.',
      plan_json: JSON.stringify({ steps: ['Implement rule parser', 'Update routing logic', 'Add tests'] }),
    })
    .execute();

  // 14. Bob Subagents
  await db
    .insertInto('build_subagents')
    .values([
      { id: 'SUBAGENT-1', build_id: buildId, name: 'Architect Agent', task: 'Design approval routing implementation', status: 'COMPLETED', result: 'Architecture documented' },
      { id: 'SUBAGENT-2', build_id: buildId, name: 'Code Agent', task: 'Implement approvalService.ts', status: 'COMPLETED', result: 'Code merged' },
      { id: 'SUBAGENT-3', build_id: buildId, name: 'Test Agent', task: 'Write tests for approval logic', status: 'COMPLETED', result: 'Tests passed' },
    ])
    .execute();

  // 15. Bob Activity Events
  await db
    .insertInto('bob_activity_events')
    .values([
      { build_id: buildId, event_type: 'PLANNING_STARTED', message: 'Bob has started analyzing the blueprint.', metadata: JSON.stringify({ agent: 'architect' }) },
      { build_id: buildId, event_type: 'CODE_GENERATED', message: 'Bob generated 120 lines of code in approvalService.ts.', metadata: JSON.stringify({ file: 'src/services/approvalService.ts' }) },
      { build_id: buildId, event_type: 'BUILD_COMPLETED', message: 'Bob successfully implemented the invoice approval workflow.', metadata: JSON.stringify({}) },
    ])
    .execute();

  // 16. Build Changes
  await db
    .insertInto('build_changes')
    .values([
      { build_id: buildId, file_path: 'src/services/approvalService.ts', change_type: 'CREATE', diff: '+ function routeApproval()...' },
      { build_id: buildId, file_path: 'tests/approvalService.test.ts', change_type: 'CREATE', diff: '+ describe("routeApproval")...' },
    ])
    .execute();

  // 17. Tests
  await db
    .insertInto('test_runs')
    .values({
      id: 'TESTRUN-1',
      build_id: buildId,
      total_tests: 45,
      passed: 45,
      failed: 0,
      duration_ms: 1200,
      name: 'Invoice Workflow Integration Tests',
      status: 'PASSED',
    })
    .execute();

  // 18. Security Scan
  await db
    .insertInto('security_scans')
    .values({
      build_id: buildId,
      risk_score: 95,
      status: 'PASS',
      critical: 0,
      high: 0,
      medium: 1,
      low: 2,
    })
    .execute();

  // 19. Documentation Artifact
  await db
    .insertInto('documentation_artifacts')
    .values({
      build_id: buildId,
      title: 'Invoice Approval Technical Docs',
      content: '# Invoice Approval Workflow\\n\\nThis document outlines the system architecture...',
    })
    .execute();

  // 20. Review
  const [review] = await db
    .insertInto('reviews')
    .values({
      build_id: buildId,
      version_id: versionId,
      status: 'APPROVED',
      reviewer: 'Alice.Admin',
      decision: 'APPROVE',
      comments: 'Looks good. Test coverage is solid.',
    })
    .returning('id')
    .execute();
  const reviewId = review.id;

  // 21. Workflow Execution
  const [execution] = await db
    .insertInto('workflow_executions')
    .values({
      id: 'EXEC-1001',
      version_id: versionId,
      build_id: buildId,
      approved_review_id: reviewId,
      status: 'COMPLETED',
      amount: 'INR 450,000',
      assigned_to: 'Finance Manager',
      time_elapsed: '2h 15m',
    })
    .returning('id')
    .execute();
  const executionId = execution.id;

  // 22. Execution History
  await db
    .insertInto('workflow_execution_history')
    .values([
      { execution_id: executionId, event: 'Workflow Started' },
      { execution_id: executionId, event: 'Vendor Validated' },
      { execution_id: executionId, event: 'Assigned to Finance Manager' },
      { execution_id: executionId, event: 'Approved by Finance Manager' },
      { execution_id: executionId, event: 'Workflow Completed' },
    ])
    .execute();

  // 23. System Audit Events
  await db
    .insertInto('activity_events')
    .values([
      { id: 'EV-1', title: 'Workflow Created', message: 'Invoice Approval workflow initialized', source: 'SYSTEM', event_type: 'WORKFLOW_CREATED', agent: 'System', status: 'SUCCESS', project_id: projectId },
      { id: 'EV-2', title: 'Build Deployed', message: 'Build deployed successfully to production', source: 'DEPLOYMENT', event_type: 'DEPLOY_SUCCESS', agent: 'System', status: 'SUCCESS', project_id: projectId },
    ])
    .execute();

  // 24. Async Jobs
  await db
    .insertInto('jobs')
    .values([
      { type: 'DOCUMENT_EXTRACTION', status: 'COMPLETED', progress: 100, resource_type: 'DOCUMENT', resource_id: documentId },
      { type: 'BOB_BUILD', status: 'COMPLETED', progress: 100, resource_type: 'BUILD', resource_id: buildId },
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Truncate tables in reverse order of dependencies, or just clear projects which cascades
  await db.deleteFrom('projects').execute();
}
