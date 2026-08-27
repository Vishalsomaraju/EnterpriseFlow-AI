import { Project } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const srcDir = project.getDirectory('src');
if (!srcDir) throw new Error('src directory not found');

// Helper to move a file or directory
function move(sourcePath: string, targetPath: string) {
  const source = project.getSourceFile(sourcePath);
  if (source) {
    source.moveToDirectory(project.getDirectory(targetPath) || project.createDirectory(targetPath));
    console.log(`Moved file: ${sourcePath} -> ${targetPath}`);
  } else {
    // maybe it's a directory
    const dir = project.getDirectory(sourcePath);
    if (dir) {
      dir.move(targetPath);
      console.log(`Moved directory: ${sourcePath} -> ${targetPath}`);
    } else {
      console.log(`WARN: Source not found: ${sourcePath}`);
    }
  }
}

// 1. REPOSITORIES
console.log('--- REPOSITORIES ---');
const repos = project.getDirectory('src/repositories')?.getSourceFiles() || [];
for (const repo of repos) {
  repo.moveToDirectory(project.getDirectory('src/db/repositories') || project.createDirectory('src/db/repositories'));
}

// 2. DOMAIN
console.log('--- DOMAIN ---');
move('src/domain/workflow/GraphNormalizer.ts', 'src/domain/workflow-engine');
move('src/domain/workflow/GraphValidator.ts', 'src/domain/workflow-engine');
move('src/domain/workflow/types.ts', 'src/domain/workflow-engine');
move('src/domain/workflow/RuleEngine.ts', 'src/domain/rule-engine');
move('src/domain/rules/ImpactAnalysisSchema.ts', 'src/domain/impact-engine');
move('src/domain/rules/RuleChangeSchema.ts', 'src/domain/rule-engine');

// 3. SERVICES
console.log('--- SERVICES ---');
move('src/services/ExtractionService.ts', 'src/services/workflow-extraction');
move('src/ai/AIClient.ts', 'src/services/workflow-extraction/ai'); 
move('src/ai/MockAIClient.ts', 'src/services/workflow-extraction/ai'); 
move('src/ai/types.ts', 'src/services/workflow-extraction/ai');

move('src/services/WorkflowService.ts', 'src/services/workflow');
move('src/services/WorkflowNormalizer.ts', 'src/services/workflow');

move('src/services/WorkflowGraphService.ts', 'src/services/graph');
move('src/services/BlueprintService.ts', 'src/services/blueprint');
move('src/services/RuleService.ts', 'src/services/rules');

move('src/services/BobWorkspaceManager.ts', 'src/services/build');
move('src/services/LifecycleOrchestrator.ts', 'src/services/build');
move('src/services/adapters/SecurePushClient.ts', 'src/services/build/adapters');

move('src/services/TestRunnerService.ts', 'src/services/tests');
move('src/services/DocumentationService.ts', 'src/services/documentation');
move('src/services/ReviewService.ts', 'src/services/review');
move('src/services/WorkflowExecutionService.ts', 'src/services/execution');

move('src/services/DashboardService.ts', 'src/services/activity');

// 4. JOBS
console.log('--- JOBS ---');
move('src/jobs/ExtractionJobHandler.ts', 'src/jobs/extraction');
move('src/jobs/ImplementationJobHandler.ts', 'src/jobs/build');
move('src/jobs/TestingJobHandler.ts', 'src/jobs/tests');
move('src/jobs/ExecutionJobHandler.ts', 'src/jobs/execution');

// 5. ROUTES
console.log('--- ROUTES ---');
move('src/routes/workflow.routes.ts', 'src/routes/workflows');
move('src/routes/document.routes.ts', 'src/routes/projects'); 
move('src/routes/job.routes.ts', 'src/routes/jobs');
move('src/routes/blueprint.routes.ts', 'src/routes/blueprints');
move('src/routes/build.routes.ts', 'src/routes/builds');

const bobRoutes = project.getSourceFile('src/routes/bob.routes.ts');
if (bobRoutes) {
  const buildsDir = project.getDirectory('src/routes/builds') || project.createDirectory('src/routes/builds');
  bobRoutes.moveToDirectory(buildsDir);
  bobRoutes.move('src/routes/builds/bob-evidence.routes.ts');
  console.log('Renamed bob.routes.ts -> builds/bob-evidence.routes.ts');
}

move('src/routes/rule.routes.ts', 'src/routes/rules'); 
move('src/routes/dashboard.routes.ts', 'src/routes/activity');
move('src/routes/execution.routes.ts', 'src/routes/executions');
move('src/routes/review.routes.ts', 'src/routes/reviews');

// Save all changes
console.log('Saving changes...');
project.saveSync();
console.log('Done.');
