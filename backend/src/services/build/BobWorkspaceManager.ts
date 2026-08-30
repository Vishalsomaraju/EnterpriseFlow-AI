import fs from 'fs/promises';
import path from 'path';
import { db } from '../../db';
import { execAsync } from '../../utils/exec';
import { AutomationBlueprint } from '../../domain/blueprint/types';

export interface WorkspaceManifest {
  buildId: string;
  workflowId: string;
  workflowVersionId: string;
  blueprintId: string;
  bobSessionId: string;
  repository: string;
  repositoryCommitHash: string;
  workspace: string;
  evidenceEndpoints: {
    events: string;
    plan: string;
    changes: string;
    tests: string;
    documentation: string;
  };
  createdAt: string;
  schemaVersion: string;
}

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:3001/api/v1';

export class BobWorkspaceManager {
  private readonly workspaceRoot = path.resolve(__dirname, '../../../..', 'bob-workspace');
  private readonly demoRepoRoot = path.resolve(__dirname, '../../../..', 'demo-repository', 'invoice-automation');

  async generateWorkspace(
    buildId: string,
    blueprintId: string,
    workflowVersionId: string,
    blueprint: AutomationBlueprint,
  ): Promise<{ bobSessionId: string; repoCommitHash: string; repoPath: string; workspacePath: string }> {
    const bobSessionId = `bob-sess-${buildId}`;
    const workspacePath = path.join(this.workspaceRoot, 'builds', buildId);

    await fs.mkdir(workspacePath, { recursive: true });
    for (const directory of ['plans', 'activities', 'changes', 'tests', 'security', 'documentation']) {
      await fs.mkdir(path.join(workspacePath, directory), { recursive: true });
    }

    const rules = await db
      .selectFrom('business_rules')
      .where('version_id', '=', workflowVersionId)
      .selectAll()
      .execute();
    const primaryRule = rules[0];
    const ruleContext = {
      approvalThreshold: primaryRule ? this.extractThreshold(primaryRule.condition) : null,
      currency: 'INR',
      version: blueprint.workflow.version,
      ruleId: primaryRule?.id || null,
      condition: primaryRule?.condition || null,
    };

    const repositoryCommitHash = (await execAsync('git rev-parse HEAD', { cwd: this.demoRepoRoot })).stdout.trim();
    const evidenceBase = `${BACKEND_BASE_URL}/builds/${buildId}/bob`;
    const manifest: WorkspaceManifest = {
      buildId,
      workflowId: blueprint.workflow.id,
      workflowVersionId,
      blueprintId,
      bobSessionId,
      repository: this.demoRepoRoot,
      repositoryCommitHash,
      workspace: workspacePath,
      evidenceEndpoints: {
        events: `${evidenceBase}/events`,
        plan: `${evidenceBase}/plan`,
        changes: `${evidenceBase}/changes`,
        tests: `${evidenceBase}/tests`,
        documentation: `${evidenceBase}/documentation`,
      },
      createdAt: new Date().toISOString(),
      schemaVersion: '3.0',
    };

    await this.writeJson(path.join(workspacePath, 'manifest.json'), manifest);
    await this.writeJson(path.join(workspacePath, 'blueprint.json'), blueprint);
    await this.writeJson(path.join(workspacePath, 'rules.json'), ruleContext);
    await fs.writeFile(path.join(workspacePath, 'BOB.md'), this.generateBobMd(manifest, blueprint));
    await fs.writeFile(path.join(workspacePath, 'AGENTS.md'), this.generateAgentsMd(manifest, blueprint, ruleContext));
    await fs.writeFile(
      path.join(workspacePath, 'plans', 'implementation-plan.md'),
      this.generateImplementationPlan(manifest, blueprint, ruleContext),
    );

    return {
      bobSessionId,
      repoCommitHash: repositoryCommitHash,
      repoPath: this.demoRepoRoot,
      workspacePath,
    };
  }

  async readManifest(buildId: string): Promise<WorkspaceManifest> {
    const manifestPath = path.join(this.workspaceRoot, 'builds', buildId, 'manifest.json');
    return JSON.parse(await fs.readFile(manifestPath, 'utf8')) as WorkspaceManifest;
  }

