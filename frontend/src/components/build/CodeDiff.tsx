import React, { useState } from 'react';
import type { CodeDiff as CodeDiffType, ChangedFile } from '../../types';
import { FileCode2 } from 'lucide-react';

interface CodeDiffProps {
  diffData: CodeDiffType;
}

export const CodeDiff: React.FC<CodeDiffProps> = ({ diffData }) => {
  const [selectedFile, setSelectedFile] = useState<ChangedFile>(diffData.files[0]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', height: '500px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* File List */}
      <div style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600 }}>
          Changed Files ({diffData.files.length})
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {diffData.files.map(file => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: selectedFile.path === file.path ? 'var(--accent-tint)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <FileCode2 size={16} color={file.status === 'added' ? 'var(--success)' : file.status === 'deleted' ? 'var(--warning)' : 'var(--accent)'} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text)' }}>
                  {file.path.split('/').pop()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {file.path}
                </div>
              </div>
              <div style={{ fontSize: '11px', display: 'flex', gap: '6px' }}>
                {file.additions > 0 && <span style={{ color: 'var(--success)' }}>+{file.additions}</span>}
                {file.deletions > 0 && <span style={{ color: 'var(--warning)' }}>-{file.deletions}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Diff View */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong style={{ fontSize: '13px' }}>{selectedFile?.path}</strong>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>READ-ONLY DIFF</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.5 }}>
          {diffData.patch.split('\n').map((line, i) => {
            let color = 'var(--text)';
            let bg = 'transparent';
            if (line.startsWith('+')) {
              color = 'var(--success)';
              bg = 'var(--success-tint)';
            } else if (line.startsWith('-')) {
              color = 'var(--warning)';
              bg = 'var(--warning-tint)';
            } else if (line.startsWith('@@')) {
              color = 'var(--muted)';
              bg = 'var(--surface)';
            }

            return (
              <div key={i} style={{ display: 'flex', gap: '16px', background: bg, padding: '0 8px' }}>
                <span style={{ color: 'var(--muted)', width: '32px', textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span style={{ color, whiteSpace: 'pre' }}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
