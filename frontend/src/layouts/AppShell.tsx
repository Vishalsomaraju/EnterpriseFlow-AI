import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  return (
    <div className="app-shell light-mode">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Topbar />
        <main className="product-main" style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
