"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = exports.ReviewService = void 0;
const index_1 = require("../../db/index");
class ReviewService {
    async submitReview(buildId, versionId, reviewer, comments) {
        const review = await index_1.db.insertInto('reviews').values({
            build_id: buildId,
            version_id: versionId,
            status: 'PENDING',
            reviewer,
            comments: comments || null
        }).returningAll().executeTakeFirstOrThrow();
        await index_1.db.insertInto('activity_events').values({
            id: `act_${Date.now()}`,
            title: 'Review Submitted',
            message: `Review submitted by ${reviewer}`,
            source: 'REVIEW',
            event_type: 'SYSTEM',
            status: 'SUCCESS'
        }).execute();
        return review;
    }
    async approveReview(reviewId) {
        // Validation
        const review = await index_1.db.selectFrom('reviews').where('id', '=', reviewId).selectAll().executeTakeFirst();
        if (!review)
            throw new Error('Review not found');
        const build = await index_1.db.selectFrom('builds').where('id', '=', review.build_id).selectAll().executeTakeFirst();
        if (!build)
            throw new Error('Build not found');
        if (build.status !== 'READY_FOR_REVIEW') {
            throw new Error(`Cannot approve review. Build is in status: ${build.status}, expected READY_FOR_REVIEW`);
        }
        // Verify tests passed
        const testRuns = await index_1.db.selectFrom('test_runs')
            .where('build_id', '=', review.build_id)
            .orderBy('completed_at', 'desc')
            .selectAll()
            .execute();
        if (testRuns.length === 0)
            throw new Error('No test runs found for this build');
        const latestTestRun = testRuns[0];
        if (latestTestRun.status !== 'PASS')
            throw new Error('Cannot approve: tests did not pass');
        // Verify docs exist
        const docs = await index_1.db.selectFrom('documentation_artifacts').where('build_id', '=', review.build_id).selectAll().execute();
        if (docs.length === 0)
            throw new Error('Cannot approve: documentation missing');
        // Verify secure push was PASS/WARN (We assume it was, since status reached READY_FOR_REVIEW, but we check explicitly)
        const secureScan = await index_1.db.selectFrom('security_scans').where('build_id', '=', review.build_id).selectAll().executeTakeFirst();
        if (!secureScan || secureScan.status === 'BLOCK') {
            throw new Error('Cannot approve: SecurePush blocked changes');
        }
        // Verify blueprint valid
        const blueprint = await index_1.db.selectFrom('blueprints').where('id', '=', build.blueprint_id).selectAll().executeTakeFirst();
        if (!blueprint)
            throw new Error('Cannot approve: Blueprint missing');
        await index_1.db.updateTable('reviews').set({
            status: 'APPROVED',
            decision: 'APPROVED',
            updated_at: new Date()
        }).where('id', '=', reviewId).execute();
        await index_1.db.insertInto('activity_events').values({
            id: `act_${Date.now()}`,
            title: 'Review Approved',
            message: `Review approved by ${review.reviewer}`,
            source: 'REVIEW',
            event_type: 'SYSTEM',
            status: 'SUCCESS'
        }).execute();
        // Transition build
        await index_1.db.updateTable('builds').set({ status: 'ACTIVATED' }).where('id', '=', review.build_id).execute();
    }
    async rejectReview(reviewId, comments) {
        const review = await index_1.db.selectFrom('reviews').where('id', '=', reviewId).selectAll().executeTakeFirst();
        if (!review)
            throw new Error('Review not found');
        await index_1.db.updateTable('reviews').set({
            status: 'REJECTED',
            decision: 'REJECTED',
            comments: comments || review.comments,
            updated_at: new Date()
        }).where('id', '=', reviewId).execute();
        await index_1.db.insertInto('activity_events').values({
            id: `act_${Date.now()}`,
            title: 'Review Rejected',
            message: `Review rejected by ${review.reviewer}`,
            source: 'REVIEW',
            event_type: 'SYSTEM',
            status: 'SUCCESS'
        }).execute();
    }
}
exports.ReviewService = ReviewService;
exports.reviewService = new ReviewService();
