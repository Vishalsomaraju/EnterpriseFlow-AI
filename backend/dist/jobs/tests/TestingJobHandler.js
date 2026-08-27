"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingJobHandler = void 0;
const JobService_1 = require("../JobService");
const types_1 = require("../types");
const TestRunnerService_1 = require("../../services/tests/TestRunnerService");
class TestingJobHandler {
    static async handle(jobId, buildId) {
        try {
            // Step 1: Running
            await JobService_1.JobService.updateStage(jobId, types_1.TestingStages[1].name, types_1.TestingStages[1].progress);
            // Execute real tests
            await TestRunnerService_1.testRunnerService.executeTests(buildId);
            // Step 2: Completed
            await JobService_1.JobService.markCompleted(jobId);
        }
        catch (err) {
            await JobService_1.JobService.markFailed(jobId, err, true);
        }
    }
}
exports.TestingJobHandler = TestingJobHandler;
