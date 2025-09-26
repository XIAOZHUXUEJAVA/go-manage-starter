package integration

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/yourname/go-manage-starter/pkg/database"
	"github.com/yourname/go-manage-starter/test/helpers"
)

func TestDatabaseConnection(t *testing.T) {
	// Setup test environment and load configuration
	cfg := helpers.SetupTestEnvironment(t)
	defer helpers.CleanupTestEnvironment()
	
	// Test database connection
	db, err := database.Init(cfg.Database)
	require.NoError(t, err, "Failed to connect to database")
	require.NotNil(t, db, "Database instance should not be nil")

	// Test database ping
	sqlDB, err := db.DB()
	require.NoError(t, err, "Failed to get underlying sql.DB")
	
	err = sqlDB.Ping()
	assert.NoError(t, err, "Failed to ping database")

	// Test basic query
	var result int
	err = db.Raw("SELECT 1").Scan(&result).Error
	assert.NoError(t, err, "Failed to execute basic query")
	assert.Equal(t, 1, result, "Query result should be 1")

	// Clean up
	sqlDB.Close()
}

func TestDatabaseMigration(t *testing.T) {
	// Setup test environment and load configuration
	cfg := helpers.SetupTestEnvironment(t)
	defer helpers.CleanupTestEnvironment()
	
	// Test database connection
	db, err := database.Init(cfg.Database)
	require.NoError(t, err, "Failed to connect to database")
	
	// Test if we can create a test table (simulating migration)
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS test_table (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`).Error
	assert.NoError(t, err, "Failed to create test table")

	// Test insert
	err = db.Exec("INSERT INTO test_table (name) VALUES (?)", "test").Error
	assert.NoError(t, err, "Failed to insert test data")

	// Test select
	var count int64
	err = db.Raw("SELECT COUNT(*) FROM test_table WHERE name = ?", "test").Scan(&count).Error
	assert.NoError(t, err, "Failed to count test data")
	assert.Greater(t, count, int64(0), "Should have at least one test record")

	// Clean up test table
	db.Exec("DROP TABLE IF EXISTS test_table")
	
	// Close connection
	sqlDB, _ := db.DB()
	sqlDB.Close()
}