import { useEffect, useState } from 'react';
import { createJobTransport } from '../api/jobTransport';
import type { JobResult } from '../api/types';

const transport = createJobTransport();

export function useAsyncJob(jobId?: string) {
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) {
      setResult(null);
      setError(null);
      return;
    }

    setResult({ status: 'QUEUED' });
    setError(null);

    const unsubscribe = transport.start(
      jobId,
      (state) => setResult(state),
      (err) => setError(err)
    );

    return () => {
      unsubscribe();
    };
  }, [jobId]);

  return {
    status: result?.status || 'IDLE',
    result: result?.result,
    error,
    isComplete: result?.status === 'COMPLETED',
    isFailed: result?.status === 'FAILED',
    isRunning: result && !['COMPLETED', 'FAILED'].includes(result.status)
  };
}
