import { describe, it, expect } from 'vitest';
import { WorkflowNormalizer, NormalizationError } from '../src/services/WorkflowNormalizer';
import { ExtractionOutputSchema } from '../src/schemas/extraction.schema';

describe('Workflow Extraction Pipeline', () => {
  describe('Zod Validation (ExtractionOutputSchema)', () => {
    it('should reject missing workflow name', () => {
      const result = ExtractionOutputSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeTruthy();
      }
    });

    it('should accept valid canonical structure', () => {
      const result = ExtractionOutputSchema.safeParse({
        name: 'Valid Workflow',
        steps: [{ id: '1', name: 'Step 1', type: 'SYSTEM' }]
      });
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowNormalizer', () => {
    it('should reject duplicate node IDs', () => {
      expect(() => {
        WorkflowNormalizer.normalize({
          name: 'Test',
          steps: [
            { id: 'duplicate', name: 'Step 1', type: 'A' },
            { id: 'duplicate', name: 'Step 2', type: 'B' }
          ]
        });
      }).toThrowError(NormalizationError);
    });

    it('should reject rules referencing non-existent nodes', () => {
      expect(() => {
        WorkflowNormalizer.normalize({
          name: 'Test',
          steps: [{ id: '1', name: 'Step 1', type: 'A' }],
          rules: [{
            id: 'r1',
            expression: 'true',
            source_node_id: '1',
            target_node_id: 'missing' // Doesn't exist
          }]
        });
      }).toThrowError(NormalizationError);
    });

    it('should reject circular dependencies', () => {
      expect(() => {
        WorkflowNormalizer.normalize({
          name: 'Test',
          steps: [
            { id: '1', name: 'Step 1', type: 'A' },
            { id: '2', name: 'Step 2', type: 'B' }
          ],
          rules: [
            { id: 'r1', expression: 'true', source_node_id: '1', target_node_id: '2' },
            { id: 'r2', expression: 'true', source_node_id: '2', target_node_id: '1' }
          ]
        });
      }).toThrowError(NormalizationError);
    });

    it('should reject orphan nodes', () => {
      expect(() => {
        WorkflowNormalizer.normalize({
          name: 'Test',
          steps: [
            { id: '1', name: 'Step 1', type: 'A' },
            { id: 'orphan', name: 'Orphan Step', type: 'B' }
          ],
          rules: [
            { id: 'r1', expression: 'true', source_node_id: '1', target_node_id: '1' }
          ]
        });
      }).toThrowError(NormalizationError);
    });

    it('should accept a valid normalized graph', () => {
      const data = {
        name: 'Test',
        steps: [
          { id: '1', name: 'Step 1', type: 'A' },
          { id: '2', name: 'Step 2', type: 'B' }
        ],
        rules: [
          { id: 'r1', expression: 'true', source_node_id: '1', target_node_id: '2' }
        ]
      };
      const result = WorkflowNormalizer.normalize(data);
      expect(result).toEqual(data);
    });
  });
});
