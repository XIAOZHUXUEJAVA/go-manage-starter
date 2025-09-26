.PHONY: help build run test test-unit test-integration test-integration-skip test-connection check-connections test-coverage clean dev dev-local dev-test run-prod run-staging migrate seed docs fmt lint security docker-build docker-run docker-stop db-reset setup ci ci-full

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "🏗️  Build & Run:"
	@echo "  build           - Build the application"
	@echo "  run             - Run the application"
	@echo "  dev             - Run in development mode (alias for dev-local)"
	@echo ""
	@echo "🚀 Environment-specific startup:"
	@echo "  dev-local       - Start in LOCAL development environment"
	@echo "  dev-test        - Start in TEST environment"
	@echo "  run-prod        - Start in PRODUCTION environment"
	@echo "  run-staging     - Start in STAGING environment"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  check-connections - Quick connection check (recommended first step)"
	@echo "  test-connection - Test database and Redis connections"
	@echo "  test            - Run all tests"
	@echo "  test-unit       - Run unit tests only"
	@echo "  test-integration - Run integration tests only (requires database)"
	@echo "  test-integration-skip - Skip integration tests (short mode)"
	@echo "  test-coverage   - Run tests with coverage report"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  migrate         - Run database migrations"
	@echo "  seed            - Seed database with sample data"
	@echo "  db-reset        - Reset database (migrate + seed)"
	@echo ""
	@echo "🛠️  Development Tools:"
	@echo "  docs            - Generate API documentation"
	@echo "  fmt             - Format code"
	@echo "  lint            - Lint code"
	@echo "  security        - Run security check"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-build    - Build Docker image"
	@echo "  docker-run      - Run with Docker Compose"
	@echo "  docker-stop     - Stop Docker Compose"
	@echo ""
	@echo "🔧 Utilities:"
	@echo "  clean           - Clean build artifacts"
	@echo "  setup           - Full development setup"
	@echo "  ci              - CI pipeline (without database)"
	@echo "  ci-full         - Full CI pipeline (with database)"

# Build the application
build:
	go build -o bin/server ./cmd/server

# Run the application
run: build
	./bin/server

# Development mode (alias for dev-local)
dev: dev-local

# Environment-specific startup commands
dev-local:
	@echo "🚀 Starting in LOCAL development environment..."
	ENVIRONMENT=development go run ./cmd/server

dev-test:
	@echo "🧪 Starting in TEST environment..."
	ENVIRONMENT=test go run ./cmd/server

run-prod:
	@echo "🏭 Starting in PRODUCTION environment..."
	ENVIRONMENT=production go run ./cmd/server

run-staging:
	@echo "🎭 Starting in STAGING environment..."
	ENVIRONMENT=staging go run ./cmd/server

# Test database and Redis connections
dev-connection:
	@echo "🔌 Testing database and Redis connections..."
	ENVIRONMENT=development go test ./test/connection/... -v

test-connection:
	@echo "🔌 Testing database and Redis connections..."
	ENVIRONMENT=test go test ./test/connection/... -v
	
prod-connection:
	@echo "🔌 Testing database and Redis connections..."
	ENVIRONMENT=production go test ./test/connection/... -v
# Quick connection check (using script)
check-connections:
	@./scripts/test-connections.sh

# Run all tests
test:
	go test ./... -v

# Run unit tests only (exclude integration tests)
test-unit:
	go test ./internal/... ./pkg/... -short -v

# Run integration tests only (requires database connection)
test-integration:
	@echo "Running integration tests (requires database)..."
	go test ./test/integration/... -v

# Skip integration tests (useful for CI without database)
test-integration-skip:
	@echo "Skipping integration tests (short mode)..."
	go test ./test/integration/... -v -short

# Run tests with coverage
test-coverage:
	go test ./... -coverprofile=coverage.out -v
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run database migrations
migrate:
	go run ./cmd/migrate

# Seed database with sample data
seed:
	go run ./cmd/seed

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html
	rm -f server.log

# Generate API documentation
docs:
	swag init -g ./cmd/server/main.go -o ./docs

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# Run security check (requires gosec)
security:
	gosec ./...

# Docker commands
docker-build:
	docker build -t go-manage-starter .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

# Database commands
db-reset: migrate seed

# Full development setup
setup: test-connection migrate seed
	@echo "Development environment setup complete!"

# CI/CD pipeline simulation (without database)
ci: fmt lint security test-unit test-integration-skip
	@echo "CI pipeline completed successfully!"

# Full CI/CD pipeline (with database)
ci-full: fmt lint security test-unit test-integration
	@echo "Full CI pipeline completed successfully!"