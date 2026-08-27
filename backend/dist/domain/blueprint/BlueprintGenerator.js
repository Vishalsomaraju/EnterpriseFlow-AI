"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueprintGenerator = void 0;
class BlueprintGenerator {
    static generate(context, nodes, edges, rules) {
        const blueprintActors = context.actors.map(a => ({
            id: a.id,
            name: a.name,
            role: a.role || 'Participant'
        }));
        const blueprintNodes = nodes.map(n => ({
            id: n.id,
            type: n.type,
            name: n.label,
            actor: n.actor,
            automated: n.automated,
            inputs: n.inputs ? Object.keys(n.inputs) : [],
            outputs: n.outputs ? Object.keys(n.outputs) : [],
            ruleIds: n.ruleIds
        }));
        const blueprintTransitions = edges.map(e => ({
            sourceId: e.sourceId,
            targetId: e.targetId,
            type: e.type,
            condition: e.condition
        }));
        const blueprintRules = rules.map(r => ({
            id: r.id,
            name: r.name || 'Unnamed Rule',
            description: r.action || 'No description',
            condition: r.condition
        }));
        const blueprintIntegrations = context.systems.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description || ''
        }));
        return {
            schemaVersion: '1.0',
            workflow: context.workflow,
            actors: blueprintActors,
            nodes: blueprintNodes,
            transitions: blueprintTransitions,
            businessRules: blueprintRules,
            integrations: blueprintIntegrations,
            acceptanceCriteria: context.acceptanceCriteria || []
        };
    }
}
exports.BlueprintGenerator = BlueprintGenerator;
