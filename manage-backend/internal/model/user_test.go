package model

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUser_JSONSerialization(t *testing.T) {
	user := User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Password: "hashedpassword",
		Role:     "user",
		Status:   "active",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)

	// Password should not be included in JSON (json:"-" tag)
	jsonString := string(jsonData)
	assert.NotContains(t, jsonString, "hashedpassword")
	assert.Contains(t, jsonString, "testuser")
	assert.Contains(t, jsonString, "test@example.com")

	// Test JSON unmarshaling
	var unmarshaled User
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, unmarshaled.ID)
	assert.Equal(t, user.Username, unmarshaled.Username)
	assert.Equal(t, user.Email, unmarshaled.Email)
	assert.Equal(t, user.Role, unmarshaled.Role)
	assert.Equal(t, user.Status, unmarshaled.Status)
	// Password should be empty after unmarshaling
	assert.Empty(t, unmarshaled.Password)
}

func TestCreateUserRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request CreateUserRequest
		valid   bool
	}{
		{
			name: "valid request",
			request: CreateUserRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "password123",
				Role:     "user",
			},
			valid: true,
		},
		{
			name: "valid request without role",
			request: CreateUserRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "password123",
			},
			valid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Test JSON marshaling/unmarshaling
			jsonData, err := json.Marshal(tt.request)
			assert.NoError(t, err)

			var unmarshaled CreateUserRequest
			err = json.Unmarshal(jsonData, &unmarshaled)
			assert.NoError(t, err)

			if tt.valid {
				assert.Equal(t, tt.request.Username, unmarshaled.Username)
				assert.Equal(t, tt.request.Email, unmarshaled.Email)
				assert.Equal(t, tt.request.Password, unmarshaled.Password)
				assert.Equal(t, tt.request.Role, unmarshaled.Role)
			}
		})
	}
}

func TestUpdateUserRequest_PartialUpdate(t *testing.T) {
	// Test that UpdateUserRequest can handle partial updates
	req := UpdateUserRequest{
		Username: "newusername",
		// Email, Role, Status are omitted
	}

	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	var unmarshaled UpdateUserRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	assert.Equal(t, "newusername", unmarshaled.Username)
	assert.Empty(t, unmarshaled.Email)
	assert.Empty(t, unmarshaled.Role)
	assert.Empty(t, unmarshaled.Status)
}

func TestLoginRequest_JSONSerialization(t *testing.T) {
	req := LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	var unmarshaled LoginRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	assert.Equal(t, req.Username, unmarshaled.Username)
	assert.Equal(t, req.Password, unmarshaled.Password)
}

func TestLoginResponse_JSONSerialization(t *testing.T) {
	user := User{
		ID:       1,
		Username: "testuser",
		Email:    "test@example.com",
		Role:     "user",
		Status:   "active",
	}

	response := LoginResponse{
		Token: "jwt-token-here",
		User:  user,
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	// Verify token is included
	jsonString := string(jsonData)
	assert.Contains(t, jsonString, "jwt-token-here")
	assert.Contains(t, jsonString, "testuser")

	var unmarshaled LoginResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	assert.Equal(t, response.Token, unmarshaled.Token)
	assert.Equal(t, response.User.ID, unmarshaled.User.ID)
	assert.Equal(t, response.User.Username, unmarshaled.User.Username)
	assert.Equal(t, response.User.Email, unmarshaled.User.Email)
}