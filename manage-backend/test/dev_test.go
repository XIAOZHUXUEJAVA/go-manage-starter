package test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
)

// TestDevelopmentConfig tests the development configuration loading
func TestDevelopmentConfig(t *testing.T) {
	// Ensure we're in development mode (default)
	os.Unsetenv("ENVIRONMENT")
	
	// Load development configuration
	cfg := config.Load()
	
	// Verify development configuration
	assert.Equal(t, "development", cfg.Environment)
	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, "go_manage_starter", cfg.Database.Name)
	assert.Equal(t, 0, cfg.Redis.DB) // Development uses Redis DB 0
	
	t.Logf("Development config loaded - Environment: %s, DB_NAME: %s, PORT: %s", 
		cfg.Environment, cfg.Database.Name, cfg.Port)
}

// TestDevelopmentDatabaseConnection tests development database connection
func TestDevelopmentDatabaseConnection(t *testing.T) {
	// Ensure we're in development mode
	os.Unsetenv("ENVIRONMENT")
	
	cfg := config.Load()
	
	// Test database connection
	db, err := database.Init(cfg.Database)
	require.NoError(t, err, "Failed to connect to development database")
	require.NotNil(t, db, "Database instance should not be nil")

	// Test database ping
	sqlDB, err := db.DB()
	require.NoError(t, err, "Failed to get underlying sql.DB")
	
	err = sqlDB.Ping()
	assert.NoError(t, err, "Failed to ping development database")

	// Test basic query
	var result int
	err = db.Raw("SELECT 1").Scan(&result).Error
	assert.NoError(t, err, "Failed to execute basic query on development database")
	assert.Equal(t, 1, result, "Query result should be 1")

	// Clean up
	sqlDB.Close()
	
	t.Log("✅ Development database connection successful")
}

// TestDevelopmentRedisConnection tests development Redis connection
func TestDevelopmentRedisConnection(t *testing.T) {
	// Ensure we're in development mode
	os.Unsetenv("ENVIRONMENT")
	
	cfg := config.Load()
	
	// Create Redis client
	redisClient := cache.NewRedisClient(cfg.Redis)
	require.NotNil(t, redisClient, "Redis client should not be nil")

	// Test basic Redis operations
	ctx := context.Background()
	testKey := "dev_test_key"
	testValue := "dev_test_value"

	// Test Set operation
	err := redisClient.Set(ctx, testKey, testValue, time.Minute)
	assert.NoError(t, err, "Failed to set value in development Redis")

	// Test Get operation
	retrievedValue, err := redisClient.Get(ctx, testKey)
	assert.NoError(t, err, "Failed to get value from development Redis")
	assert.Equal(t, testValue, retrievedValue, "Retrieved value should match set value")

	// Clean up
	redisClient.Del(ctx, testKey)
	redisClient.Close()
	
	t.Log("✅ Development Redis connection successful")
}