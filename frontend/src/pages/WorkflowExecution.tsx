import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useWorkflowExecution } from '../hooks/queries';
import { LoadingState, ErrorState } from '../components/States';

export function WorkflowExecutionPage() {
  const { id = 'w_1043' } = useParams();
  const { data: execution, isLoading, error } = useWorkflowExecution(id);

  if (isLoading) {
    return (
      <>
        <PageHeader eyebrow="Runtime Execution" title="Execution Details" />
        <LoadingState message="Loading execution state..." />
      </>
    );
  }

  if (error || !execution) {
    return (
      <>
        <PageHeader eyebrow="Runtime Execution" title="Execution Details" />
        <ErrorState error={error} message="Failed to load execution state." />
      </>
    );
  }

  return (
    <>
      <PageHeader 
        eyebrow="Runtime Execution" 
        title="INV-1043 — ₹8,10,000"
        actions={<Badge variant="warning">Awaiting Approval</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', marginTop: '32px' }}>
        <main>
          <div className="validation-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Execution State</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {execution.steps.map((step: any, idx: number) => {
                if (step.status === 'success') {
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)' }}>
                      <CheckCircle2 size={20} />
                      <span style={{ fontWeight: 500 }}>{step.name}</span>
                    </div>
                  );
                } else if (step.status === 'current') {
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)', background: 'var(--accent-tint)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <Clock size={20} />
                      <span style={{ fontWeight: 600 }}>{step.name}</span>
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)' }}>
                      <AlertCircle size={20} />
                      <span>{step.name}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="summary-card">
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Approval Status</h3>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--warning)', marginBottom: '16px' }}>
              {execution.status}
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5 }}>Assigned to: <strong>{execution.assignedTo}</strong><br/>Time elapsed: <strong>{execution.timeElapsed}</strong></p>
          </div>
          <div className="summary-card">
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Execution History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {execution.history.map((event: any, idx: number) => (
                <div key={idx}>
                  <strong style={{ display: 'block' }}>{event.event}</strong>
                  <span style={{ color: 'var(--muted)' }}>{event.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
