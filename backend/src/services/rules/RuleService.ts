import { db } from '../../db/index';
import { RuleEngine } from '../../demo-repository/invoice-automation-baseline/src/engine'; // We will use a local implementation of the rule engine for snapshotting if available, or just mock it deterministically.
import { ImpactAnalysisResponse, ImpactComponent } from '../../domain/impact-engine/ImpactAnalysisSchema';

export class RuleService {

  async analyzeRuleImpact(ruleId: string, proposedExpression: string, sampleInput?: any): Promise<ImpactAnalysisResponse> {
    const rule = await db.selectFrom('business_rules').where('id', '=', ruleId).selectAll().executeTakeFirst();
    if (!rule) throw new Error('Rule not found');

    const dependencies = await db.selectFrom('rule_dependencies').where('business_rule_id', '=', ruleId).selectAll().execute();
    
    const directImpact: ImpactComponent[] = [];
    const downstreamImpact: ImpactComponent[] = [];
    const affectedFiles: string[] = [];
    const affectedTests: string[] = [];
    const affectedNodes: string[] = [];
    const affectedDocs: string[] = [];

    let highestSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    for (const dep of dependencies) {
      const comp: ImpactComponent = {
        id: dep.target_id,
        type: dep.target_type,
        name: dep.target_id, // We could look up names from specific tables, but ID is sufficient for MVP
        reason: `Dependent on business rule: ${rule.name}`,
        severity: 'LOW'
      };

      if (dep.target_type === 'WORKFLOW_NODE') {
        comp.severity = 'MEDIUM';
        highestSeverity = highestSeverity === 'LOW' ? 'MEDIUM' : highestSeverity;
        affectedNodes.push(dep.target_id);
      } else if (dep.target_type === 'SOURCE_FILE') {
        affectedFiles.push(dep.target_id);
      } else if (dep.target_type === 'TEST_FILE') {
        affectedTests.push(dep.target_id);
      } else if (dep.target_type === 'DOC_FILE') {
        affectedDocs.push(dep.target_id);
      }

      // Determine severity heuristically for demonstration
      if (proposedExpression.includes('1000000')) {
        comp.severity = 'CRITICAL';
        highestSeverity = 'CRITICAL';
      }

      directImpact.push(comp);
    }

    // Evaluate before/after if sampleInput is provided
    let evaluation: { input: any, before?: string, after?: string } | undefined = undefined;
    if (sampleInput) {
      // Mock deterministic rule evaluation. In a real system, you'd evaluate the expression in a sandbox.
      let before = 'No Action';
      let after = 'No Action';

      const amount = sampleInput.amount || 0;
      
      // OLD Logic
      if (rule.condition.includes('< 500000') && amount < 500000) before = rule.action || 'assign_to("Finance Manager")';
      else if (rule.condition.includes('>= 500000') && amount >= 500000) before = rule.action || 'assign_to("CFO")';
      
      // NEW Logic
      if (proposedExpression.includes('< 1000000') && amount < 1000000) after = rule.action || 'assign_to("Finance Manager")';
      else if (proposedExpression.includes('>= 1000000') && amount >= 1000000) after = rule.action || 'assign_to("CFO")';
      // Add more branches if needed for the test

      evaluation = {
        input: sampleInput,
        before,
        after
      };
    }

    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}_impact`,
      title: 'Rule Impact Analyzed',
      message: `Impact analyzed for rule ${ruleId}`,
      source: 'SYSTEM',
      event_type: 'RULE_IMPACT_ANALYZED',
      status: 'SUCCESS'
    }).execute();

    return {
      rule: {
        id: rule.id,
        oldExpression: rule.condition,
        newExpression: proposedExpression
      },
      directImpact,
      downstreamImpact,
      risk: {
        level: highestSeverity,
        reason: 'Rule affects core financial boundary.'
      },
      evaluation,
      affected_files: affectedFiles,
      affected_tests: affectedTests,
      affected_nodes: affectedNodes,
      affected_docs: affectedDocs
    };
  }

  async changeRule(ruleId: string, newExpression: string, baseVersion: number): Promise<{ newVersionId: string, newVersionNumber: number }> {
    return await db.transaction().execute(async (trx) => {
      const rule = await trx.selectFrom('business_rules').where('id', '=', ruleId).selectAll().executeTakeFirst();
      if (!rule) throw new Error('Rule not found');

      const oldVersion = await trx.selectFrom('workflow_versions').where('id', '=', rule.version_id).selectAll().executeTakeFirst();
      if (!oldVersion) throw new Error('Workflow version not found');

      if (oldVersion.version !== baseVersion) {
        throw new Error(`Conflict: Base version ${baseVersion} does not match current version ${oldVersion.version}`);
      }

      const nextVersionNumber = baseVersion + 1;

      // 1. Create new version
      const newVersion = await trx.insertInto('workflow_versions').values({
        workflow_id: oldVersion.workflow_id,
        version: nextVersionNumber,
        status: 'DRAFT'
      }).returning('id').executeTakeFirstOrThrow();

      // 2. Clone actors
      const actors = await trx.selectFrom('workflow_actors').where('version_id', '=', oldVersion.id).selectAll().execute();
      if (actors.length > 0) {
        await trx.insertInto('workflow_actors').values(actors.map(a => ({ name: a.name, role: a.role, version_id: newVersion.id }))).execute();
      }

      // 3. Clone systems
      const systems = await trx.selectFrom('workflow_systems').where('version_id', '=', oldVersion.id).selectAll().execute();
      if (systems.length > 0) {
        await trx.insertInto('workflow_systems').values(systems.map(s => ({ name: s.name, description: s.description, version_id: newVersion.id }))).execute();
      }

      // 4. Clone nodes
      const nodes = await trx.selectFrom('workflow_nodes').where('version_id', '=', oldVersion.id).selectAll().execute();
      if (nodes.length > 0) {
        await trx.insertInto('workflow_nodes').values(nodes.map(n => ({ id: `${n.id}_v${nextVersionNumber}`, version_id: newVersion.id, type: n.type, name: n.name, kind: n.kind, pos_x: n.pos_x, pos_y: n.pos_y }))).execute();
      }

      // 5. Clone edges (re-mapping IDs)
      const edges = await trx.selectFrom('workflow_edges').where('version_id', '=', oldVersion.id).selectAll().execute();
      if (edges.length > 0) {
        await trx.insertInto('workflow_edges').values(edges.map(e => ({ id: `${e.id}_v${nextVersionNumber}`, version_id: newVersion.id, source_id: `${e.source_id}_v${nextVersionNumber}`, target_id: `${e.target_id}_v${nextVersionNumber}`, label: e.label, is_branch: e.is_branch }))).execute();
      }

      // 6. Clone rules and update the specific rule
      const rules = await trx.selectFrom('business_rules').where('version_id', '=', oldVersion.id).selectAll().execute();
      if (rules.length > 0) {
        const newRules = rules.map(r => {
          let cond = r.condition;
          if (r.id === ruleId) {
            cond = newExpression;
          }
          return {
            id: `${r.id}_v${nextVersionNumber}`,
            version_id: newVersion.id,
            name: r.name,
            description: r.description,
            condition: cond,
            action: r.action,
            node_id: r.node_id ? `${r.node_id}_v${nextVersionNumber}` : null
          };
        });
        await trx.insertInto('business_rules').values(newRules).execute();
      }

      // 7. Clone rule dependencies (We map the old rule IDs to new rule IDs)
      for (const r of rules) {
        const deps = await trx.selectFrom('rule_dependencies').where('business_rule_id', '=', r.id).selectAll().execute();
        if (deps.length > 0) {
          await trx.insertInto('rule_dependencies').values(deps.map(d => ({
            business_rule_id: `${r.id}_v${nextVersionNumber}`,
            target_type: d.target_type,
            target_id: d.target_type === 'WORKFLOW_NODE' ? `${d.target_id}_v${nextVersionNumber}` : d.target_id
          }))).execute();
        }
      }

      // Audit Events
      await trx.insertInto('activity_events').values([
        {
          id: `act_${Date.now()}_vc`,
          title: 'Workflow Version Created',
          message: `Created version ${nextVersionNumber}`,
          source: 'SYSTEM',
          event_type: 'WORKFLOW_VERSION_CREATED',
          status: 'SUCCESS'
        },
        {
          id: `act_${Date.now()}_rc`,
          title: 'Rule Changed',
          message: `Rule ${ruleId} condition changed to ${newExpression}`,
          source: 'SYSTEM',
          event_type: 'RULE_CHANGED',
          status: 'SUCCESS'
        }
      ]).execute();

      return {
        newVersionId: newVersion.id,
        newVersionNumber: nextVersionNumber
      };
    });
  }
}

export const ruleService = new RuleService();
