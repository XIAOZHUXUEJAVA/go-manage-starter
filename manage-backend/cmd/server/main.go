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

// @title Go 管理系统启动器 API
// @version 1.0
// @description 基于 Go 和 Gin 构建的管理系统 API
// @termsOfService http://swagger.io/terms/

// @contact.name API 支持
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
	// 加载配置
	cfg := config.Load()

	// 初始化日志器
	logger.Init(cfg.LogLevel)

	// 初始化数据库
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatal("数据库初始化失败:", err)
	}

	// 运行数据库迁移
	if err := database.RunMigrations(db, cfg); err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	// 如需种子数据，可以手动调用: database.SeedDatabase(db, cfg.Environment)
	log.Println("✅ 数据库连接成功")

	// 根据环境初始化 Gin 路由器设置
	switch cfg.Environment {
	case "production":
		gin.SetMode(gin.ReleaseMode)
		log.Println("🏭 运行在生产模式")
	case "test":
		gin.SetMode(gin.TestMode)
		log.Println("🧪 运行在测试模式")
	default:
		gin.SetMode(gin.DebugMode)
		log.Println("🔧 运行在开发模式")
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())

	// API 路由
	api := router.Group("/api/v1")
	handler.SetupRoutes(api, db)

	// Swagger 文档
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 启动服务器
	log.Printf("服务器正在端口 %s 上启动", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}