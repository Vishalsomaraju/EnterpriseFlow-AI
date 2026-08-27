"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lifecycleOrchestrator = exports.LifecycleOrchestrator = void 0;
const index_1 = require("../../db/index");
const SecurePushClient_1 = require("./adapters/SecurePushClient");
const JobService_1 = require("../../jobs/JobService");
class LifecycleOrchestrator {
    async onChangesReceived(buildId) {
        // Transition to testing (we'll run SecurePush synchronously for now)
        // 1. Run SecurePush Scan
        const scanResult = await SecurePushClient_1.securePushClient.scanChanges(buildId);
        await index_1.db.insertInto('security_scans')
            .values({
            build_id: buildId,
            status: scanResult.status,
            critical: scanResult.critical,
            high: scanResult.high,
            medium: scanResult.medium,
            low: scanResult.low
        })
            .execute();
        if (scanResult.status === 'BLOCK') {
            await index_1.db.updateTable('builds')
                .set({ status: 'FAILED' })
                .where('id', '=', buildId)
                .execute();
            await index_1.db.insertInto('bob_activity_events')
                .values({
                build_id: buildId,
                event_type: 'SECURE_PUSH_FAILED',
                message: 'SecurePush blocked the changes.',
                metadata: { scanResult }
            })
                .execute();
            return;
        }
        // 2. PASS/WARN -> proceed to TESTING
        await index_1.db.updateTable('builds')
            .set({ status: 'TESTING' })
            .where('id', '=', buildId)
            .execute();
        // 3. Dispatch test job for the backend to orchestrate testing (or wait for Bob's tests)
        // If we rely entirely on Bob's test run, we just wait.
        // Let's create a job so that we have an active worker tracking this stage.
        await JobService_1.jobService.createJob('BUILD_TESTING', 'build', buildId);
    }
    async onTestsReceived(buildId) {
        // 1. Check if we have passing tests
        const testRuns = await index_1.db.selectFrom('test_runs')
            .where('build_id', '=', buildId)
            .selectAll()
            .execute();
        const allPassed = testRuns.length > 0 && testRuns.every(tr => tr.status === 'PASS');
        if (allPassed) {
            await index_1.db.updateTable('builds')
                .set({ status: 'VALIDATED' })
                .where('id', '=', buildId)
                .execute();
            // Generate Documentation
            const { documentationService } = await Promise.resolve().then(() => __importStar(require('../documentation/DocumentationService')));
            await documentationService.generateAndPersistDocs(buildId);
            // Auto-transition to READY_FOR_REVIEW
            await index_1.db.updateTable('builds')
                .set({ status: 'READY_FOR_REVIEW' })
                .where('id', '=', buildId)
                .execute();
        }
        else {
            await index_1.db.updateTable('builds')
                .set({ status: 'FAILED' }) // or leave it in TESTING until it passes
                .where('id', '=', buildId)
                .execute();
        }
    }
}
exports.LifecycleOrchestrator = LifecycleOrchestrator;
exports.lifecycleOrchestrator = new LifecycleOrchestrator();
