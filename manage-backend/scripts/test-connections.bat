@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting connection tests...

REM Check if Go is installed
go version >nul 2>&1
if errorlevel 1 (
    echo ❌ Go is not installed or not in PATH
    exit /b 1
)

echo ℹ️ Go version:
go version

echo ℹ️ Ensuring Go dependencies are up to date...
go mod tidy
if errorlevel 1 (
    echo ❌ Failed to update Go dependencies
    exit /b 1
) else (
    echo ✅ Go dependencies updated
)

echo ℹ️ Running database connection tests...
go test -v ./test/integration/ -run TestDatabase
if errorlevel 1 (
    echo ❌ Database connection tests failed
    echo 💡 Make sure PostgreSQL is running and accessible with the configured credentials
    echo 💡 Check your configuration in config.yaml or environment variables
) else (
    echo ✅ Database connection tests passed
)

echo ℹ️ Running Redis connection tests...
go test -v ./test/integration/ -run TestRedis
if errorlevel 1 (
    echo ❌ Redis connection tests failed
    echo 💡 Make sure Redis is running and accessible with the configured credentials
    echo 💡 Check your configuration in config.yaml or environment variables
) else (
    echo ✅ Redis connection tests passed
)

echo ℹ️ Running comprehensive connection tests...
go test -v ./test/integration/ -run TestConnection
if errorlevel 1 (
    echo ❌ Comprehensive connection tests failed
) else (
    echo ✅ Comprehensive connection tests passed
)

echo.
echo 🎉 Connection testing completed!
echo.
echo 📋 Next steps:
echo 1. If tests passed, your connections are working correctly
echo 2. If tests failed, check your database and Redis configurations
echo 3. Make sure your services are running and accessible
echo 4. Check the error messages above for specific issues
echo.
echo 🔧 Configuration files to check:
echo - config.yaml (if using YAML config)
echo - .env (if using environment variables)
echo - Environment variables in your system

pause