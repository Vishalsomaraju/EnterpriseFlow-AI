import { JobService } from './JobService';
import { JobType } from './types';
import { ExtractionJobHandler } from './extraction/ExtractionJobHandler';
import { ImplementationJobHandler } from './build/ImplementationJobHandler';
import { TestingJobHandler } from './tests/TestingJobHandler';
import { ExecutionJobHandler } from './execution/ExecutionJobHandler';

export class JobWorker {
  private static timer: NodeJS.Timeout | null = null;

  // Called immediately when a job is created
  static async dispatch(jobId: string, type: string, resourceId: string) {
    // Process async without blocking request
    setImmediate(async () => {
      try {
        switch (type) {
          case JobType.EXTRACTION:
            await ExtractionJobHandler.handle(jobId, resourceId);
            break;
          case JobType.IMPLEMENTATION:
            await ImplementationJobHandler.handle(jobId, resourceId);
            break;
          case JobType.TESTING:
            await TestingJobHandler.handle(jobId, resourceId);
            break;
          case JobType.EXECUTION:
            await ExecutionJobHandler.handle(jobId, resourceId);
            break;
          default:
            console.error(`Unknown job type: ${type}`);
        }
      } catch (err) {
        console.error(`Job worker crash for ${jobId}:`, err);
      }
    });
  }

  // Recovery loop for stale jobs
  static startRecoveryWorker() {
    if (this.timer) return;
    
    this.timer = setInterval(async () => {
      try {
        const staleJobs = await JobService.lockStaleJobs();
        for (const job of staleJobs) {
          if (job.resource_id) {
            console.log(`Recovering stale job: ${job.id} (Attempt)`);
            this.dispatch(job.id, job.type, job.resource_id);
          }
        }
      } catch (err) {
        console.error('Recovery worker error:', err);
      }
    }, 5000);
  }
}
