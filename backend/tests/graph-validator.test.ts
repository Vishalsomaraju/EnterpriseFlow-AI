import { describe, expect, test } from 'vitest';
import { GraphValidator } from '../src/domain/workflow-engine/GraphValidator';

const node = (id: string, type = 'ACTION') => ({ id, label: id, type, automated: true });
const edge = (id: string, sourceId: string, targetId: string, type: 'BRANCH' | 'DEFAULT' = 'DEFAULT') => ({
  id, sourceId, targetId, type, condition: undefined
});

describe('GraphValidator', () => {
  test('accepts an executable graph with one start and terminal branches', () => {
    const result = GraphValidator.validate(
      [node('start', 'TRIGGER'), node('decision'), node('low'), node('high')],
      [edge('a', 'start', 'decision'), edge('b', 'decision', 'low', 'BRANCH'), edge('c', 'decision', 'high', 'BRANCH')]
    );
    expect(result.isValid).toBe(true);
  });

  test('rejects invalid edge references, orphan nodes, and cycles', () => {
    const result = GraphValidator.validate(
      [node('start', 'TRIGGER'), node('orphan'), node('cycle')],
      [edge('bad', 'start', 'missing'), edge('loop', 'cycle', 'cycle')]
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('target does not exist'))).toBe(true);
    expect(result.errors.some(error => error.includes('unreachable'))).toBe(true);
  });
});
