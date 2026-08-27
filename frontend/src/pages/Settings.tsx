import { useState } from 'react';
import clsx from 'clsx';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const tabs = ['General', 'Workflow', 'Notifications', 'Appearance'];

  return (
    <PageContainer>
      <PageHeader eyebrow="Configuration" title="Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', margin: '32px 0' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={clsx('mini-nav', activeTab === t && 'active')}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </aside>

        <main>
          <Card style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', margin: 0 }}>{activeTab} Settings</h2>
            
            {activeTab === 'General' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Workspace Name</label>
                  <input type="text" defaultValue="EnterpriseFlow Default Workspace" style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>API Environment</label>
                  <select style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab !== 'General' && (
              <p style={{ color: 'var(--muted)', marginTop: '24px', margin: 0 }}>Configuration for {activeTab.toLowerCase()} will appear here in future updates.</p>
            )}
          </Card>
        </main>
      </div>
    </PageContainer>
  );
}
