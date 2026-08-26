

import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  
  // Format location path for context
  const pathParts = location.pathname.split('/').filter(Boolean);
  const contextPath = pathParts.length > 1 
    ? pathParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Workspace';

  return (
    <header className="screen-topbar light" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      height: '64px',
      padding: '0 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
          EnterpriseFlow <span style={{ color: 'var(--border-strong)', margin: '0 8px' }}>/</span> {contextPath.replace('W_1043', 'Invoice Approval')}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            V
          </div>
        </div>
      </div>
    </header>
  );
}
