import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bobEvidenceService } from '../src/domain/bob/BobEvidenceService';
import { db } from '../src/db';
import { lifecycleOrchestrator } from '../src/services/LifecycleOrchestrator';

// Mock dependencies
vi.mock('../src/db', () => ({
  db: {
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn().mockImplementation(async (callback) => {
        const mockTrx = {
          selectFrom: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          selectAll: vi.fn().mockReturnThis(),
          executeTakeFirst: vi.fn().mockResolvedValue(null),
          insertInto: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue(undefined),
          updateTable: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis()
        };
        return callback(mockTrx);
      })
    })
  }
}));

vi.mock('../src/services/LifecycleOrchestrator', () => ({
  lifecycleOrchestrator: {
    onChangesReceived: vi.fn().mockResolvedValue(undefined),
    onTestsReceived: vi.fn().mockResolvedValue(undefined),
  }
}));

describe('BobEvidenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Zod Validation', () => {
    it('should reject invalid payload for processEvent', async () => {
      const invalidPayload = {
        build_id: '123e4567-e89b-12d3-a456-426614174000',
        bob_session_id: 'session-1',
        event_id: 'event-1',
        event_type: 'INVALID_EVENT' // Not in enum
      };

      await expect(bobEvidenceService.processEvent(invalidPayload)).rejects.toThrow('invalid_value');
    });

    it('should accept valid payload for processEvent', async () => {
      const validPayload = {
        build_id: '123e4567-e89b-12d3-a456-426614174000',
        bob_session_id: 'session-1',
        event_id: 'event-1',
        event_type: 'REPOSITORY_ANALYZED',
        message: 'Success'
      };

      await expect(bobEvidenceService.processEvent(validPayload)).resolves.not.toThrow();
    });
  });

  describe('Lifecycle Triggering', () => {
    it('should trigger lifecycle orchestrator on valid changes', async () => {
      const payload = {
        build_id: '123e4567-e89b-12d3-a456-426614174000',
        bob_session_id: 'session-1',
        event_id: 'event-1',
        change_set_id: 'changes-1',
        files: [
          { file_path: 'src/index.ts', change_type: 'modified', diff: '+ console.log(1)' }
        ]
      };

      await bobEvidenceService.processChanges(payload);
      
      expect(lifecycleOrchestrator.onChangesReceived).toHaveBeenCalledWith(payload.build_id);
    });

    it('should trigger lifecycle orchestrator on test results', async () => {
      const payload = {
        build_id: '123e4567-e89b-12d3-a456-426614174000',
        bob_session_id: 'session-1',
        event_id: 'event-1',
        test_run_id: 'run-1',
        name: 'Unit Tests',
        total_tests: 10,
        passed: 10,
        failed: 0,
        duration_ms: 100,
        status: 'Passed'
      };

      await bobEvidenceService.processTestResults(payload);
      
      expect(lifecycleOrchestrator.onTestsReceived).toHaveBeenCalledWith(payload.build_id);
    });
  });
});
