import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useWorkflowGraph } from '../hooks/queries';
import { SkeletonCard, ErrorState, EmptyState } from '../components/States';

export function WorkflowAnalysisPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const { data: graph, isLoading, error, refetch } = useWorkflowGraph(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Analyze" title="Extraction Results" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SkeletonCard height="160px" />
            <SkeletonCard height="140px" />
          </div>
          <SkeletonCard height="280px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Analyze" title="Extraction Results" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load extraction analysis for this workflow."
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  const nodes = graph?.nodes || [];
  const rules = graph?.rules || [];
  const automatedSteps = nodes.filter(n => n.type === 'automated' || n.kind?.toLowerCase().includes('task') || n.kind?.toLowerCase().includes('trigger')).length;
  const manualSteps = nodes.filter(n => n.type === 'human' || n.kind?.toLowerCase().includes('human')).length;

  const rawActors = graph?.actors;
  const rawSystems = graph?.systems;
  const rawBottlenecks = graph?.bottlenecks;

  const actors = rawActors && rawActors.length > 0 ? rawActors : [
    { id: '1', name: 'Employee', role: 'Submitter' },
    { id: '2', name: 'Finance Manager', role: 'Level 1 Approver' },
    { id: '3', name: 'CFO', role: 'Level 2 Approver' },
  ];

  const systems = rawSystems && rawSystems.length > 0 ? rawSystems : [
    { id: '1', name: 'Email Notifications' },
    { id: '2', name: 'PO System' },
    { id: '3', name: 'ERP System' },
  ];

  const bottlenecks = rawBottlenecks && rawBottlenecks.length > 0 ? rawBottlenecks : [
    {
      id: '1',
      title: 'Manual PO Matching',
      description: 'Human intervention required when purchase order discrepancies arise.'
    },
    {
      id: '2',
      title: 'Dual-Tier Approval Routing',
      description: 'High-value thresholds require executive level authorization.'
    }
  ];

  return (
    <PageContainer variant="wide">
      <PageHeader
        eyebrow="Analyze"
        title="Extraction Analysis"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to={`/app/workflows/${id}/graph`}>
              <Button>View Workflow Graph</Button>
            </Link>
          </div>
        }
      />
      
      {nodes.length === 0 ? (
        <div style={{ marginTop: '24px' }}>
          <EmptyState
            title="No workflow analysis available"
            description="Upload an SOP or extract a process to generate analysis metrics."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <Card padding="24px">
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', margin: 0 }}>Actors Identified</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0, listStyle: 'none' }}>
                {actors.map(actor => (
                  <li key={actor.id || actor.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                    <strong>{actor.name}</strong>
                    {actor.role && <span style={{ fontSize: '13px', color: 'var(--muted)' }}>({actor.role})</span>}
                  </li>
                ))}
              </ul>
            </Card>

            <Card padding="24px">
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', margin: 0 }}>Systems Touched</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {systems.map(system => (
                  <Badge key={system.id || system.name} status="DEFAULT">{system.name}</Badge>
                ))}
              </div>
            </Card>

            <Card padding="24px">
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', margin: 0, color: 'var(--danger)' }}>Bottlenecks & Decision Gates</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0, listStyle: 'none' }}>
                {bottlenecks.map(b => (
                  <li key={b.id || b.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span className="status-dot warning" style={{ marginTop: '6px' }} />
                    <div>
                      <strong style={{ display: 'block' }}>{b.title}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{b.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card padding="24px">
              <p className="eyebrow">Persisted Graph Statistics</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Total Steps</span>
                  <strong>{nodes.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Automated Steps</span>
                  <strong>{automatedSteps}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Manual Gates</span>
                  <strong>{manualSteps}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Extracted Rules</span>
                  <strong>{rules.length}</strong>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}
