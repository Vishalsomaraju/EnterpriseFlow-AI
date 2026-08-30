import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { Book, FileText, HelpCircle, Terminal } from 'lucide-react';

export function HelpPage() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Support" title="Help & Documentation" />

      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '32px' }}>
          Welcome to EnterpriseFlow documentation. Select a topic to learn more about defining, simulating, and implementing business workflows.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Link to="/app/workflows" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ padding: '24px', cursor: 'pointer', height: '100%' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><Book size={24} /></div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', margin: 0 }}>Getting Started</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Learn the basics of EnterpriseFlow, from creating your first blueprint to triggering IBM Bob.</p>
            </Card>
          </Link>
          
          <Link to="/app/workflows/0bc69865-15e0-4f30-af96-6227abee5e6c/build" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ padding: '24px', cursor: 'pointer', height: '100%' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><Terminal size={24} /></div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', margin: 0 }}>IBM Bob Engineering</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Understand how the multi-agent orchestration translates graph rules into source code.</p>
            </Card>
          </Link>

          <Link to="/app/workflows/0bc69865-15e0-4f30-af96-6227abee5e6c/documentation" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ padding: '24px', cursor: 'pointer', height: '100%' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><FileText size={24} /></div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', margin: 0 }}>API Reference</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Documentation for triggering workflows programmatically and checking execution status.</p>
            </Card>
          </Link>

          <Link to="/app/audit" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ padding: '24px', cursor: 'pointer', height: '100%' }}>
              <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><HelpCircle size={24} /></div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', margin: 0 }}>Compliance & Audit</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Common verification patterns during blueprint extraction, security validation, and test regression.</p>
            </Card>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
