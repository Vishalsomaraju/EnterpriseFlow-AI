#!/bin/bash
set -e

echo "Resetting demo repository to baseline..."

ROOT_DIR=$(dirname $(dirname $(realpath $0)))
DEMO_REPO="$ROOT_DIR/demo-repository/invoice-automation"
BASELINE_DIR="$ROOT_DIR/demo-repository/invoice-automation-baseline"

if [ ! -d "$BASELINE_DIR" ]; then
  echo "Baseline directory not found. Creating it from current demo-repository state..."
  if [ -d "$DEMO_REPO" ]; then
    cp -r "$DEMO_REPO" "$BASELINE_DIR"
  else
    echo "Creating empty baseline directory..."
    mkdir -p "$BASELINE_DIR/src/backend"
    mkdir -p "$BASELINE_DIR/src/frontend"
    echo '{"name": "invoice-automation"}' > "$BASELINE_DIR/package.json"
  fi
fi

# Remove existing demo repo
rm -rf "$DEMO_REPO"

# Copy baseline back
cp -r "$BASELINE_DIR" "$DEMO_REPO"

echo "Demo repository reset to baseline successfully."
