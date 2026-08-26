import { realApi } from './realApi';
import { MockApi } from '../mock/api';
import type { ApiService } from './service';

// Ensure MockApi explicitly satisfies the ApiService interface (or mostly does via assertion)
// since MockApi has slightly different return types for ImpactAnalysisResult for now.
const mockApiAdapter: ApiService = {
  ...MockApi,
  createProject: async (_name: string) => {},
  extractDocument: async (_id: string) => ({ jobId: 'j1', status: 'EXTRACTING' }),
  getJob: async (_id: string) => ({ status: 'COMPLETED' }),
  implementBlueprint: async (_id: string) => ({ buildId: 'b1', status: 'QUEUED' }),
  getBuildChanges: async (_id: string) => ({ diff: '', files_changed: 0 }),
  runTests: async (_id: string) => ({ status: 'QUEUED' }),
  runSecurityScan: async (_id: string) => ({ status: 'QUEUED' }),
} as unknown as ApiService;

const apiMode = import.meta.env.VITE_API_MODE || 'mock';

export const api: ApiService = apiMode === 'api' ? realApi : mockApiAdapter;
