package service

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/test/mocks"
)

func TestUserService_Register_Success(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.CreateUserRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
		Role:     "user",
	}

	// Mock repository calls
	mockRepo.On("GetByUsername", "testuser").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("GetByEmail", "test@example.com").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("Create", mock.AnythingOfType("*model.User")).Return(nil)

	user, err := service.Register(req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "user", user.Role)
	assert.NotEqual(t, "password123", user.Password) // Password should be hashed
	mockRepo.AssertExpectations(t)
}

func TestUserService_Register_UsernameExists(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.CreateUserRequest{
		Username: "existinguser",
		Email:    "test@example.com",
		Password: "password123",
	}

	existingUser := &model.User{
		ID:       1,
		Username: "existinguser",
		Email:    "existing@example.com",
	}

	mockRepo.On("GetByUsername", "existinguser").Return(existingUser, nil)

	user, err := service.Register(req)

	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Contains(t, err.Error(), "username already exists")
	mockRepo.AssertExpectations(t)
}

func TestUserService_Register_EmailExists(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.CreateUserRequest{
		Username: "testuser",
		Email:    "existing@example.com",
		Password: "password123",
	}

	existingUser := &model.User{
		ID:       1,
		Username: "existinguser",
		Email:    "existing@example.com",
	}

	mockRepo.On("GetByUsername", "testuser").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("GetByEmail", "existing@example.com").Return(existingUser, nil)

	user, err := service.Register(req)

	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Contains(t, err.Error(), "email already exists")
	mockRepo.AssertExpectations(t)
}

func TestUserService_Register_DefaultRole(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.CreateUserRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
		// Role is empty, should default to "user"
	}

	mockRepo.On("GetByUsername", "testuser").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("GetByEmail", "test@example.com").Return(nil, gorm.ErrRecordNotFound)
	mockRepo.On("Create", mock.AnythingOfType("*model.User")).Return(nil)

	user, err := service.Register(req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "user", user.Role) // Should default to "user"
	mockRepo.AssertExpectations(t)
}

func TestUserService_Login_Success(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	// Create a user with properly hashed password
	password := "password123"
	hashedPassword, err := utils.HashPassword(password)
	require.NoError(t, err)
	
	user := &model.User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Password: hashedPassword,
		Role:     "user",
	}

	req := &model.LoginRequest{
		Username: "testuser",
		Password: password,
	}

	mockRepo.On("GetByUsername", "testuser").Return(user, nil)
	mockJWT.On("GenerateToken", uint(1), "testuser", "user").Return("mock-jwt-token", nil)

	response, err := service.Login(req)

	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, "mock-jwt-token", response.Token)
	
	// Verify user information (password should be empty for security)
	assert.Equal(t, user.ID, response.User.ID)
	assert.Equal(t, user.Username, response.User.Username)
	assert.Equal(t, user.Email, response.User.Email)
	assert.Equal(t, user.Role, response.User.Role)
	assert.Equal(t, user.Status, response.User.Status)
	assert.Empty(t, response.User.Password, "Password should not be returned in login response")
	
	mockRepo.AssertExpectations(t)
	mockJWT.AssertExpectations(t)
}

func TestUserService_Login_UserNotFound(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.LoginRequest{
		Username: "nonexistent",
		Password: "password123",
	}

	mockRepo.On("GetByUsername", "nonexistent").Return(nil, gorm.ErrRecordNotFound)

	response, err := service.Login(req)

	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "invalid credentials")
	mockRepo.AssertExpectations(t)
}

func TestUserService_Login_WrongPassword(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	// Create a user with properly hashed password
	correctPassword := "password123"
	hashedPassword, err := utils.HashPassword(correctPassword)
	require.NoError(t, err)
	
	user := &model.User{
		ID:       1,
		Username: "testuser",
		Password: hashedPassword,
	}

	req := &model.LoginRequest{
		Username: "testuser",
		Password: "wrongpassword",
	}

	mockRepo.On("GetByUsername", "testuser").Return(user, nil)

	response, err := service.Login(req)

	assert.Error(t, err)
	assert.Nil(t, response)
	assert.Contains(t, err.Error(), "invalid credentials")
	mockRepo.AssertExpectations(t)
}

func TestUserService_Update_Success(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	existingUser := &model.User{
		ID:       1,
		Username: "oldusername",
		Email:    "old@example.com",
		Role:     "user",
		Status:   "active",
	}

	req := &model.UpdateUserRequest{
		Username: "newusername",
		Email:    "new@example.com",
		Role:     "admin",
		Status:   "inactive",
	}

	mockRepo.On("GetByID", uint(1)).Return(existingUser, nil)
	mockRepo.On("Update", mock.AnythingOfType("*model.User")).Return(nil)

	user, err := service.Update(1, req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "newusername", user.Username)
	assert.Equal(t, "new@example.com", user.Email)
	assert.Equal(t, "admin", user.Role)
	assert.Equal(t, "inactive", user.Status)
	mockRepo.AssertExpectations(t)
}

func TestUserService_Update_UserNotFound(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	req := &model.UpdateUserRequest{
		Username: "newusername",
	}

	mockRepo.On("GetByID", uint(999)).Return(nil, gorm.ErrRecordNotFound)

	user, err := service.Update(999, req)

	assert.Error(t, err)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestUserService_Delete_Success(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	mockRepo.On("Delete", uint(1)).Return(nil)

	err := service.Delete(1)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestUserService_Delete_Error(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	mockRepo.On("Delete", uint(1)).Return(errors.New("database error"))

	err := service.Delete(1)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "database error")
	mockRepo.AssertExpectations(t)
}

func TestUserService_List_Success(t *testing.T) {
	mockRepo := &mocks.MockUserRepository{}
	mockJWT := &mocks.MockJWTManager{}
	service := NewUserService(mockRepo, mockJWT)

	expectedUsers := []model.User{
		{ID: 1, Username: "user1", Email: "user1@example.com"},
		{ID: 2, Username: "user2", Email: "user2@example.com"},
	}

	mockRepo.On("List", 0, 10).Return(expectedUsers, int64(2), nil)

	users, total, err := service.List(1, 10)

	assert.NoError(t, err)
	assert.Equal(t, expectedUsers, users)
	assert.Equal(t, int64(2), total)
	mockRepo.AssertExpectations(t)
}