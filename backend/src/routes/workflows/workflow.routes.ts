import { FastifyPluginAsync } from 'fastify';
import { WorkflowGraphService } from '../../services/graph/WorkflowGraphService';
import { BlueprintService } from '../../services/blueprint/BlueprintService';

export const workflowRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { id: string } }>('/:id/graph', async (request, reply) => {
    try {
      const graph = await WorkflowGraphService.getGraph(request.params.id);
      return reply.send(graph);
    } catch (error) {
      request.log.error(error);
      return reply.status(404).send({
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: error instanceof Error ? error.message : 'Workflow not found',
          requestId: request.id
        }
      });
    }
  });

  app.post<{ Params: { id: string } }>('/:id/blueprint', async (request, reply) => {
    try {
      const result = await BlueprintService.generateAndPersistBlueprint(request.params.id);
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(404).send({
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: error instanceof Error ? error.message : 'Workflow not found',
          requestId: request.id
        }
      });
    }
  });

  app.get<{ Params: { id: string } }>('/:id/blueprint', async (request, reply) => {
    try {
      const result = await BlueprintService.getBlueprint(request.params.id);
      if (!result) {
        return reply.status(404).send({
          error: {
            code: 'BLUEPRINT_NOT_FOUND',
            message: 'Blueprint not generated for this workflow',
            requestId: request.id
          }
        });
      }
      return reply.send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal error',
          requestId: request.id
        }
      });
    }
  });
};
