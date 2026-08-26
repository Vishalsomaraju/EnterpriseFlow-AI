import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export function WorkflowAnalysisPage() {
  return (
    <>
      <PageHeader 
        eyebrow="Analyze" 
        title="Extraction Results"
        actions={
          <Link to="/app/workflows/w_1043/graph">
            <Button>View Workflow Graph</Button>
          </Link>
        }
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="validation-card">
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Actors Identified</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                <strong>Employee</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                <strong>Finance Manager</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                <strong>CFO</strong>
              </li>
            </ul>
          </div>

          <div className="validation-card">
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Systems Touched</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Badge variant="info">Email</Badge>
              <Badge variant="info">PO System</Badge>
              <Badge variant="info">ERP</Badge>
            </div>
          </div>

          <div className="validation-card">
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--danger)' }}>Bottlenecks Detected</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="status-dot warning" style={{ marginTop: '6px' }} />
                <div>
                  <strong style={{ display: 'block' }}>Manual PO matching</strong>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Human intervention required to cross-reference Purchase Orders.</span>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="status-dot warning" style={{ marginTop: '6px' }} />
                <div>
                  <strong style={{ display: 'block' }}>Email approval</strong>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Unstructured approvals via email threads cause tracing delays.</span>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="status-dot warning" style={{ marginTop: '6px' }} />
                <div>
                  <strong style={{ display: 'block' }}>Manual duplicate checking</strong>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Risk of double-payment due to manual visual checks.</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="summary-card">
            <p className="eyebrow">Summary Statistics</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Total Steps</span>
                <strong>10</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Automated Steps</span>
                <strong>7</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Manual Steps</span>
                <strong>3</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Rules Extracted</span>
                <strong>2</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
