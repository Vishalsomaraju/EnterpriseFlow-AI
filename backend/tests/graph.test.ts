import { describe, it, expect } from 'vitest';
import { GraphValidator } from '../src/domain/workflow/GraphValidator';
import { EngineNode, EngineEdge } from '../src/domain/workflow/types';

describe('Deterministic Graph Validator', () => {
  const createBaseNode = (id: string, type: string): EngineNode => ({
    id,
    type,
    label: id,
    automated: true,
    ruleIds: []
  });

  const createBaseEdge = (id: string, sourceId: string, targetId: string, type: 'DEFAULT' | 'BRANCH' = 'DEFAULT'): EngineEdge => ({
    id,
    sourceId,
    targetId,
    type
  });

  it('should accept a valid graph with start and terminal', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('mid', 'INTERMEDIATE'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [
      createBaseEdge('e1', 'start', 'mid'),
      createBaseEdge('e2', 'mid', 'end')
    ];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject a graph missing a START node', () => {
    const nodes = [
      createBaseNode('mid', 'INTERMEDIATE'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [createBaseEdge('e1', 'mid', 'end')];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Graph must have at least one START node');
  });

  it('should reject duplicate edges', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [
      createBaseEdge('e1', 'start', 'end'),
      createBaseEdge('e2', 'start', 'end') // duplicate direction
    ];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate edge detected'))).toBe(true);
  });

  it('should reject self-loops', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [
      createBaseEdge('e1', 'start', 'start'),
      createBaseEdge('e2', 'start', 'end')
    ];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid self-loop'))).toBe(true);
  });

  it('should reject orphan nodes (unreachable from start)', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('orphan', 'INTERMEDIATE'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [
      createBaseEdge('e1', 'start', 'end')
    ];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Orphan'))).toBe(true);
  });

  it('should reject dead-end nodes (cannot reach terminal)', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('mid', 'INTERMEDIATE'),
      createBaseNode('deadend', 'INTERMEDIATE'),
      createBaseNode('end', 'TERMINAL')
    ];
    const edges = [
      createBaseEdge('e1', 'start', 'mid'),
      createBaseEdge('e2', 'mid', 'end'),
      createBaseEdge('e3', 'mid', 'deadend') // deadend goes nowhere
    ];
    
    const result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Dead end'))).toBe(true);
  });

  it('should validate decision node branches correctly', () => {
    const nodes = [
      createBaseNode('start', 'START'),
      createBaseNode('decision', 'DECISION'),
      createBaseNode('end1', 'TERMINAL'),
      createBaseNode('end2', 'TERMINAL')
    ];
    
    // Invalid: only 1 branch
    let edges = [
      createBaseEdge('e1', 'start', 'decision'),
      createBaseEdge('e2', 'decision', 'end1', 'BRANCH')
    ];
    edges[1].condition = 'something';
    
    let result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('must have at least two outgoing edges'))).toBe(true);

    // Invalid: branch missing condition
    edges = [
      createBaseEdge('e1', 'start', 'decision'),
      createBaseEdge('e2', 'decision', 'end1', 'BRANCH'),
      createBaseEdge('e3', 'decision', 'end2', 'BRANCH')
    ];
    edges[1].condition = 'amount > 50';
    // e3 missing condition
    
    result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('must be a BRANCH with a condition'))).toBe(true);

    // Valid
    edges[2].condition = 'amount <= 50';
    result = GraphValidator.validate(nodes, edges);
    expect(result.isValid).toBe(true);
  });
});
