"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bobWorkspaceManager = exports.BobWorkspaceManager = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class BobWorkspaceManager {
    workspaceRoot = path_1.default.join(process.cwd(), '..', 'bob-workspace');
    demoRepoRoot = path_1.default.join(process.cwd(), '..', 'demo-repository', 'invoice-automation');
    async generateWorkspace(buildId, blueprintId, workflowVersionId, blueprint) {
        const bobSessionId = `bob-sess-${Date.now()}`;
        const repoCommitHash = 'baseline-local-demo'; // For MVP demo, simulating a git hash
        const repoPath = this.demoRepoRoot;
        // Create directories
        await promises_1.default.mkdir(path_1.default.join(this.workspaceRoot, 'prompts'), { recursive: true });
        await promises_1.default.mkdir(path_1.default.join(this.workspaceRoot, 'plans'), { recursive: true });
        await promises_1.default.mkdir(path_1.default.join(this.workspaceRoot, 'evidence'), { recursive: true });
        await promises_1.default.mkdir(this.demoRepoRoot, { recursive: true }); // Ensure repo exists
        // Generate AGENTS.md
        const agentsMd = this.generateAgentsMd(blueprint);
        await promises_1.default.writeFile(path_1.default.join(this.workspaceRoot, 'AGENTS.md'), agentsMd);
        // Generate BOB.md
        const bobMd = this.generateBobMd(buildId, bobSessionId, blueprint);
        await promises_1.default.writeFile(path_1.default.join(this.workspaceRoot, 'BOB.md'), bobMd);
        // Generate manifest.json
        const manifest = {
            buildId,
            workflowId: blueprint.workflow.id,
            workflowVersionId,
            blueprintId,
            bobSessionId,
            repository: this.demoRepoRoot,
            createdAt: new Date().toISOString(),
            schemaVersion: '1.0'
        };
        await promises_1.default.writeFile(path_1.default.join(this.workspaceRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
        return { bobSessionId, repoCommitHash, repoPath };
    }
    generateAgentsMd(blueprint) {
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
    generateBobMd(buildId, bobSessionId, blueprint) {
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
exports.BobWorkspaceManager = BobWorkspaceManager;
exports.bobWorkspaceManager = new BobWorkspaceManager();
