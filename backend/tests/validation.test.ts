import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';
import { uuidParamSchema, paginationQuerySchema } from '../src/schemas/common.schema';

describe('Schema Validation', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp();
    
    app.get('/test-validation/:id', {
      schema: {
        params: uuidParamSchema,
        querystring: paginationQuerySchema
      }
    }, async (request, reply) => {
      return { success: true };
    });
  });

  it('returns 400 with VALIDATION_ERROR on bad params', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validation/not-a-uuid'
    });
    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.requestId).toBeDefined();
    expect(body.error.fieldErrors.length).toBeGreaterThan(0);
  });

  it('validates querystring types', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validation/123e4567-e89b-12d3-a456-426614174000?page=-1'
    });
    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('passes on valid request', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validation/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10'
    });
    expect(response.statusCode).toBe(200);
  });
});
