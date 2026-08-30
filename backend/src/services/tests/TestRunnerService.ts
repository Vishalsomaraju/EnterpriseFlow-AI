import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { db } from '../../db/index';
import { lifecycleOrchestrator } from '../build/LifecycleOrchestrator';

const execFileAsync = promisify(execFile);

export class TestRunnerService {
  async executeTests(buildId: string): Promise<void> {
    const repoPath = path.resolve(__dirname, '../../../../demo-repository/invoice-automation');
    
    const startedAt = new Date();
    
    // Preflight checks
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Workspace not found at ${repoPath}`);
    }
    const pkgPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error(`package.json not found in ${repoPath}`);
    }
    
    // Capture HEAD hash
    let commitHash = 'unknown';
    try {
      const { stdout: hashOut } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoPath });
      commitHash = hashOut.trim();
    } catch {
      commitHash = 'unknown';
    }

    let parsedResults: any = null;
    let stdout = '';
    let stderr = '';
    let exitCode = 1;
    const isDemo = process.env.TEST_MODE === 'demo';
    
    try {
      {
        try {
          const result = await execFileAsync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vitest', 'run', '--reporter=json'], {
            cwd: repoPath,
            windowsHide: true,
            maxBuffer: 10 * 1024 * 1024,
          });
          stdout = result.stdout;
          stderr = result.stderr;
          exitCode = 0;
        } catch (error: any) {
          stdout = error.stdout || '';
          stderr = error.stderr || '';
          exitCode = typeof error.code === 'number' ? error.code : 1;
        }
        try {
          parsedResults = JSON.parse(stdout);
        } catch {
          parsedResults = null;
        }
      }
    } catch (error: any) {
      stderr = error instanceof Error ? error.message : String(error);
    }
    
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    
    let total = 0, passed = 0, failed = 0, skipped = 0;
    let status = 'FAIL';
    
    if (parsedResults && parsedResults.testResults) {
      parsedResults.testResults.forEach((suite: any) => {
        suite.assertionResults.forEach((test: any) => {
          total++;
          if (test.status === 'passed') passed++;
          else if (test.status === 'failed') failed++;
          else skipped++;
        });
      });
      status = (exitCode === 0 && failed === 0) ? 'PASS' : 'FAIL';
    }

    // Persist Test Run
    const testRun = await db.insertInto('test_runs').values({
      id: `test_${Date.now()}`,
      build_id: buildId,
      total_tests: total,
      passed,
      failed,
      skipped,
      duration_ms: durationMs,
      name: 'Invoice Automation Suite',
      status,
      repository_path: repoPath,
      commit_hash: commitHash,
      started_at: startedAt,
      completed_at: completedAt,
      exit_code: exitCode,
      is_demo: false,
      stdout,
      stderr
    }).returning('id').executeTakeFirstOrThrow();
    
    // Persist individual test results
    if (parsedResults && parsedResults.testResults) {
      const resultsToInsert = [];
      for (const suite of parsedResults.testResults) {
        for (const test of suite.assertionResults) {
          resultsToInsert.push({
            test_run_id: testRun.id,
            build_id: buildId,
            test_name: test.title,
            status: test.status,
            duration_ms: suite.endTime - suite.startTime,
            error_output: test.failureMessages?.join('\n') || null
          });
        }
      }
      if (resultsToInsert.length > 0) {
        await db.insertInto('test_results').values(resultsToInsert).execute();
      }
    }

    // Audit event
    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}`,
      title: 'Tests Completed',
      message: `Test run finished with status: ${status}. Passed: ${passed}, Failed: ${failed}.`,
      source: 'TEST_RUNNER',
      event_type: 'SYSTEM',
      status: 'SUCCESS',
      metadata: null
    }).execute();
    
    // Trigger lifecycle orchestrator
    await lifecycleOrchestrator.onTestsReceived(buildId);
  }
}

export const testRunnerService = new TestRunnerService();
