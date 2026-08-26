import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { useDocumentation } from '../hooks/queries';
import { LoadingState, ErrorState } from '../components/States';

export function DocumentationPage() {
  const { id = 'w_1043' } = useParams();
  const { data: docs, isLoading, error } = useDocumentation(id);

  if (isLoading) {
    return (
      <>
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <LoadingState message="Loading documentation..." />
      </>
    );
  }

  if (error || !docs) {
    return (
      <>
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <ErrorState error={error} message="Failed to load documentation." />
      </>
    );
  }
  return (
    <>
      <PageHeader 
        eyebrow="Engineering Artifacts" 
        title="API & Workflow Documentation"
        actions={<Badge variant="info">Documentation Updated</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', marginTop: '24px' }}>
        <aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: '24px' }}>
            <button className="nav-button active" style={{ textAlign: 'left', padding: '8px 12px', background: 'var(--accent-tint)', color: 'var(--accent)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>API Endpoints</button>
            <button className="nav-button" style={{ textAlign: 'left', padding: '8px 12px', background: 'transparent', color: 'var(--text)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Approval Rules</button>
            <button className="nav-button" style={{ textAlign: 'left', padding: '8px 12px', background: 'transparent', color: 'var(--text)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Error Codes</button>
            <button className="nav-button" style={{ textAlign: 'left', padding: '8px 12px', background: 'transparent', color: 'var(--text)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Workflow States</button>
          </div>
        </aside>

        <main className="validation-card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>API Endpoints</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}>
            Generated documentation for the updated invoice approval boundary. This documentation is treated as a first-class engineering artifact updated by IBM Bob during the build lifecycle.
          </p>

          <section style={{ marginBottom: '40px' }}>
            {docs.endpoints.map((ep: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ padding: '4px 8px', background: 'var(--ai-tint)', color: 'var(--ai)', borderRadius: '4px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{ep.method}</span>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{ep.path}</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>{ep.desc}</p>
                
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Request Body</h4>
                <pre style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)' }}>
{ep.body}
                </pre>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Approval Rules</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
              The system utilizes a dual-tier human routing checkpoint. As of the latest change:
              <br/><br/>
              {docs.rules.map((rule: any, idx: number) => (
                <span key={idx}>• <strong>{rule.condition}</strong>: {rule.action}<br/></span>
              ))}
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
