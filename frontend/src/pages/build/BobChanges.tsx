import { useOutletContext } from 'react-router-dom';
import { CodeDiff } from '../../components/build/CodeDiff';
import { useCodeDiff } from '../../hooks/queries';
import type { Build } from '../../types';
import { LoadingState, ErrorState } from '../../components/States';

export function BobChanges() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: diff, isLoading, error } = useCodeDiff(build.id);

  if (isLoading) return <LoadingState message="Loading code changes..." />;
  if (error || !diff) return <ErrorState error={error} message="Failed to load code changes." />;

  return (
    <div>
      <CodeDiff diffData={diff} />
    </div>
  );
}
