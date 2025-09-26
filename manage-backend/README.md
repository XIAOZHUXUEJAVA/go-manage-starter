# Go Management System Backend

A modern Go backend application built with Gin framework, following best practices for enterprise applications.

## Features

- **Web Framework**: Gin for high-performance HTTP routing
- **Configuration**: Viper for flexible configuration management
- **Logging**: Zap for structured, high-performance logging
- **Database**: GORM with PostgreSQL support
- **Caching**: Redis integration
- **Authentication**: JWT-based authentication
- **Authorization**: Casbin for access control (optional)
- **API Documentation**: Swagger/OpenAPI integration
- **Testing**: Testify framework
- **Database Migration**: golang-migrate support

## Project Structure

```
manage-backend/
├── cmd/server/          # Application entrypoints
├── internal/            # Private application code
│   ├── config/         # Configuration management
│   ├── handler/        # HTTP handlers (controllers)
│   ├── middleware/     # HTTP middleware
│   ├── model/          # Data models
│   ├── repository/     # Data access layer
│   ├── service/        # Business logic layer
│   └── utils/          # Utility functions
├── pkg/                # Public library code
│   ├── auth/           # Authentication utilities
│   ├── cache/          # Cache utilities
│   ├── database/       # Database utilities
│   └── logger/         # Logging utilities
├── api/v1/             # API version 1 definitions
├── docs/               # Swagger documentation
├── migrations/         # Database migrations
├── scripts/            # Build and deployment scripts
└── test/               # Test files
```

## Quick Start

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 12.0 or higher
- Redis 6.0 or higher (optional)

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd manage-backend
```

2. Install dependencies:

```bash
go mod tidy
```

3. Copy configuration file:

```bash
cp config.yaml.example config.yaml
# or
cp .env.example .env
```

4. Update configuration with your database credentials

5. Run database migrations:

```bash
make migrate-up
```

6. Generate Swagger documentation:

```bash
make swagger
```

7. Run the application:

```bash
make run
# or for development with hot reload
make dev
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login

### Users (Protected)

- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users` - List users (with pagination)

### Documentation

- `GET /swagger/index.html` - Swagger UI
- `GET /health` - Health check endpoint

## Configuration

The application supports configuration via:

1. YAML file (`config.yaml`)
2. Environment variables
3. Default values

### Environment Variables

```bash
ENVIRONMENT=development
PORT=8080
LOG_LEVEL=info
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=go_manage_starter
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
JWT_SECRET=your-secret-key
JWT_EXPIRE_TIME=24
```

## Development

### Available Make Commands

```bash
make build        # Build the application
make run          # Run the application
make test         # Run tests
make clean        # Clean build artifacts
make swagger      # Generate swagger docs
make migrate-up   # Run database migrations up
make migrate-down # Run database migrations down
make deps         # Install dependencies
make fmt          # Format code
make lint         # Lint code
make dev          # Run with hot reload (requires air)
```

### Testing

#### Run All Tests

```bash
make test
```

#### Run Integration Tests (Database & Redis)

```bash
make test-integration
```

#### Run Connection Tests Specifically

```bash
make test-connections
```

#### Run Database Tests Only

```bash
make test-db
```

#### Run Redis Tests Only

```bash
make test-redis
```

#### Run Tests with Coverage

```bash
make test-coverage
```

#### Quick Connection Test Script

For a quick check of your database and Redis connections:

**Linux/macOS:**

```bash
./scripts/test-connections.sh
```

**Windows:**

```cmd
scripts\test-connections.bat
```

#### Test Configuration

Tests use the same configuration system as the main application. You can:

1. Use environment variables for test-specific settings
2. Create a `test/config/test.yaml` file for test configuration
3. Set `ENVIRONMENT=test` to use test-specific defaults

#### Before Running Tests

Make sure you have:

1. PostgreSQL running and accessible
2. Redis running and accessible (optional, but recommended)
3. Test database created (can be different from production database)
4. Proper credentials configured

#### Test Database Setup

Create a test database:

```sql
CREATE DATABASE go_manage_starter_test;
```

Or use environment variables:

```bash
export DB_NAME=go_manage_starter_test
export REDIS_DB=1  # Use different Redis DB for tests
```

### Database Migrations

Create a new migration:

```bash
migrate create -ext sql -dir migrations -seq migration_name
```

Run migrations:

```bash
make migrate-up
```

Rollback migrations:

```bash
make migrate-down
```

## Deployment

1. Build the application:

```bash
make build
```

2. Set environment variables for production
3. Run the binary:

```bash
./bin/server
```

## Contributing

1. Follow Go coding standards
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages
