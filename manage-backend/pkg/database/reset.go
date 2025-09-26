package database

import (
	"log"

	"gorm.io/gorm"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
)

// ResetDatabase 重置数据库（删除所有表）
func ResetDatabase(db *gorm.DB) error {
	log.Println("Resetting database...")
	
	// 获取所有表名
	tables := []string{
		"migration_records",
		"users",
		// 在这里添加其他表名
	}
	
	// 删除所有表
	for _, table := range tables {
		if db.Migrator().HasTable(table) {
			if err := db.Migrator().DropTable(table); err != nil {
				log.Printf("Warning: Failed to drop table %s: %v", table, err)
			} else {
				log.Printf("Dropped table: %s", table)
			}
		}
	}
	
	// 或者使用模型来删除表（更安全的方式）
	models := []interface{}{
		&MigrationRecord{},
		&model.User{},
		// 在这里添加其他模型
	}
	
	for _, model := range models {
		if err := db.Migrator().DropTable(model); err != nil {
			log.Printf("Warning: Failed to drop table for model %T: %v", model, err)
		}
	}
	
	log.Println("Database reset completed")
	return nil
}