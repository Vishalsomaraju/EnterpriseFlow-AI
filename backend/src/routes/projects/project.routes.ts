import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index';

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    try {
      const projects = await db.selectFrom('projects').selectAll().execute();
      return reply.send(projects);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Body: { name: string } }>('/', async (request, reply) => {
    try {
      if (!request.body || !request.body.name) {
        return reply.status(400).send({ error: 'Name is required' });
      }

      const project = await db.insertInto('projects')
        .values({
          name: request.body.name
        })
        .returningAll()
        .executeTakeFirstOrThrow();
        
      return reply.send(project);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });
};
