import { useState } from 'react';
import clsx from 'clsx';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PageContainer } from '../components/layout/PageContainer';
import { Check } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('EnterpriseFlow Master Workspace');
  const [env, setEnv] = useState('Development');

  const tabs = ['General', 'Workflow', 'Notifications', 'Appearance'];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>{activeTab} Settings</h2>
              {saved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}>
                  <Check size={16} /> Configuration saved
                </div>
              )}
            </div>
            
            {activeTab === 'General' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label htmlFor="workspace-name-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Workspace Name</label>
                  <input 
                    id="workspace-name-input"
                    type="text" 
                    value={workspaceName} 
                    onChange={e => setWorkspaceName(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label htmlFor="api-environment-select" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>API Environment</label>
                  <select 
                    id="api-environment-select"
                    value={env}
                    onChange={e => setEnv(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Button onClick={handleSave}>Save Configuration</Button>
                </div>
              </div>
            )}

            {activeTab !== 'General' && (
              <p style={{ color: 'var(--muted)', marginTop: '16px', margin: 0 }}>
                Configuration policies for {activeTab.toLowerCase()} are managed automatically by the environment controller.
              </p>
            )}
          </Card>
        </main>
      </div>
    </PageContainer>
  );
}
