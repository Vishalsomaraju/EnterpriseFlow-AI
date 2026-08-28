import { FastifyPluginAsync } from 'fastify';
import { bobEvidenceService } from '../../domain/bob/BobEvidenceService';

export const bobRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/:id/bob/events', async (request, reply) => {
    try {
      const payload = { build_id: request.params.id, ...(request.body as any) };
      await bobEvidenceService.processEvent(payload);
      return reply.status(202).send({ status: 'accepted' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/bob/plan', async (request, reply) => {
    try {
      const payload = { build_id: request.params.id, ...(request.body as any) };
      await bobEvidenceService.processPlan(payload);
      return reply.status(202).send({ status: 'accepted' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/bob/changes', async (request, reply) => {
    try {
      const payload = { build_id: request.params.id, ...(request.body as any) };
      await bobEvidenceService.processChanges(payload);
      return reply.status(202).send({ status: 'accepted' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/bob/tests', async (request, reply) => {
    try {
      const payload = { build_id: request.params.id, ...(request.body as any) };
      await bobEvidenceService.processTestResults(payload);
      return reply.status(202).send({ status: 'accepted' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/bob/documentation', async (request, reply) => {
    try {
      const payload = { build_id: request.params.id, ...(request.body as any) };
      await bobEvidenceService.processDocumentation(payload);
      return reply.status(202).send({ status: 'accepted' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });
};
