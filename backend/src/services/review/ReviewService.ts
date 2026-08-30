import { db } from '../../db/index';
import { lifecycleOrchestrator } from '../build/LifecycleOrchestrator';

export class ReviewService {
  async submitReview(buildId: string, versionId: string, reviewer: string, comments?: string) {
    const review = await db.insertInto('reviews').values({
      build_id: buildId,
      version_id: versionId,
      status: 'PENDING',
      reviewer,
      comments: comments || null
    }).returningAll().executeTakeFirstOrThrow();

    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}`,
      title: 'Review Submitted',
      message: `Review submitted by ${reviewer}`,
      source: 'REVIEW',
      event_type: 'SYSTEM',
      status: 'SUCCESS',
      metadata: null
    }).execute();

    return review;
  }

  async approveReview(reviewId: string) {
    // Validation
    const review = await db.selectFrom('reviews').where('id', '=', reviewId).selectAll().executeTakeFirst();
    if (!review) throw new Error('Review not found');

    const build = await db.selectFrom('builds').where('id', '=', review.build_id).selectAll().executeTakeFirst();
    if (!build) throw new Error('Build not found');

    if (build.status !== 'READY_FOR_REVIEW') {
      throw new Error(`Cannot approve review. Build is in status: ${build.status}, expected READY_FOR_REVIEW`);
    }

    // Verify tests passed
    const testRuns = await db.selectFrom('test_runs')
      .where('build_id', '=', review.build_id)
      .orderBy('completed_at', 'desc')
      .selectAll()
      .execute();
    
    if (testRuns.length === 0) throw new Error('No test runs found for this build');
    const latestTestRun = testRuns[0];
    if (latestTestRun.status !== 'PASS') throw new Error('Cannot approve: tests did not pass');

    const secureScan = await db.selectFrom('security_scans').where('build_id', '=', review.build_id).selectAll().executeTakeFirst();
    if (!secureScan) {
      throw Object.assign(new Error('Cannot approve: SecurePush scan not completed'), { code: 'SECURITY_SCAN_REQUIRED', statusCode: 400 });
    }
    if (secureScan.status === 'BLOCK') {
      throw Object.assign(
        new Error(`Cannot approve: SecurePush BLOCKED changes. Risk score: ${secureScan.risk_score ?? 'unknown'}/100. Fix critical findings first.`),
        { code: 'APPROVAL_BLOCKED', statusCode: 403 }
      );
    }

    // Verify docs exist
    const docs = await db.selectFrom('documentation_artifacts').where('build_id', '=', review.build_id).selectAll().execute();
    if (docs.length === 0) throw new Error('Cannot approve: documentation missing');

    const plan = await db.selectFrom('build_plans').where('build_id', '=', review.build_id).selectAll().executeTakeFirst();
    if (!plan) throw new Error('Cannot approve: implementation plan missing');
    const changes = await db.selectFrom('build_changes').where('build_id', '=', review.build_id).selectAll().execute();
    if (changes.length === 0 || changes.every(change => !change.diff?.trim())) {
      throw new Error('Cannot approve: Bob repository change evidence missing');
    }
    const bobActivity = await db.selectFrom('bob_activity_events')
      .where('build_id', '=', review.build_id)
      .select('id')
      .executeTakeFirst();
    if (!bobActivity) throw new Error('Cannot approve: Bob activity evidence missing');

    // Verify SecurePush was PASS or WARN — BLOCK is a hard gate
    if (!secureScan.completed_at || secureScan.findings === null || secureScan.findings === undefined) {
      throw Object.assign(new Error('Cannot approve: SecurePush scan evidence is incomplete'), { code: 'SECURITY_SCAN_REQUIRED', statusCode: 400 });
    }
    if (secureScan.status !== 'PASS' && secureScan.status !== 'WARN') {
      throw Object.assign(new Error(`Cannot approve: SecurePush scan status is ${secureScan.status}`), { code: 'SECURITY_SCAN_REQUIRED', statusCode: 400 });
    }

    // Verify blueprint valid
    const blueprint = await db.selectFrom('blueprints').where('id', '=', build.blueprint_id).selectAll().executeTakeFirst();
    if (!blueprint) throw new Error('Cannot approve: Blueprint missing');

    await db.updateTable('reviews').set({
      status: 'APPROVED',
      decision: 'APPROVED',
      updated_at: new Date()
    }).where('id', '=', reviewId).execute();

    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}`,
      title: 'Review Approved',
      message: `Review approved by ${review.reviewer}`,
      source: 'REVIEW',
      event_type: 'SYSTEM',
      status: 'SUCCESS',
      metadata: null
    }).execute();

    // Transition build
    await db.updateTable('builds').set({ status: 'ACTIVATED' }).where('id', '=', review.build_id).execute();
  }

  async rejectReview(reviewId: string, comments?: string) {
    const review = await db.selectFrom('reviews').where('id', '=', reviewId).selectAll().executeTakeFirst();
    if (!review) throw new Error('Review not found');

    await db.updateTable('reviews').set({
      status: 'REJECTED',
      decision: 'REJECTED',
      comments: comments || review.comments,
      updated_at: new Date()
    }).where('id', '=', reviewId).execute();

    await db.insertInto('activity_events').values({
      id: `act_${Date.now()}`,
      title: 'Review Rejected',
      message: `Review rejected by ${review.reviewer}`,
      source: 'REVIEW',
      event_type: 'SYSTEM',
      status: 'SUCCESS',
      metadata: null
    }).execute();

    // Transition build
    await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', review.build_id).execute();
  }
}

export const reviewService = new ReviewService();
