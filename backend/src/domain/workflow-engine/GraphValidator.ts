import { DomainNode, DomainEdge } from './types';

export class GraphValidator {
  static validate(nodes: DomainNode[], edges: DomainEdge[]): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    if (!nodes || nodes.length === 0) {
      errors.push('Graph must have at least one node');
    }
    if (errors.length > 0) return { isValid: false, errors };

    const nodeIds = new Set(nodes.map(node => node.id));
    const incoming = new Map<string, number>();
    const outgoing = new Map<string, DomainEdge[]>();
    nodes.forEach(node => {
      incoming.set(node.id, 0);
      outgoing.set(node.id, []);
    });

    for (const edge of edges || []) {
      if (!nodeIds.has(edge.sourceId)) errors.push(`Edge ${edge.id} source does not exist: ${edge.sourceId}`);
      if (!nodeIds.has(edge.targetId)) errors.push(`Edge ${edge.id} target does not exist: ${edge.targetId}`);
      if (nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)) {
        incoming.set(edge.targetId, (incoming.get(edge.targetId) || 0) + 1);
        outgoing.get(edge.sourceId)?.push(edge);
      }
    }

    const triggerNodes = nodes.filter(node => node.type?.toUpperCase() === 'TRIGGER');
    const starts = triggerNodes.length > 0 ? triggerNodes : nodes.filter(node => incoming.get(node.id) === 0);
    if (starts.length !== 1) errors.push(`Graph must have exactly one start node; found ${starts.length}`);

    const terminals = nodes.filter(node => (outgoing.get(node.id) || []).length === 0);
    if (terminals.length === 0) errors.push('Graph must have at least one terminal node');
    if (nodes.some(node => !incoming.has(node.id) || (!incoming.get(node.id) && !starts.some(start => start.id === node.id)))) {
      errors.push('Graph contains orphan nodes');
    }

    if (starts.length === 1) {
      const visited = new Set<string>();
      const visiting = new Set<string>();
      const visit = (nodeId: string) => {
        if (visiting.has(nodeId)) {
          errors.push(`Graph contains a cycle involving node ${nodeId}`);
          return;
        }
        if (visited.has(nodeId)) return;
        visiting.add(nodeId);
        (outgoing.get(nodeId) || []).forEach(edge => visit(edge.targetId));
        visiting.delete(nodeId);
        visited.add(nodeId);
      };
      visit(starts[0].id);
      nodes.filter(node => !visited.has(node.id)).forEach(node => errors.push(`Node is unreachable: ${node.id}`));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
