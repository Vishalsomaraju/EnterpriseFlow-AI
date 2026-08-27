import { describe, it, expect } from 'vitest';
import { RuleEngine } from '../src/domain/workflow/RuleEngine';
import { EngineRule } from '../src/domain/workflow/types';

describe('Deterministic Business Rule Engine', () => {
  it('should evaluate the exact 5 lakh boundary correctly', () => {
    const ruleUnder: EngineRule = { id: 'r1', condition: 'amount < 500000' };
    const ruleOverOrEq: EngineRule = { id: 'r2', condition: 'amount >= 500000' };

    // 499999
    expect(RuleEngine.evaluate(ruleUnder, { amount: 499999 }).matched).toBe(true);
    expect(RuleEngine.evaluate(ruleOverOrEq, { amount: 499999 }).matched).toBe(false);

    // 500000
    expect(RuleEngine.evaluate(ruleUnder, { amount: 500000 }).matched).toBe(false);
    expect(RuleEngine.evaluate(ruleOverOrEq, { amount: 500000 }).matched).toBe(true);

    // 500001
    expect(RuleEngine.evaluate(ruleUnder, { amount: 500001 }).matched).toBe(false);
    expect(RuleEngine.evaluate(ruleOverOrEq, { amount: 500001 }).matched).toBe(true);
  });

  it('should return a rich auditable result', () => {
    const rule: EngineRule = { id: 'RULE-002', condition: 'amount >= 500000' };
    const result = RuleEngine.evaluate(rule, { amount: 500000 });

    expect(result).toEqual({
      matched: true,
      ruleId: 'RULE-002',
      expression: 'amount >= 500000',
      evaluatedWith: { amount: 500000 }
    });
  });

  it('should fail gracefully (no match) when context variable is missing', () => {
    const rule: EngineRule = { id: 'r1', condition: 'amount >= 500000' };
    const result = RuleEngine.evaluate(rule, {});
    expect(result.matched).toBe(false);
  });

  it('should handle null values securely', () => {
    const rule: EngineRule = { id: 'r1', condition: 'amount >= 500000' };
    const result = RuleEngine.evaluate(rule, { amount: null });
    expect(result.matched).toBe(false); // null >= 500000 is coerced in JS, but parseAndEvaluate throws or handles it safely
    // Actually, in JS null >= 500000 is false, so it's matched = false. Let's ensure it.
  });

  it('should handle negative values correctly', () => {
    const rule: EngineRule = { id: 'r1', condition: 'amount >= 500000' };
    const ruleUnder: EngineRule = { id: 'r2', condition: 'amount < 500000' };
    expect(RuleEngine.evaluate(rule, { amount: -100 }).matched).toBe(false);
    expect(RuleEngine.evaluate(ruleUnder, { amount: -100 }).matched).toBe(true);
  });

  it('should evaluate string matches', () => {
    const rule: EngineRule = { id: 'r1', condition: 'status == "PENDING"' };
    expect(RuleEngine.evaluate(rule, { status: 'PENDING' }).matched).toBe(true);
    expect(RuleEngine.evaluate(rule, { status: 'APPROVED' }).matched).toBe(false);
  });

  it('should evaluate booleans correctly', () => {
    const rule1: EngineRule = { id: 'r1', condition: 'missingPO == true' };
    const rule2: EngineRule = { id: 'r2', condition: 'duplicateInvoice == false' };

    expect(RuleEngine.evaluate(rule1, { missingPO: true }).matched).toBe(true);
    expect(RuleEngine.evaluate(rule1, { missingPO: false }).matched).toBe(false);
    expect(RuleEngine.evaluate(rule2, { duplicateInvoice: false }).matched).toBe(true);
    expect(RuleEngine.evaluate(rule2, { duplicateInvoice: true }).matched).toBe(false);
  });
});
