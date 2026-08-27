"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRunnerService = exports.TestRunnerService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../../db/index");
const LifecycleOrchestrator_1 = require("../build/LifecycleOrchestrator");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class TestRunnerService {
    async executeTests(buildId) {
        const repoPath = path_1.default.resolve(__dirname, '../../../../demo-repository/invoice-automation');
        const startedAt = new Date();
        // Preflight checks
        if (!fs_1.default.existsSync(repoPath)) {
            throw new Error(`Workspace not found at ${repoPath}`);
        }
        const pkgPath = path_1.default.join(repoPath, 'package.json');
        if (!fs_1.default.existsSync(pkgPath)) {
            throw new Error(`package.json not found in ${repoPath}`);
        }
        // Capture HEAD hash
        let commitHash = 'unknown';
        try {
            const { stdout: hashOut } = await execAsync('git rev-parse HEAD', { cwd: repoPath });
            commitHash = hashOut.trim();
        }
        catch (e) {
            // Ignore if not a git repo
        }
        let parsedResults = null;
        let exitCode = 0;
        try {
            // Vitest json reporter
            // We assume vitest is installed in the baseline and we just run it
            const { stdout } = await execAsync('npx vitest run --reporter=json', { cwd: repoPath });
            parsedResults = JSON.parse(stdout);
        }
        catch (err) {
            exitCode = err.code || 1;
            if (err.stdout) {
                try {
                    parsedResults = JSON.parse(err.stdout);
                }
                catch (e) {
                    // Output was unparseable or just text
                }
            }
        }
        const completedAt = new Date();
        const durationMs = completedAt.getTime() - startedAt.getTime();
        let total = 0, passed = 0, failed = 0, skipped = 0;
        let status = 'TEST_EXECUTION_ERROR';
        if (parsedResults && parsedResults.testResults) {
            parsedResults.testResults.forEach((suite) => {
                suite.assertionResults.forEach((test) => {
                    total++;
                    if (test.status === 'passed')
                        passed++;
                    else if (test.status === 'failed')
                        failed++;
                    else
                        skipped++;
                });
            });
            status = (exitCode === 0 && failed === 0) ? 'PASS' : 'FAIL';
        }
        // Persist Test Run
        const testRun = await index_1.db.insertInto('test_runs').values({
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
            exit_code: exitCode
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
                await index_1.db.insertInto('test_results').values(resultsToInsert).execute();
            }
        }
        // Audit event
        await index_1.db.insertInto('activity_events').values({
            id: `act_${Date.now()}`,
            title: 'Tests Completed',
            message: `Test run finished with status: ${status}. Passed: ${passed}, Failed: ${failed}.`,
            source: 'TEST_RUNNER',
            event_type: 'SYSTEM',
            status: 'SUCCESS'
        }).execute();
        // Trigger lifecycle orchestrator
        await LifecycleOrchestrator_1.lifecycleOrchestrator.onTestsReceived(buildId);
    }
}
exports.TestRunnerService = TestRunnerService;
exports.testRunnerService = new TestRunnerService();