  private async writeJson(filePath: string, value: unknown): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  }

  private extractThreshold(condition: string): number | null {
    const match = condition.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : null;
  }

  private generateBobMd(manifest: WorkspaceManifest, blueprint: AutomationBlueprint): string {
    return `# IBM Bob Build Handoff

This file is a handoff package for the actual IBM Bob engineering session. EnterpriseFlow does not write application code or simulate Bob activity.

## Build identity
- Build: \`${manifest.buildId}\`
- Workflow version: \`${manifest.workflowVersionId}\`
- Blueprint: \`${manifest.blueprintId}\`
- Bob session: \`${manifest.bobSessionId}\`
- Repository: \`${manifest.repository}\`
- Baseline commit: \`${manifest.repositoryCommitHash}\`
- Workspace: \`${manifest.workspace}\`

## Bob execution
Open the repository in the supported IBM Bob IDE/local-agent environment. Read \`AGENTS.md\` and \`plans/implementation-plan.md\`, then perform the analysis, planning, implementation, testing, and documentation work in the repository itself.

Do not report a stage until it actually happened. Do not submit fabricated activity, plans, diffs, test results, or documentation. The repository must remain the source of truth.

## Evidence endpoints
- Events: POST \`${manifest.evidenceEndpoints.events}\`
- Plan: POST \`${manifest.evidenceEndpoints.plan}\`
- Changes: POST \`${manifest.evidenceEndpoints.changes}\`
- Tests: POST \`${manifest.evidenceEndpoints.tests}\`
- Documentation: POST \`${manifest.evidenceEndpoints.documentation}\`

Every request must include the exact build ID and Bob session ID above. Changes must be derived from \`git diff ${manifest.repositoryCommitHash}..HEAD\` or the equivalent working-tree diff, and tests/builds must be run in the repository.

## Blueprint context
${blueprint.nodes.map((node) => `- ${node.name} (${node.type})`).join('\n')}
`;
  }

  private generateAgentsMd(
    manifest: WorkspaceManifest,
    blueprint: AutomationBlueprint,
    ruleContext: { approvalThreshold: number | null; currency: string; version: number; ruleId: string | null; condition: string | null },
  ): string {
    return `# Engineering Instructions

## Objective
Implement the invoice approval workflow represented by the EnterpriseFlow blueprint. Preserve the existing TypeScript module boundaries and make the real repository compile and pass its tests.

## Repository and build identity
- Repository: \`${manifest.repository}\`
- Build: \`${manifest.buildId}\`
- Workflow version: \`${manifest.workflowVersionId}\`
- Baseline commit: \`${manifest.repositoryCommitHash}\`
- Expected build command: \`npm run build\`
- Expected test command: \`npm test\`

## Rule context
- Rule ID: \`${ruleContext.ruleId || 'not supplied'}\`
- Condition: \`${ruleContext.condition || 'not supplied'}\`
- Threshold: \`${ruleContext.approvalThreshold ?? 'not supplied'} ${ruleContext.currency}\`

## Required implementation
1. Analyze the baseline before editing.
2. Implement the affected modules from the implementation plan.
3. Keep approval rules in configuration/rule-engine code, not UI or controllers.
4. Add or update executable boundary tests.
5. Update relevant documentation.
6. Run \`npm run build\` and \`npm test\`.
7. Capture the real diff and submit evidence using the endpoints in \`BOB.md\`.

## Security requirements
- Validate external input and business-rule boundaries.
- Do not use \`eval\` or execute user-controlled commands.
- Do not add credentials or secrets.
- Preserve an auditable record of approval decisions.

## Blueprint
${blueprint.nodes.map((node) => `- ${node.name} (${node.type})`).join('\n')}
`;
  }

  private generateImplementationPlan(
    manifest: WorkspaceManifest,
    blueprint: AutomationBlueprint,
    ruleContext: { approvalThreshold: number | null; currency: string; version: number; ruleId: string | null; condition: string | null },
  ): string {
    const affectedModules = [
      'src/invoice/InvoiceProcessor.ts',
      'src/approval/ApprovalGate.ts',
      'src/routing/WorkflowRouter.ts',
      'src/validation/InvoiceValidator.ts',
      'tests/invoice.test.ts',
      'README.md',
    ];
    return `# Implementation Plan

## Identity
- Build: \`${manifest.buildId}\`
- Workflow version: \`${manifest.workflowVersionId}\`
- Blueprint: \`${manifest.blueprintId}\`
- Repository: \`${manifest.repository}\`
- Baseline commit: \`${manifest.repositoryCommitHash}\`

## Business objective
Implement and validate the invoice approval workflow. The current rule context is \`${ruleContext.condition || 'unavailable'}\`, with threshold \`${ruleContext.approvalThreshold ?? 'unavailable'} ${ruleContext.currency}\`.

## Affected modules
${affectedModules.map((module) => `- \`${module}\``).join('\n')}

## Required changes
1. Analyze the current validation, routing, processor, and approval behavior.
2. Implement the blueprint's vendor, duplicate, purchase-order, amount, routing, secondary-approval, and audit requirements without changing unrelated boundaries.
3. Add executable tests for valid vendor, invalid vendor, duplicate invoice, matching/missing PO, low/high value, threshold boundary routing, and audit behavior.
4. Update the repository documentation to describe the implemented policy.
5. Run \`npm run build\` and \`npm test\`; fix failures through the actual Bob session.
6. Capture the repository diff and submit only evidence produced by the actual work.

## Security
No secrets, no unsafe dynamic evaluation, no user-controlled command execution, and no bypass of validation.

## Workflow
${blueprint.nodes.map((node) => `- ${node.name} (${node.type})`).join('\n')}
`;
  }
}

export const bobWorkspaceManager = new BobWorkspaceManager();
