import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export function Demo() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg)',
      backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      padding: '24px', 
      boxSizing: 'border-box' 
    }}>
      <Card padding="32px" style={{ maxWidth: '480px', width: '100%', borderTop: '2px solid var(--accent)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className="brand-mark">EF</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p className="eyebrow" style={{ margin: 0, padding: 0 }}>IBM Bob Hackathon</p>
              <strong style={{ fontSize: '14px', lineHeight: '1.2' }}>EnterpriseFlow</strong>
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{ margin: '0 0 8px 0' }}>Demo Access</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>Invoice Approval</h2>
              <Badge status="ACTIVE">Deterministic workflow</Badge>
            </div>
          </div>
          
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>
            This demo follows the Invoice Approval workflow from SOP extraction through deterministic rule generation and IBM Bob integration.
          </p>
          
          <div style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
            <Link to="/app/dashboard">
              <Button>Access Dashboard</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
