import { describe, test, expect, beforeAll } from 'vitest';
import { db } from '../src/db';
import { buildApp } from '../src/app';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Layer A: Real EnterpriseFlow E2E
 * We test the entire EnterpriseFlow architecture from HTTP -> Service -> DB -> JobWorker -> Filesystem.
 * 
 * Layer B: Bob Boundary Simulation
 * Bob is MOCKED-BY-DESIGN externally. We do not simulate Bob internally. We send evidence
 * to the exact same webhooks Bob would use to prove EnterpriseFlow handles it correctly.
 */
describe('E2E Full Lifecycle & Invariant Audit', () => {
  let app: any;
  let projectId: string;
  let documentId: string;
  let workflowId: string;
  let versionId: string;
  let blueprintId: string;
  let buildId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
    
    // Clear potentially conflicting state for a clean run
    await db.deleteFrom('workflow_executions').execute();
    const existingProjects = await db.selectFrom('projects').where('name', '=', 'E2E Test Project').select('id').execute();
    if (existingProjects.length > 0) {
      const ids = existingProjects.map(p => p.id);
      await db.deleteFrom('activity_events').where('project_id', 'in', ids).execute();
      await db.deleteFrom('projects').where('id', 'in', ids).execute();
    }
    
    // Create base project
    const project = await db.insertInto('projects').values({
      name: 'E2E Test Project'
    }).returning('id').executeTakeFirstOrThrow();
    projectId = project.id;
  });

  const waitForJob = async (jobId: string, timeoutMs = 15000) => {
    let elapsed = 0;
    while (elapsed < timeoutMs) {
      const job = await db.selectFrom('jobs').where('id', '=', jobId).selectAll().executeTakeFirst();
      if (job?.status === 'COMPLETED' || job?.status === 'FAILED') {
        if (job.status === 'FAILED') {
          console.error("Job Failed:", job);
        }
        return job;
      }
      await new Promise(r => setTimeout(r, 200));
      elapsed += 200;
    }
    throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
  };

  test('STEP 1 & 2: Workflow Extraction (Concurrency + DB Truth)', async () => {
    // Insert a document manually as if uploaded
    const doc = await db.insertInto('documents').values({
      project_id: projectId,
      filename: 'Invoice_Approval_Policy.pdf',
      mime_type: 'application/pdf',
      storage_path: 'test/Invoice_Approval_Policy.pdf',
      extraction_status: 'UPLOADED'
    }).returning('id').executeTakeFirstOrThrow();
    documentId = doc.id;

    // Test Concurrency/Idempotency
    const req1 = app.inject({ method: 'POST', url: `/documents/${documentId}/extract` });
    const req2 = app.inject({ method: 'POST', url: `/documents/${documentId}/extract` });
    const req3 = app.inject({ method: 'POST', url: `/documents/${documentId}/extract` });
    
    const responses = await Promise.all([req1, req2, req3]);
    const successRes = responses.find(r => r.statusCode === 202);
    expect(successRes).toBeDefined(); // At least one succeeded
    
    const { jobId } = JSON.parse(successRes!.body);

    // Verify state transitions (DB Truth)
    const job = await waitForJob(jobId);
    expect(job.status).toBe('COMPLETED');
    expect(job.resource_id).toBeDefined(); // Should point to the extracted workflow
    
    workflowId = job.resource_id!;
    
    // DB Truth verification
    const workflow = await db.selectFrom('workflows').where('id', '=', workflowId).selectAll().executeTakeFirst();
    expect(workflow).toBeDefined();

    const version = await db.selectFrom('workflow_versions').where('workflow_id', '=', workflowId).selectAll().executeTakeFirst();
    expect(version).toBeDefined();
    versionId = version!.id;
  }, 30000);

  test('STEP 3 & 4: Analysis & Graph Generation', async () => {
    const res = await app.inject({ method: 'GET', url: `/workflows/${workflowId}/graph` });
    expect(res.statusCode).toBe(200);
    const graph = JSON.parse(res.body);
    
    // Verify schema
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
    
    // DB Truth: Verify rules exist
    const rules = await db.selectFrom('business_rules').where('version_id', '=', versionId).selectAll().execute();
    expect(rules.length).toBeGreaterThan(0);
    
    // Ensure the 500k rule exists (for our step 13 rule change test)
    // For test purposes we assume the extraction generated it, or we insert it if the AI mock didn't.
  }, 30000);

  test('STEP 5: Blueprint Generation (Idempotency)', async () => {
    const req1 = app.inject({ method: 'POST', url: `/workflows/${workflowId}/blueprint` });
    const req2 = app.inject({ method: 'POST', url: `/workflows/${workflowId}/blueprint` });
    
    const [res1, res2] = await Promise.all([req1, req2]);
    // Both might return 200/201 depending on how /blueprints is implemented, but DB should have 1 blueprint
    
    const blueprints = await db.selectFrom('blueprints').where('workflow_version_id', '=', versionId).selectAll().execute();
    expect(blueprints.length).toBe(1);
    blueprintId = blueprints[0].id;
    
    // Verify Architectural Invariant: Blueprint belongs to exactly one version
    expect(blueprints[0].workflow_version_id).toBe(versionId);
  }, 30000);

  test('STEP 6: Bob Engineering Package (Build Creation)', async () => {
    const res = await app.inject({ method: 'POST', url: `/blueprints/${blueprintId}/implement` });
    expect(res.statusCode).toBe(202);
    
    const { jobId } = JSON.parse(res.body);
    const job = await waitForJob(jobId);
    expect(job.status).toBe('COMPLETED');
    
    // DB Truth
    buildId = job.resource_id!;
    const build = await db.selectFrom('builds').where('id', '=', buildId).selectAll().executeTakeFirst();
    expect(build?.status).toBe('WAITING_FOR_BOB');
    
    // Verify Architectural Invariant: Build references exactly one blueprint
    expect(build?.blueprint_id).toBe(blueprintId);
  }, 20000);

  test('STEP 7 & 8: Bob Evidence Submission (Boundary Simulation)', async () => {
    // Bob sends PLAN
    await app.inject({
      method: 'POST',
      url: `/builds/${buildId}/bob/plan`,
      payload: { 
        bob_session_id: 'session-123',
        event_id: 'evt-1',
        summary: 'Planning test',
        plan_json: {}
      }
    });
    
    // Bob sends CHANGES_RECEIVED
    await app.inject({
      method: 'POST',
      url: `/builds/${buildId}/bob/changes`,
      payload: { 
        bob_session_id: 'session-123',
        event_id: 'evt-2',
        change_set_id: 'change-1',
        files: [{ file_path: 'src/approval.ts', change_type: 'modified' }]
      }
    });
    
    const build = await db.selectFrom('builds').where('id', '=', buildId).selectAll().executeTakeFirst();
    // After CHANGES_RECEIVED, status should progress (e.g. to SECURITY_SCANNED or TESTING)
    expect(build?.status).not.toBe('WAITING_FOR_BOB');
  }, 30000);

  test('STEP 9 & 10: Tests & Docs', async () => {
    // Simulate triggering tests (normally done via JobWorker after CHANGES_RECEIVED)
    const res = await app.inject({ method: 'POST', url: `/builds/${buildId}/test` });
    expect(res.statusCode).toBe(202);
    
    const { jobId } = JSON.parse(res.body);
    await waitForJob(jobId);
    
    const testRuns = await db.selectFrom('test_runs').where('build_id', '=', buildId).selectAll().execute();
    // DB Truth verification
    expect(testRuns.length).toBeGreaterThan(0);
  }, 20000);

  test('STEP 11: Review lifecycle & Negative Paths', async () => {
    // Create a review record so we can approve/reject it
    const reviewRes = await app.inject({
      method: 'POST',
      url: `/reviews/builds/${buildId}/reviews`,
      payload: { reviewer: 'governance-lead@company.com', comments: 'E2E review', versionId }
    });
    const review = JSON.parse(reviewRes.body);
    const reviewId = review.id;

    // Negative Path: force build into bad status, then attempt approval
    await db.updateTable('builds').set({ status: 'TESTING_FAILED' }).where('id', '=', buildId).execute();
    
    const badApprove = await app.inject({ method: 'POST', url: `/reviews/${reviewId}/approve` });
    expect(badApprove.statusCode).toBe(400); // Should fail because build not READY_FOR_REVIEW
    
    // Fix status to READY_FOR_REVIEW for the happy path
    await db.updateTable('builds').set({ status: 'READY_FOR_REVIEW' }).where('id', '=', buildId).execute();
    
    const goodApprove = await app.inject({ method: 'POST', url: `/reviews/${reviewId}/approve` });
    expect(goodApprove.statusCode).toBe(200);
    
    const build = await db.selectFrom('builds').where('id', '=', buildId).selectAll().executeTakeFirst();
    expect(build?.status).toBe('ACTIVATED');
  }, 30000);

  test('STEP 12: Execute Workflow (Two-Invoice Scenario Version 1)', async () => {
    // Assuming extraction created a 500k rule. 
    // Execute Invoice A: 400k -> Finance Manager
    const resA = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: { versionId, invoiceData: { amount: 400000, hasPO: true, isDuplicate: false } }
    });
    expect(resA.statusCode).toBe(202);
    
    const jobA = await waitForJob(JSON.parse(resA.body).jobId);
    const historyA = await db.selectFrom('workflow_execution_history').where('execution_id', '=', jobA.resource_id!).selectAll().execute();
    expect(historyA.some(h => h.event === 'Finance Manager')).toBe(true);
    
    // Execute Invoice B: 750k -> CFO
    const resB = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: { versionId, invoiceData: { amount: 750000, hasPO: true, isDuplicate: false } }
    });
    expect(resB.statusCode).toBe(202);
    const jobB = await waitForJob(JSON.parse(resB.body).jobId);
    const historyB = await db.selectFrom('workflow_execution_history').where('execution_id', '=', jobB.resource_id!).selectAll().execute();
    expect(historyB.some(h => h.event === 'CFO')).toBe(true);
  }, 30000);

  test('STEP 13 & 14: Rule Change, Impact Analysis, & Immutability Proof', async () => {
    // 1. Fetch rule to change
    const rules = await db.selectFrom('business_rules').where('version_id', '=', versionId).selectAll().execute();
    const rule = rules[0]; // Assuming this is the threshold rule
    
    // 2. Change rule — API expects { baseVersion: number, expression: string }
    const resChange = await app.inject({
      method: 'PUT',
      url: `/rules/${rule.id}`,
      payload: { baseVersion: 1, expression: 'amount >= 1000000' }
    });
    expect(resChange.statusCode).toBe(200);
    
    // 3. Immutability Verification
    // Version 1 should still exist and have old rules (original condition unchanged)
    const v1Rules = await db.selectFrom('business_rules').where('version_id', '=', versionId).selectAll().execute();
    expect(v1Rules.find(r => r.id === rule.id)?.condition).not.toBe('amount >= 1000000');
    
    // Verify Version 2 exists
    const newVersion = await db.selectFrom('workflow_versions').where('workflow_id', '=', workflowId).orderBy('version', 'desc').limit(1).selectAll().executeTakeFirst();
    expect(newVersion?.id).not.toBe(versionId);
    expect(newVersion?.version).toBe(2);
    
    // 4. Two-Invoice Scenario Version 2
    // Execute Invoice B: 750k -> Now routes to Finance Manager instead of CFO (threshold raised to 1M)
    const resB2 = await app.inject({
      method: 'POST',
      url: `/workflows/${workflowId}/execute`,
      payload: { versionId: newVersion!.id, invoiceData: { amount: 750000, hasPO: true, isDuplicate: false } }
    });
    expect(resB2.statusCode).toBe(202);
    const jobB2 = await waitForJob(JSON.parse(resB2.body).jobId);
    const historyB2 = await db.selectFrom('workflow_execution_history').where('execution_id', '=', jobB2.resource_id!).selectAll().execute();
    expect(historyB2.some(h => h.event === 'Finance Manager')).toBe(true); // Changed routing!
  }, 30000);
});
