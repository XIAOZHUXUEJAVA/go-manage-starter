#!/bin/bash

# Development environment startup script

set -e

echo "🚀 Starting Go Management System in Development Mode..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed or not in PATH"
    exit 1
fi

print_info "Go version: $(go version)"

# Set development environment
export ENVIRONMENT=development

# Check if development database exists
print_info "Checking development database connection..."
if make test-dev &> /dev/null; then
    print_success "Development database connection successful"
else
    echo "⚠️  Development database connection failed"
    echo "💡 Make sure PostgreSQL is running and the database exists"
    echo "💡 You can create it by running: make setup-dev-db"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the development server
print_info "Starting development server on port 8080..."
print_info "API will be available at: http://localhost:8080"
print_info "Swagger documentation: http://localhost:8080/swagger/index.html"
print_info "Health check: http://localhost:8080/health"
echo ""
print_info "Press Ctrl+C to stop the server"
echo ""

# Run the server
make run-dev