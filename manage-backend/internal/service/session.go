package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
)

type SessionInfo struct {
	UserID       uint      `json:"user_id"`
	Username     string    `json:"username"`
	RefreshToken string    `json:"refresh_token"`
	DeviceInfo   string    `json:"device_info"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	LoginTime    time.Time `json:"login_time"`
	LastActivity time.Time `json:"last_activity"`
}

type SessionService struct {
	redisClient *cache.RedisClient
	jwtManager  *auth.JWTManager
}

func NewSessionService(redisClient *cache.RedisClient, jwtManager *auth.JWTManager) *SessionService {
	return &SessionService{
		redisClient: redisClient,
		jwtManager:  jwtManager,
	}
}

// CreateSession creates a new user session in Redis
func (s *SessionService) CreateSession(ctx context.Context, userID uint, username, refreshToken, deviceInfo, ipAddress, userAgent string) error {
	sessionInfo := &SessionInfo{
		UserID:       userID,
		Username:     username,
		RefreshToken: refreshToken,
		DeviceInfo:   deviceInfo,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		LoginTime:    time.Now(),
		LastActivity: time.Now(),
	}

	sessionData, err := json.Marshal(sessionInfo)
	if err != nil {
		return fmt.Errorf("failed to marshal session info: %w", err)
	}

	sessionKey := fmt.Sprintf("user:session:%d", userID)
	// Set session with 30 days expiration (same as refresh token)
	return s.redisClient.Set(ctx, sessionKey, sessionData, 30*24*time.Hour)
}

// GetSession retrieves user session from Redis
func (s *SessionService) GetSession(ctx context.Context, userID uint) (*SessionInfo, error) {
	sessionKey := fmt.Sprintf("user:session:%d", userID)
	sessionData, err := s.redisClient.Get(ctx, sessionKey)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	var sessionInfo SessionInfo
	if err := json.Unmarshal([]byte(sessionData), &sessionInfo); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session info: %w", err)
	}

	return &sessionInfo, nil
}

// UpdateLastActivity updates the last activity time for a user session
func (s *SessionService) UpdateLastActivity(ctx context.Context, userID uint) error {
	sessionInfo, err := s.GetSession(ctx, userID)
	if err != nil {
		return err
	}

	sessionInfo.LastActivity = time.Now()

	sessionData, err := json.Marshal(sessionInfo)
	if err != nil {
		return fmt.Errorf("failed to marshal session info: %w", err)
	}

	sessionKey := fmt.Sprintf("user:session:%d", userID)
	return s.redisClient.Set(ctx, sessionKey, sessionData, 30*24*time.Hour)
}

// DeleteSession removes user session from Redis
func (s *SessionService) DeleteSession(ctx context.Context, userID uint) error {
	sessionKey := fmt.Sprintf("user:session:%d", userID)
	return s.redisClient.Del(ctx, sessionKey)
}

// ValidateRefreshToken validates refresh token against stored session
func (s *SessionService) ValidateRefreshToken(ctx context.Context, refreshToken string) (*SessionInfo, error) {
	// First validate the JWT structure
	claims, err := s.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Check if token is blacklisted
	if s.IsTokenBlacklisted(ctx, claims.JTI) {
		return nil, fmt.Errorf("refresh token is blacklisted")
	}

	// Get session from Redis
	sessionInfo, err := s.GetSession(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	// Verify refresh token matches the one in session
	if sessionInfo.RefreshToken != refreshToken {
		return nil, fmt.Errorf("refresh token mismatch")
	}

	return sessionInfo, nil
}

// AddTokenToBlacklist adds a token JTI to the blacklist
func (s *SessionService) AddTokenToBlacklist(ctx context.Context, jti string, expiration time.Duration) error {
	blacklistKey := fmt.Sprintf("token:blacklist:%s", jti)
	return s.redisClient.Set(ctx, blacklistKey, "blacklisted", expiration)
}

// IsTokenBlacklisted checks if a token JTI is blacklisted
func (s *SessionService) IsTokenBlacklisted(ctx context.Context, jti string) bool {
	blacklistKey := fmt.Sprintf("token:blacklist:%s", jti)
	exists, err := s.redisClient.Exists(ctx, blacklistKey)
	if err != nil {
		return false
	}
	return exists > 0
}

// SetUserActive sets user as active with TTL
func (s *SessionService) SetUserActive(ctx context.Context, userID uint) error {
	activeKey := fmt.Sprintf("user:active:%d", userID)
	return s.redisClient.Set(ctx, activeKey, time.Now().Unix(), 30*time.Minute)
}

// IsUserActive checks if user is currently active
func (s *SessionService) IsUserActive(ctx context.Context, userID uint) bool {
	activeKey := fmt.Sprintf("user:active:%d", userID)
	exists, err := s.redisClient.Exists(ctx, activeKey)
	if err != nil {
		return false
	}
	return exists > 0
}

// CacheUserPermissions caches user permissions in Redis
func (s *SessionService) CacheUserPermissions(ctx context.Context, userID uint, role string, permissions []string) error {
	permissionData := map[string]interface{}{
		"role":        role,
		"permissions": permissions,
		"cached_at":   time.Now().Unix(),
	}

	data, err := json.Marshal(permissionData)
	if err != nil {
		return fmt.Errorf("failed to marshal permission data: %w", err)
	}

	permissionKey := fmt.Sprintf("user:permissions:%d", userID)
	return s.redisClient.Set(ctx, permissionKey, data, time.Hour)
}

// GetCachedUserPermissions retrieves cached user permissions
func (s *SessionService) GetCachedUserPermissions(ctx context.Context, userID uint) (string, []string, error) {
	permissionKey := fmt.Sprintf("user:permissions:%d", userID)
	data, err := s.redisClient.Get(ctx, permissionKey)
	if err != nil {
		return "", nil, fmt.Errorf("permissions not cached: %w", err)
	}

	var permissionData map[string]interface{}
	if err := json.Unmarshal([]byte(data), &permissionData); err != nil {
		return "", nil, fmt.Errorf("failed to unmarshal permission data: %w", err)
	}

	role, _ := permissionData["role"].(string)
	permissionsInterface, _ := permissionData["permissions"].([]interface{})
	
	permissions := make([]string, len(permissionsInterface))
	for i, p := range permissionsInterface {
		permissions[i], _ = p.(string)
	}

	return role, permissions, nil
}

// CleanupExpiredSessions removes expired sessions (can be called by a cron job)
func (s *SessionService) CleanupExpiredSessions(ctx context.Context) error {
	// This is a placeholder for cleanup logic
	// In a real implementation, you might scan for expired sessions
	// and remove them, but Redis TTL handles most of this automatically
	return nil
}