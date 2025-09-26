package config

import (
	"log"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Environment string   `mapstructure:"ENVIRONMENT"`
	Port        string   `mapstructure:"PORT"`
	LogLevel    string   `mapstructure:"LOG_LEVEL"`
	Database    Database `mapstructure:",squash"`
	Redis       Redis    `mapstructure:",squash"`
	JWT         JWT      `mapstructure:",squash"`
}

type Database struct {
	Host     string `mapstructure:"DB_HOST"`
	Port     string `mapstructure:"DB_PORT"`
	User     string `mapstructure:"DB_USER"`
	Password string `mapstructure:"DB_PASSWORD"`
	Name     string `mapstructure:"DB_NAME"`
}

type Redis struct {
	Host     string `mapstructure:"REDIS_HOST"`
	Port     string `mapstructure:"REDIS_PORT"`
	Password string `mapstructure:"REDIS_PASSWORD"`
	DB       int    `mapstructure:"REDIS_DB"`
}

type JWT struct {
	Secret     string `mapstructure:"JWT_SECRET"`
	ExpireTime int    `mapstructure:"JWT_EXPIRE_TIME"`
}

func Load() *Config {
	// Enable reading from environment variables first
	viper.AutomaticEnv()
	
	// Check if we're in test environment - read directly from OS environment
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = viper.GetString("ENVIRONMENT")
		if environment == "" {
			environment = "development"
		}
	}

	// Set default values first
	viper.SetDefault("ENVIRONMENT", environment)
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("LOG_LEVEL", "info")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "")
	viper.SetDefault("DB_NAME", "go_manage_starter")
	viper.SetDefault("REDIS_HOST", "localhost")
	viper.SetDefault("REDIS_PORT", "6379")
	viper.SetDefault("REDIS_PASSWORD", "")
	viper.SetDefault("REDIS_DB", 0)
	viper.SetDefault("JWT_SECRET", "your-secret-key")
	viper.SetDefault("JWT_EXPIRE_TIME", 24)

	// Set config file name and type
	viper.SetConfigType("yaml")
	
	// Add config paths based on environment
	if environment == "test" {
		viper.SetConfigName("test")
		viper.AddConfigPath("./test/config")
		viper.AddConfigPath("../test/config") // For when running from subdirectories
		viper.AddConfigPath("../../test/config") // For deeper nested calls
	} else if environment == "production" {
		viper.SetConfigName("production")
		viper.AddConfigPath("./config")
		viper.AddConfigPath("../config")
	} else {
		// Default to development
		viper.SetConfigName("config")
		viper.AddConfigPath("./config")
		viper.AddConfigPath("../config")
		viper.AddConfigPath(".") // Fallback to current directory
	}

	// Read config file if exists
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("No config file found for environment '%s', using defaults and environment variables", environment)
	} else {
		log.Printf("Using config file: %s", viper.ConfigFileUsed())
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("Unable to decode config:", err)
	}

	return &config
}