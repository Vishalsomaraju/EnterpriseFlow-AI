import fs from 'fs/promises';
import path from 'path';
import { AutomationBlueprint } from '../../domain/blueprint/types';

export interface WorkspaceManifest {
  buildId: string;
  workflowId: string;
  workflowVersionId: string;
  blueprintId: string;
  bobSessionId: string;
  repository: string;
  createdAt: string;
  schemaVersion: string;
}

export class BobWorkspaceManager {
  private readonly workspaceRoot = path.join(process.cwd(), '..', 'bob-workspace');
  private readonly demoRepoRoot = path.join(process.cwd(), '..', 'demo-repository', 'invoice-automation');

  async generateWorkspace(
    buildId: string,
    blueprintId: string,
    workflowVersionId: string,
    blueprint: AutomationBlueprint
  ): Promise<{ bobSessionId: string; repoCommitHash: string; repoPath: string }> {
    const bobSessionId = `bob-sess-${Date.now()}`;
    const repoCommitHash = 'baseline-local-demo'; // For MVP demo, simulating a git hash
    const repoPath = this.demoRepoRoot;

    // Create directories
    await fs.mkdir(path.join(this.workspaceRoot, 'prompts'), { recursive: true });
    await fs.mkdir(path.join(this.workspaceRoot, 'plans'), { recursive: true });
    await fs.mkdir(path.join(this.workspaceRoot, 'evidence'), { recursive: true });
    await fs.mkdir(this.demoRepoRoot, { recursive: true }); // Ensure repo exists

    // Generate AGENTS.md
    const agentsMd = this.generateAgentsMd(blueprint);
    await fs.writeFile(path.join(this.workspaceRoot, 'AGENTS.md'), agentsMd);

    // Generate BOB.md
    const bobMd = this.generateBobMd(buildId, bobSessionId, blueprint);
    await fs.writeFile(path.join(this.workspaceRoot, 'BOB.md'), bobMd);

    // Generate manifest.json
    const manifest: WorkspaceManifest = {
      buildId,
      workflowId: blueprint.workflow.id,
      workflowVersionId,
      blueprintId,
      bobSessionId,
      repository: this.demoRepoRoot,
      createdAt: new Date().toISOString(),
      schemaVersion: '1.0'
    };
    await fs.writeFile(
      path.join(this.workspaceRoot, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return { bobSessionId, repoCommitHash, repoPath };
  }

  private generateAgentsMd(blueprint: AutomationBlueprint): string {
    return `# IBM Bob Engineering Instructions

## Repository Context
You are modifying the \`invoice-automation\` application in the adjacent \`demo-repository\`.

## Architectural Constraints
- All backend code must go into \`src/backend/\`.
- All frontend code must go into \`src/frontend/\`.

## Acceptance Criteria
${blueprint.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}

## Security Constraints
- All inputs must be validated.
- Do not bypass authentication.
`;
  }

  private generateBobMd(buildId: string, bobSessionId: string, blueprint: AutomationBlueprint): string {
    return `# IBM Bob Evidence Context

## Identity
- **Build ID:** ${buildId}
- **Bob Session ID:** ${bobSessionId}
- **Workflow:** ${blueprint.workflow.name} (ID: ${blueprint.workflow.id})

## Expected Implementation
You are implementing the automation blueprint for this workflow. Provide evidence back through the Evidence Ingestion APIs.

### Blueprint Nodes
${blueprint.nodes.map(n => `- ${n.name} (${n.type})`).join('\n')}
`;
  }
}

export const bobWorkspaceManager = new BobWorkspaceManager();
