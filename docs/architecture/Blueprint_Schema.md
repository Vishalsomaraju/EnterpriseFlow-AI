# Automation Blueprint Schema

The Automation Blueprint is the structured machine-readable document generated deterministically from a Workflow Version. It is validated and then consumed by IBM Bob.

## Canonical JSON Structure

```json
{
  "schemaVersion": "1.0",
  "workflow": {
    "id": "uuid",
    "version": 1,
    "name": "string"
  },
  "actors": [
    {
      "id": "string",
      "name": "string",
      "role": "string"
    }
  ],
  "nodes": [
    {
      "id": "string",
      "type": "START | INTERMEDIATE | DECISION | TERMINAL",
      "name": "string",
      "actor": "string",
      "automated": true,
      "inputs": ["string"],
      "outputs": ["string"],
      "ruleIds": ["string"]
    }
  ],
  "transitions": [
    {
      "sourceId": "string",
      "targetId": "string",
      "type": "DEFAULT | BRANCH",
      "condition": "string"
    }
  ],
  "businessRules": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "condition": "string"
    }
  ],
  "integrations": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ],
  "acceptanceCriteria": [
    "string"
  ]
}
```

## Validation Rules
- `schemaVersion` must be exactly `"1.0"`.
- `workflow`, `actors`, `nodes`, `transitions`, `businessRules`, `integrations`, and `acceptanceCriteria` are required.
- All references must be valid:
  - `transitions.sourceId` and `transitions.targetId` must exist in `nodes.id`.
  - `nodes.ruleIds` must exist in `businessRules.id`.
- Deterministic Output: Re-generating a blueprint from the identical workflow version must yield an identical JSON payload.
