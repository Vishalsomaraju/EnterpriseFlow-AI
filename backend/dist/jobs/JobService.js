"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const db_1 = require("../db");
const types_1 = require("./types");
class JobService {
    static async createJob(type, resourceType, resourceId) {
        const job = await db_1.db
            .insertInto('jobs')
            .values({
            type,
            status: types_1.JobStatus.QUEUED,
            stage: 'QUEUED',
            progress: 0,
            resource_type: resourceType,
            resource_id: resourceId,
            attempt: 1,
            max_attempts: 2,
            retryable: true
        })
            .returning('id')
            .executeTakeFirstOrThrow();
        return job.id;
    }
    static async updateStage(jobId, stage, progress) {
        await db_1.db
            .updateTable('jobs')
            .set({
            status: types_1.JobStatus.RUNNING,
            stage,
            progress,
            updated_at: new Date()
        })
            .where('id', '=', jobId)
            .execute();
    }
    static async markCompleted(jobId) {
        await db_1.db
            .updateTable('jobs')
            .set({
            status: types_1.JobStatus.COMPLETED,
            stage: 'COMPLETED',
            progress: 100,
            completed_at: new Date(),
            updated_at: new Date()
        })
            .where('id', '=', jobId)
            .execute();
    }
    static async markFailed(jobId, error, retryable = false) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await db_1.db
            .updateTable('jobs')
            .set({
            status: types_1.JobStatus.FAILED,
            error_message: errorMessage,
            retryable,
            updated_at: new Date(),
            completed_at: new Date()
        })
            .where('id', '=', jobId)
            .execute();
    }
    static async getJob(jobId) {
        return await db_1.db.selectFrom('jobs').selectAll().where('id', '=', jobId).executeTakeFirst();
    }
    static async lockStaleJobs() {
        // Find jobs that have been QUEUED or RUNNING but not updated in 5 minutes
        const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);
        // Using a simplistic lock mechanism for MVP by updating attempt and locked_at
        const staleJobs = await db_1.db
            .selectFrom('jobs')
            .select(['id', 'type', 'resource_id', 'attempt', 'max_attempts'])
            .where('status', 'in', [types_1.JobStatus.QUEUED, types_1.JobStatus.RUNNING])
            .where('updated_at', '<', staleThreshold)
            .where('retryable', '=', true)
            .execute();
        const jobsToRetry = staleJobs.filter(j => j.attempt < j.max_attempts);
        const lockedJobs = [];
        for (const job of jobsToRetry) {
            const result = await db_1.db
                .updateTable('jobs')
                .set({
                attempt: job.attempt + 1,
                locked_at: new Date(),
                updated_at: new Date()
            })
                .where('id', '=', job.id)
                .returning(['id', 'type', 'resource_id'])
                .executeTakeFirst();
            if (result)
                lockedJobs.push(result);
        }
        return lockedJobs;
    }
}
exports.JobService = JobService;
