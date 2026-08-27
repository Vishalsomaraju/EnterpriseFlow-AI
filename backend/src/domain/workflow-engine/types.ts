export interface WorkflowGraphDTO {
  nodes: {
    id: string;
    label: string;
    kind: string | null;
    type: 'automated' | 'human';
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label: string | null;
    isBranch: boolean;
  }[];
  rules: {
    id: string;
    description: string;
    condition: string;
    action?: string | null;
    nodeId: string;
  }[];
}

export interface DomainNode {
  id: string;
  label: string;
  type: string | null; // kind from db
  automated: boolean;
  actor?: string;
  inputs?: any;
  outputs?: any;
  ruleIds?: string[];
}

export interface DomainEdge {
  id: string;
  sourceId: string;
  targetId: string;
  condition: string | undefined;
  type: 'BRANCH' | 'DEFAULT';
}

export interface DomainRule {
  id: string;
  name?: string;
  condition: string;
  action?: string | null;
  nodeId?: string;
}
