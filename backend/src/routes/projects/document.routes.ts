import { FastifyInstance } from 'fastify';
import { db } from '../../db/index';
import { z } from 'zod';
import { JobWorker } from '../../jobs/JobWorker';
import { JobService } from '../../jobs/JobService';
import { JobType } from '../../jobs/types';

const ExtractParamsSchema = z.object({
  id: z.string(),
});

export async function documentRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>('/documents/:id/extract', async (request, reply) => {
    const params = ExtractParamsSchema.parse(request.params);
    const documentId = params.id;

    try {
      // Check if document exists
      const doc = await db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
      if (!doc) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
      }

      // Idempotency: Check if a job is already queued/running for this document
      const existingJob = await db.selectFrom('jobs')
        .selectAll()
        .where('resource_type', '=', 'document')
        .where('resource_id', '=', documentId)
        .where('status', 'in', ['QUEUED', 'RUNNING'])
        .executeTakeFirst();

      if (existingJob) {
        return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
      }

      // Create extraction job
      const jobId = await JobService.createJob(JobType.EXTRACTION, 'document', documentId);
      
      // Dispatch immediately
      JobWorker.dispatch(jobId, JobType.EXTRACTION, documentId);

      // Return 202 accepted
      return reply.status(202).send({
        jobId,
        status: 'QUEUED'
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start extraction' } });
    }
  });
}
