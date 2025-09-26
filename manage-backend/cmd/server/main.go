package main

import (
	"log"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/handler"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/middleware"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Go Manage Starter API
// @version 1.0
// @description A management system API built with Go and Gin
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger.Init(cfg.LogLevel)

	// Initialize database
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Run database migrations
	if err := database.RunMigrations(db, cfg); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Run seed data based on environment
	switch cfg.Environment {
	case "development":
		log.Println("🌱 Seeding development data...")
		if err := database.SeedDatabase(db, cfg.Environment); err != nil {
			log.Fatal("Failed to seed database:", err)
		}
	case "test":
		log.Println("🧪 Seeding test data...")
		if err := database.SeedDatabase(db, cfg.Environment); err != nil {
			log.Fatal("Failed to seed database:", err)
		}
	case "production":
		log.Println("🏭 Checking production data...")
		if err := database.SeedDatabase(db, cfg.Environment); err != nil {
			log.Fatal("Failed to seed database:", err)
		}
	default:
		log.Printf("⚠️  Unknown environment: %s, skipping seeding", cfg.Environment)
	}

	// Initialize Gin router with environment-specific settings
	switch cfg.Environment {
	case "production":
		gin.SetMode(gin.ReleaseMode)
		log.Println("🏭 Running in production mode")
	case "test":
		gin.SetMode(gin.TestMode)
		log.Println("🧪 Running in test mode")
	default:
		gin.SetMode(gin.DebugMode)
		log.Println("🔧 Running in development mode")
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())

	// API routes
	api := router.Group("/api/v1")
	handler.SetupRoutes(api, db)

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}