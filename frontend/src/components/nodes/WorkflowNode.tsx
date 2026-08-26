import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import clsx from 'clsx';

export type WorkflowNodeType = Node<{
  label: string;
  kind: string;
  type: 'automated' | 'human';
}, 'customNode'>;

export function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeType>) {
  return (
    <div
      className={clsx(
        'workflow-node',
        data.type === 'automated' ? 'automated' : 'human',
        selected && 'selected'
      )}
      style={{ position: 'relative' }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <span className={clsx('node-status', data.type === 'automated' ? 'success' : 'warning')} />
      <strong>{data.label}</strong>
      <small>{data.kind}</small>
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
