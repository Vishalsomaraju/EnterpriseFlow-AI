import { PageHeader } from '../components/PageHeader';
import { Book, FileText, HelpCircle, Terminal } from 'lucide-react';

export function HelpPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Help & Documentation" />

      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '32px' }}>
          Welcome to EnterpriseFlow documentation. Select a topic to learn more about defining, simulating, and implementing business workflows.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="summary-card" style={{ padding: '24px', cursor: 'pointer' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><Book size={24} /></div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Getting Started</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Learn the basics of EnterpriseFlow, from creating your first blueprint to triggering IBM Bob.</p>
          </div>
          
          <div className="summary-card" style={{ padding: '24px', cursor: 'pointer' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><Terminal size={24} /></div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>IBM Bob Engineering</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Understand how the multi-agent orchestration translates graph rules into source code.</p>
          </div>

          <div className="summary-card" style={{ padding: '24px', cursor: 'pointer' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><FileText size={24} /></div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>API Reference</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Documentation for triggering workflows programmatically and checking execution status.</p>
          </div>

          <div className="summary-card" style={{ padding: '24px', cursor: 'pointer' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><HelpCircle size={24} /></div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Troubleshooting</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Common errors during blueprint extraction, security validation, and test regression.</p>
          </div>
        </div>
      </div>
    </>
  );
}
