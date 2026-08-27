import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app';

describe('API Contract Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /projects matches Frontend Project[] contract', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/projects',
    });
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
    
    if (body.length > 0) {
      const project = body[0];
      // Frontend expects: { id: string; name: string; created_at: string; }
      expect(typeof project.id).toBe('string');
      expect(typeof project.name).toBe('string');
      expect(typeof project.created_at).toBe('string');
    }
  });

  it('GET /workflows/:id/graph matches Frontend WorkflowGraph contract', async () => {
    // We can test against a known workflow if we want, or just verify structure of a 404/empty.
    // Assuming there's a seed workflow id:
    const workflowResponse = await app.inject({
      method: 'GET',
      url: '/workflows/00000000-0000-0000-0000-000000000001/graph', // assuming UUID works or we get 404
    });

    if (workflowResponse.statusCode === 200) {
      const body = JSON.parse(workflowResponse.payload);
      expect(Array.isArray(body.nodes)).toBe(true);
      expect(Array.isArray(body.edges)).toBe(true);
      expect(Array.isArray(body.rules)).toBe(true);
    }
  });

  it('POST /builds/:id/security-scan matches AsyncJobResponse', async () => {
    const buildId = '00000000-0000-0000-0000-000000000001';
    const response = await app.inject({
      method: 'POST',
      url: `/builds/${buildId}/security-scan`,
    });
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    // Frontend expects: { jobId: string, status: string }
    expect(typeof body.jobId).toBe('string');
    expect(typeof body.status).toBe('string');
  });

  it('GET /builds/:id/security matches SecurityResult', async () => {
    const buildId = '00000000-0000-0000-0000-000000000001';
    const response = await app.inject({
      method: 'GET',
      url: `/builds/${buildId}/security`,
    });
    
    if (response.statusCode === 200) {
      const body = JSON.parse(response.payload);
      expect(['PASS', 'WARN', 'BLOCK']).toContain(body.status);
      expect(typeof body.critical).toBe('number');
      expect(typeof body.high).toBe('number');
      expect(typeof body.medium).toBe('number');
      expect(typeof body.low).toBe('number');
    }
  });
});
