import { PageHeader } from '../components/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/Card';

export function AuditTrailPage() {
  const events = [
    { id: 1, time: '10:45 AM', action: 'Invoice approved', actor: 'Sarah Jenkins (Manager)' },
    { id: 2, time: '09:16 AM', action: 'Approval requested', actor: 'System Router' },
    { id: 3, time: '09:15 AM', action: 'PO matched', actor: 'ERP Integration Service' },
    { id: 4, time: '09:13 AM', action: 'Vendor validated', actor: 'Vendor Master Service' },
    { id: 5, time: '09:12 AM', action: 'Invoice submitted', actor: 'API Gateway' },
  ];

  return (
    <PageContainer>
      <PageHeader eyebrow="Compliance & Security" title="Audit Trail" />

      <div style={{ maxWidth: '800px', margin: '32px auto' }}>
        <Card>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', margin: 0 }}>Chronological System Events</h2>
          
          <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginTop: '24px' }}>
            {events.map((evt, idx) => (
              <div key={evt.id} style={{ position: 'relative', marginBottom: idx === events.length - 1 ? 0 : '32px' }}>
                <div style={{ position: 'absolute', left: '-21px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)' }} />
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{evt.time}</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{evt.action}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Actor: {evt.actor}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
