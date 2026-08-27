import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index';
import { JobWorker } from '../../jobs/JobWorker';
import { JobService } from '../../jobs/JobService';
import { JobType } from '../../jobs/types';

export const blueprintRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/:id/implement', async (request, reply) => {
    const blueprintId = request.params.id;

    try {
      const blueprint = await db
        .selectFrom('blueprints')
        .where('id', '=', blueprintId)
        .selectAll()
        .executeTakeFirst();

      if (!blueprint) {
        return reply.status(404).send({
          error: {
            code: 'BLUEPRINT_NOT_FOUND',
            message: 'Blueprint not found',
            requestId: request.id
          }
        });
      }

      // Check validation
      if (blueprint.validation_status !== 'VALID') {
        return reply.status(409).send({
          error: {
            code: 'BLUEPRINT_INVALID',
            message: 'Cannot implement an invalid blueprint. Please resolve validation errors.',
            requestId: request.id
          }
        });
      }

      // Idempotency: Is a job already processing this blueprint?
      const existingJob = await db.selectFrom('jobs')
        .selectAll()
        .where('resource_type', '=', 'blueprint')
        .where('resource_id', '=', blueprintId)
        .where('status', 'in', ['QUEUED', 'RUNNING'])
        .executeTakeFirst();

      if (existingJob) {
        return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
      }

      // Create implementation job
      const jobId = await JobService.createJob(JobType.IMPLEMENTATION, 'blueprint', blueprintId);
      
      // Dispatch immediately
      JobWorker.dispatch(jobId, JobType.IMPLEMENTATION, blueprintId);

      return reply.status(202).send({
        jobId,
        status: 'QUEUED'
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start implementation' } });
    }
  });
};
