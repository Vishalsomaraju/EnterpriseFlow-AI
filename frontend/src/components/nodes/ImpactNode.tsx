import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';


export type ImpactNodeType = Node<{
  variant: 'info' | 'warning' | 'success' | 'danger' | 'ai';
  label: string;
  title: string;
  description: string;
  metrics?: string;
}, 'impactNode'>;

export function ImpactNode({ data }: NodeProps<ImpactNodeType>) {
  return (
    <div className="impact-node ripple-hot" style={{ width: 280, position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <span className={`pill ${data.variant}`}>{data.label}</span>
      <h2 style={{ marginTop: '8px', fontSize: '15px' }}>{data.title}</h2>
      {data.metrics && <h3 style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text)' }}>{data.metrics}</h3>}
      <p style={{ marginTop: '8px' }}>{data.description}</p>
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
