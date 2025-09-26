package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
)

func main() {
	var action = flag.String("action", "up", "Migration action: up, down, status, reset")
	var migrationID = flag.String("id", "", "Migration ID for rollback")
	flag.Parse()

	// 加载配置
	cfg := config.Load()
	
	// 连接数据库
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	switch *action {
	case "up":
		if err := database.RunMigrations(db, cfg); err != nil {
			log.Fatal("Migration failed:", err)
		}
		fmt.Println("✅ Migrations completed successfully")
		
	case "down":
		if *migrationID == "" {
			log.Fatal("Migration ID is required for rollback")
		}
		if err := database.RollbackMigration(db, *migrationID); err != nil {
			log.Fatal("Rollback failed:", err)
		}
		fmt.Printf("✅ Migration %s rolled back successfully\n", *migrationID)
		
	case "status":
		status, err := database.GetMigrationStatus(db)
		if err != nil {
			log.Fatal("Failed to get migration status:", err)
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
			log.Fatal("Database reset failed:", err)
		}
		
		// 重新运行迁移
		if err := database.RunMigrations(db, cfg); err != nil {
			log.Fatal("Migration after reset failed:", err)
		}
		
		fmt.Println("✅ Database reset and migrations completed successfully")
		
	default:
		log.Fatal("Unknown action:", *action)
	}
}