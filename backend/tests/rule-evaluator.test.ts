import { describe, expect, test } from 'vitest';
import { RuleEvaluator } from '../src/domain/workflow-engine/RuleEvaluator';

describe('RuleEvaluator', () => {
  const lower = { amount: 200000 };
  const mid = { amount: 800000 };
  const high = { amount: 1200000 };

  test('evaluates the stored 500000 rule without embedding a threshold in the evaluator', () => {
    expect(RuleEvaluator.evaluate('amount < 500000', lower).matched).toBe(true);
    expect(RuleEvaluator.evaluate('amount >= 500000', mid).matched).toBe(true);
    expect(RuleEvaluator.evaluate('amount >= 500000', lower).matched).toBe(false);
  });

  test('evaluates a new stored 1000000 version independently', () => {
    expect(RuleEvaluator.evaluate('amount < 1000000', mid).matched).toBe(true);
    expect(RuleEvaluator.evaluate('amount >= 1000000', mid).matched).toBe(false);
    expect(RuleEvaluator.evaluate('amount >= 1000000', high).matched).toBe(true);
  });

  test('supports validated non-invoice fields and compound expressions', () => {
    expect(RuleEvaluator.evaluate('request.amount >= 100000 && request.currency == "INR"', {
      request: { amount: 150000, currency: 'INR' }
    }).matched).toBe(true);
  });

  describe('Semantic Parsing', () => {
    test('safely parses a simple less-than expression', () => {
      const result = RuleEvaluator.parseExpression('amount < 500000');
      expect(result).not.toBeNull();
      expect(result?.field).toBe('amount');
      expect(result?.operator).toBe('<');
      expect(result?.value).toBe(500000);
    });

    test('safely parses other numeric operators', () => {
      expect(RuleEvaluator.parseExpression('amount <= 500000')?.operator).toBe('<=');
      expect(RuleEvaluator.parseExpression('amount > 500000')?.operator).toBe('>');
      expect(RuleEvaluator.parseExpression('amount >= 500000')?.operator).toBe('>=');
    });

    test('ignores whitespace', () => {
      const result = RuleEvaluator.parseExpression('  amount   <=   100 ');
      expect(result).not.toBeNull();
      expect(result?.field).toBe('amount');
      expect(result?.value).toBe(100);
    });

    test('returns null for complex expressions', () => {
      expect(RuleEvaluator.parseExpression('amount < 500000 && role === "admin"')).toBeNull();
      expect(RuleEvaluator.parseExpression('amount < 500000 || amount > 1000000')).toBeNull();
    });

    test('returns null for non-threshold operators', () => {
      expect(RuleEvaluator.parseExpression('role === "admin"')).toBeNull();
      expect(RuleEvaluator.parseExpression('role !== "user"')).toBeNull();
    });

    test('returns null for non-numeric values', () => {
      expect(RuleEvaluator.parseExpression('amount < "five"')).toBeNull();
    });
  });
});
