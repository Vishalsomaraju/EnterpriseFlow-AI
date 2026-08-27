const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
}

replaceInFile('src/app.ts', [
  {
    from: "./routes/builds/src/routes/builds/bob-evidence.routes",
    to: "./routes/builds/bob-evidence.routes"
  }
]);

replaceInFile('src/domain/blueprint/BlueprintGenerator.ts', [
  {
    from: "from '../workflow/types'",
    to: "from '../workflow-engine/types'"
  }
]);

replaceInFile('src/domain/bob/BobEvidenceService.ts', [
  {
    from: "from '../../utils/AppError'",
    to: "from '../../errors/AppError'"
  }
]);

replaceInFile('src/jobs/extraction/ExtractionJobHandler.ts', [
  {
    from: "from '../services/ExtractionService'",
    to: "from '../../services/workflow-extraction/ExtractionService'"
  }
]);

replaceInFile('src/routes/builds/bob-evidence.routes.ts', [
  {
    from: "from '../../../../../domain/bob/BobEvidenceService'",
    to: "from '../../../domain/bob/BobEvidenceService'"
  }
]);

replaceInFile('src/routes/rules/rule.routes.ts', [
  {
    from: "from '../domain/rules/RuleChangeSchema'",
    to: "from '../../domain/rule-engine/RuleChangeSchema'"
  },
  {
    from: "from '../domain/rules/ImpactAnalysisSchema'",
    to: "from '../../domain/impact-engine/ImpactAnalysisSchema'"
  }
]);

replaceInFile('src/services/graph/WorkflowGraphService.ts', [
  {
    from: "from '../domain/workflow/GraphNormalizer'",
    to: "from '../../domain/workflow-engine/GraphNormalizer'"
  },
  {
    from: "from '../domain/workflow/GraphValidator'",
    to: "from '../../domain/workflow-engine/GraphValidator'"
  },
  {
    from: "from '../domain/workflow/types'",
    to: "from '../../domain/workflow-engine/types'"
  }
]);

replaceInFile('src/services/rules/RuleService.ts', [
  {
    from: "from '../domain/rules/ImpactAnalysisSchema'",
    to: "from '../../domain/impact-engine/ImpactAnalysisSchema'"
  }
]);

console.log('Finished fixing imports');
