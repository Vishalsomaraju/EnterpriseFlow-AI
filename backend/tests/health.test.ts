import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Health and Readiness Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp();
  });

  it('GET /health returns status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.time).toBeDefined();
  });

  it('GET /ready returns database connectivity status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ready'
    });
    // Can be 200 or 503 depending on if DB is actually running in CI
    const body = response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('database');
  });
});
