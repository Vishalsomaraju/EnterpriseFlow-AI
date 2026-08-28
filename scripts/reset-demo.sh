#!/bin/bash
set -e

echo "=== EnterpriseFlow Demo Reset ==="

ROOT_DIR=$(dirname $(dirname $(realpath $0)))
DEMO_REPO="$ROOT_DIR/demo-repository/invoice-automation"
BASELINE_DIR="$ROOT_DIR/demo-repository/invoice-automation-baseline"
BOB_WORKSPACE="$ROOT_DIR/bob-workspace"

# 1. Restore demo repository from baseline
echo "[1/4] Restoring demo-repository to clean baseline..."
rm -rf "$DEMO_REPO"
cp -r "$BASELINE_DIR" "$DEMO_REPO"

# 2. Reset git in demo repository
echo "[2/4] Initializing clean git history in demo repository..."
cd "$DEMO_REPO"
git init -q
git config user.email "bob@enterpriseflow.ai"
git config user.name "IBM Bob"
git add -A
git commit -q -m "baseline: invoice automation with known deficiencies (4 tests pass, 18 acceptance criteria pending)"

# 3. Clean up bob-workspace evidence artifacts
echo "[3/4] Cleaning bob-workspace evidence directories..."
mkdir -p "$BOB_WORKSPACE/plans" "$BOB_WORKSPACE/activities" "$BOB_WORKSPACE/changes" "$BOB_WORKSPACE/tests" "$BOB_WORKSPACE/security" "$BOB_WORKSPACE/documentation"
rm -f "$BOB_WORKSPACE/plans"/* "$BOB_WORKSPACE/activities"/* "$BOB_WORKSPACE/changes"/* "$BOB_WORKSPACE/tests"/* "$BOB_WORKSPACE/security"/* "$BOB_WORKSPACE/documentation"/* 2>/dev/null || true

# 4. Reset and re-seed database
echo "[4/4] Resetting and re-seeding database..."
cd "$ROOT_DIR/backend"
npx tsx src/db/reset.ts

echo "=== ✅ Demo environment reset successfully! ==="
