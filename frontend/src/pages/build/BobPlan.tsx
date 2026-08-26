import { useOutletContext } from 'react-router-dom';
import { SubagentCard } from '../../components/build/SubagentCard';
import { useBobSubagents } from '../../hooks/queries';
import type { Build } from '../../types';
import { LoadingState, ErrorState } from '../../components/States';

export function BobPlan() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: subagents = [], isLoading, error } = useBobSubagents(build.id);

  if (isLoading) return <LoadingState message="Loading subagents..." />;
  if (error) return <ErrorState error={error} message="Failed to load subagents." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Implementation Summary</h2>
          <div className="validation-card">
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }}>
              The business rule for "Approval Threshold" was updated to ₹10,00,000. 
              This requires modifying the <code style={{ color: 'var(--accent)' }}>approval.service.ts</code> module to route requests appropriately. 
              Test assertions in <code style={{ color: 'var(--accent)' }}>manager-route.test.ts</code> and <code style={{ color: 'var(--accent)' }}>cfo-route.test.ts</code> will be updated to reflect the new boundary.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Files to Change</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>src/approval.service.ts</span>
            <span style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>tests/manager-route.test.ts</span>
            <span style={{ padding: '4px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>docs/policies.md</span>
          </div>
        </section>
      </div>

      <div>
        <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Subagents Executing</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subagents.map(sa => (
            <SubagentCard key={sa.id} subagent={sa} />
          ))}
        </div>
      </div>
    </div>
  );
}
