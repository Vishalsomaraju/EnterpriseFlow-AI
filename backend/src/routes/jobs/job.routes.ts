import { FastifyInstance } from 'fastify';
import { db } from '../../db/index';
import { z } from 'zod';

const JobParamsSchema = z.object({
  id: z.string(),
});

export async function jobRoutes(app: FastifyInstance) {
  app.get('/jobs/:id', async (request, reply) => {
    const params = JobParamsSchema.parse(request.params);
    const jobId = params.id;

    const job = await db.selectFrom('jobs')
      .selectAll()
      .where('id', '=', jobId)
      .executeTakeFirst();

    if (!job) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Format for the frontend
    return {
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      result_reference: job.status === 'COMPLETED' ? { workflowId: job.resource_id } : undefined,
      error_message: job.error_message
    };
  });
}
