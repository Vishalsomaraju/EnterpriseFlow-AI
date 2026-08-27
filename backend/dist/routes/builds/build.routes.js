"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutes = void 0;
const index_1 = require("../../db/index");
const JobWorker_1 = require("../../jobs/JobWorker");
const JobService_1 = require("../../jobs/JobService");
const types_1 = require("../../jobs/types");
const buildRoutes = async (app) => {
    app.post('/:id/test', async (request, reply) => {
        const buildId = request.params.id;
        try {
            const build = await index_1.db
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
            const existingJob = await index_1.db.selectFrom('jobs')
                .selectAll()
                .where('resource_type', '=', 'build')
                .where('resource_id', '=', buildId)
                .where('status', 'in', ['QUEUED', 'RUNNING'])
                .executeTakeFirst();
            if (existingJob) {
                return reply.status(202).send({ jobId: existingJob.id, status: existingJob.status });
            }
            const jobId = await JobService_1.JobService.createJob(types_1.JobType.TESTING, 'build', buildId);
            JobWorker_1.JobWorker.dispatch(jobId, types_1.JobType.TESTING, buildId);
            return reply.status(202).send({ jobId, status: 'QUEUED' });
        }
        catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to start testing' } });
        }
    });
    // Frontend API Endpoints
    app.get('/:id', async (request, reply) => {
        try {
            const build = await index_1.db.selectFrom('builds').where('id', '=', request.params.id).selectAll().executeTakeFirst();
            if (!build)
                return reply.status(404).send({ error: 'Not found' });
            return reply.send(build);
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.get('/:id/events', async (request, reply) => {
        try {
            const events = await index_1.db.selectFrom('bob_activity_events')
                .where('build_id', '=', request.params.id)
                .orderBy('created_at', 'asc')
                .selectAll()
                .execute();
            return reply.send(events);
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.get('/:id/plan', async (request, reply) => {
        try {
            const subagents = await index_1.db.selectFrom('build_subagents')
                .where('build_id', '=', request.params.id)
                .selectAll()
                .execute();
            return reply.send(subagents);
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.get('/:id/changes', async (request, reply) => {
        try {
            const changes = await index_1.db.selectFrom('build_changes')
                .where('build_id', '=', request.params.id)
                .selectAll()
                .execute();
            const patch = changes.map(c => `--- a/${c.file_path}\n+++ b/${c.file_path}\n${c.diff}`).join('\n');
            return reply.send({ diff: patch, files_changed: changes.length });
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.get('/:id/tests', async (request, reply) => {
        try {
            const testRuns = await index_1.db.selectFrom('test_runs')
                .where('build_id', '=', request.params.id)
                .orderBy('completed_at', 'desc')
                .selectAll()
                .execute();
            if (testRuns.length > 0) {
                const results = await index_1.db.selectFrom('test_results')
                    .where('test_run_id', '=', testRuns[0].id)
                    .selectAll()
                    .execute();
                return reply.send({ ...testRuns[0], results });
            }
            return reply.send(null);
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.get('/:id/documentation', async (request, reply) => {
        try {
            const docs = await index_1.db.selectFrom('documentation_artifacts')
                .where('build_id', '=', request.params.id)
                .selectAll()
                .execute();
            return reply.send(docs);
        }
        catch (err) {
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
};
exports.buildRoutes = buildRoutes;
