package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/middleware"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/repository"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/service"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	cfg := config.Load()
	
	// Initialize JWT manager with configuration
	accessTokenExpire := cfg.JWT.AccessTokenExpire
	refreshTokenExpire := cfg.JWT.RefreshTokenExpire
	
	// Fallback to default values if not configured
	if accessTokenExpire == 0 {
		accessTokenExpire = 30 // 30 minutes
	}
	if refreshTokenExpire == 0 {
		refreshTokenExpire = 720 // 30 days in hours
	}
	
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, accessTokenExpire, refreshTokenExpire)

	// Initialize Redis client
	redisClient := cache.NewRedisClient(cfg.Redis)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// Initialize services
	sessionService := service.NewSessionService(redisClient, jwtManager)
	userService := service.NewUserService(userRepo, jwtManager, sessionService)

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

	// User availability check routes (no authentication required)
	userCheck := router.Group("/users")
	{
		userCheck.GET("/check-username/:username", userHandler.CheckUsernameAvailable)
		userCheck.GET("/check-email/:email", userHandler.CheckEmailAvailable)
		userCheck.POST("/check-availability", userHandler.CheckUserDataAvailability)
	}

	// Auth routes (no authentication required)
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", userHandler.Register)
		authRoutes.POST("/login", userHandler.Login)
		authRoutes.POST("/refresh", userHandler.RefreshToken)
	}

	// Protected routes (authentication required)
	protected := router.Group("/")
	protected.Use(middleware.JWTAuthWithSession(jwtManager, sessionService))
	{
		// Auth routes that require authentication
		authProtected := protected.Group("/auth")
		{
			authProtected.POST("/logout", userHandler.Logout)
		}

		// User routes
		users := protected.Group("/users")
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.GET("", userHandler.ListUsers)
			users.POST("", userHandler.CreateUser)
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
		}
	}
}