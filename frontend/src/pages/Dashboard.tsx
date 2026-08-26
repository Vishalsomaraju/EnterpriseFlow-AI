import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { PageContainer } from '../components/layout/PageContainer';
import { Section } from '../components/layout/Section';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { useProjects, useDashboardStats, useActivity } from '../hooks/queries';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: activity, isLoading: activityLoading, error: activityError } = useActivity();

  if (statsLoading || projectsLoading || activityLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Workspace" title="Good Morning, EnterpriseFlow Admin" />
        <LoadingState message="Loading dashboard..." />
      </PageContainer>
    );
  }

  if (statsError || projectsError || activityError) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Workspace" title="Good Morning, EnterpriseFlow Admin" />
        <ErrorState error={statsError || projectsError || activityError || 'Failed to load dashboard'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        eyebrow="Workspace" 
        title="Good Morning, EnterpriseFlow Admin" 
        actions={
          <Link to="/app/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        } 
      />
      
      {/* KPI Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card>
          <p className="eyebrow">Workflows</p>
          <h3 style={{ fontSize: '28px', margin: 0 }}>{stats?.totalWorkflows || 0}</h3>
        </Card>
        <Card>
          <p className="eyebrow">Active</p>
          <h3 style={{ fontSize: '28px', margin: 0 }}>{stats?.activeWorkflows || 0}</h3>
        </Card>
        <Card>
          <p className="eyebrow">Pending</p>
          <h3 style={{ fontSize: '28px', margin: 0, color: 'var(--warning)' }}>{stats?.pendingTasks || 0}</h3>
        </Card>
        <Card>
          <p className="eyebrow">Changes (IBM Bob)</p>
          <h3 style={{ fontSize: '28px', margin: 0, color: 'var(--ai)' }}>{stats?.bobChanges || 0}</h3>
        </Card>
      </section>

      {/* Active Workflows Section */}
      <Section
        title="Active workflows"
        actions={<Link to="/app/workflows" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>View all</Link>}
      >
        {(!projects || projects.length === 0) ? (
          <EmptyState 
            title="No active workflows" 
            description="Create a new workflow to automate your processes." 
            action={
              <Link to="/app/workflows/new">
                <Button size="sm">Create Workflow</Button>
              </Link>
            } 
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 500 }}>{project.name}</td>
                  <td><Badge status="ACTIVE" /></td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(project.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/app/workflows/${project.id}/graph`}>
                      <Button variant="secondary" size="sm">View Graph</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Pending Actions */}
        <Section title="Pending actions">
          <Card>
            {stats?.pendingTasks ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>Invoice Approval - Threshold Rule Change</strong>
                  <small style={{ color: 'var(--muted)' }}>Bob has finished tests. Human review required.</small>
                </div>
                <Link to="/app/workflows/w_1043/review">
                  <Button variant="primary" size="sm">Review Change</Button>
                </Link>
              </div>
            ) : (
              <EmptyState title="No pending actions" description="You're all caught up." />
            )}
          </Card>
        </Section>

        {/* Recent Activity */}
        <Section title="Recent activity">
          <Card>
            {(!activity || activity.length === 0) ? (
              <EmptyState title="No recent activity" description="Activity will appear here once actions are taken." />
            ) : (
              <ActivityTimeline items={activity} />
            )}
          </Card>
        </Section>
      </div>
    </PageContainer>
  );
}
