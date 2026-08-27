"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRoutes = void 0;
const WorkflowGraphService_1 = require("../../services/graph/WorkflowGraphService");
const BlueprintService_1 = require("../../services/blueprint/BlueprintService");
const workflowRoutes = async (app) => {
    app.get('/:id/graph', async (request, reply) => {
        try {
            const graph = await WorkflowGraphService_1.WorkflowGraphService.getGraph(request.params.id);
            return reply.send(graph);
        }
        catch (error) {
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
    app.post('/:id/blueprint', async (request, reply) => {
        try {
            const result = await BlueprintService_1.BlueprintService.generateAndPersistBlueprint(request.params.id);
            return reply.send(result);
        }
        catch (error) {
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
    app.get('/:id/blueprint', async (request, reply) => {
        try {
            const result = await BlueprintService_1.BlueprintService.getBlueprint(request.params.id);
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
        }
        catch (error) {
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
exports.workflowRoutes = workflowRoutes;
