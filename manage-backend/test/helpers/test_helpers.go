package helpers

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
	"gorm.io/gorm"
)

// TestDatabase holds database connection for tests
type TestDatabase struct {
	DB *gorm.DB
}

// TestRedis holds Redis connection for tests
type TestRedis struct {
	Client *cache.RedisClient
}

// SetupTestDatabase creates a test database connection
func SetupTestDatabase(t *testing.T) *TestDatabase {
	// Reset viper configuration
	viper.Reset()
	
	// Set test environment
	os.Setenv("ENVIRONMENT", "test")
	
	cfg := config.Load()
	
	db, err := database.Init(cfg.Database)
	require.NoError(t, err, "Failed to setup test database")
	
	return &TestDatabase{DB: db}
}

// TeardownTestDatabase closes the test database connection
func (td *TestDatabase) TeardownTestDatabase() {
	if td.DB != nil {
		sqlDB, _ := td.DB.DB()
		sqlDB.Close()
	}
}

// CleanupTestData removes test data from database
func (td *TestDatabase) CleanupTestData() {
	// Add cleanup queries for test tables
	td.DB.Exec("DELETE FROM users WHERE username LIKE 'test_%'")
}

// SetupTestRedis creates a test Redis connection
func SetupTestRedis(t *testing.T) *TestRedis {
	// Reset viper configuration
	viper.Reset()
	
	// Set test environment
	os.Setenv("ENVIRONMENT", "test")
	
	cfg := config.Load()
	
	client := cache.NewRedisClient(cfg.Redis)
	require.NotNil(t, client, "Failed to setup test Redis")
	
	return &TestRedis{Client: client}
}

// TeardownTestRedis closes the test Redis connection
func (tr *TestRedis) TeardownTestRedis() {
	if tr.Client != nil {
		tr.Client.Close()
	}
}

// CleanupTestData removes test data from Redis
func (tr *TestRedis) CleanupTestData(ctx context.Context) {
	// Clean up test keys (keys starting with "test_")
	// Note: In production, you might want to use SCAN instead of KEYS
	// This is just for testing purposes
}

// WaitForConnection waits for a service to be available
func WaitForConnection(t *testing.T, testFunc func() error, maxRetries int, delay time.Duration) {
	var err error
	for i := 0; i < maxRetries; i++ {
		err = testFunc()
		if err == nil {
			return
		}
		t.Logf("Connection attempt %d failed: %v", i+1, err)
		time.Sleep(delay)
	}
	require.NoError(t, err, fmt.Sprintf("Failed to establish connection after %d retries", maxRetries))
}

// TestDatabaseConnection tests if database is reachable
func TestDatabaseConnection(cfg config.Database) error {
	db, err := database.Init(cfg)
	if err != nil {
		return err
	}
	
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()
	
	return sqlDB.Ping()
}

// TestRedisConnection tests if Redis is reachable
func TestRedisConnection(cfg config.Redis) error {
	client := cache.NewRedisClient(cfg)
	defer client.Close()
	
	ctx := context.Background()
	return client.Set(ctx, "ping_test", "pong", time.Second)
}

// CreateTestUser creates a test user in database
func (td *TestDatabase) CreateTestUser(username, email string) error {
	query := `
		INSERT INTO users (username, email, password, role, status, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, NOW(), NOW())
	`
	return td.DB.Exec(query, username, email, "hashed_password", "user", "active").Error
}

// DeleteTestUser removes a test user from database
func (td *TestDatabase) DeleteTestUser(username string) error {
	return td.DB.Exec("DELETE FROM users WHERE username = ?", username).Error
}

// GetTestUserCount returns the number of test users
func (td *TestDatabase) GetTestUserCount() (int64, error) {
	var count int64
	err := td.DB.Raw("SELECT COUNT(*) FROM users WHERE username LIKE 'test_%'").Scan(&count).Error
	return count, err
}