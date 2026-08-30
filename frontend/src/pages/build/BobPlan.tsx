import { useOutletContext } from 'react-router-dom';
import { SubagentCard } from '../../components/build/SubagentCard';
import { Card } from '../../components/Card';
import { useBobSubagents, useCodeDiff } from '../../hooks/queries';
import type { Build } from '../../types';
import { SkeletonCard, SkeletonList, ErrorState, EmptyState } from '../../components/States';

export function BobPlan() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: subagents = [], isLoading: subagentsLoading, error: subagentsError, refetch } = useBobSubagents(build.id);
  const { data: diffData } = useCodeDiff(build.id);

  if (subagentsLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SkeletonCard height="160px" />
          <SkeletonCard height="100px" />
        </div>
        <SkeletonList items={3} />
      </div>
    );
  }

  if (subagentsError) {
    return (
      <ErrorState
        error={subagentsError}
        message="Failed to load build subagents plan."
        onRetry={() => refetch()}
      />
    );
  }

  const changedFiles = diffData?.files || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section>
          <p className="eyebrow">Implementation Summary</p>
          <Card style={{ marginTop: '8px' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
              The multi-agent orchestration plans and executes code modifications directly against the target repository.
              Specialized subagents (Planner, Coder, Test, Security) collaborate to apply AST modifications, update boundary tests, and verify contract integrity.
            </p>
          </Card>
        </section>

        <section>
          <p className="eyebrow">Targeted Artifacts</p>
          {changedFiles.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {changedFiles.map(f => (
                <span key={f.path} style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  {f.path}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>src/services/approvalService.ts</span>
              <span style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>tests/approvalService.test.ts</span>
            </div>
          )}
        </section>
      </div>

      <div>
        <p className="eyebrow">Subagents Executing</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {subagents.length === 0 ? (
            <EmptyState
              title="No subagents dispatched"
              description="Subagent execution plans will appear here during active builds."
            />
          ) : (
            subagents.map(sa => (
              <SubagentCard key={sa.id} subagent={sa} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
