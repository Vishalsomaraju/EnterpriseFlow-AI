export interface BlueprintActor {
  id: string;
  name: string;
  role?: string;
}

export interface BlueprintNode {
  id: string;
  type: 'START' | 'INTERMEDIATE' | 'DECISION' | 'TERMINAL';
  name: string;
  actor?: string;
  automated: boolean;
  inputs: string[];
  outputs: string[];
  ruleIds: string[];
}

export interface BlueprintTransition {
  sourceId: string;
  targetId: string;
  type: 'DEFAULT' | 'BRANCH';
  condition?: string;
}

export interface BlueprintBusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
}

export interface BlueprintIntegration {
  id: string;
  name: string;
  description: string;
}

export interface AutomationBlueprint {
  schemaVersion: "1.0";
  workflow: {
    id: string;
    version: number;
    name: string;
  };
  actors: BlueprintActor[];
  nodes: BlueprintNode[];
  transitions: BlueprintTransition[];
  businessRules: BlueprintBusinessRule[];
  integrations: BlueprintIntegration[];
  acceptanceCriteria: string[];
}
