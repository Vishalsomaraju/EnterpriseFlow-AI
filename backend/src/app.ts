import fastify from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from './middleware/error-handler';
import { db } from './db';
import { config } from './config';
import { sql } from 'kysely';
import { documentRoutes } from './routes/projects/document.routes';
import { projectRoutes } from './routes/projects/project.routes';
import { jobRoutes } from './routes/jobs/job.routes';
import { workflowRoutes } from './routes/workflows/workflow.routes';
import { blueprintRoutes } from './routes/blueprints/blueprint.routes';
import { buildRoutes } from './routes/builds/build.routes';
import { bobRoutes } from './routes/builds/bob-evidence.routes';
import { reviewRoutes } from './routes/reviews/review.routes';
import { ruleRoutes } from './routes/rules/rule.routes';
import dashboardRoutes from './routes/activity/dashboard.routes';
import executionRoutes from './routes/executions/execution.routes';

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.register(cors, {
    origin: '*',
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async (request, reply) => {
    return { status: 'ok', time: new Date().toISOString() };
  });

  app.get('/ready', async (request, reply) => {
    try {
      await sql`SELECT 1`.execute(db);
      return { status: 'ready', database: 'connected' };
    } catch (error) {
      request.log.error(error);
      return reply.status(503).send({ status: 'unavailable', database: 'disconnected' });
    }
  });

  app.register(projectRoutes, { prefix: '/projects' });
  app.register(documentRoutes);
  app.register(jobRoutes);
  app.register(workflowRoutes, { prefix: '/workflows' });
  app.register(blueprintRoutes, { prefix: '/blueprints' });
  app.register(buildRoutes, { prefix: '/builds' });
  app.register(bobRoutes, { prefix: '/builds' });
  app.register(reviewRoutes, { prefix: '/reviews' });
  app.register(ruleRoutes, { prefix: '/rules' });
  app.register(dashboardRoutes);
  app.register(executionRoutes);
  return app;
}
