import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprintGenerator } from '../src/domain/blueprint/BlueprintGenerator';
import { BlueprintValidator } from '../src/domain/blueprint/BlueprintValidator';
import { EngineNode, EngineEdge, EngineRule } from '../src/domain/workflow/types';

describe('Automation Blueprint Layer', () => {
  const context = {
    workflow: { id: 'w_1', version: 1, name: 'Invoice Approval' },
    actors: [
      { id: 'a_1', name: 'Finance Manager' }
    ],
    systems: [
      { id: 's_1', name: 'ERP System', description: 'Internal ERP' }
    ],
    acceptanceCriteria: ['All invoices > 5L route to CFO']
  };

  const validNodes: EngineNode[] = [
    { id: 'n_1', type: 'START', label: 'Receive Invoice', automated: true, ruleIds: [] },
    { id: 'n_2', type: 'DECISION', label: 'Check Threshold', automated: true, ruleIds: ['r_1'] },
    { id: 'n_3', type: 'TERMINAL', label: 'Approve', automated: false, actor: 'Finance Manager', ruleIds: [] }
  ];

  const validEdges: EngineEdge[] = [
    { id: 'e_1', sourceId: 'n_1', targetId: 'n_2', type: 'DEFAULT' },
    { id: 'e_2', sourceId: 'n_2', targetId: 'n_3', type: 'BRANCH', condition: 'amount > 5000' }
  ];

  const validRules: EngineRule[] = [
    { id: 'r_1', name: 'Threshold Rule', condition: 'amount > 5000', action: 'Approve', nodeId: 'n_2' }
  ];

  it('Valid workflow -> valid blueprint', () => {
    const blueprint = BlueprintGenerator.generate(context, validNodes, validEdges, validRules);
    const result = BlueprintValidator.validate(blueprint);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('Missing business rule -> invalid', () => {
    // Generate with nodes that reference 'r_1' but 'r_1' is missing from rules
    const blueprint = BlueprintGenerator.generate(context, validNodes, validEdges, []);
    const result = BlueprintValidator.validate(blueprint);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('does not exist in businessRules'))).toBe(true);
  });

  it('Broken transition -> invalid', () => {
    // Edge references n_99 which doesn't exist
    const brokenEdges = [
      ...validEdges,
      { id: 'e_bad', sourceId: 'n_3', targetId: 'n_99', type: 'DEFAULT' as const }
    ];
    
    const blueprint = BlueprintGenerator.generate(context, validNodes, brokenEdges, validRules);
    const result = BlueprintValidator.validate(blueprint);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('does not exist in nodes'))).toBe(true);
  });

  it('Invalid schema version -> invalid', () => {
    const blueprint = BlueprintGenerator.generate(context, validNodes, validEdges, validRules);
    // Mutate schema version
    (blueprint as any).schemaVersion = '2.0';
    
    const result = BlueprintValidator.validate(blueprint);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('Duplicate node IDs -> invalid', () => {
    const duplicateNodes = [
      ...validNodes,
      { id: 'n_1', type: 'INTERMEDIATE', label: 'Duplicate Node', automated: true, ruleIds: [] }
    ];
    
    const blueprint = BlueprintGenerator.generate(context, duplicateNodes, validEdges, validRules);
    const result = BlueprintValidator.validate(blueprint);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate node IDs detected.');
  });

  it('Generated blueprint is deterministic: same input -> identical output', () => {
    const blueprint1 = BlueprintGenerator.generate(context, validNodes, validEdges, validRules);
    const blueprint2 = BlueprintGenerator.generate(context, validNodes, validEdges, validRules);
    
    expect(JSON.stringify(blueprint1)).toEqual(JSON.stringify(blueprint2));
  });
});
