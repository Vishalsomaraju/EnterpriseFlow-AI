import { FastifyPluginAsync } from 'fastify';
import { reviewService } from '../services/ReviewService';

export const reviewRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { buildId: string }, Body: { reviewer: string, comments?: string, versionId: string } }>('/builds/:buildId/reviews', async (request, reply) => {
    try {
      const review = await reviewService.submitReview(request.params.buildId, request.body.versionId, request.body.reviewer, request.body.comments);
      return reply.send(review);
    } catch (err: any) {
      return reply.status(500).send({ error: { message: err.message } });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/approve', async (request, reply) => {
    try {
      await reviewService.approveReview(request.params.id);
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(400).send({ error: { message: err.message } });
    }
  });

  app.post<{ Params: { id: string }, Body: { comments?: string } }>('/:id/reject', async (request, reply) => {
    try {
      await reviewService.rejectReview(request.params.id, request.body?.comments);
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(400).send({ error: { message: err.message } });
    }
  });
};
