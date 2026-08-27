import { JobService } from '../JobService';
import { TestingStages } from '../types';
import { testRunnerService } from '../../services/tests/TestRunnerService';

export class TestingJobHandler {
  static async handle(jobId: string, buildId: string) {
    try {
      // Step 1: Running
      await JobService.updateStage(jobId, TestingStages[1].name, TestingStages[1].progress);
      
      // Execute real tests
      await testRunnerService.executeTests(buildId);

      // Step 2: Completed
      await JobService.markCompleted(jobId);
    } catch (err) {
      await JobService.markFailed(jobId, err, true);
    }
  }
}
