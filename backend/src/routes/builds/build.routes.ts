import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index';
import { JobWorker } from '../../jobs/JobWorker';
import { JobService } from '../../jobs/JobService';
import { JobType } from '../../jobs/types';
import { WorkflowGraphService } from '../../services/graph/WorkflowGraphService';

export const buildRoutes: FastifyPluginAsync = async (app) => {
  async function resolveBuild(idOrWorkflowId: string) {
    let build = await db.selectFrom('builds').where('id', '=', idOrWorkflowId).selectAll().executeTakeFirst();
    if (!build) {
      const version = await WorkflowGraphService.resolveWorkflowVersion(idOrWorkflowId);
      if (version) {
        const blueprint = await db.selectFrom('blueprints')
          .where('workflow_version_id', '=', version.id)
          .selectAll()
          .executeTakeFirst();

        if (blueprint) {
          build = await db.selectFrom('builds')
            .where('blueprint_id', '=', blueprint.id)
            .orderBy('created_at', 'desc')
            .selectAll()
            .executeTakeFirst();
        }
      }
    }
    return build;
  }

  app.post<{ Params: { id: string } }>('/:id/test', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);

      if (!build) {
        return reply.status(404).send({
          error: { code: 'BUILD_NOT_FOUND', message: 'Build not found', requestId: request.id }
        });
      }

      const buildId = build.id;

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
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.status(404).send({ error: 'Build not found' });
      const blueprint = await db.selectFrom('blueprints').where('id', '=', build.blueprint_id).selectAll().executeTakeFirst();
      const version = blueprint
        ? await db.selectFrom('workflow_versions').where('id', '=', blueprint.workflow_version_id).selectAll().executeTakeFirst()
        : undefined;
      return reply.send({
        ...build,
        workflowId: version?.workflow_id || null,
        stages: [
          { id: 'blueprint', name: 'Blueprint Validated', status: ['WAITING_FOR_BOB', 'CHANGES_RECEIVED', 'TESTING', 'VALIDATED', 'READY_FOR_REVIEW', 'ACTIVATED'].includes(build.status) ? 'COMPLETED' : 'ACTIVE' },
          { id: 'bob', name: 'Bob Implementation', status: ['CHANGES_RECEIVED', 'TESTING', 'VALIDATED', 'READY_FOR_REVIEW', 'ACTIVATED'].includes(build.status) ? 'COMPLETED' : build.status === 'WAITING_FOR_BOB' ? 'ACTIVE' : 'PENDING' },
          { id: 'validation', name: 'Tests & Security', status: ['VALIDATED', 'READY_FOR_REVIEW', 'ACTIVATED'].includes(build.status) ? 'COMPLETED' : build.status === 'TESTING' ? 'ACTIVE' : build.status === 'FAILED' ? 'FAILED' : 'PENDING' },
          { id: 'review', name: 'Human Review', status: build.status === 'ACTIVATED' ? 'COMPLETED' : build.status === 'READY_FOR_REVIEW' ? 'ACTIVE' : 'PENDING' },
        ],
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/events', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.send([]);

      const events = await db.selectFrom('bob_activity_events')
        .where('build_id', '=', build.id)
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
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.send([]);

      const subagents = await db.selectFrom('build_subagents')
        .where('build_id', '=', build.id)
        .selectAll()
        .execute();
      return reply.send(subagents);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/changes', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.send({ diff: '', files_changed: 0, files: [] });

      const changes = await db.selectFrom('build_changes')
        .where('build_id', '=', build.id)
        .selectAll()
        .execute();

      const patch = changes.map(c => `--- a/${c.file_path}\n+++ b/${c.file_path}\n${c.diff}`).join('\n');
      return reply.send({
        diff: patch,
        files_changed: changes.length,
        files: changes.map(c => ({
          file_path: c.file_path,
          change_type: c.change_type,
          diff: c.diff || '',
        })),
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/tests', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.send({ testRuns: [] });

      const testRuns = await db.selectFrom('test_runs')
        .where('build_id', '=', build.id)
        .orderBy('completed_at', 'desc')
        .selectAll()
        .execute();

      // Always return { testRuns: [] } wrapper so frontend shape is consistent
      if (testRuns.length === 0) {
        return reply.send({ testRuns: [] });
      }

      const results = await db.selectFrom('test_results')
        .where('test_run_id', '=', testRuns[0].id)
        .selectAll()
        .execute();

      return reply.send({
        testRuns: testRuns.map((tr, i) => ({
          ...tr,
          results: i === 0 ? results : [],
        })),
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/documentation', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.send([]);

      const docs = await db.selectFrom('documentation_artifacts')
        .where('build_id', '=', build.id)
        .selectAll()
        .execute();
      return reply.send(docs);
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/security-scan', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.status(404).send({ error: 'Build not found' });

      const { JobService } = await import('../../jobs/JobService');
      const { JobWorker } = await import('../../jobs/JobWorker');
      const { JobType } = await import('../../jobs/types');

      const jobId = await JobService.createJob(JobType.SECURITY_SCAN, 'BUILD', build.id);
      JobWorker.dispatch(jobId, JobType.SECURITY_SCAN, build.id);
      
      return reply.send({ jobId, status: 'QUEUED' });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/security', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.status(404).send({ error: 'Build not found' });

      const scan = await db.selectFrom('security_scans')
        .where('build_id', '=', build.id)
        .selectAll()
        .executeTakeFirst();
      
      if (!scan) {
        return reply.status(404).send({ error: 'Not found' });
      }

      return reply.send({
        status: scan.status,
        riskScore: scan.risk_score ?? 0,
        critical: scan.critical,
        high: scan.high,
        medium: scan.medium,
        low: scan.low,
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/review', async (request, reply) => {
    try {
      const build = await resolveBuild(request.params.id);
      if (!build) return reply.status(404).send({ error: 'Build not found' });

      const [review, changes, testRun, security, blueprint] = await Promise.all([
        db.selectFrom('reviews').where('build_id', '=', build.id).orderBy('created_at', 'desc').selectAll().executeTakeFirst(),
        db.selectFrom('build_changes').where('build_id', '=', build.id).selectAll().execute(),
        db.selectFrom('test_runs').where('build_id', '=', build.id).orderBy('completed_at', 'desc').selectAll().executeTakeFirst(),
        db.selectFrom('security_scans').where('build_id', '=', build.id).orderBy('id', 'desc').selectAll().executeTakeFirst(),
        db.selectFrom('blueprints').where('id', '=', build.blueprint_id).selectAll().executeTakeFirst(),
      ]);

      let rulesChanged = 0;
      if (blueprint) {
        rulesChanged = Number((await db.selectFrom('business_rules')
          .where('version_id', '=', blueprint.workflow_version_id)
          .select((eb) => eb.fn.count('id').as('count'))
          .executeTakeFirst())?.count || 0);
      }

      const testsPassed = testRun?.passed ?? 0;
      const testsFailed = testRun?.failed ?? 0;
      const securityStatus = security?.status || 'NOT_SCANNED';

      return reply.send({
        review,
        build: { id: build.id, status: build.status, blueprintId: build.blueprint_id },
        filesChanged: changes.length,
        testsPassed,
        testsFailed,
        rulesChanged,
        securityStatus,
        businessImpact: `${changes.length} file${changes.length === 1 ? '' : 's'} changed; ${testsPassed} test${testsPassed === 1 ? '' : 's'} passed and ${testsFailed} failed; SecurePush status: ${securityStatus}.`,
      });
    } catch (err) {
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });
};
