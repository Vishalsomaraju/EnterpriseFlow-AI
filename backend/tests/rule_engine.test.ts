import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/db';
import { ruleService } from '../src/services/RuleService';

describe('RuleService (Business Rule Engine)', () => {
  let workflowId: string;
  let ruleId: string;
  let initialVersionId: string;

  beforeAll(async () => {
    // Setup test data
    workflowId = `wf_test_${Date.now()}`;
    initialVersionId = `wv_test_${Date.now()}`;
    ruleId = `br_test_${Date.now()}`;

    await db.insertInto('workflows').values({
      id: workflowId,
      name: 'Test Workflow',
      description: 'Test Workflow',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).execute();

    await db.insertInto('workflow_versions').values({
      id: initialVersionId,
      workflow_id: workflowId,
      version: 1,
      status: 'PUBLISHED'
    }).execute();

    await db.insertInto('business_rules').values({
      id: ruleId,
      version_id: initialVersionId,
      name: 'Approval Rule',
      condition: 'amount < 500000',
      action: 'assign_to("Finance Manager")'
    }).execute();

    await db.insertInto('rule_dependencies').values({
      business_rule_id: ruleId,
      target_type: 'WORKFLOW_NODE',
      target_id: 'node_finance_manager'
    }).execute();
  });

  afterAll(async () => {
    // Cleanup
    await db.deleteFrom('rule_dependencies').where('business_rule_id', 'like', 'br_test_%').execute();
    await db.deleteFrom('business_rules').where('id', 'like', 'br_test_%').execute();
    await db.deleteFrom('workflow_nodes').where('version_id', 'like', 'wv_test_%').execute();
    await db.deleteFrom('workflow_versions').where('workflow_id', '=', workflowId).execute();
    await db.deleteFrom('workflows').where('id', '=', workflowId).execute();
  });

  it('should analyze rule impact (Read Only) without mutation', async () => {
    const impact = await ruleService.analyzeRuleImpact(ruleId, 'amount < 1000000', { amount: 750000 });
    
    expect(impact.rule?.oldExpression).toBe('amount < 500000');
    expect(impact.rule?.newExpression).toBe('amount < 1000000');
    
    // Direct Impact check
    expect(impact.directImpact?.length).toBeGreaterThan(0);
    expect(impact.directImpact![0].type).toBe('WORKFLOW_NODE');
    expect(impact.directImpact![0].id).toBe('node_finance_manager');
    
    // Evaluation check
    expect(impact.evaluation?.before).toBe('assign_to("CFO")');
    expect(impact.evaluation?.after).toBe('assign_to("Finance Manager")');

    // Make sure nothing was mutated
    const currentRule = await db.selectFrom('business_rules').where('id', '=', ruleId).selectAll().executeTakeFirst();
    expect(currentRule?.condition).toBe('amount < 500000'); // Still original
  });

  it('should reject changeRule if baseVersion mismatches (Optimistic Concurrency)', async () => {
    await expect(ruleService.changeRule(ruleId, 'amount < 1000000', 99)).rejects.toThrow(/Conflict:/);
  });

  it('should changeRule inside a transaction and bump version', async () => {
    const result = await ruleService.changeRule(ruleId, 'amount < 1000000', 1);
    
    expect(result.newVersionNumber).toBe(2);
    expect(result.newVersionId).toBeTruthy();

    // Verify historical version is untouched
    const historicalRule = await db.selectFrom('business_rules').where('id', '=', ruleId).selectAll().executeTakeFirst();
    expect(historicalRule?.condition).toBe('amount < 500000'); // Remains untouched

    // Verify new version rule is updated
    const newRule = await db.selectFrom('business_rules')
      .where('version_id', '=', result.newVersionId)
      .where('id', 'like', `${ruleId}_%`)
      .selectAll().executeTakeFirst();
      
    expect(newRule?.condition).toBe('amount < 1000000'); // Updated
    
    // Verify dependencies were cloned correctly
    const newDeps = await db.selectFrom('rule_dependencies').where('business_rule_id', '=', newRule!.id).selectAll().execute();
    expect(newDeps.length).toBe(1);
    expect(newDeps[0].target_id).toBe('node_finance_manager_v2'); // ID mapped
  });
});
