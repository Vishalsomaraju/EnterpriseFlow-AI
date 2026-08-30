import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { PageContainer } from '../../components/layout/PageContainer';
import { BuildStatus } from '../../components/build/BuildStatus';
import { useBuildOverview } from '../../hooks/queries';
import { SkeletonMetrics, SkeletonCard, ErrorState, EmptyState } from '../../components/States';

export function BobBuildLayout() {
  const location = useLocation();
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams<{ id: string }>();
  const { data: build, isLoading, error, refetch } = useBuildOverview(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="IBM Bob Engineering" title="Implementation Workspace" />
        <SkeletonMetrics count={4} />
        <div style={{ marginTop: '24px' }}>
          <SkeletonCard height="320px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="IBM Bob Engineering" title="Implementation Workspace" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load build data from server." 
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  if (!build) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="IBM Bob Engineering" title="Implementation Workspace" />
        <div style={{ marginTop: '24px' }}>
          <EmptyState
            title="No builds recorded for this workflow"
            description="Generate a blueprint and trigger an implementation build to see Bob agent execution."
            action={
              <Link to={`/app/workflows/${id}/blueprint`}>
                <Button>Go to Blueprint</Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const workflowId = build.workflowId || id;

  const tabs = [
    { label: 'Overview', path: `/app/workflows/${workflowId}/build` },
    { label: 'Plan', path: `/app/workflows/${workflowId}/build/plan` },
    { label: 'Changes', path: `/app/workflows/${workflowId}/build/changes` }
  ];

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="IBM Bob Engineering" 
        title="Implementation Workspace"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge status="ACTIVE">Bob Active</Badge>
            <BuildStatus status={build.status} />
            <Link to={`/app/workflows/${workflowId}/review`}>
              <Button disabled={build.status !== 'COMPLETED'}>Proceed to Review</Button>
            </Link>
          </div>
        }
      />

      <div style={{ borderBottom: '1px solid var(--border)', marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path || (location.pathname === `/app/workflows/${workflowId}/build/` && tab.label === 'Overview');
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
    </PageContainer>
  );
}
