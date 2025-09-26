@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Go Management System in Development Mode...

REM Check if Go is installed
go version >nul 2>&1
if errorlevel 1 (
    echo ❌ Go is not installed or not in PATH
    exit /b 1
)

echo ℹ️ Go version:
go version

REM Set development environment
set ENVIRONMENT=development

echo ℹ️ Checking development database connection...
make test-dev >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Development database connection failed
    echo 💡 Make sure PostgreSQL is running and the database exists
    echo 💡 You can create it by running: make setup-dev-db
    echo.
    set /p continue="Do you want to continue anyway? (y/N): "
    if /i not "!continue!"=="y" (
        exit /b 1
    )
) else (
    echo ✅ Development database connection successful
)

echo ℹ️ Starting development server on port 8080...
echo ℹ️ API will be available at: http://localhost:8080
echo ℹ️ Swagger documentation: http://localhost:8080/swagger/index.html
echo ℹ️ Health check: http://localhost:8080/health
echo.
echo ℹ️ Press Ctrl+C to stop the server
echo.

REM Run the server
make run-dev

pause