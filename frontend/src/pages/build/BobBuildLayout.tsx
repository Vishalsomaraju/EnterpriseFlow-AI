
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { BuildStatus } from '../../components/build/BuildStatus';
import { useBuildOverview } from '../../hooks/queries';
import { LoadingState, ErrorState } from '../../components/States';

export function BobBuildLayout() {
  const location = useLocation();
  const { data: build, isLoading, error } = useBuildOverview('b_9912');

  if (isLoading) {
    return (
      <>
        <PageHeader eyebrow="IBM Bob Engineering" title="Implementation Workspace" />
        <LoadingState message="Loading build environment..." />
      </>
    );
  }

  if (error || !build) {
    return (
      <>
        <PageHeader eyebrow="IBM Bob Engineering" title="Implementation Workspace" />
        <ErrorState error={error} message="Failed to load build data." />
      </>
    );
  }

  const tabs = [
    { label: 'Overview', path: `/app/workflows/${build.workflowId}/build` },
    { label: 'Plan', path: `/app/workflows/${build.workflowId}/build/plan` },
    { label: 'Changes', path: `/app/workflows/${build.workflowId}/build/changes` }
  ];

  return (
    <>
      <PageHeader 
        eyebrow="IBM Bob Engineering" 
        title="Implementation Workspace"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge variant="ai">Bob active</Badge>
            <BuildStatus status={build.status} />
            <Link to={`/app/workflows/${build.workflowId}/review`}>
              <Button disabled={build.status !== 'COMPLETED'}>Proceed to Review</Button>
            </Link>
          </div>
        }
      />

      <div style={{ borderBottom: '1px solid var(--border)', marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path;
            return (
              <Link 
                key={tab.path}
                to={tab.path}
                style={{
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  padding: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Outlet context={{ build }} />
      </div>
    </>
  );
}
