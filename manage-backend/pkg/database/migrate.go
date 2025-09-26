package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
	"github.com/yourname/go-manage-starter/internal/config"
	"github.com/yourname/go-manage-starter/internal/model"
)

// RunMigrations 根据环境运行不同的迁移策略
func RunMigrations(db *gorm.DB, cfg *config.Config) error {
	log.Printf("Running migrations for environment: %s", cfg.Environment)
	
	switch cfg.Environment {
	case "development", "test":
		// 开发和测试环境使用 AutoMigrate
		return autoMigrate(db, cfg)
	case "production":
		// 生产环境使用版本化迁移
		return runVersionedMigrations(db)
	default:
		return fmt.Errorf("unknown environment: %s", cfg.Environment)
	}
}

// autoMigrate 自动迁移所有模型
func autoMigrate(db *gorm.DB, cfg *config.Config) error {
	log.Println("Running auto migration...")
	
	// 如果配置了非 public 模式，先创建模式
	if cfg.Database.Schema != "" && cfg.Database.Schema != "public" {
		createSchemaSQL := fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", cfg.Database.Schema)
		if err := db.Exec(createSchemaSQL).Error; err != nil {
			log.Printf("Warning: Failed to create schema %s: %v", cfg.Database.Schema, err)
		} else {
			log.Printf("Schema %s created or already exists", cfg.Database.Schema)
		}
	}
	
	err := db.AutoMigrate(
		&model.User{},
		// 在这里添加其他模型
	)
	
	if err != nil {
		return fmt.Errorf("auto migration failed: %w", err)
	}
	
	log.Println("Auto migration completed successfully")
	return nil
}

// runVersionedMigrations 运行版本化迁移（生产环境）
func runVersionedMigrations(db *gorm.DB) error {
	log.Println("Running versioned migrations...")
	
	// 创建迁移记录表
	if err := db.AutoMigrate(&MigrationRecord{}); err != nil {
		return fmt.Errorf("failed to create migration table: %w", err)
	}
	
	// 运行所有未执行的迁移
	for _, migration := range migrations {
		var record MigrationRecord
		result := db.Where("migration_id = ?", migration.ID).First(&record)
		
		if result.Error == gorm.ErrRecordNotFound {
			// 执行迁移
			if err := migration.Up(db); err != nil {
				return fmt.Errorf("migration %s failed: %w", migration.ID, err)
			}
			
			// 记录迁移
			record = MigrationRecord{
				MigrationID: migration.ID,
				ExecutedAt:  time.Now(),
			}
			if err := db.Create(&record).Error; err != nil {
				return fmt.Errorf("failed to record migration %s: %w", migration.ID, err)
			}
			
			log.Printf("Migration %s executed successfully", migration.ID)
		}
	}
	
	log.Println("Versioned migrations completed successfully")
	return nil
}

// MigrationRecord 迁移记录模型
type MigrationRecord struct {
	ID          uint      `gorm:"primaryKey"`
	MigrationID string    `gorm:"uniqueIndex;not null"`
	ExecutedAt  time.Time `gorm:"not null"`
}