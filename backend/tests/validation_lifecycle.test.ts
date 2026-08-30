import { describe, test, expect, beforeAll } from 'vitest';
import { db } from '../src/db';
import { buildApp } from '../src/app';

describe('Engineering Validation Lifecycle', () => {
  let app: any;
  let projectId: string;
  let workflowId: string;
  let versionId: string;
  let blueprintId: string;

  beforeAll(async () => {
    app = buildApp();

    const project = await db.insertInto('projects').values({
      name: 'Validation Lifecycle Test'
    }).returning('id').executeTakeFirstOrThrow();
    projectId = project.id;

    const workflow = await db.insertInto('workflows').values({
      project_id: projectId,
      name: 'Test Workflow'
    }).returning('id').executeTakeFirstOrThrow();
    workflowId = workflow.id;

    const version = await db.insertInto('workflow_versions').values({
      workflow_id: workflowId,
      version: 1,
      status: 'DRAFT'
    }).returning('id').executeTakeFirstOrThrow();
    versionId = version.id;

    // Minimal graph
    const trigId = `n_val_trig_${Date.now()}`;
    const taskId = `n_val_task_${Date.now()}`;
    await db.insertInto('workflow_nodes').values([
      { id: trigId, version_id: versionId, type: 'TRIGGER', name: 'Trigger', kind: 'trigger', pos_x: 0, pos_y: 0 },
      { id: taskId, version_id: versionId, type: 'ACTION', name: 'Task', kind: 'action', pos_x: 0, pos_y: 0 },
    ]).execute();

    await db.insertInto('workflow_edges').values([
      { id: `e_val_${Date.now()}`, version_id: versionId, source_id: trigId, target_id: taskId, is_branch: false },
    ]).execute();

    const blueprint = await db.insertInto('blueprints').values({
      workflow_version_id: versionId,
      schema_json: JSON.stringify({})
    }).returning('id').executeTakeFirstOrThrow();
    blueprintId = blueprint.id;
  });

  test('Happy Path: SecurePush PASS -> Testing -> Validation -> Ready for Review -> Approve', { timeout: 15000 }, async () => {
    // 1. Create build (mimicking WAITING_FOR_BOB)
    const build = await db.insertInto('builds').values({
      blueprint_id: blueprintId,
      status: 'READY_FOR_REVIEW'
    }).returning('id').executeTakeFirstOrThrow();

    // Inject Mock Security Scan with evidence
    await db.insertInto('security_scans').values({
      build_id: build.id,
      status: 'PASS',
      critical: 0, high: 0, medium: 0, low: 0,
      completed_at: new Date(),
      findings: JSON.stringify([])
    }).execute();

    // Inject Plan
    await db.insertInto('build_plans').values({
      build_id: build.id,
      summary: 'Plan',
      plan_json: JSON.stringify({ steps: [] })
    }).execute();

    // Inject Changes
    await db.insertInto('build_changes').values({
      build_id: build.id,
      file_path: 'src/index.ts',
      change_type: 'CREATE',
      diff: '+ code'
    }).execute();

    // Inject Bob Activity
    await db.insertInto('bob_activity_events').values({
      build_id: build.id,
      event_type: 'BUILD_COMPLETED',
      message: 'Completed'
    }).execute();

    // Inject Mock passing tests
    const testRun = await db.insertInto('test_runs').values({
      id: `tr_${Date.now()}`,
      build_id: build.id,
      status: 'PASS',
      failed: 0,
      completed_at: new Date()
    }).returning('id').executeTakeFirstOrThrow();
    
    await db.insertInto('test_results').values({
      test_run_id: testRun.id,
      build_id: build.id,
      test_name: 'dummy test',
      status: 'passed'
    }).execute();

    // Inject Document
    await db.insertInto('documentation_artifacts').values({
      build_id: build.id,
      title: 'Doc',
      content: 'Content'
    }).execute();

    // Submit review
    let submitRes = await app.inject({
      method: 'POST',
      url: `/reviews/builds/${build.id}/reviews`,
      payload: { reviewer: 'Alice', versionId }
    });
    
    expect(submitRes.statusCode).toBe(200);
    const reviewId = JSON.parse(submitRes.body).id;

    // Approve Review
    let approveRes = await app.inject({
      method: 'POST',
      url: `/reviews/${reviewId}/approve`
    });

    expect(approveRes.statusCode).toBe(200);
  });

  test('Failure Path: Test fails -> READY_FOR_REVIEW -> Approve -> Rejected by Validation', { timeout: 15000 }, async () => {
    const build = await db.insertInto('builds').values({
      blueprint_id: blueprintId,
      status: 'READY_FOR_REVIEW'
    }).returning('id').executeTakeFirstOrThrow();

    await db.insertInto('security_scans').values({
      build_id: build.id,
      status: 'PASS'
    }).execute();

    await db.insertInto('test_runs').values({
      id: `tr_${Date.now()}_fail`,
      build_id: build.id,
      status: 'FAIL',
      failed: 1
    }).execute();

    await db.insertInto('documentation_artifacts').values({
      build_id: build.id,
      title: 'Doc',
      content: 'Content'
    }).execute();

    let submitRes = await app.inject({
      method: 'POST',
      url: `/reviews/builds/${build.id}/reviews`,
      payload: { reviewer: 'Bob', versionId }
    });
    const reviewId = JSON.parse(submitRes.body).id;

    let approveRes = await app.inject({
      method: 'POST',
      url: `/reviews/${reviewId}/approve`
    });

    // Should fail validation because tests didn't pass
    expect(approveRes.statusCode).toBe(400);
    expect(JSON.parse(approveRes.body).error.message).toContain('tests did not pass');
  });
});
