#!/bin/bash

# k6 Load Testing Helper Script
# Runs different load test scenarios with proper configuration

BASE_URL=${BASE_URL:-"http://localhost:3000"}
SCENARIO=${1:-"smoke"}

echo "========================================"
echo "YWMESSAGING Load Testing"
echo "========================================"
echo "Base URL: $BASE_URL"
echo "Scenario: $SCENARIO"
echo ""

case $SCENARIO in
  smoke)
    echo "Running Smoke Test (1 user, 5 iterations)..."
    k6 run \
      --vus 1 \
      --iterations 5 \
      --duration 2m \
      --env BASE_URL="$BASE_URL" \
      scripts/loadtest.k6.js
    ;;

  load)
    echo "Running Load Test (10-50 concurrent users, 30s sustained)..."
    k6 run \
      --scenario load \
      --env BASE_URL="$BASE_URL" \
      scripts/loadtest.k6.js
    ;;

  spike)
    echo "Running Spike Test (1->50 users, burst test)..."
    k6 run \
      --scenario spike \
      --env BASE_URL="$BASE_URL" \
      scripts/loadtest.k6.js
    ;;

  soak)
    echo "Running Soak Test (5 users, 5 minute sustained load)..."
    k6 run \
      --scenario soak \
      --env BASE_URL="$BASE_URL" \
      scripts/loadtest.k6.js
    ;;

  conversation)
    echo "Running Conversation Reply Test (0-20 users, 30s sustained)..."
    k6 run \
      --scenario conversation \
      --env BASE_URL="$BASE_URL" \
      scripts/loadtest.k6.js
    ;;

  all)
    echo "Running ALL scenarios sequentially..."
    echo ""

    echo "1. Smoke Test..."
    k6 run --scenario smoke --env BASE_URL="$BASE_URL" scripts/loadtest.k6.js

    echo ""
    echo "2. Load Test..."
    k6 run --scenario load --env BASE_URL="$BASE_URL" scripts/loadtest.k6.js

    echo ""
    echo "3. Spike Test..."
    k6 run --scenario spike --env BASE_URL="$BASE_URL" scripts/loadtest.k6.js

    echo ""
    echo "4. Conversation Test..."
    k6 run --scenario conversation --env BASE_URL="$BASE_URL" scripts/loadtest.k6.js

    echo ""
    echo "All tests completed!"
    ;;

  *)
    echo "Unknown scenario: $SCENARIO"
    echo ""
    echo "Available scenarios:"
    echo "  smoke         - 1 user, 5 iterations (quick sanity check)"
    echo "  load          - 10-50 users, 30s sustained load"
    echo "  spike         - 1->50 users, burst test"
    echo "  soak          - 5 users, 5 minutes sustained load"
    echo "  conversation  - 0-20 users conversation reply test"
    echo "  all           - Run all scenarios sequentially"
    echo ""
    echo "Usage: ./scripts/run-loadtest.sh [scenario]"
    echo "       BASE_URL=http://example.com ./scripts/run-loadtest.sh load"
    exit 1
    ;;
esac
