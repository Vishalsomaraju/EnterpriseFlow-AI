import type { JobResult } from './types';
import { api } from './index';

export interface JobTransport {
  start(jobId: string, onUpdate: (state: JobResult) => void, onError: (error: Error) => void): () => void;
}

export class PollingJobTransport implements JobTransport {
  private intervals: Map<string, number> = new Map();

  start(jobId: string, onUpdate: (state: JobResult) => void, onError: (error: Error) => void): () => void {
    let isCancelled = false;
    let delay = 1000;

    const poll = async () => {
      if (isCancelled) return;
      try {
        const result = await api.getJob(jobId);
        if (isCancelled) return;
        
        onUpdate(result);

        const terminalStates = ['COMPLETED', 'FAILED'];
        if (!terminalStates.includes(result.status)) {
          // Exponential backoff up to 5s
          delay = Math.min(delay * 1.5, 5000);
          const timeoutId = window.setTimeout(poll, delay);
          this.intervals.set(jobId, timeoutId);
        }
      } catch (err) {
        if (isCancelled) return;
        onError(err instanceof Error ? err : new Error(String(err)));
        // Retry on failure with backoff
        delay = Math.min(delay * 2, 10000);
        const timeoutId = window.setTimeout(poll, delay);
        this.intervals.set(jobId, timeoutId);
      }
    };

    poll();

    return () => {
      isCancelled = true;
      const timeoutId = this.intervals.get(jobId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        this.intervals.delete(jobId);
      }
    };
  }
}

// Factory for JobTransport
export const createJobTransport = (): JobTransport => {
  return new PollingJobTransport();
};
