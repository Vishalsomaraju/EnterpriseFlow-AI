"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueprintRoutes = void 0;
const index_1 = require("../../db/index");
const JobWorker_1 = require("../../jobs/JobWorker");
const JobService_1 = require("../../jobs/JobService");
const types_1 = require("../../jobs/types");
const blueprintRoutes = async (app) => {
    app.post('/:id/implement', async (request, reply) => {
        const blueprintId = request.params.id;
        try {
            const blueprint = await index_1.db
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
            const existingJob = await index_1.db.selectFrom('jobs')
                .selectAll()
                .where('resource_type', '=', 'blueprint')
                .where('resource_id', '=', blueprintId)
                .where('status', 'in', ['QUEUED', 'RUNNING'])
                .executeTakeFirst();
            if (existingJob) {
                return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
            }
            // Create implementation job
            const jobId = await JobService_1.JobService.createJob(types_1.JobType.IMPLEMENTATION, 'blueprint', blueprintId);
            // Dispatch immediately
            JobWorker_1.JobWorker.dispatch(jobId, types_1.JobType.IMPLEMENTATION, blueprintId);
            return reply.status(202).send({
                jobId,
                status: 'QUEUED'
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start implementation' } });
        }
    });
};
exports.blueprintRoutes = blueprintRoutes;
