import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useWorkflowExecution } from '../hooks/queries';
import { SkeletonCard, ErrorState, EmptyState } from '../components/States';

export function WorkflowExecutionPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const { data: execution, isLoading, error, refetch } = useWorkflowExecution(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Runtime Execution" title="Execution Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', marginTop: '32px' }}>
          <SkeletonCard height="340px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SkeletonCard height="120px" />
            <SkeletonCard height="200px" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Runtime Execution" title="Execution Details" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load runtime execution state from server." 
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  if (!execution) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Runtime Execution" title="Execution Details" />
        <div style={{ marginTop: '24px' }}>
          <EmptyState
            title="No runtime execution instance found"
            description="Trigger a test run or runtime execution to view state machine step transitions."
            action={
              <Link to={`/app/workflows/${id}/graph`}>
                <Button>Go to Workflow Graph</Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const executionTitle = execution.title || `Instance ${execution.id || id}`;

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Runtime Execution" 
        title={executionTitle}
        actions={
          <Badge status={execution.status === 'COMPLETED' ? 'COMPLETED' : execution.status === 'FAILED' ? 'DANGER' : 'WARNING'}>
            {execution.status || 'Active'}
          </Badge>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', marginTop: '32px' }}>
        <main>
          <Card style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', margin: 0 }}>State Machine Step Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {execution.steps && execution.steps.length > 0 ? (
                execution.steps.map((step: any, idx: number) => {
                  if (step.status === 'success' || step.status === 'COMPLETED') {
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)' }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontWeight: 500 }}>{step.name}</span>
                      </div>
                    );
                  } else if (step.status === 'current' || step.status === 'IN_PROGRESS') {
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
                })
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>No runtime step transitions recorded.</p>
              )}
            </div>
          </Card>
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px', margin: 0 }}>Current Gate Status</h3>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--warning)', marginBottom: '16px', marginTop: '8px' }}>
              {execution.status || 'Pending'}
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Assigned to: <strong>{execution.assignedTo || 'Automated Engine'}</strong><br/>
              Time elapsed: <strong>{execution.timeElapsed || 'In Progress'}</strong>
            </p>
          </Card>
          <Card>
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px', margin: 0 }}>Audit History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginTop: '12px' }}>
              {execution.history && execution.history.length > 0 ? (
                execution.history.map((event: any, idx: number) => (
                  <div key={idx}>
                    <strong style={{ display: 'block' }}>{event.event}</strong>
                    <span style={{ color: 'var(--muted)' }}>{event.timestamp}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>No event audit history recorded.</p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
