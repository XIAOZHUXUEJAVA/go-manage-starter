package service

import (
	"errors"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
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
}

// JWTManagerInterface defines the interface for JWT manager
type JWTManagerInterface interface {
	GenerateToken(userID uint, username, role string) (string, error)
}

type UserService struct {
	userRepo   UserRepositoryInterface
	jwtManager JWTManagerInterface
}

func NewUserService(userRepo UserRepositoryInterface, jwtManager JWTManagerInterface) *UserService {
	return &UserService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
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

	token, err := s.jwtManager.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
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
		Token: token,
		User:  safeUser,
	}, nil
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