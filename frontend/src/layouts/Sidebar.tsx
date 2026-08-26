import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { 
  LayoutDashboard, 
  ListTree, 
  Activity, 
  PlusSquare, 
  Settings, 
  HelpCircle
} from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="product-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-brand-block">
        <div className="brand-mark">EF</div>
        <div>
          <strong>EnterpriseFlow</strong>
          <small>Workspace</small>
        </div>
      </div>
      <nav className="product-nav">
        <div className="nav-group">
          <p className="eyebrow" style={{ padding: '0 12px', marginBottom: '8px' }}>OVERVIEW</p>
          <NavLink to="/app/dashboard" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutDashboard size={16} /> Dashboard
            </div>
          </NavLink>
          <NavLink to="/app/workflows" end className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTree size={16} /> Workflows
            </div>
          </NavLink>
          <NavLink to="/app/activity" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Activity
            </div>
          </NavLink>
        </div>

        <div className="nav-group" style={{ marginTop: '24px' }}>
          <p className="eyebrow" style={{ padding: '0 12px', marginBottom: '8px' }}>WORKSPACE</p>
          <NavLink to="/app/workflows/new" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusSquare size={16} /> Create Workflow
            </div>
          </NavLink>
        </div>

        <div className="nav-group" style={{ marginTop: '24px' }}>
          <p className="eyebrow" style={{ padding: '0 12px', marginBottom: '8px' }}>SYSTEM</p>
          <NavLink to="/app/settings" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} /> Settings
            </div>
          </NavLink>
          <NavLink to="/app/help" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} /> Help
            </div>
          </NavLink>
        </div>
      </nav>

      <div className="nav-footer-card light" style={{ marginTop: 'auto', padding: '16px 12px', border: 'none', borderTop: '1px solid var(--border)', background: 'transparent' }}>
        <NavLink to="/app/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            V
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '14px' }}>Vishal</strong>
            <small style={{ color: 'var(--muted)' }}>Finance Manager</small>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
