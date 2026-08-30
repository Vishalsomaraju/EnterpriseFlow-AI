import { PageHeader } from '../components/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/Card';
import { useActivity } from '../hooks/queries';
import { SkeletonList, ErrorState, EmptyState } from '../components/States';

export function AuditTrailPage() {
  const { data: events = [], isLoading, error, refetch } = useActivity('0bc69865-15e0-4f30-af96-6227abee5e6c');

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Compliance & Security" title="Audit Trail" />
        <div style={{ maxWidth: '800px', margin: '32px auto' }}>
          <SkeletonList items={5} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Compliance & Security" title="Audit Trail" />
        <div style={{ maxWidth: '800px', margin: '32px auto' }}>
          <ErrorState 
            error={error} 
            message="Failed to load compliance audit events." 
            onRetry={() => refetch()} 
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader eyebrow="Compliance & Security" title="Audit Trail" />

      <div style={{ maxWidth: '800px', margin: '32px auto' }}>
        <Card>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', margin: 0 }}>Chronological System Audit Events</h2>
          
          {events.length === 0 ? (
            <div style={{ marginTop: '16px' }}>
              <EmptyState
                title="No compliance audit events recorded yet"
                description="State changes, rule evaluations, and human sign-offs will be logged here with cryptographic timestamps."
              />
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginTop: '24px' }}>
              {events.map((evt, idx) => (
                <div key={evt.id || idx} style={{ position: 'relative', marginBottom: idx === events.length - 1 ? 0 : '28px' }}>
                  <div style={{ position: 'absolute', left: '-21px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)' }} />
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent event'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{evt.message || evt.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                    Source: <code style={{ color: 'var(--accent)', fontSize: '12px' }}>{evt.source || evt.event_type || 'System'}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
