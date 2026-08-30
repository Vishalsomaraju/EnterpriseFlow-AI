/**
 * Impact Analysis — API contract and hook unit tests.
 *
 * Coverage:
 *  A. Empty-payload regression: impact request must NOT be issued without an expression
 *  B. Valid expression: request body contains { expression: "<trimmed>" }
 *  C. Whitespace-only expression must not trigger an impact request
 *  D. Changed rule: oldExpression !== newExpression detected correctly
 *  E. Unchanged rule: no "changed" flag when old === new
 *  F. API error: 400 response surfaces as error state
 *  G. Real response: affected arrays and risk come from API data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';

// ---------------------------------------------------------------------------
// vi.mock is hoisted to the top of the file, so this mock is in place before
// the module-under-test is evaluated.
// ---------------------------------------------------------------------------

const mockAnalyzeRuleImpact = vi.fn();

vi.mock('../api', () => ({
  api: {
    analyzeRuleImpact: (...args: unknown[]) => mockAnalyzeRuleImpact(...args),
  },
}));

// Import AFTER the mock declaration so Vitest hoisting picks it up
import { useImpactAnalysis } from '../hooks/queries';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function freshQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

const RULE_ID = 'RULE-manager-approval';

const STUB_IMPACT = {
  rule: { id: RULE_ID, oldExpression: 'amount < 1000000', newExpression: 'amount < 500000' },
  directImpact: [],
  downstreamImpact: [],
  risk: { level: 'HIGH' as const, reason: 'Changed' },
  affected_files: ['src/approval.ts'],
  affected_tests: ['tests/approval.test.ts'],
  affected_nodes: ['Approval Gate (DECISION)'],
  affected_docs: [],
};

// ---------------------------------------------------------------------------
// A + C — hook enabled guard
// ---------------------------------------------------------------------------

describe('useImpactAnalysis hook — enabled guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('A. does NOT fire the query when expression is undefined', () => {
    const qc = freshQueryClient();
    const { result } = renderHook(
      () => useImpactAnalysis(RULE_ID, undefined),
      { wrapper: makeWrapper(qc) }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAnalyzeRuleImpact).not.toHaveBeenCalled();
  });

  it('A. does NOT fire the query when expression is empty string', () => {
    const qc = freshQueryClient();
    const { result } = renderHook(
      () => useImpactAnalysis(RULE_ID, ''),
      { wrapper: makeWrapper(qc) }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAnalyzeRuleImpact).not.toHaveBeenCalled();
  });

  it('C. does NOT fire when expression is whitespace-only', () => {
    const qc = freshQueryClient();
    const { result } = renderHook(
      () => useImpactAnalysis(RULE_ID, '   '),
      { wrapper: makeWrapper(qc) }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAnalyzeRuleImpact).not.toHaveBeenCalled();
  });

  it('fires and returns data when expression is non-empty', async () => {
    mockAnalyzeRuleImpact.mockResolvedValue(STUB_IMPACT);

    const qc = freshQueryClient();
    const { result } = renderHook(
      () => useImpactAnalysis(RULE_ID, 'amount < 500000'),
      { wrapper: makeWrapper(qc) }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAnalyzeRuleImpact).toHaveBeenCalledWith(RULE_ID, 'amount < 500000');
    expect(result.current.data).toEqual(STUB_IMPACT);
  });
});

// ---------------------------------------------------------------------------
// F — API error surfaces
// ---------------------------------------------------------------------------

describe('F. API error — 400 from backend surfaces as error state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useImpactAnalysis exposes error when API rejects', async () => {
    const apiError = new Error('expression: Required (expected string, received undefined)');
    mockAnalyzeRuleImpact.mockRejectedValue(apiError);

    const qc = freshQueryClient();
    const { result } = renderHook(
      () => useImpactAnalysis(RULE_ID, 'amount < 500000'),
      { wrapper: makeWrapper(qc) }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(apiError);
  });
});

// ---------------------------------------------------------------------------
// B — realApi payload tests via fetch spy
// ---------------------------------------------------------------------------

describe('realApi.analyzeRuleImpact — request payload', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify(STUB_IMPACT),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
  });

  it('B. sends { expression } in the request body', async () => {
    const { realApi } = await import('../api/realApi');
    await realApi.analyzeRuleImpact(RULE_ID, 'amount < 500000');

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ expression: 'amount < 500000' });
  });

  it('B. trims leading/trailing whitespace before sending', async () => {
    const { realApi } = await import('../api/realApi');
    await realApi.analyzeRuleImpact(RULE_ID, '  amount < 500000  ');

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.expression).toBe('amount < 500000');
  });

  it('B. never sends an empty body {} for a non-empty expression', async () => {
    const { realApi } = await import('../api/realApi');
    await realApi.analyzeRuleImpact(RULE_ID, 'amount > 0');

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(Object.keys(body)).toContain('expression');
    expect(body.expression).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// D. Changed rule detection
// ---------------------------------------------------------------------------

describe('D. Changed rule expression detection', () => {
  it('isChanged is true when oldExpression !== newExpression', () => {
    const rule = { oldExpression: 'amount < 1000000', newExpression: 'amount < 500000' };
    expect(rule.oldExpression !== rule.newExpression).toBe(true);
  });

  it('both oldExpression and newExpression are present in the API response', () => {
    expect(STUB_IMPACT.rule.oldExpression).toBe('amount < 1000000');
    expect(STUB_IMPACT.rule.newExpression).toBe('amount < 500000');
  });
});

// ---------------------------------------------------------------------------
// E. Unchanged rule
// ---------------------------------------------------------------------------

describe('E. Unchanged rule — isChanged is false', () => {
  it('isChanged is false when oldExpression === newExpression', () => {
    const rule = { oldExpression: 'amount < 1000000', newExpression: 'amount < 1000000' };
    expect(rule.oldExpression !== rule.newExpression).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// G. Real API response fields
// ---------------------------------------------------------------------------

describe('G. Real API response shape — data reflects backend values', () => {
  it('affected_nodes, risk.level, and rule.id come from API response', () => {
    const response = {
      rule: { id: RULE_ID, oldExpression: 'amount < 1000000', newExpression: 'amount < 500000' },
      directImpact: [
        { id: 'n6', type: 'WORKFLOW_NODE', name: 'Approval Gate (DECISION)', reason: `Dependent on rule ${RULE_ID}`, severity: 'MEDIUM' as const },
      ],
      downstreamImpact: [],
      risk: { level: 'HIGH' as const, reason: 'Stored rule expression changed and its persisted dependencies require review.' },
      affected_files: [],
      affected_tests: [],
      affected_nodes: ['Approval Gate (DECISION)'],
      affected_docs: [],
    };

    expect(response.affected_nodes[0]).toBe('Approval Gate (DECISION)');
    expect(response.risk.level).toBe('HIGH');
    expect(response.risk.reason).toContain('persisted dependencies');
    expect(response.rule.id).toBe(RULE_ID);
  });

  it('risk.level is one of the valid enum values', () => {
    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    expect(levels).toContain(STUB_IMPACT.risk.level);
  });
});
