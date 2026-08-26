import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useProjects, useDashboardStats, useActivity } from '../hooks/queries';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: activity, isLoading: activityLoading, error: activityError } = useActivity();

  if (statsLoading || projectsLoading || activityLoading) {
    return (
      <>
        <PageHeader eyebrow="Workspace" title="Good Morning, EnterpriseFlow Admin" />
        <LoadingState message="Loading dashboard..." />
      </>
    );
  }

  if (statsError || projectsError || activityError) {
    return (
      <>
        <PageHeader eyebrow="Workspace" title="Good Morning, EnterpriseFlow Admin" />
        <ErrorState error={statsError || projectsError || activityError || 'Failed to load dashboard'} />
      </>
    );
  }

  return (
    <>
      <PageHeader 
        eyebrow="Workspace" 
        title="Good Morning, EnterpriseFlow Admin" 
        actions={
          <Link to="/app/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        } 
      />
      
      <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* KPI Row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="summary-card">
            <p className="eyebrow">Workflows</p>
            <h3 style={{ fontSize: '28px', marginTop: '8px' }}>{stats?.totalWorkflows || 0}</h3>
          </div>
          <div className="summary-card">
            <p className="eyebrow">Active</p>
            <h3 style={{ fontSize: '28px', marginTop: '8px' }}>{stats?.activeWorkflows || 0}</h3>
          </div>
          <div className="summary-card">
            <p className="eyebrow">Pending</p>
            <h3 style={{ fontSize: '28px', marginTop: '8px', color: 'var(--warning)' }}>{stats?.pendingTasks || 0}</h3>
          </div>
          <div className="summary-card">
            <p className="eyebrow">Changes (IBM Bob)</p>
            <h3 style={{ fontSize: '28px', marginTop: '8px', color: 'var(--ai)' }}>{stats?.bobChanges || 0}</h3>
          </div>
        </section>

        {/* Active Workflows Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px' }}>Active workflows</h2>
            <Link to="/app/workflows" style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>View all</Link>
          </div>
          
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
            <div className="validation-card" style={{ padding: 0 }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px' }}>Name</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Last Updated</th>
                    <th style={{ padding: '16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={project.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{project.name}</td>
                      <td style={{ padding: '16px' }}><Badge variant="success">Active</Badge></td>
                      <td style={{ padding: '16px', color: 'var(--muted)' }}>{new Date(project.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Link to={`/app/workflows/${project.id}/graph`}>
                          <Button variant="secondary" size="sm">View Graph</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Pending Actions */}
          <section>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Pending actions</h2>
            <div className="validation-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent activity</h2>
            <div className="validation-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(!activity || activity.length === 0) ? (
                <EmptyState title="No recent activity" description="Activity will appear here once actions are taken." />
              ) : (
                activity.map((item, idx) => (
                  <div key={item.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none', paddingTop: idx > 0 ? '16px' : '0' }}>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{item.title}</strong>
                    <small style={{ color: 'var(--muted)' }}>{item.source} • {item.timestamp}</small>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

      </div>
    </>
  );
}
