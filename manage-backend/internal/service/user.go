package service

import (
	"context"
	"errors"
	"time"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
	"gorm.io/gorm"
)

// UserRepositoryInterface 定义用户仓库接口
type UserRepositoryInterface interface {
	Create(user *model.User) error
	GetByID(id uint) (*model.User, error)
	GetByUsername(username string) (*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Update(user *model.User) error
	Delete(id uint) error
	List(offset, limit int) ([]model.User, int64, error)
	CheckUsernameExists(username string) (bool, error)
	CheckEmailExists(email string) (bool, error)
	CheckUsernameExistsExcludeID(username string, excludeID uint) (bool, error)
	CheckEmailExistsExcludeID(email string, excludeID uint) (bool, error)
}

// JWTManagerInterface 定义 JWT 管理器接口
type JWTManagerInterface interface {
	GenerateToken(userID uint, username, role string) (string, error)
	GenerateTokenPair(userID uint, username, role string) (*auth.TokenPair, error)
	ValidateToken(tokenString string) (*auth.Claims, error)
	ValidateRefreshToken(tokenString string) (*auth.Claims, error)
	GetTokenExpiration(claims *auth.Claims) time.Duration
}

// SessionServiceInterface 定义会话服务接口
type SessionServiceInterface interface {
	CreateSession(ctx context.Context, userID uint, username, refreshToken, deviceInfo, ipAddress, userAgent string) error
	GetSession(ctx context.Context, userID uint) (*SessionInfo, error)
	UpdateLastActivity(ctx context.Context, userID uint) error
	DeleteSession(ctx context.Context, userID uint) error
	ValidateRefreshToken(ctx context.Context, refreshToken string) (*SessionInfo, error)
	AddTokenToBlacklist(ctx context.Context, jti string, expiration time.Duration) error
	IsTokenBlacklisted(ctx context.Context, jti string) bool
	SetUserActive(ctx context.Context, userID uint) error
	CacheUserPermissions(ctx context.Context, userID uint, role string, permissions []string) error
}

type UserService struct {
	userRepo       UserRepositoryInterface
	jwtManager     JWTManagerInterface
	sessionService SessionServiceInterface
}

func NewUserService(userRepo UserRepositoryInterface, jwtManager JWTManagerInterface, sessionService SessionServiceInterface) *UserService {
	return &UserService{
		userRepo:       userRepo,
		jwtManager:     jwtManager,
		sessionService: sessionService,
	}
}

func (s *UserService) Register(req *model.CreateUserRequest) (*model.User, error) {
	// 检查用户名是否已存在
	_, err := s.userRepo.GetByUsername(req.Username)
	if err == nil {
		return nil, errors.New("username already exists")
	}

	// 检查邮箱是否已存在
	_, err = s.userRepo.GetByEmail(req.Email)
	if err == nil {
		return nil, errors.New("email already exists")
	}

	// 加密密码
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     req.Role,
	}

	if user.Role == "" {
		user.Role = "user"
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Login(req *model.LoginRequest) (*model.LoginResponse, error) {
	return s.LoginWithContext(context.Background(), req, "", "", "")
}

// LoginWithContext 带会话上下文信息的登录
func (s *UserService) LoginWithContext(ctx context.Context, req *model.LoginRequest, deviceInfo, ipAddress, userAgent string) (*model.LoginResponse, error) {
	user, err := s.userRepo.GetByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// 生成令牌对
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	// 在 Redis 中创建会话
	if s.sessionService != nil {
		err = s.sessionService.CreateSession(ctx, user.ID, user.Username, tokenPair.RefreshToken, deviceInfo, ipAddress, userAgent)
		if err != nil {
			return nil, err
		}

		// 设置用户为活跃状态
		s.sessionService.SetUserActive(ctx, user.ID)

		// 缓存用户权限
		permissions := []string{} // 可根据权限系统扩展
		s.sessionService.CacheUserPermissions(ctx, user.ID, user.Role, permissions)
	}

	// 创建安全的用户响应（不包含密码）
	safeUser := model.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		Status:    user.Status,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	return &model.LoginResponse{
		AccessToken:      tokenPair.AccessToken,
		RefreshToken:     tokenPair.RefreshToken,
		ExpiresIn:        tokenPair.ExpiresIn,
		RefreshExpiresIn: tokenPair.RefreshExpiresIn,
		TokenType:        "Bearer",
		User:             safeUser,
	}, nil
}

// RefreshToken 使用刷新令牌更新访问令牌
func (s *UserService) RefreshToken(ctx context.Context, req *model.RefreshTokenRequest) (*model.RefreshTokenResponse, error) {
	if s.sessionService == nil {
		return nil, errors.New("session service not available")
	}

	// 验证刷新令牌并获取会话
	sessionInfo, err := s.sessionService.ValidateRefreshToken(ctx, req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// 生成新的令牌对
	tokenPair, err := s.jwtManager.GenerateTokenPair(sessionInfo.UserID, sessionInfo.Username, "user") // 角色可从会话中获取
	if err != nil {
		return nil, err
	}

	// 用新的刷新令牌更新会话
	err = s.sessionService.CreateSession(ctx, sessionInfo.UserID, sessionInfo.Username, tokenPair.RefreshToken, sessionInfo.DeviceInfo, sessionInfo.IPAddress, sessionInfo.UserAgent)
	if err != nil {
		return nil, err
	}

	// 更新最后活跃时间
	s.sessionService.UpdateLastActivity(ctx, sessionInfo.UserID)

	return &model.RefreshTokenResponse{
		AccessToken: tokenPair.AccessToken,
		ExpiresIn:   tokenPair.ExpiresIn,
		TokenType:   "Bearer",
	}, nil
}

// Logout 用户登出
func (s *UserService) Logout(ctx context.Context, userID uint, accessToken string, req *model.LogoutRequest) error {
	if s.sessionService == nil {
		return errors.New("session service not available")
	}

	// 验证并获取访问令牌声明
	claims, err := s.jwtManager.ValidateToken(accessToken)
	if err != nil {
		return errors.New("invalid access token")
	}

	// 将访问令牌加入黑名单
	expiration := s.jwtManager.GetTokenExpiration(claims)
	if expiration > 0 {
		err = s.sessionService.AddTokenToBlacklist(ctx, claims.JTI, expiration)
		if err != nil {
			return err
		}
	}

	// 如果提供了刷新令牌，也验证并拉黑
	if req.RefreshToken != "" {
		refreshClaims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken)
		if err == nil {
			refreshExpiration := s.jwtManager.GetTokenExpiration(refreshClaims)
			if refreshExpiration > 0 {
				s.sessionService.AddTokenToBlacklist(ctx, refreshClaims.JTI, refreshExpiration)
			}
		}
	}

	// 删除会话
	return s.sessionService.DeleteSession(ctx, userID)
}

func (s *UserService) GetByID(id uint) (*model.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *UserService) Update(id uint, req *model.UpdateUserRequest) (*model.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Status != "" {
		user.Status = req.Status
	}

	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Delete(id uint) error {
	return s.userRepo.Delete(id)
}

func (s *UserService) List(page, pageSize int) ([]model.User, int64, error) {
	offset := (page - 1) * pageSize
	return s.userRepo.List(offset, pageSize)
}

// CheckUsernameAvailable 检查用户名是否可用
func (s *UserService) CheckUsernameAvailable(username string) (bool, error) {
	exists, err := s.userRepo.CheckUsernameExists(username)
	if err != nil {
		return false, err
	}
	return !exists, nil // 不存在则可用
}

// CheckEmailAvailable 检查邮箱是否可用
func (s *UserService) CheckEmailAvailable(email string) (bool, error) {
	exists, err := s.userRepo.CheckEmailExists(email)
	if err != nil {
		return false, err
	}
	return !exists, nil // 不存在则可用
}

// CheckUserDataAvailability 批量检查用户数据可用性
func (s *UserService) CheckUserDataAvailability(req *model.CheckAvailabilityRequest) (*model.CheckAvailabilityResponse, error) {
	response := &model.CheckAvailabilityResponse{}

	// 检查用户名
	if req.Username != "" {
		var available bool
		var err error
		
		if req.ExcludeUserID != nil && *req.ExcludeUserID > 0 {
			exists, err := s.userRepo.CheckUsernameExistsExcludeID(req.Username, *req.ExcludeUserID)
			if err != nil {
				return nil, err
			}
			available = !exists
		} else {
			available, err = s.CheckUsernameAvailable(req.Username)
			if err != nil {
				return nil, err
			}
		}

		message := "用户名可用"
		if !available {
			message = "用户名已被使用"
		}

		response.Username = &model.AvailabilityResult{
			Available: available,
			Message:   message,
		}
	}

	// 检查邮箱
	if req.Email != "" {
		var available bool
		var err error
		
		if req.ExcludeUserID != nil && *req.ExcludeUserID > 0 {
			exists, err := s.userRepo.CheckEmailExistsExcludeID(req.Email, *req.ExcludeUserID)
			if err != nil {
				return nil, err
			}
			available = !exists
		} else {
			available, err = s.CheckEmailAvailable(req.Email)
			if err != nil {
				return nil, err
			}
		}

		message := "邮箱可用"
		if !available {
			message = "邮箱已被使用"
		}

		response.Email = &model.AvailabilityResult{
			Available: available,
			Message:   message,
		}
	}

	return response, nil
}
