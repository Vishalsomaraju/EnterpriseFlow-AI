import { db } from '../db';
import { JobType, JobStatus } from './types';
import { AppError } from '../errors/AppError';

export class JobService {
  static async createJob(type: JobType, resourceType: string, resourceId: string): Promise<string> {
    const job = await db
      .insertInto('jobs')
      .values({
        type,
        status: JobStatus.QUEUED,
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

  static async updateStage(jobId: string, stage: string, progress: number): Promise<void> {
    await db
      .updateTable('jobs')
      .set({
        status: JobStatus.RUNNING,
        stage,
        progress,
        updated_at: new Date()
      })
      .where('id', '=', jobId)
      .execute();
  }

  static async markCompleted(jobId: string): Promise<void> {
    await db
      .updateTable('jobs')
      .set({
        status: JobStatus.COMPLETED,
        stage: 'COMPLETED',
        progress: 100,
        completed_at: new Date(),
        updated_at: new Date()
      })
      .where('id', '=', jobId)
      .execute();
  }

  static async markFailed(jobId: string, error: unknown, retryable: boolean = false): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await db
      .updateTable('jobs')
      .set({
        status: JobStatus.FAILED,
        error_message: errorMessage,
        retryable,
        updated_at: new Date(),
        completed_at: new Date()
      })
      .where('id', '=', jobId)
      .execute();
  }

  static async getJob(jobId: string) {
    return await db.selectFrom('jobs').selectAll().where('id', '=', jobId).executeTakeFirst();
  }

  static async lockStaleJobs(): Promise<Array<{ id: string, type: string, resource_id: string | null }>> {
    // Find jobs that have been QUEUED or RUNNING but not updated in 5 minutes
    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);
    
    // Using a simplistic lock mechanism for MVP by updating attempt and locked_at
    const staleJobs = await db
      .selectFrom('jobs')
      .select(['id', 'type', 'resource_id', 'attempt', 'max_attempts'])
      .where('status', 'in', [JobStatus.QUEUED, JobStatus.RUNNING])
      .where('updated_at', '<', staleThreshold)
      .where('retryable', '=', true)
      .execute();

    const jobsToRetry = staleJobs.filter(j => j.attempt < j.max_attempts);
    
    const lockedJobs = [];
    for (const job of jobsToRetry) {
      const result = await db
        .updateTable('jobs')
        .set({
          attempt: job.attempt + 1,
          locked_at: new Date(),
          updated_at: new Date()
        })
        .where('id', '=', job.id)
        .returning(['id', 'type', 'resource_id'])
        .executeTakeFirst();
        
      if (result) lockedJobs.push(result);
    }

    return lockedJobs;
  }
}
