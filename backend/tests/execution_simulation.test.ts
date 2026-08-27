import { describe, test, expect, beforeAll } from 'vitest';
import { db } from '../src/db';
import { buildApp } from '../src/app';

describe('Execution Simulation & Read Models', () => {
  let app: any;
  let projectId: string;
  let workflowId: string;
  let versionId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // 1. Setup minimal workflow context
    const project = await db.insertInto('projects').values({
      name: 'Simulation Test Project'
    }).returning('id').executeTakeFirstOrThrow();
    projectId = project.id;

    const workflow = await db.insertInto('workflows').values({
      project_id: projectId,
      name: 'Invoice Workflow'
    }).returning('id').executeTakeFirstOrThrow();
    workflowId = workflow.id;

    const version = await db.insertInto('workflow_versions').values({
      workflow_id: workflowId,
      version: 1,
      status: 'ACTIVE'
    }).returning('id').executeTakeFirstOrThrow();
    versionId = version.id;

    // 2. Insert minimal graph (Vendor -> POMatch -> DuplicateCheck -> AmountVerification -> Manager/CFO)
    await db.insertInto('workflow_nodes').values([
      { id: 'n_vendor', version_id: versionId, type: 'TRIGGER', name: 'Vendor Validation', kind: 'trigger', pos_x: 0, pos_y: 0 },
      { id: 'n_po', version_id: versionId, type: 'ACTION', name: 'PO Matching', kind: 'action', pos_x: 0, pos_y: 0 },
      { id: 'n_dup', version_id: versionId, type: 'ACTION', name: 'Duplicate Check', kind: 'action', pos_x: 0, pos_y: 0 },
      { id: 'n_amount', version_id: versionId, type: 'CONDITION', name: 'Amount Verification', kind: 'condition', pos_x: 0, pos_y: 0 },
      { id: 'n_cfo', version_id: versionId, type: 'ACTION', name: 'CFO Approval', kind: 'action', pos_x: 0, pos_y: 0 },
      { id: 'n_mgr', version_id: versionId, type: 'ACTION', name: 'Manager Approval', kind: 'action', pos_x: 0, pos_y: 0 },
    ]).execute();

    await db.insertInto('workflow_edges').values([
      { id: 'e_1', version_id: versionId, source_id: 'n_vendor', target_id: 'n_po', is_branch: false },
      { id: 'e_2', version_id: versionId, source_id: 'n_po', target_id: 'n_dup', is_branch: false },
      { id: 'e_3', version_id: versionId, source_id: 'n_dup', target_id: 'n_amount', is_branch: false },
      { id: 'e_4', version_id: versionId, source_id: 'n_amount', target_id: 'n_cfo', is_branch: true, label: 'CFO' },
      { id: 'e_5', version_id: versionId, source_id: 'n_amount', target_id: 'n_mgr', is_branch: true, label: 'Manager' },
    ]).execute();

    // 3. Insert rules
    await db.insertInto('business_rules').values([
      { id: 'r_cfo', version_id: versionId, name: 'CFO Threshold', condition: 'amount >= 1000000', action: 'assign_to("CFO")', node_id: 'n_amount' },
      { id: 'r_mgr', version_id: versionId, name: 'Manager Threshold', condition: 'amount < 1000000', action: 'assign_to("Finance Manager")', node_id: 'n_amount' },
    ]).execute();
  });

  const waitForExecutionToComplete = async (executionId: string) => {
    // Basic polling to wait for async job to finish
    let attempts = 0;
    while (attempts < 10) {
      const exec = await db.selectFrom('workflow_executions').where('id', '=', executionId).selectAll().executeTakeFirst();
      if (exec?.status === 'COMPLETED' || exec?.status === 'FAILED') return exec;
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    throw new Error('Execution timed out');
  };

  test('Valid Invoice - CFO Route (amount >= 1M)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: {
        versionId,
        invoiceData: { amount: 1500000, hasPO: true, isDuplicate: false }
      }
    });
    
    expect(res.statusCode).toBe(202);
    const { executionId } = JSON.parse(res.body);

    const exec = await waitForExecutionToComplete(executionId);
    expect(exec.status).toBe('COMPLETED');

    // Verify history routed to CFO
    const history = await db.selectFrom('workflow_execution_history').where('execution_id', '=', executionId).orderBy('timestamp', 'asc').selectAll().execute();
    const cfoStep = history.find(h => h.event === 'CFO Approval');
    expect(cfoStep).toBeDefined();

    // Verify activity event logged
    const activities = await db.selectFrom('activity_events').where('entity_id', '=', executionId).selectAll().execute();
    expect(activities.length).toBeGreaterThan(0);
    expect(activities.some(a => a.event_type === 'WORKFLOW_EXECUTION_STARTED')).toBe(true);
    expect(activities.some(a => a.event_type === 'WORKFLOW_EXECUTION_COMPLETED')).toBe(true);
  });

  test('Valid Invoice - Manager Route (amount < 1M)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: {
        versionId,
        invoiceData: { amount: 500000, hasPO: true, isDuplicate: false }
      }
    });
    
    expect(res.statusCode).toBe(202);
    const { executionId } = JSON.parse(res.body);
    await waitForExecutionToComplete(executionId);

    const history = await db.selectFrom('workflow_execution_history').where('execution_id', '=', executionId).selectAll().execute();
    expect(history.some(h => h.event === 'Manager Approval')).toBe(true);
    expect(history.some(h => h.event === 'CFO Approval')).toBe(false);
  });

  test('Fails PO Matching', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: {
        versionId,
        invoiceData: { amount: 500000, hasPO: false, isDuplicate: false }
      }
    });
    const { executionId } = JSON.parse(res.body);
    const exec = await waitForExecutionToComplete(executionId);
    expect(exec.status).toBe('FAILED');
    expect(exec.failure_reason).toContain('Missing Purchase Order');
  });

  test('Fails Duplicate Check', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: {
        versionId,
        invoiceData: { amount: 500000, hasPO: true, isDuplicate: true }
      }
    });
    const { executionId } = JSON.parse(res.body);
    const exec = await waitForExecutionToComplete(executionId);
    expect(exec.status).toBe('FAILED');
    expect(exec.failure_reason).toContain('duplicate');
  });

  test('Dashboard and Activity Endpoints', async () => {
    const dashboardRes = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/stats/dashboard`
    });
    expect(dashboardRes.statusCode).toBe(200);
    const stats = JSON.parse(dashboardRes.body);
    expect(stats.activeWorkflows).toBe(1);
    expect(stats.totalWorkflows).toBe(1);

    const activityRes = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}/activity`
    });
    expect(activityRes.statusCode).toBe(200);
    const activities = JSON.parse(activityRes.body);
    expect(Array.isArray(activities)).toBe(true);
  });

  test('Execution API returns frontend shape', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/workflows/${workflowId}/execution`
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.execution).toBeDefined();
    expect(body.execution.status).toBeDefined();
    expect(body.input).toBeDefined();
    expect(Array.isArray(body.history)).toBe(true);
  });
});
