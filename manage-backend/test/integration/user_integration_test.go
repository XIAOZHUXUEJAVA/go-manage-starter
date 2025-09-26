package integration

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/config"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/repository"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/service"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/database"
)

func TestUserService_Integration_RegisterAndLogin(t *testing.T) {
	// Skip integration test if no database available
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Load configuration with explicit environment variables for integration tests
	// This ensures we use the correct database credentials
	os.Setenv("DB_USER", "xiaozhu")
	os.Setenv("DB_PASSWORD", "12345679")
	os.Setenv("DB_NAME", "go_manage_starter")
	os.Setenv("DB_SCHEMA", "manage_dev")
	
	cfg := config.Load()
	
	// Setup test database connection
	db, err := database.Init(cfg.Database)
	require.NoError(t, err)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()
	
	// Clean up test data
	defer func() {
		db.Exec("DELETE FROM users WHERE username LIKE 'test_integration_%'")
	}()

	// Create services
	userRepo := repository.NewUserRepository(db)
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpireTime)
	userService := service.NewUserService(userRepo, jwtManager)

	// Test user registration
	registerReq := &model.CreateUserRequest{
		Username: "test_integration_user",
		Email:    "test_integration@example.com",
		Password: "password123",
		Role:     "user",
	}

	user, err := userService.Register(registerReq)
	require.NoError(t, err)
	require.NotNil(t, user)
	assert.Equal(t, "test_integration_user", user.Username)
	assert.Equal(t, "test_integration@example.com", user.Email)
	assert.Equal(t, "user", user.Role)
	assert.NotEmpty(t, user.ID)

	// Test user login
	loginReq := &model.LoginRequest{
		Username: "test_integration_user",
		Password: "password123",
	}

	loginResponse, err := userService.Login(loginReq)
	require.NoError(t, err, "登录应该成功")
	require.NotNil(t, loginResponse, "登录响应不应该为空")
	
	// 验证JWT token
	assert.NotEmpty(t, loginResponse.Token, "JWT token不应该为空")
	
	// 验证JWT token的有效性
	claims, err := jwtManager.ValidateToken(loginResponse.Token)
	require.NoError(t, err, "JWT token应该是有效的")
	assert.Equal(t, user.ID, claims.UserID, "JWT中的用户ID应该匹配")
	assert.Equal(t, user.Username, claims.Username, "JWT中的用户名应该匹配")
	assert.Equal(t, user.Role, claims.Role, "JWT中的角色应该匹配")
	
	// 验证返回的用户信息
	assert.Equal(t, user.ID, loginResponse.User.ID, "返回的用户ID应该匹配")
	assert.Equal(t, user.Username, loginResponse.User.Username, "返回的用户名应该匹配")
	assert.Equal(t, user.Email, loginResponse.User.Email, "返回的邮箱应该匹配")
	assert.Equal(t, user.Role, loginResponse.User.Role, "返回的角色应该匹配")
	
	// 验证密码不会在响应中泄露
	assert.Empty(t, loginResponse.User.Password, "响应中不应该包含密码")
	
	t.Logf("✅ 登录成功验证完成:")
	t.Logf("   - 用户ID: %d", loginResponse.User.ID)
	t.Logf("   - 用户名: %s", loginResponse.User.Username)
	t.Logf("   - JWT Token长度: %d", len(loginResponse.Token))
	t.Logf("   - JWT Claims验证: 通过")

	// Test login with wrong password (should fail)
	wrongLoginReq := &model.LoginRequest{
		Username: "test_integration_user",
		Password: "wrong_password",
	}
	
	_, err = userService.Login(wrongLoginReq)
	assert.Error(t, err, "错误密码登录应该失败")
	assert.Contains(t, err.Error(), "invalid credentials", "应该返回凭据无效错误信息")
	
	// Test login with non-existent user (should fail)
	nonExistentLoginReq := &model.LoginRequest{
		Username: "non_existent_user",
		Password: "password123",
	}
	
	_, err = userService.Login(nonExistentLoginReq)
	assert.Error(t, err, "不存在的用户登录应该失败")
	assert.Contains(t, err.Error(), "invalid credentials", "应该返回凭据无效错误信息")
	
	t.Logf("✅ 登录失败场景验证完成:")
	t.Logf("   - 错误密码: 正确拒绝")
	t.Logf("   - 不存在用户: 正确拒绝")
	t.Logf("   - 安全策略: 统一返回'invalid credentials'")

	// Test duplicate registration
	_, err = userService.Register(registerReq)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "username already exists")
}

func TestUserService_Integration_UserCRUD(t *testing.T) {
	// Skip integration test if no database available
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Load configuration with explicit environment variables for integration tests
	os.Setenv("DB_USER", "xiaozhu")
	os.Setenv("DB_PASSWORD", "12345679")
	os.Setenv("DB_NAME", "go_manage_starter")
	os.Setenv("DB_SCHEMA", "manage_dev")
	
	cfg := config.Load()
	
	// Setup test database connection
	db, err := database.Init(cfg.Database)
	require.NoError(t, err)
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()
	
	// Clean up test data
	defer func() {
		db.Exec("DELETE FROM users WHERE username LIKE 'test_crud_%'")
	}()

	// Create services
	userRepo := repository.NewUserRepository(db)
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpireTime)
	userService := service.NewUserService(userRepo, jwtManager)

	// Create user
	registerReq := &model.CreateUserRequest{
		Username: "test_crud_user",
		Email:    "test_crud@example.com",
		Password: "password123",
		Role:     "user",
	}

	user, err := userService.Register(registerReq)
	require.NoError(t, err)
	userID := user.ID

	// Read user
	retrievedUser, err := userService.GetByID(userID)
	require.NoError(t, err)
	assert.Equal(t, user.Username, retrievedUser.Username)
	assert.Equal(t, user.Email, retrievedUser.Email)

	// Update user
	updateReq := &model.UpdateUserRequest{
		Username: "test_crud_user_updated",
		Email:    "test_crud_updated@example.com",
		Role:     "admin",
		Status:   "inactive",
	}

	updatedUser, err := userService.Update(userID, updateReq)
	require.NoError(t, err)
	assert.Equal(t, "test_crud_user_updated", updatedUser.Username)
	assert.Equal(t, "test_crud_updated@example.com", updatedUser.Email)
	assert.Equal(t, "admin", updatedUser.Role)
	assert.Equal(t, "inactive", updatedUser.Status)

	// List users
	users, total, err := userService.List(1, 10)
	require.NoError(t, err)
	assert.Greater(t, total, int64(0))
	assert.NotEmpty(t, users)

	// Delete user
	err = userService.Delete(userID)
	require.NoError(t, err)

	// Verify user is deleted
	_, err = userService.GetByID(userID)
	assert.Error(t, err)
}