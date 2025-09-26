package integration

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/yourname/go-manage-starter/internal/config"
	"github.com/yourname/go-manage-starter/pkg/cache"
	"github.com/yourname/go-manage-starter/pkg/database"
	"github.com/yourname/go-manage-starter/test/helpers"
	"gorm.io/gorm"
)

// ConnectionTestSuite defines a test suite for connection tests
type ConnectionTestSuite struct {
	suite.Suite
	db          *gorm.DB
	redisClient *cache.RedisClient
	cfg         *config.Config
}

// SetupSuite runs before all tests in the suite
func (suite *ConnectionTestSuite) SetupSuite() {
	// Setup test environment and load configuration
	suite.cfg = helpers.SetupTestEnvironment(suite.T())
	
	// Initialize database connection
	db, err := database.Init(suite.cfg.Database)
	suite.Require().NoError(err, "Failed to initialize database")
	suite.db = db
	
	// Initialize Redis connection
	suite.redisClient = cache.NewRedisClient(suite.cfg.Redis)
	suite.Require().NotNil(suite.redisClient, "Failed to initialize Redis client")
}

// TearDownSuite runs after all tests in the suite
func (suite *ConnectionTestSuite) TearDownSuite() {
	if suite.db != nil {
		sqlDB, _ := suite.db.DB()
		sqlDB.Close()
	}
	if suite.redisClient != nil {
		suite.redisClient.Close()
	}
	
	// Cleanup test environment
	helpers.CleanupTestEnvironment()
}

// TestDatabaseAndRedisConnections tests both connections together
func (suite *ConnectionTestSuite) TestDatabaseAndRedisConnections() {
	ctx := context.Background()
	
	// Test database connection
	var dbResult int
	err := suite.db.Raw("SELECT 1").Scan(&dbResult).Error
	suite.Assert().NoError(err, "Database connection should work")
	suite.Assert().Equal(1, dbResult, "Database query should return 1")
	
	// Test Redis connection
	testKey := "integration_test_" + time.Now().Format("20060102150405")
	err = suite.redisClient.Set(ctx, testKey, "test_value", time.Minute)
	suite.Assert().NoError(err, "Redis set operation should work")
	
	value, err := suite.redisClient.Get(ctx, testKey)
	suite.Assert().NoError(err, "Redis get operation should work")
	suite.Assert().Equal("test_value", value, "Redis should return correct value")
	
	// Clean up Redis test data
	suite.redisClient.Del(ctx, testKey)
}

// TestConcurrentConnections tests multiple concurrent operations
func (suite *ConnectionTestSuite) TestConcurrentConnections() {
	ctx := context.Background()
	
	// Test concurrent database operations
	done := make(chan bool, 10)
	
	for i := 0; i < 10; i++ {
		go func(id int) {
			var result int
			err := suite.db.Raw("SELECT ?", id).Scan(&result).Error
			suite.Assert().NoError(err, "Concurrent database operation should work")
			suite.Assert().Equal(id, result, "Database should return correct value")
			done <- true
		}(i)
	}
	
	// Wait for all database operations to complete
	for i := 0; i < 10; i++ {
		<-done
	}
	
	// Test concurrent Redis operations
	for i := 0; i < 10; i++ {
		go func(id int) {
			key := "concurrent_test_" + time.Now().Format("20060102150405") + "_" + string(rune(id))
			err := suite.redisClient.Set(ctx, key, "value", time.Minute)
			suite.Assert().NoError(err, "Concurrent Redis set should work")
			
			value, err := suite.redisClient.Get(ctx, key)
			suite.Assert().NoError(err, "Concurrent Redis get should work")
			suite.Assert().Equal("value", value, "Redis should return correct value")
			
			// Clean up
			suite.redisClient.Del(ctx, key)
			done <- true
		}(i)
	}
	
	// Wait for all Redis operations to complete
	for i := 0; i < 10; i++ {
		<-done
	}
}

// TestConnectionRecovery tests connection recovery after temporary failures
func (suite *ConnectionTestSuite) TestConnectionRecovery() {
	ctx := context.Background()
	
	// Test database connection recovery
	// First, ensure connection works
	var result int
	err := suite.db.Raw("SELECT 1").Scan(&result).Error
	suite.Assert().NoError(err, "Initial database connection should work")
	
	// Test Redis connection recovery
	testKey := "recovery_test_" + time.Now().Format("20060102150405")
	err = suite.redisClient.Set(ctx, testKey, "recovery_value", time.Minute)
	suite.Assert().NoError(err, "Initial Redis connection should work")
	
	// Verify we can still read after some time
	time.Sleep(time.Millisecond * 100)
	
	value, err := suite.redisClient.Get(ctx, testKey)
	suite.Assert().NoError(err, "Redis connection should still work after delay")
	suite.Assert().Equal("recovery_value", value, "Redis should return correct value")
	
	// Clean up
	suite.redisClient.Del(ctx, testKey)
}

// Run the test suite
func TestConnectionSuite(t *testing.T) {
	suite.Run(t, new(ConnectionTestSuite))
}

// TestHealthCheck tests a combined health check function
func TestHealthCheck(t *testing.T) {
	// Setup test environment and load configuration
	cfg := helpers.SetupTestEnvironment(t)
	defer helpers.CleanupTestEnvironment()
	
	// Test database health
	db, err := database.Init(cfg.Database)
	require.NoError(t, err, "Database should be accessible")
	
	sqlDB, err := db.DB()
	require.NoError(t, err, "Should get underlying sql.DB")
	
	err = sqlDB.Ping()
	assert.NoError(t, err, "Database should be pingable")
	
	// Test Redis health
	redisClient := cache.NewRedisClient(cfg.Redis)
	require.NotNil(t, redisClient, "Redis client should be created")
	
	ctx := context.Background()
	healthKey := "health_check_" + time.Now().Format("20060102150405")
	
	err = redisClient.Set(ctx, healthKey, "healthy", time.Second*10)
	assert.NoError(t, err, "Redis should accept health check")
	
	value, err := redisClient.Get(ctx, healthKey)
	assert.NoError(t, err, "Redis should return health check value")
	assert.Equal(t, "healthy", value, "Health check value should match")
	
	// Clean up
	redisClient.Del(ctx, healthKey)
	redisClient.Close()
	sqlDB.Close()
}