package handler

import (
	"strconv"

	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/service"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type PublicUserHandler struct {
	userService *service.UserService
}

func NewPublicUserHandler(userService *service.UserService) *PublicUserHandler {
	return &PublicUserHandler{
		userService: userService,
	}
}

// GetUser 获取用户信息（公开接口，无需登录）
// @Summary 获取用户信息
// @Description 根据用户ID获取用户的基本信息，无需登录验证
// @Tags 公开接口
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} utils.APIResponse{data=model.UserResponse} "获取成功"
// @Failure 400 {object} utils.APIResponse "请求参数错误"
// @Failure 404 {object} utils.APIResponse "用户不存在"
// @Failure 500 {object} utils.APIResponse "服务器内部错误"
// @Router /public/users/{id} [get]
func (h *PublicUserHandler) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "invalid user id")
		return
	}

	user, err := h.userService.GetByID(uint(id))
	if err != nil {
		if err.Error() == "user not found" {
			utils.NotFound(c, "user not found")
			return
		}
		utils.InternalServerError(c, "failed to get user information")
		return
	}

	utils.Success(c, user)
}

// ListUsers 获取用户列表（公开接口，无需登录）
// @Summary 获取用户列表
// @Description 获取用户列表，支持分页，无需登录验证
// @Tags 公开接口
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Success 200 {object} utils.PaginatedResponse{data=[]model.UserResponse} "获取成功"
// @Failure 400 {object} utils.APIResponse "请求参数错误"
// @Failure 500 {object} utils.APIResponse "服务器内部错误"
// @Router /public/users [get]
func (h *PublicUserHandler) ListUsers(c *gin.Context) {
	// 解析查询参数
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 50 { // 限制最大每页数量
		pageSize = 50
	}

	// 调用服务层的 List 方法
	users, total, err := h.userService.List(page, pageSize)
	if err != nil {
		utils.InternalServerError(c, "failed to get user list")
		return
	}

	// 计算分页信息
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))
	pagination := utils.PaginationMeta{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	}

	utils.PaginatedSuccess(c, users, pagination)
}