package database

import (
	"fmt"
	"log"

	"gorm.io/gorm"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
)

// Migration 迁移定义
type Migration struct {
	ID   string
	Up   func(*gorm.DB) error
	Down func(*gorm.DB) error
}

// migrations 所有迁移的列表
var migrations = []Migration{
	{
		ID: "001_create_users_table",
		Up: func(db *gorm.DB) error {
			return db.AutoMigrate(&model.User{})
		},
		Down: func(db *gorm.DB) error {
			return db.Migrator().DropTable(&model.User{})
		},
	},
	// 在这里添加更多迁移
}

// RollbackMigration 回滚指定的迁移
func RollbackMigration(db *gorm.DB, migrationID string) error {
	for _, migration := range migrations {
		if migration.ID == migrationID {
			if err := migration.Down(db); err != nil {
				return fmt.Errorf("rollback migration %s failed: %w", migrationID, err)
			}
			
			// 删除迁移记录
			if err := db.Where("migration_id = ?", migrationID).Delete(&MigrationRecord{}).Error; err != nil {
				return fmt.Errorf("failed to remove migration record %s: %w", migrationID, err)
			}
			
			log.Printf("Migration %s rolled back successfully", migrationID)
			return nil
		}
	}
	
	return fmt.Errorf("migration %s not found", migrationID)
}

// GetMigrationStatus 获取迁移状态
func GetMigrationStatus(db *gorm.DB) ([]MigrationStatus, error) {
	// 检查 migration_records 表是否存在
	if !db.Migrator().HasTable(&MigrationRecord{}) {
		// 如果表不存在，检查实际的表是否存在来判断迁移状态
		var status []MigrationStatus
		for _, migration := range migrations {
			s := MigrationStatus{
				ID:       migration.ID,
				Executed: false,
			}
			
			// 检查对应的表是否存在（简单判断）
			if migration.ID == "001_create_users_table" {
				s.Executed = db.Migrator().HasTable("users")
				if s.Executed {
					s.ExecutedAt = "Auto-migrated (development mode)"
				}
			}
			
			status = append(status, s)
		}
		return status, nil
	}
	
	var records []MigrationRecord
	if err := db.Find(&records).Error; err != nil {
		return nil, fmt.Errorf("failed to get migration records: %w", err)
	}
	
	recordMap := make(map[string]MigrationRecord)
	for _, record := range records {
		recordMap[record.MigrationID] = record
	}
	
	var status []MigrationStatus
	for _, migration := range migrations {
		s := MigrationStatus{
			ID:       migration.ID,
			Executed: false,
		}
		
		if record, exists := recordMap[migration.ID]; exists {
			s.Executed = true
			s.ExecutedAt = record.ExecutedAt
		}
		
		status = append(status, s)
	}
	
	return status, nil
}

// MigrationStatus 迁移状态
type MigrationStatus struct {
	ID         string
	Executed   bool
	ExecutedAt interface{}
}