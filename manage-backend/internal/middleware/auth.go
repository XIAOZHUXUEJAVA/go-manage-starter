package middleware

import (
	"context"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/internal/utils"
	"github.com/XIAOZHUXUEJAVA/go-manage-starter/manage-backend/pkg/auth"
)

// SessionServiceInterface defines the interface for session service in middleware
type SessionServiceInterface interface {
	IsTokenBlacklisted(ctx context.Context, jti string) bool
	UpdateLastActivity(ctx context.Context, userID uint) error
	SetUserActive(ctx context.Context, userID uint) error
}

func JWTAuth(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return JWTAuthWithSession(jwtManager, nil)
}

func JWTAuthWithSession(jwtManager *auth.JWTManager, sessionService SessionServiceInterface) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "Authorization header required")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			utils.Unauthorized(c, "Bearer token required")
			c.Abort()
			return
		}

		claims, err := jwtManager.ValidateToken(tokenString)
		if err != nil {
			utils.Unauthorized(c, "Invalid token")
			c.Abort()
			return
		}

		// Check if token is blacklisted (if session service is available)
		if sessionService != nil {
			ctx := context.Background()
			if sessionService.IsTokenBlacklisted(ctx, claims.JTI) {
				utils.Unauthorized(c, "Token has been revoked")
				c.Abort()
				return
			}

			// Update user activity
			sessionService.UpdateLastActivity(ctx, claims.UserID)
			sessionService.SetUserActive(ctx, claims.UserID)
		}

		// Set user information in context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("jti", claims.JTI)
		c.Set("access_token", tokenString)
		c.Next()
	})
}

// RefreshTokenAuth middleware for refresh token endpoints
func RefreshTokenAuth(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		var req struct {
			RefreshToken string `json:"refresh_token" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request format")
			c.Abort()
			return
		}

		claims, err := jwtManager.ValidateRefreshToken(req.RefreshToken)
		if err != nil {
			utils.Unauthorized(c, "Invalid refresh token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("refresh_token", req.RefreshToken)
		c.Next()
	})
}