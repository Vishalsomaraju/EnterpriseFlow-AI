import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../src/db/index';
import { BaseRepository } from '../src/repositories/BaseRepository';

// Mock kysely to avoid actual DB connection issues in CI without postgres
vi.mock('../src/db/index', () => {
  const executeMock = vi.fn().mockResolvedValue([{ id: '1', name: 'Mock Project' }]);
  const executeTakeFirstMock = vi.fn().mockResolvedValue({ id: '1', name: 'Mock Project' });
  const selectAllMock = vi.fn().mockReturnValue({ execute: executeMock, executeTakeFirst: executeTakeFirstMock });
  const whereMock = vi.fn().mockReturnValue({ selectAll: selectAllMock });
  const selectFromMock = vi.fn().mockReturnValue({ where: whereMock, selectAll: selectAllMock });

  return {
    db: {
      selectFrom: selectFromMock,
    },
  };
});

describe('Database Repositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('BaseRepository should construct queries correctly', async () => {
    const repo = new BaseRepository<any>(db as any, 'projects');
    
    const result = await repo.findById('1');
    expect(result).toBeDefined();
    expect(result.id).toBe('1');
    expect(db.selectFrom).toHaveBeenCalledWith('projects');
  });

  it('BaseRepository should retrieve all records', async () => {
    const repo = new BaseRepository<any>(db as any, 'projects');
    
    const result = await repo.findAll();
    expect(result.length).toBeGreaterThan(0);
    expect(db.selectFrom).toHaveBeenCalledWith('projects');
  });
});
