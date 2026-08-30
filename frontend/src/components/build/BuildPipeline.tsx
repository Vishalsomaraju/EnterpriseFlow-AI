import React from 'react';
import type { BuildStage } from '../../types';

interface BuildPipelineProps {
  stages: BuildStage[];
}

export const BuildPipeline: React.FC<BuildPipelineProps> = ({ stages }) => {
  return (
    <div className="sidebar-shell" style={{ borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Engineering Lifecycle</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {stages.map((stage, idx) => (
          <div key={stage.id} style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: stage.status === 'COMPLETED' ? 'var(--success)' : stage.status === 'ACTIVE' ? 'var(--ai)' : stage.status === 'FAILED' ? 'var(--warning)' : 'var(--border)',
                marginTop: '6px',
                zIndex: 1
              }} />
              {idx < stages.length - 1 && (
                <div style={{
                  width: '2px', flex: 1, minHeight: '24px',
                  background: stage.status === 'COMPLETED' ? 'var(--success)' : 'var(--border)',
                  margin: '4px 0'
                }} />
              )}
            </div>
            <div style={{ paddingBottom: idx < stages.length - 1 ? '16px' : '0', paddingTop: '3px' }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: stage.status === 'ACTIVE' ? 600 : 400,
                color: stage.status === 'ACTIVE' ? 'var(--ai)' : stage.status === 'PENDING' ? 'var(--muted)' : 'var(--text)' 
              }}>
                {stage.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
