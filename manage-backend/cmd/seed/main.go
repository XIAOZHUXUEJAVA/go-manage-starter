package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/yourname/go-manage-starter/internal/config"
	"github.com/yourname/go-manage-starter/pkg/database"
)

func main() {
	var action = flag.String("action", "seed", "Seed action: seed, clean, reset")
	flag.Parse()

	// 加载配置
	cfg := config.Load()
	
	// 连接数据库
	db, err := database.Init(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	switch *action {
	case "seed":
		if err := database.SeedDatabase(db, cfg.Environment); err != nil {
			log.Fatal("Seeding failed:", err)
		}
		fmt.Println("✅ Database seeding completed successfully")
		
	case "clean":
		fmt.Println("⚠️  WARNING: This will delete all data!")
		fmt.Print("Are you sure? (y/N): ")
		
		var confirm string
		fmt.Scanln(&confirm)
		
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Operation cancelled")
			os.Exit(0)
		}
		
		if err := database.CleanDatabase(db); err != nil {
			log.Fatal("Database cleaning failed:", err)
		}
		fmt.Println("✅ Database cleaned successfully")
		
	case "reset":
		fmt.Println("⚠️  WARNING: This will delete all data and reseed!")
		fmt.Print("Are you sure? (y/N): ")
		
		var confirm string
		fmt.Scanln(&confirm)
		
		if confirm != "y" && confirm != "Y" {
			fmt.Println("Operation cancelled")
			os.Exit(0)
		}
		
		// 清理数据
		if err := database.CleanDatabase(db); err != nil {
			log.Fatal("Database cleaning failed:", err)
		}
		
		// 重新种子
		if err := database.SeedDatabase(db, cfg.Environment); err != nil {
			log.Fatal("Database seeding failed:", err)
		}
		
		fmt.Println("✅ Database reset and seeding completed successfully")
		
	default:
		log.Fatal("Unknown action:", *action)
	}
}