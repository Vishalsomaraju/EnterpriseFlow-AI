"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowNormalizer = exports.NormalizationError = void 0;
class NormalizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NormalizationError';
    }
}
exports.NormalizationError = NormalizationError;
class WorkflowNormalizer {
    static normalize(data) {
        // 1. Collect all node IDs (steps + decisions)
        const nodeIds = new Set();
        const steps = data.steps || [];
        const decisions = data.decisions || [];
        const rules = data.rules || [];
        for (const step of steps) {
            if (nodeIds.has(step.id)) {
                throw new NormalizationError(`Duplicate node ID found: ${step.id}`);
            }
            nodeIds.add(step.id);
        }
        for (const decision of decisions) {
            if (nodeIds.has(decision.id)) {
                throw new NormalizationError(`Duplicate node ID found: ${decision.id}`);
            }
            nodeIds.add(decision.id);
        }
        if (nodeIds.size === 0) {
            throw new NormalizationError('Workflow must have at least one node');
        }
        // 2. Validate Rules (Check referenced IDs and edge correctness)
        const connectedTargets = new Set();
        for (const rule of rules) {
            if (!nodeIds.has(rule.source_node_id)) {
                throw new NormalizationError(`Rule ${rule.id} references non-existent source node: ${rule.source_node_id}`);
            }
            const targets = Array.isArray(rule.target_node_id) ? rule.target_node_id : [rule.target_node_id];
            for (const target of targets) {
                if (!nodeIds.has(target)) {
                    throw new NormalizationError(`Rule ${rule.id} references non-existent target node: ${target}`);
                }
                connectedTargets.add(target);
            }
            if (rule.decision_node_id && !nodeIds.has(rule.decision_node_id)) {
                throw new NormalizationError(`Rule ${rule.id} references non-existent decision node: ${rule.decision_node_id}`);
            }
        }
        // 3. Orphan check (A node must be a source or a target of a rule, unless it's the only node)
        if (nodeIds.size > 1) {
            const sourceNodes = new Set(rules.map(r => r.source_node_id));
            for (const nodeId of nodeIds) {
                if (!sourceNodes.has(nodeId) && !connectedTargets.has(nodeId)) {
                    throw new NormalizationError(`Orphan node detected: ${nodeId}. It is not connected by any rules.`);
                }
            }
        }
        // 4. Circular graph check (Basic DFS for cycles - simple version)
        const adjacencyList = new Map();
        for (const rule of rules) {
            const targets = Array.isArray(rule.target_node_id) ? rule.target_node_id : [rule.target_node_id];
            const existing = adjacencyList.get(rule.source_node_id) || [];
            adjacencyList.set(rule.source_node_id, [...existing, ...targets]);
        }
        const visited = new Set();
        const recStack = new Set();
        const dfsCycle = (node) => {
            if (!visited.has(node)) {
                visited.add(node);
                recStack.add(node);
                const neighbors = adjacencyList.get(node) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor) && dfsCycle(neighbor)) {
                        return true;
                    }
                    else if (recStack.has(neighbor)) {
                        return true;
                    }
                }
            }
            recStack.delete(node);
            return false;
        };
        for (const node of nodeIds) {
            if (dfsCycle(node)) {
                throw new NormalizationError('Circular dependency detected in workflow rules.');
            }
        }
        return data;
    }
}
exports.WorkflowNormalizer = WorkflowNormalizer;
