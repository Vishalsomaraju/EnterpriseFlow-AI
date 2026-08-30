import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';

export function CreateWorkflowPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // Navigate directly to analysis step for MVP — uses the real workflow ID
    navigate('/app/workflows/0bc69865-15e0-4f30-af96-6227abee5e6c/analysis');
  };

  return (
    <PageContainer variant="narrow">
      <PageHeader eyebrow="Workflows" title="Create New Workflow" />
      
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, height: '2px', background: 'var(--border)', zIndex: 0 }} />
          {['Describe', 'Analyze', 'Blueprint', 'Build', 'Review'].map((step, idx) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, position: 'relative' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: idx === 0 ? 'var(--accent)' : 'var(--surface)',
                border: idx === 0 ? 'none' : '2px solid var(--border)',
                color: idx === 0 ? 'white' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600
              }}>
                {idx + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: idx === 0 ? 600 : 400, color: idx === 0 ? 'var(--text)' : 'var(--muted)' }}>{step}</span>
            </div>
          ))}
        </div>

        <Card padding="32px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Workflow name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Invoice Approval" 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Current process description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe how this process is currently handled..." 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', minHeight: '100px', resize: 'vertical', background: 'var(--bg)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Supporting document upload</label>
              <div style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: 'var(--radius-md)', 
                padding: '32px', 
                textAlign: 'center',
                background: 'color-mix(in srgb, var(--surface) 50%, var(--bg))'
              }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--muted)' }}>Support PDF/DOCX format</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button 
                  variant="secondary" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {file ? file.name : 'Upload Document'}
                </Button>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost">Save Draft</Button>
            <Button onClick={handleAnalyze} disabled={!name && !file}>Analyze Workflow</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
