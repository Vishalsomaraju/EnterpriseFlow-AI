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
    <aside className="product-sidebar">
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
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/app/workflows" end className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <ListTree size={16} /> Workflows
          </NavLink>
          <NavLink to="/app/activity" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <Activity size={16} /> Activity
          </NavLink>
        </div>

        <div className="nav-group" style={{ marginTop: '24px' }}>
          <p className="eyebrow" style={{ padding: '0 12px', marginBottom: '8px' }}>WORKSPACE</p>
          <NavLink to="/app/workflows/new" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <PlusSquare size={16} /> Create Workflow
          </NavLink>
        </div>

        <div className="nav-group" style={{ marginTop: '24px' }}>
          <p className="eyebrow" style={{ padding: '0 12px', marginBottom: '8px' }}>SYSTEM</p>
          <NavLink to="/app/settings" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <Settings size={16} /> Settings
          </NavLink>
          <NavLink to="/app/help" className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <HelpCircle size={16} /> Help
          </NavLink>
        </div>
      </nav>

      <div className="nav-footer-card light">
        <NavLink to="/app/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            V
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Vishal</strong>
            <small style={{ color: 'var(--muted)' }}>Finance Manager</small>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
