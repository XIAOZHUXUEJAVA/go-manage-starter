.PHONY: build run test clean swagger migrate-up migrate-down

# Build the application
build:
	go build -o bin/server cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run tests
test:
	go test -v ./...

# Run integration tests
test-integration:
	go test -v ./test/integration/...

# Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Run connection tests specifically
test-connections:
	go test -v ./test/integration/ -run TestConnection

# Run database tests
test-db:
	go test -v ./test/integration/ -run TestDatabase

# Run Redis tests  
test-redis:
	go test -v ./test/integration/ -run TestRedis

# Test development environment
test-dev:
	go test -v ./test/ -run TestDevelopment

# Setup development database
setup-dev-db:
	psql -U postgres -h localhost -f scripts/setup-dev-db.sql

# Run development server
run-dev:
	ENVIRONMENT=development go run cmd/server/main.go

# Run production server
run-prod:
	ENVIRONMENT=production go run cmd/server/main.go

# Clean build artifacts
clean:
	rm -rf bin/

# Generate swagger documentation
swagger:
	swag init -g cmd/server/main.go -o docs

# 数据库迁移 (使用 GORM)
migrate-up:
	@echo "Running database migrations..."
	@ENVIRONMENT=development go run cmd/migrate/main.go -action=up

migrate-down:
	@echo "Rolling back migration..."
	@ENVIRONMENT=development go run cmd/migrate/main.go -action=down -id=$(id)

migrate-status:
	@echo "Checking migration status..."
	@ENVIRONMENT=development go run cmd/migrate/main.go -action=status

migrate-reset:
	@echo "Resetting database..."
	@ENVIRONMENT=development go run cmd/migrate/main.go -action=reset

# 数据库种子数据
seed:
	@echo "Seeding database..."
	@ENVIRONMENT=development go run cmd/seed/main.go -action=seed

seed-clean:
	@echo "Cleaning database..."
	@ENVIRONMENT=development go run cmd/seed/main.go -action=clean

seed-reset:
	@echo "Resetting and seeding database..."
	@ENVIRONMENT=development go run cmd/seed/main.go -action=reset

# 数据库完整设置
db-setup: migrate-up seed
	@echo "Database setup completed"

db-reset: migrate-reset seed
	@echo "Database reset completed"

# Install dependencies
deps:
	go mod tidy
	go mod download

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Run the application in development mode with hot reload
dev:
	air