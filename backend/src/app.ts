import fastify from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from './middleware/error-handler';
import { db } from './db';
import { config } from './config';
import { sql } from 'kysely';
import { documentRoutes } from './routes/document.routes';
import { jobRoutes } from './routes/job.routes';
import { workflowRoutes } from './routes/workflow.routes';
import { blueprintRoutes } from './routes/blueprint.routes';
import { buildRoutes } from './routes/build.routes';
import { bobRoutes } from './routes/bob.routes';
import { reviewRoutes } from './routes/review.routes';
import { ruleRoutes } from './routes/rule.routes';
import dashboardRoutes from './routes/dashboard.routes';
import executionRoutes from './routes/execution.routes';

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
