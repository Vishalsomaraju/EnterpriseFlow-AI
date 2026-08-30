/**
 * StaticAnalyser — real pattern-based security scanner for git diffs.
 *
 * Scans the actual code changes Bob produces and reports security findings.
 * This is what makes SecurePush a real gate, not a mocked status.
 */

export interface Finding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rule: string;
  description: string;
  line?: string;
}

export interface ScanVerdict {
  status: 'PASS' | 'WARN' | 'BLOCK';
  riskScore: number;  // 0–100
  critical: number;
  high: number;
  medium: number;
  low: number;
  findings: Finding[];
}

// ── Scanning rules ────────────────────────────────────────────────────────────
// Each rule checks only added/modified lines (lines starting with + in diff)

const RULES: Array<{
  id: string;
  severity: Finding['severity'];
  description: string;
  pattern: RegExp;
}> = [
  // CRITICAL
  {
    id: 'HARDCODED_SECRET',
    severity: 'CRITICAL',
    description: 'Hardcoded password, secret, or API key',
    pattern: /^\+.*\b(password|secret|api_key|apikey|token|private_key)\s*[:=]\s*['"`][^'"`]{4,}['"`]/i,
  },
  {
    id: 'HARDCODED_CREDENTIAL',
    severity: 'CRITICAL',
    description: 'Hardcoded credential string',
    pattern: /^\+.*\b(auth|credentials?)\s*[:=]\s*['"`][^'"`]{4,}['"`]/i,
  },
  // HIGH
  {
    id: 'EVAL_USAGE',
    severity: 'HIGH',
    description: 'Direct eval() call — potential code injection',
    pattern: /^\+.*\beval\s*\(/,
  },
  {
    id: 'EXEC_WITH_VARIABLE',
    severity: 'HIGH',
    description: 'exec() or execSync() with non-literal argument — potential command injection',
    pattern: /^\+.*\b(exec|execSync|spawn)\s*\(\s*(?!['"`])/,
  },
  {
    id: 'SQL_CONCATENATION',
    severity: 'HIGH',
    description: 'SQL query built via string concatenation — potential SQL injection',
    pattern: /^\+.*['"`]\s*SELECT|INSERT|UPDATE|DELETE.*\+\s*(?:req\.|user\.|input|data)/i,
  },
  // MEDIUM
  {
    id: 'CONSOLE_LOG_SENSITIVE',
    severity: 'MEDIUM',
    description: 'console.log with potentially sensitive data (token, password, secret)',
    pattern: /^\+.*console\.log\s*\(.*\b(token|password|secret|auth|credential)/i,
  },
  {
    id: 'MISSING_ERROR_HANDLING',
    severity: 'MEDIUM',
    description: 'async function without try/catch block',
    pattern: /^\+\s*async\s+function\s+\w+[^{]*\{(?![^}]*try\s*\{)/,
  },
  {
    id: 'INSECURE_RANDOM',
    severity: 'MEDIUM',
    description: 'Math.random() used for security-sensitive purpose',
    pattern: /^\+.*Math\.random\s*\(\s*\).*\b(token|id|session|key|secret|nonce)/i,
  },
  // LOW
  {
    id: 'TODO_IN_CHANGED_CODE',
    severity: 'LOW',
    description: 'TODO/FIXME/HACK comment in changed code',
    pattern: /^\+.*\b(TODO|FIXME|HACK|XXX)\b/,
  },
  {
    id: 'CONSOLE_LOG_REMAINING',
    severity: 'LOW',
    description: 'console.log left in production code',
    pattern: /^\+\s*console\.(log|warn|error)\s*\(/,
  },
];

export class StaticAnalyser {
  static scan(diffText: string): Finding[] {
    const findings: Finding[] = [];
    const lines = diffText.split('\n');

    for (const line of lines) {
      // Only scan lines that were added (+ prefix), skip metadata/context lines
      if (!line.startsWith('+') || line.startsWith('+++')) continue;

      for (const rule of RULES) {
        if (rule.pattern.test(line)) {
          findings.push({
            severity: rule.severity,
            rule: rule.id,
            description: rule.description,
            line: line.substring(0, 120), // truncate for display
          });
          break; // one finding per line per scan pass
        }
      }
    }

    return findings;
  }

  static computeVerdict(findings: Finding[]): ScanVerdict {
    let critical = 0, high = 0, medium = 0, low = 0;

    for (const f of findings) {
      if (f.severity === 'CRITICAL') critical++;
      else if (f.severity === 'HIGH') high++;
      else if (f.severity === 'MEDIUM') medium++;
      else low++;
    }

    // Risk score: weighted sum, capped at 100
    const riskScore = Math.min(100, critical * 25 + high * 10 + medium * 3 + low * 1);

    let status: 'PASS' | 'WARN' | 'BLOCK';
    if (critical > 0 || riskScore > 50) {
      status = 'BLOCK';
    } else if (riskScore > 20) {
      status = 'WARN';
    } else {
      status = 'PASS';
    }

    return { status, riskScore, critical, high, medium, low, findings };
  }
}
