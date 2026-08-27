import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';
import { ApiError } from '../src/errors/api.error';

describe('Error Handler', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp();
    
    app.get('/test-error', async () => {
      throw ApiError.badRequest('Test message', 'TEST_ERROR', [{ field: 'test', message: 'invalid' }]);
    });

    app.get('/test-internal', async () => {
      throw new Error('Secret database password xyz123');
    });
  });

  it('formats ApiError correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-error'
    });
    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('TEST_ERROR');
    expect(body.error.message).toBe('Test message');
    expect(body.error.requestId).toBeDefined();
    expect(body.error.fieldErrors).toHaveLength(1);
  });

  it('masks internal errors and hides stack trace', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-internal'
    });
    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected internal error occurred');
    expect(body.error.requestId).toBeDefined();
    expect(JSON.stringify(body)).not.toContain('xyz123');
  });
});
