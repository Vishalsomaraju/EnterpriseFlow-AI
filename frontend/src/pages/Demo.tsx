import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export function Demo() {
  return (
    <div className="overview-page">
      <div className="launcher-shell" style={{ maxWidth: '600px', margin: '40px auto', gridTemplateColumns: '1fr' }}>
        <main className="overview-main">
          <header className="hero-panel" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <p className="eyebrow">Demo Access</p>
              <h2>Invoice Approval</h2>
            </div>
            <p className="hero-copy">
              This demo follows the Invoice Approval workflow from SOP extraction through deterministic rule generation and IBM Bob integration.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link to="/app/dashboard">
                <Button>Access Dashboard</Button>
              </Link>
            </div>
          </header>
        </main>
      </div>
    </div>
  );
}
