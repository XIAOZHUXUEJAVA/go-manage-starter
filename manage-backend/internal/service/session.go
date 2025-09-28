package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/cache"
)

// SessionInfo 表示用户会话信息
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

// CreateSession 创建一个新的用户会话（存储到 Redis）
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
		return fmt.Errorf("序列化会话信息失败: %w", err)
	}

	sessionKey := fmt.Sprintf("user:session:%d", userID)
	// 设置 30 天过期（与刷新令牌一致）
	return s.redisClient.Set(ctx, sessionKey, sessionData, 30*24*time.Hour)
}

// GetSession 从 Redis 获取用户会话
func (s *SessionService) GetSession(ctx context.Context, userID uint) (*SessionInfo, error) {
	sessionKey := fmt.Sprintf("user:session:%d", userID)
	sessionData, err := s.redisClient.Get(ctx, sessionKey)
	if err != nil {
		return nil, fmt.Errorf("未找到会话: %w", err)
	}

	var sessionInfo SessionInfo
	if err := json.Unmarshal([]byte(sessionData), &sessionInfo); err != nil {
		return nil, fmt.Errorf("反序列化会话信息失败: %w", err)
	}

	return &sessionInfo, nil
}

// UpdateLastActivity 更新用户会话的最后活跃时间
func (s *SessionService) UpdateLastActivity(ctx context.Context, userID uint) error {
	sessionInfo, err := s.GetSession(ctx, userID)
	if err != nil {
		return err
	}

	sessionInfo.LastActivity = time.Now()

	sessionData, err := json.Marshal(sessionInfo)
	if err != nil {
		return fmt.Errorf("序列化会话信息失败: %w", err)
	}

	sessionKey := fmt.Sprintf("user:session:%d", userID)
	return s.redisClient.Set(ctx, sessionKey, sessionData, 30*24*time.Hour)
}

// DeleteSession 删除 Redis 中的用户会话
func (s *SessionService) DeleteSession(ctx context.Context, userID uint) error {
	sessionKey := fmt.Sprintf("user:session:%d", userID)
	return s.redisClient.Del(ctx, sessionKey)
}

// ValidateRefreshToken 校验刷新令牌是否合法，并验证 Redis 中的会话
func (s *SessionService) ValidateRefreshToken(ctx context.Context, refreshToken string) (*SessionInfo, error) {
	// 先校验 JWT 格式
	claims, err := s.jwtManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, fmt.Errorf("刷新令牌无效: %w", err)
	}

	// 检查是否在黑名单中
	if s.IsTokenBlacklisted(ctx, claims.JTI) {
		return nil, fmt.Errorf("刷新令牌已被加入黑名单")
	}

	// 从 Redis 获取会话
	sessionInfo, err := s.GetSession(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("未找到会话: %w", err)
	}

	// 校验 Redis 中的刷新令牌是否一致
	if sessionInfo.RefreshToken != refreshToken {
		return nil, fmt.Errorf("刷新令牌不匹配")
	}

	return sessionInfo, nil
}

// AddTokenToBlacklist 将令牌 JTI 加入黑名单
func (s *SessionService) AddTokenToBlacklist(ctx context.Context, jti string, expiration time.Duration) error {
	blacklistKey := fmt.Sprintf("token:blacklist:%s", jti)
	return s.redisClient.Set(ctx, blacklistKey, "blacklisted", expiration)
}

// IsTokenBlacklisted 检查令牌 JTI 是否在黑名单中
func (s *SessionService) IsTokenBlacklisted(ctx context.Context, jti string) bool {
	blacklistKey := fmt.Sprintf("token:blacklist:%s", jti)
	exists, err := s.redisClient.Exists(ctx, blacklistKey)
	if err != nil {
		return false
	}
	return exists > 0
}

// SetUserActive 标记用户为活跃状态（设置 TTL）
func (s *SessionService) SetUserActive(ctx context.Context, userID uint) error {
	activeKey := fmt.Sprintf("user:active:%d", userID)
	return s.redisClient.Set(ctx, activeKey, time.Now().Unix(), 30*time.Minute)
}

// IsUserActive 检查用户当前是否活跃
func (s *SessionService) IsUserActive(ctx context.Context, userID uint) bool {
	activeKey := fmt.Sprintf("user:active:%d", userID)
	exists, err := s.redisClient.Exists(ctx, activeKey)
	if err != nil {
		return false
	}
	return exists > 0
}

// CacheUserPermissions 缓存用户权限到 Redis
func (s *SessionService) CacheUserPermissions(ctx context.Context, userID uint, role string, permissions []string) error {
	permissionData := map[string]interface{}{
		"role":        role,
		"permissions": permissions,
		"cached_at":   time.Now().Unix(),
	}

	data, err := json.Marshal(permissionData)
	if err != nil {
		return fmt.Errorf("序列化权限数据失败: %w", err)
	}

	permissionKey := fmt.Sprintf("user:permissions:%d", userID)
	return s.redisClient.Set(ctx, permissionKey, data, time.Hour)
}

// GetCachedUserPermissions 获取缓存的用户权限
func (s *SessionService) GetCachedUserPermissions(ctx context.Context, userID uint) (string, []string, error) {
	permissionKey := fmt.Sprintf("user:permissions:%d", userID)
	data, err := s.redisClient.Get(ctx, permissionKey)
	if err != nil {
		return "", nil, fmt.Errorf("权限未缓存: %w", err)
	}

	var permissionData map[string]interface{}
	if err := json.Unmarshal([]byte(data), &permissionData); err != nil {
		return "", nil, fmt.Errorf("反序列化权限数据失败: %w", err)
	}

	role, _ := permissionData["role"].(string)
	permissionsInterface, _ := permissionData["permissions"].([]interface{})

	permissions := make([]string, len(permissionsInterface))
	for i, p := range permissionsInterface {
		permissions[i], _ = p.(string)
	}

	return role, permissions, nil
}

// CleanupExpiredSessions 清理过期会话（可由定时任务调用）
func (s *SessionService) CleanupExpiredSessions(ctx context.Context) error {
	// 这里是一个占位方法
	// 在实际实现中，你可能需要扫描过期会话并删除
	// 但 Redis TTL 已经能处理大部分场景
	return nil
}
