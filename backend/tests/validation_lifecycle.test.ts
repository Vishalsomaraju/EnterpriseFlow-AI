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

    const blueprint = await db.insertInto('blueprints').values({
      version_id: versionId
    }).returning('id').executeTakeFirstOrThrow();
    blueprintId = blueprint.id;
  });

  test('Happy Path: SecurePush PASS -> Testing -> Validation -> Ready for Review -> Approve', async () => {
    // 1. Create build (mimicking WAITING_FOR_BOB)
    const build = await db.insertInto('builds').values({
      blueprint_id: blueprintId,
      status: 'READY_FOR_REVIEW'
    }).returning('id').executeTakeFirstOrThrow();

    // Inject Mock Security Scan
    await db.insertInto('security_scans').values({
      build_id: build.id,
      status: 'PASS',
      critical: 0, high: 0, medium: 0, low: 0
    }).execute();

    // Inject Mock passing tests
    const testRun = await db.insertInto('test_runs').values({
      id: `tr_${Date.now()}`,
      build_id: build.id,
      status: 'PASS',
      failed: 0
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

  test('Failure Path: Test fails -> READY_FOR_REVIEW -> Approve -> Rejected by Validation', async () => {
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
