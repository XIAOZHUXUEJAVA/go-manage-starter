package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/middleware"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/repository"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/service"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
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
	publicUserHandler := NewPublicUserHandler(userService)

	// Public routes (no authentication required)
	public := router.Group("/public")
	{
		// Public user routes
		public.GET("/users/:id", publicUserHandler.GetUser)
		public.GET("/users", publicUserHandler.ListUsers)
	}

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