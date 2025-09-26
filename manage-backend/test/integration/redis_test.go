package integration

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/test/helpers"
)

func TestRedisConnection(t *testing.T) {
	// Setup test environment and load configuration
	cfg := helpers.SetupTestEnvironment(t)
	defer helpers.CleanupTestEnvironment()
	
	// Create Redis client
	redisClient := cache.NewRedisClient(cfg.Redis)
	require.NotNil(t, redisClient, "Redis client should not be nil")

	ctx := context.Background()

	// Test basic ping (connection test)
	err := redisClient.Set(ctx, "ping_test", "pong", time.Second*10)
	assert.NoError(t, err, "Failed to set ping test value")

	// Test get
	value, err := redisClient.Get(ctx, "ping_test")
	assert.NoError(t, err, "Failed to get ping test value")
	assert.Equal(t, "pong", value, "Retrieved value should match set value")

	// Clean up
	err = redisClient.Del(ctx, "ping_test")
	assert.NoError(t, err, "Failed to delete test key")

	// Close connection
	redisClient.Close()
}

func TestRedisOperations(t *testing.T) {
	// Setup test environment and load configuration
	cfg := helpers.SetupTestEnvironment(t)
	defer helpers.CleanupTestEnvironment()
	
	// Create Redis client
	redisClient := cache.NewRedisClient(cfg.Redis)
	require.NotNil(t, redisClient, "Redis client should not be nil")

	ctx := context.Background()
	testKey := "test_key_" + time.Now().Format("20060102150405")
	testValue := "test_value"

	// Test Set operation
	err := redisClient.Set(ctx, testKey, testValue, time.Minute)
	assert.NoError(t, err, "Failed to set test value")

	// Test Get operation
	retrievedValue, err := redisClient.Get(ctx, testKey)
	assert.NoError(t, err, "Failed to get test value")
	assert.Equal(t, testValue, retrievedValue, "Retrieved value should match set value")

	// Test Exists operation
	exists, err := redisClient.Exists(ctx, testKey)
	assert.NoError(t, err, "Failed to check if key exists")
	assert.Equal(t, int64(1), exists, "Key should exist")

	// Test Delete operation
	err = redisClient.Del(ctx, testKey)
	assert.NoError(t, err, "Failed to delete test key")

	// Verify key is deleted
	exists, err = redisClient.Exists(ctx, testKey)
	assert.NoError(t, err, "Failed to check if key exists after deletion")
	assert.Equal(t, int64(0), exists, "Key should not exist after deletion")

	// Test expiration
	expireKey := "expire_test_" + time.Now().Format("20060102150405")
	err = redisClient.Set(ctx, expireKey, "expire_value", time.Millisecond*100)
	assert.NoError(t, err, "Failed to set expiring value")

	// Wait for expiration
	time.Sleep(time.Millisecond * 150)

	// Key should be expired
	_, err = redisClient.Get(ctx, expireKey)
	assert.Error(t, err, "Key should be expired and not found")

	// Close connection
	redisClient.Close()
}

func TestRedisConnectionFailure(t *testing.T) {
	// Test with invalid Redis configuration (no need for test environment setup here)
	invalidCfg := config.Redis{
		Host:     "invalid_host",
		Port:     "9999",
		Password: "",
		DB:       0,
	}

	redisClient := cache.NewRedisClient(invalidCfg)
	require.NotNil(t, redisClient, "Redis client should not be nil even with invalid config")

	ctx := context.Background()

	// This should fail due to invalid connection
	err := redisClient.Set(ctx, "test", "value", time.Second)
	assert.Error(t, err, "Should fail to connect to invalid Redis server")

	redisClient.Close()
}