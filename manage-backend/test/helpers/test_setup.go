package helpers

import (
	"os"
	"testing"

	"github.com/spf13/viper"
	"github.com/yourname/go-manage-starter/internal/config"
)

// SetupTestEnvironment initializes the test environment and returns a clean config
func SetupTestEnvironment(t *testing.T) *config.Config {
	// Set test environment BEFORE resetting viper
	os.Setenv("ENVIRONMENT", "test")
	
	// Reset viper to ensure clean state
	viper.Reset()
	
	// Load test configuration
	cfg := config.Load()
	
	// Debug: Print configuration details
	t.Logf("Test config loaded - Environment: %s, DB_USER: %s, DB_NAME: %s", 
		cfg.Environment, cfg.Database.User, cfg.Database.Name)
	
	// Verify we're using test configuration
	if cfg.Environment != "test" {
		t.Fatalf("Expected test environment, got: %s", cfg.Environment)
	}
	
	return cfg
}

// CleanupTestEnvironment cleans up after tests
func CleanupTestEnvironment() {
	// Reset environment variables if needed
	os.Unsetenv("ENVIRONMENT")
	
	// Reset viper
	viper.Reset()
}