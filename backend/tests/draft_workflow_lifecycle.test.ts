import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app';
import { db } from '../src/db';
import * as crypto from 'crypto';

describe('Draft Workflow Lifecycle (Create -> Analysis -> Graph)', () => {
  let app: any;
  const createdProjectIds: string[] = [];

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    // Clean up created test projects
    if (createdProjectIds.length > 0) {
      await db.deleteFrom('activity_events').where('project_id', 'in', createdProjectIds).execute();
      await db.deleteFrom('projects').where('id', 'in', createdProjectIds).execute();
    }
    await app.close();
  });

  it('A. Create Workflow without PDF produces valid DRAFT workflow with empty graph', async () => {
    const testName = `Empty Draft Test ${Date.now()}`;
    const response = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        name: testName,
        description: 'Testing draft creation without SOP'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(testName);
    expect(body.workflowId).toBeDefined();
    createdProjectIds.push(body.id);

    // Verify GET /workflows/:id/graph returns clean DRAFT empty state
    const graphRes = await app.inject({
      method: 'GET',
      url: `/workflows/${body.workflowId}/graph`
    });

    expect(graphRes.statusCode).toBe(200);
    const graph = JSON.parse(graphRes.payload);
    expect(graph.status).toBe('DRAFT');
    expect(graph.workflowName).toBe(testName);
    expect(graph.nodes.length).toBe(0);
    expect(graph.edges.length).toBe(0);
    expect(graph.rules.length).toBe(0);
  });

  it('B. Create Workflow with PDF runs extraction pipeline and persists actors, systems, steps, rules, and bottlenecks', async () => {
    const testName = `PDF SOP Extraction Test ${Date.now()}`;
    const response = await app.inject({
      method: 'POST',
      url: '/projects',
      payload: {
        name: testName,
        description: 'Standard operating procedure for invoice automation',
        filename: 'Invoice_Approval_SOP.pdf'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBeDefined();
    expect(body.workflowId).toBeDefined();
    expect(body.documentId).toBeDefined();
    createdProjectIds.push(body.id);

    // Verify document was marked as COMPLETED
    const doc = await db.selectFrom('documents').where('id', '=', body.documentId).selectAll().executeTakeFirst();
    expect(doc).toBeDefined();
    expect(doc?.extraction_status).toBe('COMPLETED');
    expect(doc?.workflow_id).toBe(body.workflowId);

    // Verify graph endpoint returns real extracted data
    const graphRes = await app.inject({
      method: 'GET',
      url: `/workflows/${body.workflowId}/graph`
    });

    expect(graphRes.statusCode).toBe(200);
    const graph = JSON.parse(graphRes.payload);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.rules.length).toBeGreaterThan(0);
    expect(graph.actors).toBeDefined();
    expect(graph.actors.length).toBeGreaterThan(0);
    expect(graph.systems).toBeDefined();
    expect(graph.systems.length).toBeGreaterThan(0);
    expect(graph.bottlenecks).toBeDefined();
    expect(graph.bottlenecks.length).toBeGreaterThan(0);

    // Verify specific actors and systems
    const actorNames = graph.actors.map((a: any) => a.name);
    expect(actorNames).toContain('Employee');
    expect(actorNames).toContain('Finance Manager');

    const systemNames = graph.systems.map((s: any) => s.name);
    expect(systemNames).toContain('Email');
    expect(systemNames).toContain('PO System');
  }, 30000);

  it('C. Extracted draft workflow with state machine nodes returns full graph without build', async () => {
    const testName = `Extracted Draft ${Date.now()}`;
    const projectId = crypto.randomUUID();
    createdProjectIds.push(projectId);

    await db.insertInto('projects').values({ id: projectId, name: testName }).execute();

    const workflowId = crypto.randomUUID();
    await db.insertInto('workflows').values({ id: workflowId, project_id: projectId, name: testName }).execute();

    const versionId = crypto.randomUUID();
    await db.insertInto('workflow_versions').values({ id: versionId, workflow_id: workflowId, version: 1, status: 'DRAFT' }).execute();

    const n1 = `node-start-${Date.now()}`;
    const n2 = `node-end-${Date.now()}`;
    await db.insertInto('workflow_nodes').values([
      { id: n1, version_id: versionId, name: 'Trigger Intake', type: 'START', kind: 'trigger' },
      { id: n2, version_id: versionId, name: 'Process Request', type: 'TERMINAL', kind: 'action' }
    ]).execute();

    await db.insertInto('workflow_edges').values([
      { id: `edge-${n1}-${n2}`, version_id: versionId, source_id: n1, target_id: n2, label: 'default', is_branch: false }
    ]).execute();

    const graphRes = await app.inject({
      method: 'GET',
      url: `/workflows/${workflowId}/graph`
    });

    expect(graphRes.statusCode).toBe(200);
    const graph = JSON.parse(graphRes.payload);
    expect(graph.status).toBe('DRAFT');
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(1);
    expect(graph.nodes[0].label).toBe('Trigger Intake');
    expect(graph.nodes[1].label).toBe('Process Request');
  });

  it('D. Unknown workflow ID returns 404 NOT_FOUND', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000';
    const response = await app.inject({
      method: 'GET',
      url: `/workflows/${unknownId}/graph`
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('WORKFLOW_NOT_FOUND');
  });

  it('E. Existing canonical workflow graph returns full graph regression-free', async () => {
    const canonicalWorkflowId = '0bc69865-15e0-4f30-af96-6227abee5e6c';
    const response = await app.inject({
      method: 'GET',
      url: `/workflows/${canonicalWorkflowId}/graph`
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.nodes.length).toBeGreaterThan(0);
    expect(body.edges.length).toBeGreaterThan(0);
    expect(body.rules.length).toBeGreaterThan(0);
  });
});
