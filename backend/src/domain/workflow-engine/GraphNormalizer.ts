import { DomainNode, DomainEdge, DomainRule } from './types';

export class GraphNormalizer {
  static normalize(dbNodes: any[], dbEdges: any[], dbRules: any[]): { nodes: DomainNode[], edges: DomainEdge[], rules: DomainRule[] } {
    return {
      nodes: dbNodes.map(n => ({
        id: n.id,
        label: n.name || n.id,
        type: n.type,
        automated: n.kind === 'automated' || n.type === 'automated'
      })),
      edges: dbEdges.map(e => ({
        id: e.id,
        sourceId: e.source_id,
        targetId: e.target_id,
        condition: e.label || undefined,
        type: e.is_branch ? 'BRANCH' : 'DEFAULT'
      })),
      rules: dbRules.map(r => ({
        id: r.id,
        name: r.name,
        condition: r.condition,
        action: r.action,
        nodeId: r.node_id
      }))
    };
  }
}
