"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobWorker = void 0;
const JobService_1 = require("./JobService");
const types_1 = require("./types");
const ExtractionJobHandler_1 = require("./extraction/ExtractionJobHandler");
const ImplementationJobHandler_1 = require("./build/ImplementationJobHandler");
const TestingJobHandler_1 = require("./tests/TestingJobHandler");
const ExecutionJobHandler_1 = require("./execution/ExecutionJobHandler");
class JobWorker {
    static timer = null;
    // Called immediately when a job is created
    static async dispatch(jobId, type, resourceId) {
        // Process async without blocking request
        setImmediate(async () => {
            try {
                switch (type) {
                    case types_1.JobType.EXTRACTION:
                        await ExtractionJobHandler_1.ExtractionJobHandler.handle(jobId, resourceId);
                        break;
                    case types_1.JobType.IMPLEMENTATION:
                        await ImplementationJobHandler_1.ImplementationJobHandler.handle(jobId, resourceId);
                        break;
                    case types_1.JobType.TESTING:
                        await TestingJobHandler_1.TestingJobHandler.handle(jobId, resourceId);
                        break;
                    case types_1.JobType.EXECUTION:
                        await ExecutionJobHandler_1.ExecutionJobHandler.handle(jobId, resourceId);
                        break;
                    default:
                        console.error(`Unknown job type: ${type}`);
                }
            }
            catch (err) {
                console.error(`Job worker crash for ${jobId}:`, err);
            }
        });
    }
    // Recovery loop for stale jobs
    static startRecoveryWorker() {
        if (this.timer)
            return;
        this.timer = setInterval(async () => {
            try {
                const staleJobs = await JobService_1.JobService.lockStaleJobs();
                for (const job of staleJobs) {
                    if (job.resource_id) {
                        console.log(`Recovering stale job: ${job.id} (Attempt)`);
                        this.dispatch(job.id, job.type, job.resource_id);
                    }
                }
            }
            catch (err) {
                console.error('Recovery worker error:', err);
            }
        }, 5000);
    }
}
exports.JobWorker = JobWorker;
