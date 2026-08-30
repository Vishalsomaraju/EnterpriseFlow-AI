import { StaticAnalyser } from './StaticAnalyser';
import { bobWorkspaceManager } from '../BobWorkspaceManager';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export type ScanResultStatus = 'PASS' | 'WARN' | 'BLOCK';

export interface ScanResult {
  status: ScanResultStatus;
  riskScore: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  findings: Array<{ severity: string; rule: string; description: string; line?: string }>;
  evidencePath?: string;
}

export interface ISecurePushClient {
  scanChanges(buildId: string): Promise<ScanResult>;
}

/**
 * SecurePushClient — scans the actual git diff produced in the Bob repository.
 *
 * The diff is produced by Bob's real code changes.
 * The scanner applies pattern-based rules to identify security findings.
 * The verdict (PASS/WARN/BLOCK) is driven by the actual content — not mocked.
 */
export class SecurePushClient implements ISecurePushClient {
  async scanChanges(buildId: string): Promise<ScanResult> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const diff = await execFileAsync('git', ['diff', manifest.repositoryCommitHash, '--'], {
      cwd: manifest.repository,
      maxBuffer: 20 * 1024 * 1024,
    });
    const fullDiff = diff.stdout;
    if (!fullDiff.trim()) {
      throw new Error('SecurePush cannot scan an empty Bob repository diff');
    }

    const findings = StaticAnalyser.scan(fullDiff);
    const verdict = StaticAnalyser.computeVerdict(findings);

    return {
      status: verdict.status,
      riskScore: verdict.riskScore,
      critical: verdict.critical,
      high: verdict.high,
      medium: verdict.medium,
      low: verdict.low,
      findings: verdict.findings,
      evidencePath: path.join(manifest.workspace, 'security', 'securepush-scan.json'),
    };
  }
}

export const securePushClient = new SecurePushClient();
