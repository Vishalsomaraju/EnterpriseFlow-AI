import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const tabs = ['General', 'Workflow', 'Notifications', 'Appearance'];

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', margin: '32px 0' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '4px',
                background: activeTab === t ? 'var(--accent-tint)' : 'transparent',
                color: activeTab === t ? 'var(--accent)' : 'var(--text)',
                fontWeight: activeTab === t ? 600 : 400,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </aside>

        <main className="validation-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>{activeTab} Settings</h2>
          
          {activeTab === 'General' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Workspace Name</label>
                <input type="text" defaultValue="EnterpriseFlow Default Workspace" style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>API Environment</label>
                <select style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text)' }}>
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </div>
            </div>
          )}

          {activeTab !== 'General' && (
            <p style={{ color: 'var(--muted)' }}>Configuration for {activeTab.toLowerCase()} will appear here in future updates.</p>
          )}
        </main>
      </div>
    </>
  );
}
