import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import clsx from 'clsx';

export function WorkflowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        className={clsx('link link-base', selected && 'active-link')} 
        style={{
          strokeWidth: 3,
          opacity: selected ? 1 : 0.3
        }}
      />
      {(data as any)?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          fill="var(--dark-muted)"
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {(data as any).label}
        </text>
      )}
    </>
  );
}
