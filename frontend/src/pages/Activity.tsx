import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/Card';

export function ActivityPage() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Workflow', 'Build', 'Test', 'Approval', 'Rule Change'];

  const timeline = [
    { id: 1, type: 'Rule Change', text: 'Approval threshold shifted to ₹10L by Admin.', time: '2 hours ago' },
    { id: 2, type: 'Approval', text: 'Sarah Jenkins approved INV-1043.', time: '4 hours ago' },
    { id: 3, type: 'Build', text: 'IBM Bob successfully implemented boundary logic.', time: '1 day ago' },
    { id: 4, type: 'Test', text: 'Regression suite 27/27 passed.', time: '1 day ago' },
    { id: 5, type: 'Workflow', text: 'Invoice Approval workflow activated.', time: '3 days ago' },
  ];

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
