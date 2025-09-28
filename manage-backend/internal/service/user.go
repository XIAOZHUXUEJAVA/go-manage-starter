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

// UserRepositoryInterface defines the interface for user repository
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

// JWTManagerInterface defines the interface for JWT manager
type JWTManagerInterface interface {
	GenerateToken(userID uint, username, role string) (string, error)
	GenerateTokenPair(userID uint, username, role string) (*auth.TokenPair, error)
	ValidateToken(tokenString string) (*auth.Claims, error)
	ValidateRefreshToken(tokenString string) (*auth.Claims, error)
	GetTokenExpiration(claims *auth.Claims) time.Duration
}

// SessionServiceInterface defines the interface for session service
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
	// Check if username already exists
	_, err := s.userRepo.GetByUsername(req.Username)
	if err == nil {
		return nil, errors.New("username already exists")
	}

	// Check if email already exists
	_, err = s.userRepo.GetByEmail(req.Email)
	if err == nil {
		return nil, errors.New("email already exists")
	}

	// Hash password
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

// LoginWithContext performs login with session context information
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

	// Generate token pair
	tokenPair, err := s.jwtManager.GenerateTokenPair(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	// Create session in Redis
	if s.sessionService != nil {
		err = s.sessionService.CreateSession(ctx, user.ID, user.Username, tokenPair.RefreshToken, deviceInfo, ipAddress, userAgent)
		if err != nil {
			return nil, err
		}

		// Set user as active
		s.sessionService.SetUserActive(ctx, user.ID)

		// Cache user permissions
		permissions := []string{} // You can extend this based on your permission system
		s.sessionService.CacheUserPermissions(ctx, user.ID, user.Role, permissions)
	}

	// Create a safe user response without password
	safeUser := model.User{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		Status:    user.Status,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		// Password field is intentionally omitted for security
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

// RefreshToken refreshes the access token using refresh token
func (s *UserService) RefreshToken(ctx context.Context, req *model.RefreshTokenRequest) (*model.RefreshTokenResponse, error) {
	if s.sessionService == nil {
		return nil, errors.New("session service not available")
	}

	// Validate refresh token and get session
	sessionInfo, err := s.sessionService.ValidateRefreshToken(ctx, req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Generate new access token
	tokenPair, err := s.jwtManager.GenerateTokenPair(sessionInfo.UserID, sessionInfo.Username, "user") // You might want to get role from session
	if err != nil {
		return nil, err
	}

	// Update session with new refresh token
	err = s.sessionService.CreateSession(ctx, sessionInfo.UserID, sessionInfo.Username, tokenPair.RefreshToken, sessionInfo.DeviceInfo, sessionInfo.IPAddress, sessionInfo.UserAgent)
	if err != nil {
		return nil, err
	}

	// Update last activity
	s.sessionService.UpdateLastActivity(ctx, sessionInfo.UserID)

	return &model.RefreshTokenResponse{
		AccessToken: tokenPair.AccessToken,
		ExpiresIn:   tokenPair.ExpiresIn,
		TokenType:   "Bearer",
	}, nil
}

// Logout performs user logout
func (s *UserService) Logout(ctx context.Context, userID uint, accessToken string, req *model.LogoutRequest) error {
	if s.sessionService == nil {
		return errors.New("session service not available")
	}

	// Validate and get access token claims
	claims, err := s.jwtManager.ValidateToken(accessToken)
	if err != nil {
		return errors.New("invalid access token")
	}

	// Add access token to blacklist
	expiration := s.jwtManager.GetTokenExpiration(claims)
	if expiration > 0 {
		err = s.sessionService.AddTokenToBlacklist(ctx, claims.JTI, expiration)
		if err != nil {
			return err
		}
	}

	// If refresh token is provided, validate and blacklist it too
	if req.RefreshToken != "" {
		refreshClaims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken)
		if err == nil {
			refreshExpiration := s.jwtManager.GetTokenExpiration(refreshClaims)
			if refreshExpiration > 0 {
				s.sessionService.AddTokenToBlacklist(ctx, refreshClaims.JTI, refreshExpiration)
			}
		}
	}

	// Delete session
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