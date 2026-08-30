import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="User Profile" />

      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <Card style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              A
            </div>
            <div>
              <h2 style={{ fontSize: '24px', margin: 0 }}>System Administrator</h2>
              <p style={{ color: 'var(--muted)', marginTop: '4px', margin: 0 }}>admin@enterpriseflow.local</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '14px' }}>
            <div style={{ color: 'var(--muted)' }}>Role</div>
            <div style={{ fontWeight: 500 }}>Global Administrator</div>

            <div style={{ color: 'var(--muted)' }}>Workspace</div>
            <div style={{ fontWeight: 500 }}>EnterpriseFlow Master Workspace</div>

            <div style={{ color: 'var(--muted)' }}>Status</div>
            <div style={{ color: 'var(--success)', fontWeight: 500 }}>Active Session</div>
          </div>

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
