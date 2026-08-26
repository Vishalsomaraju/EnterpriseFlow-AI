import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export function CreateWorkflowPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // Navigate directly to analysis step for MVP
    navigate('/app/workflows/w_1043/analysis');
  };

  return (
    <>
      <PageHeader eyebrow="Workflows" title="Create New Workflow" />
      
      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        
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

        <div className="validation-card" style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Workflow name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Invoice Approval" 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Current process description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe how this process is currently handled..." 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Supporting document upload</label>
              <div style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: 'var(--radius-md)', 
                padding: '32px', 
                textAlign: 'center',
                background: 'var(--surface)'
              }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--muted)' }}>Support PDF/DOCX format</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload">
                  <span className="inline-flex items-center justify-center font-bold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 min-h-[38px] px-4 text-[13px] rounded-md cursor-pointer">
                    {file ? file.name : 'Upload Document'}
                  </span>
                </label>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost">Save Draft</Button>
            <Button onClick={handleAnalyze} disabled={!name && !file}>Analyze Workflow</Button>
          </div>
        </div>
      </div>
    </>
  );
}
