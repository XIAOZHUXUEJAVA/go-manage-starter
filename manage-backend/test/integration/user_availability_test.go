package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/stretchr/testify/assert"
)

func TestCheckUsernameAvailable(t *testing.T) {
	// 设置测试环境
	router := setupTestRouter()

	tests := []struct {
		name           string
		username       string
		expectedStatus int
		expectedAvailable bool
		setupData      func()
	}{
		{
			name:           "Available username",
			username:       "newuser123",
			expectedStatus: http.StatusOK,
			expectedAvailable: true,
			setupData:      func() {},
		},
		{
			name:           "Existing username",
			username:       "testuser",
			expectedStatus: http.StatusOK,
			expectedAvailable: false,
			setupData: func() {
				// 创建测试用户
				createTestUser("testuser", "test@example.com", "password123")
			},
		},
		{
			name:           "Empty username",
			username:       "",
			expectedStatus: http.StatusBadRequest,
			expectedAvailable: false,
			setupData:      func() {},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 设置测试数据
			tt.setupData()

			// 发送请求
			url := fmt.Sprintf("/api/users/check-username/%s", tt.username)
			req, _ := http.NewRequest("GET", url, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 验证响应
			assert.Equal(t, tt.expectedStatus, w.Code)

			if w.Code == http.StatusOK {
				var response struct {
					Code    int    `json:"code"`
					Message string `json:"message"`
					Data    model.SimpleAvailabilityResponse `json:"data"`
				}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedAvailable, response.Data.Available)
			}

			// 清理测试数据
			cleanupTestData()
		})
	}
}

func TestCheckEmailAvailable(t *testing.T) {
	router := setupTestRouter()

	tests := []struct {
		name           string
		email          string
		expectedStatus int
		expectedAvailable bool
		setupData      func()
	}{
		{
			name:           "Available email",
			email:          "new@example.com",
			expectedStatus: http.StatusOK,
			expectedAvailable: true,
			setupData:      func() {},
		},
		{
			name:           "Existing email",
			email:          "existing@example.com",
			expectedStatus: http.StatusOK,
			expectedAvailable: false,
			setupData: func() {
				createTestUser("existinguser", "existing@example.com", "password123")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupData()

			url := fmt.Sprintf("/api/users/check-email/%s", tt.email)
			req, _ := http.NewRequest("GET", url, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if w.Code == http.StatusOK {
				var response struct {
					Code    int    `json:"code"`
					Message string `json:"message"`
					Data    model.SimpleAvailabilityResponse `json:"data"`
				}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedAvailable, response.Data.Available)
			}

			cleanupTestData()
		})
	}
}

func TestCheckUserDataAvailability(t *testing.T) {
	router := setupTestRouter()

	tests := []struct {
		name           string
		requestData    model.CheckAvailabilityRequest
		expectedStatus int
		setupData      func()
		validateResponse func(t *testing.T, response model.CheckAvailabilityResponse)
	}{
		{
			name: "Check both username and email - both available",
			requestData: model.CheckAvailabilityRequest{
				Username: "newuser",
				Email:    "new@example.com",
			},
			expectedStatus: http.StatusOK,
			setupData:      func() {},
			validateResponse: func(t *testing.T, response model.CheckAvailabilityResponse) {
				assert.NotNil(t, response.Username)
				assert.True(t, response.Username.Available)
				assert.NotNil(t, response.Email)
				assert.True(t, response.Email.Available)
			},
		},
		{
			name: "Check existing username and email",
			requestData: model.CheckAvailabilityRequest{
				Username: "existinguser",
				Email:    "existing@example.com",
			},
			expectedStatus: http.StatusOK,
			setupData: func() {
				createTestUser("existinguser", "existing@example.com", "password123")
			},
			validateResponse: func(t *testing.T, response model.CheckAvailabilityResponse) {
				assert.NotNil(t, response.Username)
				assert.False(t, response.Username.Available)
				assert.NotNil(t, response.Email)
				assert.False(t, response.Email.Available)
			},
		},
		{
			name: "Check with exclude user ID",
			requestData: model.CheckAvailabilityRequest{
				Username:      "existinguser",
				Email:         "existing@example.com",
				ExcludeUserID: func() *uint { id := uint(1); return &id }(),
			},
			expectedStatus: http.StatusOK,
			setupData: func() {
				// 创建ID为1的用户
				createTestUserWithID(1, "existinguser", "existing@example.com", "password123")
			},
			validateResponse: func(t *testing.T, response model.CheckAvailabilityResponse) {
				// 排除自己的ID，应该显示可用
				assert.NotNil(t, response.Username)
				assert.True(t, response.Username.Available)
				assert.NotNil(t, response.Email)
				assert.True(t, response.Email.Available)
			},
		},
		{
			name: "Empty request",
			requestData: model.CheckAvailabilityRequest{},
			expectedStatus: http.StatusBadRequest,
			setupData:      func() {},
			validateResponse: func(t *testing.T, response model.CheckAvailabilityResponse) {},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupData()

			jsonData, _ := json.Marshal(tt.requestData)
			req, _ := http.NewRequest("POST", "/api/users/check-availability", bytes.NewBuffer(jsonData))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if w.Code == http.StatusOK {
				var response struct {
					Code    int    `json:"code"`
					Message string `json:"message"`
					Data    model.CheckAvailabilityResponse `json:"data"`
				}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				tt.validateResponse(t, response.Data)
			}

			cleanupTestData()
		})
	}
}

// 辅助函数
func createTestUser(username, email, password string) {
	// 实现创建测试用户的逻辑
	// 这里需要根据你的测试环境设置来实现
}

func createTestUserWithID(id uint, username, email, password string) {
	// 实现创建指定ID测试用户的逻辑
}

func cleanupTestData() {
	// 实现清理测试数据的逻辑
}

func setupTestRouter() *gin.Engine {
	// 实现设置测试路由的逻辑
	// 返回配置好的gin引擎
	return nil
}