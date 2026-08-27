"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRoutes = documentRoutes;
const index_1 = require("../../db/index");
const zod_1 = require("zod");
const JobWorker_1 = require("../../jobs/JobWorker");
const JobService_1 = require("../../jobs/JobService");
const types_1 = require("../../jobs/types");
const ExtractParamsSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
async function documentRoutes(app) {
    app.post('/documents/:id/extract', async (request, reply) => {
        const params = ExtractParamsSchema.parse(request.params);
        const documentId = params.id;
        try {
            // Check if document exists
            const doc = await index_1.db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
            if (!doc) {
                return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
            }
            // Idempotency: Check if a job is already queued/running for this document
            const existingJob = await index_1.db.selectFrom('jobs')
                .selectAll()
                .where('resource_type', '=', 'document')
                .where('resource_id', '=', documentId)
                .where('status', 'in', ['QUEUED', 'RUNNING'])
                .executeTakeFirst();
            if (existingJob) {
                return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
            }
            // Create extraction job
            const jobId = await JobService_1.JobService.createJob(types_1.JobType.EXTRACTION, 'document', documentId);
            // Dispatch immediately
            JobWorker_1.JobWorker.dispatch(jobId, types_1.JobType.EXTRACTION, documentId);
            // Return 202 accepted
            return reply.status(202).send({
                jobId,
                status: 'QUEUED'
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start extraction' } });
        }
    });
}
