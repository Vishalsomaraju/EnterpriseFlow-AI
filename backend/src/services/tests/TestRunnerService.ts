import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { db } from '../../db/index';
import { lifecycleOrchestrator } from '../build/LifecycleOrchestrator';

const execAsync = promisify(exec);

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
      const { stdout: hashOut } = await execAsync('git rev-parse HEAD', { cwd: repoPath });
      commitHash = hashOut.trim();
    } catch (e) {
      // Ignore if not a git repo
    }

    let parsedResults: any = null;
    let exitCode = 0;
    const testMode = process.env.TEST_MODE || 'demo';
    const isDemo = testMode === 'demo';
    
    try {
      if (isDemo) {
        // DEMO MODE: deterministic fixture, always passes unless we need negative testing
        // You could later parameterize this if needed
        parsedResults = {
          isDemo: true,
          mode: 'DEMO',
          testResults: [
            {
              startTime: Date.now(),
              endTime: Date.now() + 100,
              assertionResults: [
                { title: 'DEMO/SIMULATION: generated tests pass', status: 'passed', failureMessages: [] }
              ]
            }
          ]
        };
        exitCode = 0;
      } else {
        // REAL MODE: actually run the tests
        const { stdout } = await execAsync('npx vitest run --reporter=json', { cwd: repoPath });
        parsedResults = JSON.parse(stdout);
        parsedResults.isDemo = false;
        parsedResults.mode = 'REAL';
      }
    } catch (err: any) {
      exitCode = err.code || 1;
      if (err.stdout) {
        try {
          parsedResults = JSON.parse(err.stdout);
          parsedResults.isDemo = false;
          parsedResults.mode = 'REAL';
        } catch(e) {
          // Output was unparseable or just text
        }
      }
    }
    
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    
    let total = 0, passed = 0, failed = 0, skipped = 0;
    let status = 'TEST_EXECUTION_ERROR';
    
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
      is_demo: isDemo
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
