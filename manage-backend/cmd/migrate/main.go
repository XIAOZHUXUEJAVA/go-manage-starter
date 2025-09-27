package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	var action = flag.String("action", "up", "Migration action: up, down, status, reset")
	var migrationID = flag.String("id", "", "Migration ID for rollback")
	flag.Parse()

	// 加载配置
	cfg := config.Load()
	
	// 初始化日志器
	logger.Init(cfg.LogLevel)
	
	// 连接数据库
	db, err := database.Init(cfg.Database)
	if err != nil {
		logger.Fatal("数据库连接失败", zap.Error(err))
	}
	
	switch *action {
	case "up":
		if err := database.RunMigrations(db, cfg); err != nil {
			logger.Fatal("数据库迁移失败", zap.Error(err))
		}
		fmt.Println("✅ Migrations completed successfully")
		
	case "down":
		if *migrationID == "" {
			logger.Fatal("回滚操作需要迁移ID")
		}
		if err := database.RollbackMigration(db, *migrationID); err != nil {
			logger.Fatal("迁移回滚失败", zap.String("migration_id", *migrationID), zap.Error(err))
		}
		fmt.Printf("✅ Migration %s rolled back successfully\n", *migrationID)
		
	case "status":
		status, err := database.GetMigrationStatus(db)
		if err != nil {
			logger.Fatal("获取迁移状态失败", zap.Error(err))
		}
		
		fmt.Println("Migration Status:")
		fmt.Println("================")
		for _, s := range status {
			if s.Executed {
				fmt.Printf("✅ %s (executed at: %v)\n", s.ID, s.ExecutedAt)
			} else {
				fmt.Printf("❌ %s (not executed)\n", s.ID)
			}
		}
		
	case "reset":
		// 警告：这会删除所有数据
		fmt.Println("⚠️  WARNING: This will drop all tables and recreate them!")
		fmt.Print("Are you sure? (y/N): ")
		
		var confirm string
		fmt.Scanln(&confirm)
		
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Operation cancelled")
			os.Exit(0)
		}
		
		// 删除所有表
		if err := database.ResetDatabase(db); err != nil {
			logger.Fatal("数据库重置失败", zap.Error(err))
		}
		
		// 重新运行迁移
		if err := database.RunMigrations(db, cfg); err != nil {
			logger.Fatal("重置后迁移失败", zap.Error(err))
		}
		
		fmt.Println("✅ Database reset and migrations completed successfully")
		
	default:
		logger.Fatal("未知操作", zap.String("action", *action))
	}
}