package handler

import (
	"time"
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
	
	// 使用配置初始化 JWT 管理器
	accessTokenExpire := cfg.JWT.AccessTokenExpire
	refreshTokenExpire := cfg.JWT.RefreshTokenExpire
	
	// 如果未配置则回退到默认值
	if accessTokenExpire == 0 {
		accessTokenExpire = 30 // 默认 30 分钟
	}
	if refreshTokenExpire == 0 {
		refreshTokenExpire = 720 // 默认 30 天（小时数）
	}
	
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, accessTokenExpire, refreshTokenExpire)

	// 初始化 Redis 客户端
	redisClient := cache.NewRedisClient(cfg.Redis)

	// 初始化仓储层
	userRepo := repository.NewUserRepository(db)

	// 初始化服务层
	sessionService := service.NewSessionService(redisClient, jwtManager)
	
	// 验证码配置
	captchaConfig := service.CaptchaConfig{
		Type:            cfg.Captcha.Type,
		Length:          cfg.Captcha.Length,
		Width:           cfg.Captcha.Width,
		Height:          cfg.Captcha.Height,
		NoiseCount:      cfg.Captcha.NoiseCount,
		ShowLineOptions: cfg.Captcha.ShowLineOptions,
		Expiration:      cfg.Captcha.Expiration,
		Enabled:         cfg.Captcha.Enabled,
	}
	

	// 如果配置为空，使用默认配置
	if captchaConfig.Type == "" {
		captchaConfig = service.CaptchaConfig{
			Type:            "digit",
			Length:          5,
			Width:           240,
			Height:          80,
			NoiseCount:      0.7,
			ShowLineOptions: 80,
			Expiration:      5 * time.Minute,
			Enabled:         true,
		}
	}
	
	captchaService := service.NewCaptchaService(redisClient.GetClient(), captchaConfig)
	userService := service.NewUserService(userRepo, jwtManager, sessionService, captchaService)

	// 初始化处理器
	userHandler := NewUserHandler(userService)
	captchaHandler := NewCaptchaHandler(captchaService)


	// 用户可用性检查路由（无需认证）
	userCheck := router.Group("/users")
	{
		userCheck.GET("/check-username/:username", userHandler.CheckUsernameAvailable)
		userCheck.GET("/check-email/:email", userHandler.CheckEmailAvailable)
		userCheck.POST("/check-availability", userHandler.CheckUserDataAvailability)
	}

	// 认证路由（无需认证）
	authRoutes := router.Group("/auth")
	{
		authRoutes.GET("/captcha", captchaHandler.GenerateCaptcha)
		authRoutes.POST("/register", userHandler.Register)
		authRoutes.POST("/login", userHandler.Login)
		authRoutes.POST("/refresh", userHandler.RefreshToken)
	}

	// 受保护的路由（需要认证）
	protected := router.Group("/")
	protected.Use(middleware.JWTAuthWithSession(jwtManager, sessionService))
	{
		// 需要认证的认证路由
		authProtected := protected.Group("/auth")
		{
			authProtected.POST("/logout", userHandler.Logout)
		}

		// 用户路由
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
