
import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  
  // Format location path for context
  const pathParts = location.pathname.split('/').filter(Boolean);
  const contextPath = pathParts.length > 1 
    ? pathParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Workspace';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '64px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
          EnterpriseFlow <span style={{ color: 'var(--muted)', margin: '0 8px' }}>/</span> {contextPath.replace('W_1043', 'Invoice Approval')}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            style={{
              padding: '8px 12px 8px 36px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              width: '240px',
              background: 'color-mix(in srgb, var(--surface) 50%, var(--bg))'
            }}
          />
        </div>
        
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
          <Bell size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--border)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            V
          </div>
        </div>
      </div>
    </header>
  );
}
