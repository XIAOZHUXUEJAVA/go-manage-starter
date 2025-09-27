package database

import (
	"gorm.io/gorm"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/logger"
	"go.uber.org/zap"
)

// SeedDatabase 根据环境种子数据库
func SeedDatabase(db *gorm.DB, env string) error {
	logger.Info("开始数据库种子数据", zap.String("environment", env))
	
	switch env {
	case "development":
		return seedDevelopmentData(db)
	case "test":
		return seedTestData(db)
	case "production":
		return seedProductionData(db)
	default:
		logger.Warn("未配置种子数据", zap.String("environment", env))
		return nil
	}
}

// seedDevelopmentData 开发环境种子数据
func seedDevelopmentData(db *gorm.DB) error {
	logger.Info("开始种子开发环境数据")
	
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
		logger.Info("创建默认管理员用户", zap.String("username", "admin"))
	} else {
		logger.Info("管理员用户已存在", zap.String("username", "admin"))
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
		logger.Info("创建测试用户", zap.String("username", "testuser"))
	} else {
		logger.Info("测试用户已存在", zap.String("username", "testuser"))
	}
	
	logger.Info("开发环境数据种子完成")
	return nil
}

// seedTestData 测试环境种子数据
func seedTestData(db *gorm.DB) error {
	logger.Info("开始种子测试环境数据")
	
	// 创建测试管理员用户
	hashedPassword, err := utils.HashPassword("test123")
	if err != nil {
		return err
	}
	
	admin := &model.User{
		Username: "testadmin",
		Email:    "testadmin@example.com",
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
		logger.Info("创建测试管理员用户", zap.String("username", "testadmin"))
	} else {
		logger.Info("测试管理员用户已存在", zap.String("username", "testadmin"))
	}
	
	// 创建测试普通用户
	testUser := &model.User{
		Username: "testuser",
		Email:    "testuser@example.com",
		Password: hashedPassword,
		Role:     "user",
		Status:   "active",
	}
	
	result = db.Where("username = ?", testUser.Username).FirstOrCreate(testUser)
	if result.Error != nil {
		return result.Error
	}
	
	if result.RowsAffected > 0 {
		logger.Info("创建测试用户", zap.String("username", "testuser"))
	} else {
		logger.Info("测试用户已存在", zap.String("username", "testuser"))
	}
	
	logger.Info("测试环境数据种子完成")
	return nil
}

// seedProductionData 生产环境种子数据
func seedProductionData(db *gorm.DB) error {
	logger.Info("开始种子生产环境数据")
	
	// 生产环境只创建必要的初始数据
	// 比如系统管理员账户（如果不存在的话）
	
	var count int64
	db.Model(&model.User{}).Where("role = ?", "admin").Count(&count)
	
	if count == 0 {
		logger.Warn("未找到管理员用户，创建默认管理员")
		
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
		
		logger.Warn("创建默认管理员用户 - 请立即更改密码！", zap.String("username", "admin"))
	}
	
	logger.Info("生产环境数据种子完成")
	return nil
}

// CleanDatabase 清理数据库（主要用于测试）
func CleanDatabase(db *gorm.DB) error {
	logger.Info("开始清理数据库")
	
	// 删除所有用户数据
	if err := db.Exec("DELETE FROM users").Error; err != nil {
		return err
	}
	
	logger.Info("数据库清理成功")
	return nil
}