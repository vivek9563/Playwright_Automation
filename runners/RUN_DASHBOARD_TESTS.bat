@echo off
REM Vedak CRM - Dashboard Major Functionality Tests
REM This script runs only the dashboard test cases (Windows)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          VEDAK CRM - DASHBOARD TEST EXECUTION             ║
echo ║          Running Dashboard Major Functionality Tests       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 Test Suite: Dashboard Major Functionality
echo 🧪 Total Tests: 16
echo 📍 Test File: modules/dashboard/test-cases/dashboard-tests/dashboard-major-func-tests-fixed.js
echo ⚙️  Mode: Non-Headless
echo.
echo Starting test execution...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Run dashboard major tests
node modules\dashboard\test-cases\dashboard-tests\dashboard-major-func-tests-fixed.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ✅ Dashboard tests completed successfully
) else (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ❌ Dashboard tests failed
)

echo.
pause
