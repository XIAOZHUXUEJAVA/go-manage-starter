package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/yourname/go-manage-starter/internal/config"
	"github.com/yourname/go-manage-starter/internal/middleware"
	"github.com/yourname/go-manage-starter/internal/repository"
	"github.com/yourname/go-manage-starter/internal/service"
	"github.com/yourname/go-manage-starter/pkg/auth"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	cfg := config.Load()
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpireTime)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo, jwtManager)

	// Initialize handlers
	userHandler := NewUserHandler(userService)

	// Auth routes (no authentication required)
	auth := router.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	// Protected routes (authentication required)
	protected := router.Group("/")
	protected.Use(middleware.JWTAuth(jwtManager))
	{
		// User routes
		users := protected.Group("/users")
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.GET("", userHandler.ListUsers)
		}
	}
}