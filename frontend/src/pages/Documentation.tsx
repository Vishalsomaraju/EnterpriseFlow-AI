import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useDocumentation } from '../hooks/queries';
import { LoadingState, ErrorState } from '../components/States';

export function DocumentationPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const { data: docs, isLoading, error } = useDocumentation(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <LoadingState message="Loading documentation..." />
      </PageContainer>
    );
  }

  if (error || !docs) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <ErrorState error={error} message="Failed to load documentation." />
      </PageContainer>
    );
  }
  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Engineering Artifacts" 
        title="API & Workflow Documentation"
        actions={<Badge status="DEFAULT">Documentation Updated</Badge>}
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

        <main>
          <Card style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '8px', margin: 0 }}>API Endpoints</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6, marginTop: '8px' }}>
              Generated documentation for the updated invoice approval boundary. This documentation is treated as a first-class engineering artifact updated by IBM Bob during the build lifecycle.
            </p>

            <section style={{ marginBottom: '40px' }}>
              {docs.map((doc) => (
                <div key={doc.id} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', margin: 0 }}>{doc.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{doc.content}</p>
                  {doc.path && <small style={{ color: 'var(--muted)' }}>{doc.path}</small>}
                </div>
              ))}
            </section>

            <section>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: 0 }}>Approval Rules</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, marginTop: '16px', margin: 0 }}>
                The system utilizes a dual-tier human routing checkpoint. As of the latest change:
                <br/><br/>
                Documentation artifacts are sourced from the build records returned by the backend.
              </p>
            </section>
          </Card>
        </main>
      </div>
    </PageContainer>
  );
}
