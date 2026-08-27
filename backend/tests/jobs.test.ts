import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JobService } from '../src/jobs/JobService';
import { JobWorker } from '../src/jobs/JobWorker';
import { JobType, JobStatus } from '../src/jobs/types';
import { db } from '../src/db';

describe('Job Infrastructure', () => {
  beforeEach(async () => {
    // Clear jobs
    await db.deleteFrom('jobs').execute();
  });

  it('should create and retrieve a job', async () => {
    const jobId = await JobService.createJob(JobType.EXTRACTION, 'document', 'doc-123');
    expect(jobId).toBeDefined();

    const job = await JobService.getJob(jobId);
    expect(job).toBeDefined();
    expect(job?.status).toBe(JobStatus.QUEUED);
    expect(job?.stage).toBe('QUEUED');
    expect(job?.resource_id).toBe('doc-123');
  });

  it('should update job stage and progress', async () => {
    const jobId = await JobService.createJob(JobType.EXTRACTION, 'document', 'doc-123');
    await JobService.updateStage(jobId, 'PARSING', 20);

    const job = await JobService.getJob(jobId);
    expect(job?.status).toBe(JobStatus.RUNNING);
    expect(job?.stage).toBe('PARSING');
    expect(job?.progress).toBe(20);
  });

  it('should mark job as completed', async () => {
    const jobId = await JobService.createJob(JobType.EXTRACTION, 'document', 'doc-123');
    await JobService.markCompleted(jobId);

    const job = await JobService.getJob(jobId);
    expect(job?.status).toBe(JobStatus.COMPLETED);
    expect(job?.stage).toBe('COMPLETED');
    expect(job?.progress).toBe(100);
    expect(job?.completed_at).toBeDefined();
  });

  it('should mark job as failed', async () => {
    const jobId = await JobService.createJob(JobType.EXTRACTION, 'document', 'doc-123');
    await JobService.markFailed(jobId, new Error('Something went wrong'), true);

    const job = await JobService.getJob(jobId);
    expect(job?.status).toBe(JobStatus.FAILED);
    expect(job?.error_message).toBe('Something went wrong');
    expect(job?.retryable).toBe(true);
  });
});
