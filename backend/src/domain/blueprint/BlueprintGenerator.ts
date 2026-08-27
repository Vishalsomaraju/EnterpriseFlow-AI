import { AutomationBlueprint, BlueprintActor, BlueprintBusinessRule, BlueprintIntegration, BlueprintNode, BlueprintTransition } from './types';
import { DomainNode, DomainEdge, DomainRule } from '../workflow-engine/types';

export interface WorkflowContext {
  workflow: {
    id: string;
    version: number;
    name: string;
  };
  actors: { id: string; name: string; role?: string }[];
  systems: { id: string; name: string; description?: string }[];
  acceptanceCriteria?: string[];
}

export class BlueprintGenerator {
  public static generate(
    context: WorkflowContext,
    nodes: DomainNode[],
    edges: DomainEdge[],
    rules: DomainRule[]
  ): AutomationBlueprint {
    const blueprintActors: BlueprintActor[] = context.actors.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role || 'Participant'
    }));

    const blueprintNodes: BlueprintNode[] = nodes.map(n => ({
      id: n.id,
      type: n.type as 'START' | 'INTERMEDIATE' | 'DECISION' | 'TERMINAL',
      name: n.label,
      actor: n.actor,
      automated: n.automated,
      inputs: n.inputs ? Object.keys(n.inputs) : [],
      outputs: n.outputs ? Object.keys(n.outputs) : [],
      ruleIds: n.ruleIds || []
    }));

    const blueprintTransitions: BlueprintTransition[] = edges.map(e => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      type: e.type,
      condition: e.condition
    }));

    const blueprintRules: BlueprintBusinessRule[] = rules.map(r => ({
      id: r.id,
      name: r.name || 'Unnamed Rule',
      description: r.action || 'No description',
      condition: r.condition
    }));

    const blueprintIntegrations: BlueprintIntegration[] = context.systems.map(s => ({
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
