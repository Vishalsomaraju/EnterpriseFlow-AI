export interface EvaluationResult {
  matched: boolean;
  field?: string;
  operator?: string;
  expected?: unknown;
  actual?: unknown;
}

export class RuleEvaluator {
  static evaluate(expression: string, input: Record<string, unknown>): EvaluationResult {
    const normalized = expression.trim();
    if (normalized.toLowerCase() === 'always' || normalized.toLowerCase() === 'true') {
      return { matched: true };
    }

    const alternatives = this.split(normalized, '||');
    if (alternatives.length > 1) {
      const results = alternatives.map(part => this.evaluate(part, input));
      return results.find(result => result.matched) || { matched: false };
    }

    const conjunctions = this.split(normalized, '&&');
    if (conjunctions.length > 1) {
      const results = conjunctions.map(part => this.evaluate(part, input));
      return results.every(result => result.matched)
        ? { matched: true }
        : { matched: false };
    }

    const match = normalized.match(/^([A-Za-z_][\w.]*)\s*(===|==|!=|!==|>=|<=|>|<)\s*(.+)$/);
    if (!match) {
      throw new Error(`Unsupported rule expression: ${expression}`);
    }

    const [, field, operator, rawExpected] = match;
    const actual = this.readField(input, field);
    const expected = this.parseValue(rawExpected.trim());
    let matched: boolean;
    switch (operator) {
      case '===':
      case '==':
        matched = actual === expected;
        break;
      case '!==':
      case '!=':
        matched = actual !== expected;
        break;
      case '>':
        matched = this.compare(actual, expected, (a, b) => a > b);
        break;
      case '>=':
        matched = this.compare(actual, expected, (a, b) => a >= b);
        break;
      case '<':
        matched = this.compare(actual, expected, (a, b) => a < b);
        break;
      case '<=':
        matched = this.compare(actual, expected, (a, b) => a <= b);
        break;
      default:
        throw new Error(`Unsupported rule operator: ${operator}`);
    }
    return { matched, field, operator, expected, actual };
  }

  static parseExpression(expression: string): { field: string; operator: string; value: number } | null {
    const normalized = expression.trim();
    if (normalized.includes('&&') || normalized.includes('||')) {
      return null;
    }
    const match = normalized.match(/^([A-Za-z_][\w.]*)\s*(===|==|!=|!==|>=|<=|>|<)\s*(.+)$/);
    if (!match) return null;
    
    const [, field, operator, rawExpected] = match;
    if (!['<', '<=', '>', '>='].includes(operator)) {
      return null;
    }
    
    const expectedValue = Number(rawExpected.trim());
    if (Number.isNaN(expectedValue)) {
      return null;
    }

    return { field, operator, value: expectedValue };
  }

  private static split(expression: string, separator: string): string[] {
    return expression.split(separator).map(part => part.trim()).filter(Boolean);
  }

  private static readField(input: Record<string, unknown>, field: string): unknown {
    return field.split('.').reduce<unknown>((value, key) => {
      if (value && typeof value === 'object') {
        return (value as Record<string, unknown>)[key];
      }
      return undefined;
    }, input);
  }

  private static parseValue(raw: string): unknown {
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      return raw.slice(1, -1);
    }
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (raw === 'null') return null;
    const numeric = Number(raw);
    return Number.isNaN(numeric) ? raw : numeric;
  }

  private static compare(actual: unknown, expected: unknown, comparator: (a: number, b: number) => boolean): boolean {
    if (typeof actual !== 'number' || typeof expected !== 'number') return false;
    return comparator(actual, expected);
  }
}
