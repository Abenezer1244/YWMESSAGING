#!/bin/bash

# Phase 3 Task 3.2: Run Performance Baseline Tests
# Creates baseline metrics for regression detection

set -e

echo "════════════════════════════════════════════════════════"
echo "PHASE 3 TASK 3.2: CREATE PERFORMANCE BASELINE"
echo "════════════════════════════════════════════════════════"
echo ""

# Configuration
API_URL="${1:-http://localhost:3000}"
OUTPUT_DIR="benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BASELINE_FILE="$OUTPUT_DIR/k6-baseline-$TIMESTAMP.json"

echo "Configuration:"
echo "  API URL: $API_URL"
echo "  Output: $BASELINE_FILE"
echo ""

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed"
    echo "Install: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo "k6 version: $(k6 --version)"
echo ""

# Run baseline tests
echo "Starting baseline tests..."
echo "  Smoke Test (5m)..."
k6 run scripts/k6-baseline.js \
    -o json=$BASELINE_FILE \
    --scenario smoke \
    --env BASE_URL=$API_URL \
    2>&1 | tail -20

echo ""
echo "✅ Baseline test complete!"
echo "   Results saved to: $BASELINE_FILE"
echo ""

# Parse and display results
echo "Generating baseline report..."
node scripts/analyze-baseline.js $BASELINE_FILE

echo ""
echo "════════════════════════════════════════════════════════"
echo "NEXT STEPS:"
echo "1. Review baseline metrics above"
echo "2. Store baseline for comparison: cp $BASELINE_FILE benchmarks/main-baseline.json"
echo "3. Run full test suite: ./scripts/run-full-baseline.sh"
echo "4. Set up monitoring: Task 3.3"
echo "════════════════════════════════════════════════════════"
echo ""
