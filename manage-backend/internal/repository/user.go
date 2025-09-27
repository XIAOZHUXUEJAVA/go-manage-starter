package repository

import (
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/model"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&model.User{}, id).Error
}

func (r *UserRepository) List(offset, limit int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	err := r.db.Model(&model.User{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// CheckUsernameExists 检查用户名是否存在
func (r *UserRepository) CheckUsernameExists(username string) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}

// CheckEmailExists 检查邮箱是否存在
func (r *UserRepository) CheckEmailExists(email string) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// CheckUsernameExistsExcludeID 检查用户名是否存在（排除指定ID）
func (r *UserRepository) CheckUsernameExistsExcludeID(username string, excludeID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("username = ? AND id != ?", username, excludeID).Count(&count).Error
	return count > 0, err
}

// CheckEmailExistsExcludeID 检查邮箱是否存在（排除指定ID）
func (r *UserRepository) CheckEmailExistsExcludeID(email string, excludeID uint) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("email = ? AND id != ?", email, excludeID).Count(&count).Error
	return count > 0, err
}