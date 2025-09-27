package config

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Environment string   `mapstructure:"environment"`
	Port        string   `mapstructure:"port"`
	LogLevel    string   `mapstructure:"log_level"`
	Database    Database `mapstructure:"database"`
	Redis       Redis    `mapstructure:"redis"`
	JWT         JWT      `mapstructure:"jwt"`
}

type Database struct {
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	Name     string `mapstructure:"name"`
	Schema   string `mapstructure:"schema"`
}

type Redis struct {
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type JWT struct {
	Secret     string `mapstructure:"secret"`
	ExpireTime int    `mapstructure:"expire_time"`
}

func Load() *Config {
	// 首先启用从环境变量读取配置
	viper.AutomaticEnv()
	
	// 从操作系统环境变量检查环境类型
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "development"
	}

	// 设置配置文件类型
	viper.SetConfigType("yaml")
	
	// 添加配置文件搜索路径（所有环境通用）
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../config")        // 用于从子目录运行时
	viper.AddConfigPath("../../config")     // 用于更深层嵌套调用（如测试）
	viper.AddConfigPath(".")                // 回退到当前目录

	// 步骤1：加载基础配置文件 (config.yaml)
	viper.SetConfigName("config")
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("警告: 未找到基础配置文件，使用默认值: %v", err)
	} else {
		log.Printf("已加载基础配置: %s", viper.ConfigFileUsed())
	}

	// 步骤2：合并环境特定配置
	envConfigName := fmt.Sprintf("config.%s", environment)
	viper.SetConfigName(envConfigName)
	
	if err := viper.MergeInConfig(); err != nil {
		log.Printf("警告: 未找到环境 '%s' 的配置文件: %v", environment, err)
	} else {
		log.Printf("已合并环境配置: %s", viper.ConfigFileUsed())
	}

	// 步骤3：使用环境变量覆盖配置
	// 将环境变量映射到配置键
	viper.BindEnv("port", "PORT")
	viper.BindEnv("log_level", "LOG_LEVEL")
	viper.BindEnv("database.host", "DB_HOST")
	viper.BindEnv("database.port", "DB_PORT")
	viper.BindEnv("database.user", "DB_USER")
	viper.BindEnv("database.password", "DB_PASSWORD")
	viper.BindEnv("database.name", "DB_NAME")
	viper.BindEnv("database.schema", "DB_SCHEMA")
	viper.BindEnv("redis.host", "REDIS_HOST")
	viper.BindEnv("redis.port", "REDIS_PORT")
	viper.BindEnv("redis.password", "REDIS_PASSWORD")
	viper.BindEnv("redis.db", "REDIS_DB")
	viper.BindEnv("jwt.secret", "JWT_SECRET")
	viper.BindEnv("jwt.expire_time", "JWT_EXPIRE_TIME")

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("无法解码配置:", err)
	}

	// 在配置中设置环境类型
	config.Environment = environment

	// 临时调试：打印运行时配置
	log.Printf("🔧 运行时配置详情:")
	log.Printf("   环境: %s", config.Environment)
	log.Printf("   端口: %s", config.Port)
	log.Printf("   日志级别: %s", config.LogLevel)
	log.Printf("   数据库: %s@%s:%s/%s (schema: %s)", 
		config.Database.User, config.Database.Host, config.Database.Port, 
		config.Database.Name, config.Database.Schema)
	log.Printf("   Redis: %s:%s (DB: %d, 密码: %s)", 
		config.Redis.Host, config.Redis.Port, config.Redis.DB, 
		func() string {
			if config.Redis.Password == "" {
				return "无"
			}
			return "***已设置***"
		}())
	log.Printf("   JWT: 密钥=%s, 过期时间=%s", 
		func() string {
			if config.JWT.Secret == "" {
				return "未设置"
			}
			return "***已设置***"
		}(), config.JWT.ExpireTime)

	return &config
}