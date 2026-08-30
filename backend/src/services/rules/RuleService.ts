import { db } from '../../db/index';
import { ImpactAnalysisResponse, ImpactComponent } from '../../domain/impact-engine/ImpactAnalysisSchema';
import { RuleEvaluator } from '../../domain/workflow-engine/RuleEvaluator';

export class RuleService {

  async analyzeRuleImpact(ruleId: string, proposedExpression: string, sampleInput?: Record<string, unknown>): Promise<ImpactAnalysisResponse> {
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
      let compName = dep.target_id;
      let reason = `Dependent on business rule: ${rule.name || ruleId}`;

      if (dep.target_type === 'WORKFLOW_NODE' || dep.target_type === 'NODE') {
        const node = await db.selectFrom('workflow_nodes').where('id', '=', dep.target_id).selectAll().executeTakeFirst();
        if (node) compName = `${node.name} (${node.type})`;
        affectedNodes.push(compName);
      } else if (dep.target_type === 'SOURCE_FILE') {
        compName = dep.target_id;
        affectedFiles.push(compName);
      } else if (dep.target_type === 'TEST_FILE') {
        compName = dep.target_id;
        affectedTests.push(compName);
      } else if (dep.target_type === 'DOC_FILE') {
        compName = dep.target_id;
        affectedDocs.push(compName);
      }

      const comp: ImpactComponent = {
        id: dep.target_id,
        type: dep.target_type,
        name: compName,
        reason,
        severity: 'LOW'
      };

      if (dep.target_type === 'WORKFLOW_NODE' || dep.target_type === 'NODE') {
        comp.severity = 'MEDIUM';
        highestSeverity = highestSeverity === 'LOW' ? 'MEDIUM' : highestSeverity;
      }

      directImpact.push(comp);
    }

    const dependentNodeIds = dependencies.filter(dep => dep.target_type === 'WORKFLOW_NODE' || dep.target_type === 'NODE').map(dep => dep.target_id);
    const edges = await db.selectFrom('workflow_edges').where('version_id', '=', rule.version_id).selectAll().execute();
    const visited = new Set(dependentNodeIds);
    const queue = [...dependentNodeIds];
    while (queue.length > 0) {
      const sourceId = queue.shift()!;
      for (const edge of edges.filter(candidate => candidate.source_id === sourceId)) {
        if (!visited.has(edge.target_id)) {
          visited.add(edge.target_id);
          queue.push(edge.target_id);
          const node = await db.selectFrom('workflow_nodes').where('id', '=', edge.target_id).selectAll().executeTakeFirst();
          if (node) {
            downstreamImpact.push({
              id: node.id,
              type: 'WORKFLOW_NODE',
              name: `${node.name} (${node.type})`,
              reason: `Downstream of dependent workflow node ${sourceId}`,
              severity: 'MEDIUM'
            });
          }
        }
      }
    }
    const changed = rule.condition !== proposedExpression;
    if (changed && directImpact.length > 0) highestSeverity = 'HIGH';
    else if (!changed) highestSeverity = 'LOW';

    // Evaluate before/after using the stored and proposed expressions.
    let evaluation: { input: Record<string, unknown>, before?: string, after?: string } | undefined = undefined;
    if (sampleInput) {
      const beforeResult = RuleEvaluator.evaluate(rule.condition, sampleInput);
      const afterResult = RuleEvaluator.evaluate(proposedExpression, sampleInput);
      evaluation = {
        input: sampleInput,
        before: `${rule.action || 'rule'}: ${beforeResult.matched}`,
        after: `${rule.action || 'rule'}: ${afterResult.matched}`
      };
    }

    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}_impact`,
      title: 'Rule Impact Analyzed',
      message: `Impact analyzed for rule ${ruleId}: ${rule.condition} -> ${proposedExpression}`,
      source: 'SYSTEM',
      event_type: 'RULE_IMPACT_ANALYZED',
      status: 'SUCCESS',
      metadata: null
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
        reason: changed ? 'Stored rule expression changed and its persisted dependencies require review.' : 'No rule change detected. No impact analysis required.'
      },
      evaluation,
      affected_files: affectedFiles,
      affected_tests: affectedTests,
      affected_nodes: affectedNodes,
      affected_docs: affectedDocs
    };
  }

  async changeRule(ruleId: string, newExpression: string, baseVersion: number): Promise<{ newVersionId: string, newVersionNumber: number }> {
    const result = await db.transaction().execute(async (trx) => {
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
          status: 'SUCCESS',
          metadata: null
        },
        {
          id: `act_${Date.now()}_rc`,
          title: 'Rule Changed',
          message: `Rule ${ruleId} condition changed to ${newExpression}`,
          source: 'SYSTEM',
          event_type: 'RULE_CHANGED',
          status: 'SUCCESS',
          metadata: null
        }
      ]).execute();

      return {
        workflowId: oldVersion.workflow_id,
        newVersionId: newVersion.id,
        newVersionNumber: nextVersionNumber
      };
    });

    const { BlueprintService } = await import('../blueprint/BlueprintService');
    await BlueprintService.generateAndPersistBlueprint(result.workflowId);
    const blueprintRecord = await db.selectFrom('blueprints')
      .where('workflow_version_id', '=', result.newVersionId)
      .selectAll()
      .executeTakeFirstOrThrow();
    const { JobService } = await import('../../jobs/JobService');
    const { JobType } = await import('../../jobs/types');
    const { JobWorker } = await import('../../jobs/JobWorker');
    const jobId = await JobService.createJob(JobType.IMPLEMENTATION, 'blueprint', blueprintRecord.id);
    JobWorker.dispatch(jobId, JobType.IMPLEMENTATION, blueprintRecord.id);

    return {
      newVersionId: result.newVersionId,
      newVersionNumber: result.newVersionNumber
    };
  }
}

export const ruleService = new RuleService();
