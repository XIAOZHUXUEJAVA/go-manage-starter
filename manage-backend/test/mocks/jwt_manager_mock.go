package mocks

import (
	"github.com/stretchr/testify/mock"
)

// MockJWTManager is a mock implementation of JWTManager
type MockJWTManager struct {
	mock.Mock
}

func (m *MockJWTManager) GenerateToken(userID uint, username, role string) (string, error) {
	args := m.Called(userID, username, role)
	return args.String(0), args.Error(1)
}

// Note: ValidateToken is not used in UserService, so we don't need to mock it for these tests