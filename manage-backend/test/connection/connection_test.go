package connection

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
	"context"
	_ "github.com/lib/pq"
)

func TestDatabaseConnection(t *testing.T) {
	cfg := config.Load()
	
	t.Run("PostgreSQL_Basic_Connection", func(t *testing.T) {
		// 测试基础PostgreSQL连接
		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			cfg.Database.Host, cfg.Database.Port, cfg.Database.User, 
			cfg.Database.Password, cfg.Database.Name)
		
		db, err := sql.Open("postgres", dsn)
		require.NoError(t, err, "应该能够打开数据库连接")
		defer db.Close()
		
		// 测试连接是否真的可用
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		err = db.PingContext(ctx)
		assert.NoError(t, err, "数据库应该能够ping通")
		
		t.Logf("✅ PostgreSQL连接成功: %s@%s:%s/%s", 
			cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
	})
	
	t.Run("GORM_Database_Connection", func(t *testing.T) {
		// 测试GORM连接
		db, err := database.Init(cfg.Database)
		require.NoError(t, err, "GORM应该能够初始化数据库连接")
		
		sqlDB, err := db.DB()
		require.NoError(t, err, "应该能够获取底层SQL DB")
		defer sqlDB.Close()
		
		// 测试连接池
		err = sqlDB.Ping()
		assert.NoError(t, err, "GORM数据库连接应该正常")
		
		// 测试简单查询
		var version string
		err = db.Raw("SELECT version()").Scan(&version).Error
		assert.NoError(t, err, "应该能够执行简单查询")
		assert.NotEmpty(t, version, "PostgreSQL版本信息不应该为空")
		
		t.Logf("✅ GORM连接成功，PostgreSQL版本: %s", version[:50]+"...")
	})
	
	t.Run("Database_Schema_Check", func(t *testing.T) {
		// 检查数据库schema和表
		db, err := database.Init(cfg.Database)
		require.NoError(t, err)
		
		sqlDB, err := db.DB()
		require.NoError(t, err)
		defer sqlDB.Close()
		
		// 检查users表是否存在
		var exists bool
		query := `SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = $1 AND table_name = 'users'
		)`
		err = db.Raw(query, cfg.Database.Schema).Scan(&exists).Error
		assert.NoError(t, err, "应该能够查询表信息")
		
		if exists {
			t.Logf("✅ users表存在于schema: %s", cfg.Database.Schema)
			
			// 检查表结构
			var count int64
			err = db.Table("users").Count(&count).Error
			assert.NoError(t, err, "应该能够查询users表")
			t.Logf("✅ users表记录数: %d", count)
		} else {
			t.Logf("⚠️  users表不存在，可能需要运行数据库迁移")
		}
	})
}

func TestRedisConnection(t *testing.T) {
	cfg := config.Load()
	
	t.Run("Redis_Basic_Connection", func(t *testing.T) {
		// 创建Redis客户端
		rdb := redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		defer rdb.Close()
		
		// 测试连接
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		pong, err := rdb.Ping(ctx).Result()
		assert.NoError(t, err, "Redis应该能够ping通")
		assert.Equal(t, "PONG", pong, "Redis应该返回PONG")
		
		t.Logf("✅ Redis连接成功: %s:%s (DB: %d)", 
			cfg.Redis.Host, cfg.Redis.Port, cfg.Redis.DB)
	})
	
	t.Run("Redis_Basic_Operations", func(t *testing.T) {
		rdb := redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		defer rdb.Close()
		
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		// 测试基本的SET/GET操作
		testKey := "connection_test_key"
		testValue := "connection_test_value"
		
		// SET操作
		err := rdb.Set(ctx, testKey, testValue, time.Minute).Err()
		assert.NoError(t, err, "应该能够设置Redis键值")
		
		// GET操作
		val, err := rdb.Get(ctx, testKey).Result()
		assert.NoError(t, err, "应该能够获取Redis键值")
		assert.Equal(t, testValue, val, "获取的值应该与设置的值相同")
		
		// 清理测试数据
		err = rdb.Del(ctx, testKey).Err()
		assert.NoError(t, err, "应该能够删除测试键")
		
		t.Logf("✅ Redis基本操作测试通过")
	})
	
	t.Run("Redis_Info", func(t *testing.T) {
		rdb := redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		defer rdb.Close()
		
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		// 获取Redis服务器信息
		_, err := rdb.Info(ctx, "server").Result()
		if err == nil {
			t.Logf("✅ Redis服务器信息获取成功")
		} else {
			t.Logf("⚠️  无法获取Redis服务器信息: %v", err)
		}
	})
}

func TestConnectionSummary(t *testing.T) {
	t.Run("Connection_Summary", func(t *testing.T) {
		cfg := config.Load()
		
		t.Logf("🔧 连接配置摘要:")
		t.Logf("   数据库: %s@%s:%s/%s (schema: %s)", 
			cfg.Database.User, cfg.Database.Host, cfg.Database.Port, 
			cfg.Database.Name, cfg.Database.Schema)
		t.Logf("   Redis: %s:%s (DB: %d)", 
			cfg.Redis.Host, cfg.Redis.Port, cfg.Redis.DB)
		t.Logf("   环境: %s", cfg.Environment)
		
		t.Logf("💡 如果测试失败，请检查:")
		t.Logf("   1. 服务是否运行 (PostgreSQL, Redis)")
		t.Logf("   2. 配置文件或环境变量是否正确")
		t.Logf("   3. 网络连接是否正常")
		t.Logf("   4. 认证信息是否正确")
	})
}