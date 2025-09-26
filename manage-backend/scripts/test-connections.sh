#!/bin/bash

# Test script for database and Redis connections
# This script helps you test the connections before running the full application

set -e

echo "🚀 Starting connection tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed or not in PATH${NC}"
    exit 1
fi

print_info "Go version: $(go version)"

# Check if PostgreSQL is running (optional check)
print_info "Checking if PostgreSQL is accessible..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        print_status 0 "PostgreSQL is running and accessible"
    else
        print_status 1 "PostgreSQL is not accessible (this might be okay if using different host/port)"
    fi
else
    print_info "pg_isready not found, skipping PostgreSQL connectivity check"
fi

# Check if Redis is running (optional check)
print_info "Checking if Redis is accessible..."
if command -v redis-cli &> /dev/null; then
    if redis-cli -h localhost -p 6379 ping &> /dev/null; then
        print_status 0 "Redis is running and accessible"
    else
        print_status 1 "Redis is not accessible (this might be okay if using different host/port)"
    fi
else
    print_info "redis-cli not found, skipping Redis connectivity check"
fi

# Run Go mod tidy to ensure dependencies are up to date
print_info "Ensuring Go dependencies are up to date..."
go mod tidy
print_status $? "Go dependencies updated"

# Run database connection tests
print_info "Running database connection tests..."
if go test -v ./test/integration/ -run TestDatabase; then
    print_status 0 "Database connection tests passed"
else
    print_status 1 "Database connection tests failed"
    echo -e "${YELLOW}💡 Make sure PostgreSQL is running and accessible with the configured credentials${NC}"
    echo -e "${YELLOW}💡 Check your configuration in config.yaml or environment variables${NC}"
fi

# Run Redis connection tests
print_info "Running Redis connection tests..."
if go test -v ./test/integration/ -run TestRedis; then
    print_status 0 "Redis connection tests passed"
else
    print_status 1 "Redis connection tests failed"
    echo -e "${YELLOW}💡 Make sure Redis is running and accessible with the configured credentials${NC}"
    echo -e "${YELLOW}💡 Check your configuration in config.yaml or environment variables${NC}"
fi

# Run comprehensive connection tests
print_info "Running comprehensive connection tests..."
if go test -v ./test/integration/ -run TestConnection; then
    print_status 0 "Comprehensive connection tests passed"
else
    print_status 1 "Comprehensive connection tests failed"
fi

echo ""
echo -e "${GREEN}🎉 Connection testing completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. If tests passed, your connections are working correctly"
echo "2. If tests failed, check your database and Redis configurations"
echo "3. Make sure your services are running and accessible"
echo "4. Check the error messages above for specific issues"
echo ""
echo -e "${YELLOW}🔧 Configuration files to check:${NC}"
echo "- config.yaml (if using YAML config)"
echo "- .env (if using environment variables)"
echo "- Environment variables in your shell"