package connection

import (
	"fmt"
	"testing"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// TestDatabaseConnection 测试数据库连接
func TestDatabaseConnection(t *testing.T) {
	// 硬编码的数据库配置 - 用于快速连通性测试
	config := struct {
		Host     string
		Port     int
		User     string
		Password string
		DBName   string
		Schema   string
		SSLMode  string
	}{
		Host:     "localhost",
		Port:     5432,
		User:     "xiaozhu",
		Password: "12345679",
		DBName:   "go_manage_starter",
		Schema:   "manage_dev",
		SSLMode:  "disable",
	}

	t.Logf("🔌 测试数据库连接: %s@%s:%d/%s", config.User, config.Host, config.Port, config.DBName)

	// 构建连接字符串
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s search_path=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
		config.Schema,
	)

	// 尝试连接数据库
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("❌ 数据库连接失败: %v", err)
	}

	// 获取底层的 sql.DB 对象
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("❌ 获取数据库实例失败: %v", err)
	}
	defer sqlDB.Close()

	// 测试连接
	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("❌ 数据库 Ping 失败: %v", err)
	}

	// 测试查询
	var version string
	if err := db.Raw("SELECT version()").Scan(&version).Error; err != nil {
		t.Fatalf("❌ 数据库查询失败: %v", err)
	}

	// 测试 schema 是否存在
	var schemaExists bool
	query := "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = ?)"
	if err := db.Raw(query, config.Schema).Scan(&schemaExists).Error; err != nil {
		t.Fatalf("❌ Schema 检查失败: %v", err)
	}

	t.Logf("✅ 数据库连接成功!")
	t.Logf("📊 PostgreSQL 版本: %s", version)
	t.Logf("📁 Schema '%s' 存在: %v", config.Schema, schemaExists)

	// 显示连接统计
	stats := sqlDB.Stats()
	t.Logf("🔗 连接统计:")
	t.Logf("   - 打开连接数: %d", stats.OpenConnections)
	t.Logf("   - 使用中连接数: %d", stats.InUse)
	t.Logf("   - 空闲连接数: %d", stats.Idle)
}

// TestDatabaseConnectionWithWrongCredentials 测试错误凭据的情况
func TestDatabaseConnectionWithWrongCredentials(t *testing.T) {
	t.Logf("🔌 测试错误的数据库凭据...")

	// 故意使用错误的密码
	dsn := "host=localhost user=xiaozhu password=wrong_password dbname=go_manage_starter_dev port=5432 sslmode=disable"

	_, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err == nil {
		t.Fatalf("❌ 预期连接失败，但连接成功了")
	}

	t.Logf("✅ 错误凭据测试通过: %v", err)
}

// TestDatabaseConnectionWithWrongHost 测试错误主机的情况
func TestDatabaseConnectionWithWrongHost(t *testing.T) {
	t.Logf("🔌 测试错误的数据库主机...")

	// 故意使用不存在的主机
	dsn := "host=nonexistent-host user=xiaozhu password=12345679 dbname=go_manage_starter_dev port=5432 sslmode=disable"

	_, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err == nil {
		t.Fatalf("❌ 预期连接失败，但连接成功了")
	}

	t.Logf("✅ 错误主机测试通过: %v", err)
}