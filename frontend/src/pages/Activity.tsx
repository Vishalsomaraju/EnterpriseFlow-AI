import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/Card';
import { useActivity, useProjects } from '../hooks/queries';
import { LoadingState, ErrorState } from '../components/States';

export function ActivityPage() {
  const [filter, setFilter] = useState('All');
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const projectId = projects?.[0]?.id;
  const { data: activity, isLoading: activityLoading, error: activityError } = useActivity(projectId);
  const filters = ['All', 'Workflow', 'Build', 'Test', 'Approval', 'Rule Change'];

  if (projectsLoading || activityLoading) {
    return <PageContainer><PageHeader eyebrow="Workspace" title="Global Activity" /><LoadingState message="Loading activity..." /></PageContainer>;
  }
  if (projectsError || activityError) {
    return <PageContainer><PageHeader eyebrow="Workspace" title="Global Activity" /><ErrorState error={projectsError || activityError} message="Failed to load activity." /></PageContainer>;
  }

  const timeline = (activity || []).map((item) => ({
    id: item.id,
    type: item.event_type || 'Workflow',
    text: item.message || item.title,
    time: new Date(item.timestamp).toLocaleString(),
  }));

  const filtered = filter === 'All' ? timeline : timeline.filter(t => t.type === filter);

  return (
    <PageContainer>
      <PageHeader eyebrow="Workspace" title="Global Activity" />

      <div style={{ display: 'flex', gap: '8px', margin: '24px 0' }}>
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 'var(--radius-sm)', 
              border: filter === f ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: filter === f ? 'var(--accent-tint)' : 'var(--surface)',
              color: filter === f ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '13px'
            }}>
            {f}
          </button>
        ))}
      </div>

      <Card style={{ padding: '24px' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
              <div style={{ fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{item.text}</div>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{item.time}</span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>No activity found.</div>}
      </Card>
    </PageContainer>
  );
}
