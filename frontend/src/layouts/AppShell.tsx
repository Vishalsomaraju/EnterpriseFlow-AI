import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  return (
    <div className="app-shell light-mode">
      <Sidebar />
      <div className="app-main-column">
        <Topbar />
        <main className="product-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
