import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index';
import { JobWorker } from '../../jobs/JobWorker';
import { JobService } from '../../jobs/JobService';
import { JobType } from '../../jobs/types';

export const buildRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/:id/test', async (request, reply) => {
    const buildId = request.params.id;

    try {
      const build = await db
        .selectFrom('builds')
        .where('id', '=', buildId)
        .selectAll()
        .executeTakeFirst();

      if (!build) {
        return reply.status(404).send({
          error: { code: 'BUILD_NOT_FOUND', message: 'Build not found', requestId: request.id }
        });
      }

      // Idempotency check
      const existingJob = await db.selectFrom('jobs')
        .selectAll()
        .where('resource_type', '=', 'build')
        .where('resource_id', '=', buildId)
        .where('status', 'in', ['QUEUED', 'RUNNING'])
        .executeTakeFirst();

      if (existingJob) {
        return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
      }

      const jobId = await JobService.createJob(JobType.TESTING, 'build', buildId);
      
      JobWorker.dispatch(jobId, JobType.TESTING, buildId);

      return reply.status(202).send({ jobId, status: 'QUEUED' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start testing' } });
    }
  });

  // Frontend API Endpoints

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const build = await db.selectFrom('builds').where('id', '=', request.params.id).selectAll().executeTakeFirst();
      if (!build) return reply.status(404).send({ error: 'Not found' });
      return reply.send(build);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/events', async (request, reply) => {
    try {
      const events = await db.selectFrom('bob_activity_events')
        .where('build_id', '=', request.params.id)
        .orderBy('created_at', 'asc')
        .selectAll()
        .execute();
      return reply.send(events);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/plan', async (request, reply) => {
    try {
      const subagents = await db.selectFrom('build_subagents')
        .where('build_id', '=', request.params.id)
        .selectAll()
        .execute();
      return reply.send(subagents);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/changes', async (request, reply) => {
    try {
      const changes = await db.selectFrom('build_changes')
        .where('build_id', '=', request.params.id)
        .selectAll()
        .execute();
      
      const patch = changes.map(c => `--- a/${c.file_path}\n+++ b/${c.file_path}\n${c.diff}`).join('\n');
      return reply.send({ diff: patch, files_changed: changes.length });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/tests', async (request, reply) => {
    try {
      const testRuns = await db.selectFrom('test_runs')
        .where('build_id', '=', request.params.id)
        .orderBy('completed_at', 'desc')
        .selectAll()
        .execute();

      if (testRuns.length > 0) {
        const results = await db.selectFrom('test_results')
          .where('test_run_id', '=', testRuns[0].id)
          .selectAll()
          .execute();
        return reply.send({ ...testRuns[0], results });
      }
      return reply.send(null);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/documentation', async (request, reply) => {
    try {
      const docs = await db.selectFrom('documentation_artifacts')
        .where('build_id', '=', request.params.id)
        .selectAll()
        .execute();
      return reply.send(docs);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/security-scan', async (request, reply) => {
    try {
      const { JobService } = await import('../../jobs/JobService');
      const { JobWorker } = await import('../../jobs/JobWorker');
      const { JobType } = await import('../../jobs/types');

      const jobId = await JobService.createJob(JobType.SECURITY_SCAN, 'BUILD', request.params.id);
      JobWorker.dispatch(jobId, JobType.SECURITY_SCAN, request.params.id);
      
      return reply.send({ jobId, status: 'QUEUED' });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/security', async (request, reply) => {
    try {
      const scan = await db.selectFrom('security_scans')
        .where('build_id', '=', request.params.id)
        .selectAll()
        .executeTakeFirst();
      
      if (!scan) {
        return reply.status(404).send({ error: 'Not found' });
      }

      return reply.send({
        status: scan.status,
        critical: scan.critical,
        high: scan.high,
        medium: scan.medium,
        low: scan.low
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/review', async (request, reply) => {
    try {
      const review = await db.selectFrom('reviews')
        .where('build_id', '=', request.params.id)
        .orderBy('created_at', 'desc')
        .selectAll()
        .executeTakeFirst();
      
      return reply.send(review || null);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });
};
