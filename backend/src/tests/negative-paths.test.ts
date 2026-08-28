import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app';
import { db } from '../db';
import { sql } from 'kysely';

describe('Negative Paths Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
    
    // Seed some base entities for testing
    await db.insertInto('projects').values({
      id: '00000000-0000-0000-0000-000000000099',
      name: 'Negative Path Test Project'
    }).onConflict((oc) => oc.doNothing()).execute();
    
    await db.insertInto('workflows').values({
      id: '00000000-0000-0000-0000-000000000099',
      project_id: '00000000-0000-0000-0000-000000000099',
      name: 'Test Workflow'
    }).onConflict((oc) => oc.doNothing()).execute();

    await db.insertInto('workflow_versions').values({
      id: '00000000-0000-0000-0000-000000000099',
      workflow_id: '00000000-0000-0000-0000-000000000099',
      version: 1,
      status: 'PUBLISHED'
    }).onConflict((oc) => oc.doNothing()).execute();

    await db.insertInto('blueprints').values({
      workflow_version_id: '00000000-0000-0000-0000-000000000099',
      schema_json: {},
      validation_status: 'VALID',
      validation_errors: null
    }).execute();
  });

  afterAll(async () => {
    // Cleanup
    await db.deleteFrom('projects').where('id', '=', '00000000-0000-0000-0000-000000000099').execute();
    await app.close();
  });

  async function createTestBuild(status = 'READY_FOR_REVIEW') {
    const blueprint = await db.selectFrom('blueprints').where('workflow_version_id', '=', '00000000-0000-0000-0000-000000000099').selectAll().executeTakeFirst();
    const build = await db.insertInto('builds').values({
      blueprint_id: blueprint?.id || '00000000-0000-0000-0000-000000000099',
      status,
    }).returning('id').executeTakeFirstOrThrow();
    return build.id;
  }

  async function setupReview(buildId: string) {
    const review = await db.insertInto('reviews').values({
      build_id: buildId,
      version_id: '00000000-0000-0000-0000-000000000099',
      status: 'PENDING',
      reviewer: 'Test Reviewer'
    }).returningAll().executeTakeFirstOrThrow();
    return review.id;
  }

  it('Test Failure -> review blocked', async () => {
    const buildId = await createTestBuild();
    
    // Insert failing test run
    await db.insertInto('test_runs').values({
      id: `test_${Date.now()}`,
      build_id: buildId,
      name: 'Failed Test Suite',
      status: 'FAIL',
      total_tests: 1,
      passed: 0,
      failed: 1,
      duration_ms: 100,
      exit_code: 1,
      completed_at: new Date()
    }).execute();

    const reviewId = await setupReview(buildId);

    const response = await app.inject({
      method: 'POST',
      url: `/reviews/${reviewId}/approve`,
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error.message).toContain('Cannot approve: tests did not pass');
  });

  it('Security BLOCK -> review blocked', async () => {
    const buildId = await createTestBuild();
    
    // Insert passing test run so it doesn't fail on tests
    await db.insertInto('test_runs').values({
      id: `test_${Date.now()}`,
      build_id: buildId,
      name: 'Passed Test Suite',
      status: 'PASS',
      total_tests: 1,
      passed: 1,
      failed: 0,
      duration_ms: 100,
      exit_code: 0,
      completed_at: new Date()
    }).execute();

    // Insert passing documentation
    await db.insertInto('documentation_artifacts').values({
      build_id: buildId,
      title: 'Docs',
      content: 'Docs'
    }).execute();

    // Insert Security BLOCK
    await db.insertInto('security_scans').values({
      build_id: buildId,
      status: 'BLOCK',
      critical: 2,
      high: 1,
      medium: 0,
      low: 0,
      risk_score: 90
    }).execute();

    const reviewId = await setupReview(buildId);

    const response = await app.inject({
      method: 'POST',
      url: `/reviews/${reviewId}/approve`,
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.payload);
    expect(body.error.message).toContain('SecurePush BLOCKED');
  });

  it('Review REJECT -> build FAILED', async () => {
    const buildId = await createTestBuild('READY_FOR_REVIEW');
    const reviewId = await setupReview(buildId);

    const response = await app.inject({
      method: 'POST',
      url: `/reviews/${reviewId}/reject`,
      payload: { comments: 'Too risky' }
    });

    expect(response.statusCode).toBe(200);

    const build = await db.selectFrom('builds').where('id', '=', buildId).selectAll().executeTakeFirst();
    expect(build?.status).toBe('FAILED');
    
    const review = await db.selectFrom('reviews').where('id', '=', reviewId).selectAll().executeTakeFirst();
    expect(review?.status).toBe('REJECTED');
  });
});
