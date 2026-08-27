"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = jobRoutes;
const index_1 = require("../../db/index");
const zod_1 = require("zod");
const JobParamsSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
async function jobRoutes(app) {
    app.get('/jobs/:id', async (request, reply) => {
        const params = JobParamsSchema.parse(request.params);
        const jobId = params.id;
        const job = await index_1.db.selectFrom('jobs')
            .selectAll()
            .where('id', '=', jobId)
            .executeTakeFirst();
        if (!job) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Job not found'
                }
            });
        }
        // Format for the frontend
        return {
            status: job.status,
            stage: job.stage,
            progress: job.progress,
            result_reference: job.status === 'COMPLETED' ? { workflowId: job.resource_id } : undefined,
            error_message: job.error_message
        };
    });
}
