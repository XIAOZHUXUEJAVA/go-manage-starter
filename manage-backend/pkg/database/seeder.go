package database

import (
	"log"

	"gorm.io/gorm"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
)

// SeedDatabase 根据环境种子数据库
func SeedDatabase(db *gorm.DB, env string) error {
	log.Printf("Seeding database for environment: %s", env)
	
	switch env {
	case "development":
		return seedDevelopmentData(db)
	case "test":
		return seedTestData(db)
	case "production":
		return seedProductionData(db)
	default:
		log.Printf("No seeding configured for environment: %s", env)
		return nil
	}
}

// seedDevelopmentData 开发环境种子数据
func seedDevelopmentData(db *gorm.DB) error {
	log.Println("Seeding development data...")
	
	// 创建默认管理员用户
	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}
	
	admin := &model.User{
		Username: "admin",
		Email:    "admin@example.com",
		Password: hashedPassword,
		Role:     "admin",
		Status:   "active",
	}
	
	// 使用 FirstOrCreate 避免重复创建
	result := db.Where("username = ?", admin.Username).FirstOrCreate(admin)
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected > 0 {
		log.Println("Created default admin user: admin/admin123")
	} else {
		log.Println("Admin user already exists")
	}
	
	// 创建测试用户
	testUser := &model.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		Role:     "user",
		Status:   "active",
	}
	
	result = db.Where("username = ?", testUser.Username).FirstOrCreate(testUser)
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected > 0 {
		log.Println("Created test user: testuser/admin123")
	} else {
		log.Println("Test user already exists")
	}
	
	log.Println("Development data seeding completed")
	return nil
}

// seedTestData 测试环境种子数据
func seedTestData(db *gorm.DB) error {
	log.Println("Seeding test data...")
	
	// 测试环境通常不需要预设数据
	// 测试会自己创建需要的数据
	
	log.Println("Test data seeding completed")
	return nil
}

// seedProductionData 生产环境种子数据
func seedProductionData(db *gorm.DB) error {
	log.Println("Seeding production data...")
	
	// 生产环境只创建必要的初始数据
	// 比如系统管理员账户（如果不存在的话）
	
	var count int64
	db.Model(&model.User{}).Where("role = ?", "admin").Count(&count)
	
	if count == 0 {
		log.Println("No admin user found, creating default admin...")
		
		hashedPassword, err := utils.HashPassword("ChangeMe123!")
		if err != nil {
			return err
		}
		
		admin := &model.User{
			Username: "admin",
			Email:    "admin@yourdomain.com",
			Password: hashedPassword,
			Role:     "admin",
			Status:   "active",
		}
		
		if err := db.Create(admin).Error; err != nil {
			return err
		}
		
		log.Println("Created default admin user - PLEASE CHANGE THE PASSWORD!")
	}
	
	log.Println("Production data seeding completed")
	return nil
}

// CleanDatabase 清理数据库（主要用于测试）
func CleanDatabase(db *gorm.DB) error {
	log.Println("Cleaning database...")
	
	// 删除所有用户数据
	if err := db.Exec("DELETE FROM users").Error; err != nil {
		return err
	}
	
	log.Println("Database cleaned successfully")
	return nil
}