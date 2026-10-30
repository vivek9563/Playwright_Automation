#!/bin/bash

# Vedak CRM - Dashboard Test Suite Runner
# This script runs only dashboard major functionality tests

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          VEDAK CRM - DASHBOARD TEST SUITE RUNNER           ║"
echo "║           Dashboard Major Functionality Tests              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running from correct directory
if [ ! -d "modules/dashboard" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: ~/Downloads/Vedak_Automation"
    exit 1
fi

echo "📋 Test Configuration:"
echo "   Total Tests: 16"
echo "   Categories: UI, Functionality, Major, Minor, Edge Cases"
echo ""

echo "🧪 Running Dashboard Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the test script
node modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js

# Capture the exit code
EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Dashboard Tests Execution Complete!"
    echo ""
    echo "📊 Results:"
    echo "   File: modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js"
    echo "   Status: ✓ All tests executed successfully"
    echo "   Report: Check terminal output above for detailed results"
    echo ""
    echo "📈 Next Steps:"
    echo "   1. Check Excel file: modules/dashboard/Vedak_CRM_Dashboard_Major_TestCases.xlsx"
    echo "   2. View HTML report: reports/Dashboard_Major_Test_Report.html"
    echo "   3. Update JSON results: reports/test-results/dashboard-major-results.json"
else
    echo ""
    echo "❌ Dashboard Tests Execution Failed!"
    echo "   Exit Code: $EXIT_CODE"
    echo "   Please check the error messages above"
fi

exit $EXIT_CODE
