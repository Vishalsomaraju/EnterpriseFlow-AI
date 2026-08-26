

export interface ActivityItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ 
          borderTop: idx > 0 ? '1px solid var(--border)' : 'none', 
          paddingTop: idx > 0 ? '16px' : '0' 
        }}>
          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>{item.title}</strong>
          <small style={{ color: 'var(--muted)' }}>{item.source} • {item.timestamp}</small>
        </div>
      ))}
    </div>
  );
}
