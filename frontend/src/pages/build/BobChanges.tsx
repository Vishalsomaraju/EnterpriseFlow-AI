import { useOutletContext } from 'react-router-dom';
import { CodeDiff } from '../../components/build/CodeDiff';
import { useCodeDiff } from '../../hooks/queries';
import type { Build } from '../../types';
import { SkeletonCard, ErrorState, EmptyState } from '../../components/States';

export function BobChanges() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: diff, isLoading, error, refetch } = useCodeDiff(build.id);

  if (isLoading) {
    return <SkeletonCard height="360px" />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        message="Failed to load code changes." 
        onRetry={() => refetch()}
      />
    );
  }

  if (!diff || (!diff.patch && (!diff.files || diff.files.length === 0))) {
    return (
      <EmptyState
        title="No code modifications generated"
        description="Bob has not generated file patches or code diffs for this build yet."
      />
    );
  }

  return (
    <div>
      <CodeDiff diffData={diff} />
    </div>
  );
}
