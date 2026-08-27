import { DomainNode, DomainEdge } from './types';

export class GraphValidator {
  static validate(nodes: DomainNode[], edges: DomainEdge[]): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    if (!nodes || nodes.length === 0) {
      errors.push('Graph must have at least one node');
    }
    // simple mock validation
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
