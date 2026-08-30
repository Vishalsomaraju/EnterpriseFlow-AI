import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useDocumentation } from '../hooks/queries';
import { SkeletonCard, SkeletonList, ErrorState, EmptyState } from '../components/States';

export function DocumentationPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const [activeSection, setActiveSection] = useState<'endpoints' | 'rules' | 'errors' | 'states'>('endpoints');
  const { data: docs = [], isLoading, error, refetch } = useDocumentation(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', marginTop: '24px' }}>
          <SkeletonList items={4} />
          <SkeletonCard height="400px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Engineering Artifacts" title="API & Workflow Documentation" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load documentation artifacts." 
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Engineering Artifacts" 
        title="API & Workflow Documentation"
        actions={<Badge status="DEFAULT">Canonical Spec</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', marginTop: '24px' }}>
        <aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: '24px' }}>
            <button 
              onClick={() => setActiveSection('endpoints')}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                background: activeSection === 'endpoints' ? 'var(--accent-tint)' : 'transparent',
                color: activeSection === 'endpoints' ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === 'endpoints' ? 600 : 400
              }}
            >
              API Endpoints
            </button>
            <button 
              onClick={() => setActiveSection('rules')}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                background: activeSection === 'rules' ? 'var(--accent-tint)' : 'transparent',
                color: activeSection === 'rules' ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === 'rules' ? 600 : 400
              }}
            >
              Approval Rules
            </button>
            <button 
              onClick={() => setActiveSection('errors')}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                background: activeSection === 'errors' ? 'var(--accent-tint)' : 'transparent',
                color: activeSection === 'errors' ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === 'errors' ? 600 : 400
              }}
            >
              Error Codes
            </button>
            <button 
              onClick={() => setActiveSection('states')}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                background: activeSection === 'states' ? 'var(--accent-tint)' : 'transparent',
                color: activeSection === 'states' ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === 'states' ? 600 : 400
              }}
            >
              Workflow States
            </button>
          </div>
        </aside>

        <main>
          <Card style={{ padding: '32px' }}>
            {activeSection === 'endpoints' && (
              <>
                <h1 style={{ fontSize: '22px', margin: 0 }}>API Endpoints</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6, marginTop: '8px' }}>
                  Synchronized OpenAPI specifications generated from the canonical workflow implementation.
                </p>

                {docs.length === 0 ? (
                  <EmptyState
                    title="No endpoint documentation generated"
                    description="Trigger an implementation build to generate API specs."
                  />
                ) : (
                  <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {docs.map((doc) => (
                      <div key={doc.id} style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', margin: 0, color: 'var(--accent)' }}>{doc.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{doc.content}</p>
                        {doc.path && <small style={{ color: 'var(--muted)', display: 'block', marginTop: '8px' }}>Artifact: <code>{doc.path}</code></small>}
                      </div>
                    ))}
                  </section>
                )}
              </>
            )}

            {activeSection === 'rules' && (
              <>
                <h1 style={{ fontSize: '22px', margin: 0 }}>Approval Rules Specification</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6, marginTop: '8px' }}>
                  Deterministic governance policies enforced at runtime by the RuleEvaluator engine.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <strong>RULE-manager-approval</strong>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0' }}>
                      Standard invoice threshold verification for manager vs executive approval routing.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'errors' && (
              <>
                <h1 style={{ fontSize: '22px', margin: 0 }}>Standard Error Codes</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6, marginTop: '8px' }}>
                  Deterministic failure handling codes produced across workflow runtime steps.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <code>ERR_RULE_EVALUATION_FAILED</code>
                    <span style={{ color: 'var(--muted)' }}>Expression parsing or boundary evaluation error</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <code>ERR_UNRESOLVED_PO</code>
                    <span style={{ color: 'var(--muted)' }}>Purchase order discrepancy or missing PO reference</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <code>ERR_SECURITY_GATE_BLOCKED</code>
                    <span style={{ color: 'var(--muted)' }}>Critical CVE or policy violation flagged by SecurePush</span>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'states' && (
              <>
                <h1 style={{ fontSize: '22px', margin: 0 }}>Workflow State Transitions</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6, marginTop: '8px' }}>
                  Canonical state graph nodes for deterministic execution and replayability.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>Intake Trigger</strong>
                    <Badge status="COMPLETED">Automated</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>Amount Verification</strong>
                    <Badge status="COMPLETED">Automated</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong>Approval Routing</strong>
                    <Badge status="WARNING">Governance Gate</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <strong>Audit Logging</strong>
                    <Badge status="COMPLETED">Terminal State</Badge>
                  </div>
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </PageContainer>
  );
}
