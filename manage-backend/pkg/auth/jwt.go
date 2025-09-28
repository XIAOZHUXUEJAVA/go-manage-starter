package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	JTI      string `json:"jti"` // JWT ID for blacklist support
	jwt.RegisteredClaims
}

type JWTManager struct {
	secretKey            string
	accessTokenExpire    time.Duration
	refreshTokenExpire   time.Duration
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`    // Access token expiration in seconds
	RefreshExpiresIn int64 `json:"refresh_expires_in"` // Refresh token expiration in seconds
}

func NewJWTManager(secretKey string, accessExpireMinutes, refreshExpireHours int) *JWTManager {
	return &JWTManager{
		secretKey:            secretKey,
		accessTokenExpire:    time.Duration(accessExpireMinutes) * time.Minute,
		refreshTokenExpire:   time.Duration(refreshExpireHours) * time.Hour,
	}
}

// GenerateTokenPair generates both access and refresh tokens
func (j *JWTManager) GenerateTokenPair(userID uint, username, role string) (*TokenPair, error) {
	// Generate access token with JTI
	accessJTI, err := j.generateJTI()
	if err != nil {
		return nil, err
	}

	accessClaims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		JTI:      accessJTI,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.accessTokenExpire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "go-manage-starter",
			Subject:   "access",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(j.secretKey))
	if err != nil {
		return nil, err
	}

	// Generate refresh token with JTI
	refreshJTI, err := j.generateJTI()
	if err != nil {
		return nil, err
	}

	refreshClaims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		JTI:      refreshJTI,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.refreshTokenExpire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "go-manage-starter",
			Subject:   "refresh",
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(j.secretKey))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:      accessTokenString,
		RefreshToken:     refreshTokenString,
		ExpiresIn:        int64(j.accessTokenExpire.Seconds()),
		RefreshExpiresIn: int64(j.refreshTokenExpire.Seconds()),
	}, nil
}

// GenerateToken generates only access token (for backward compatibility)
func (j *JWTManager) GenerateToken(userID uint, username, role string) (string, error) {
	tokenPair, err := j.GenerateTokenPair(userID, username, role)
	if err != nil {
		return "", err
	}
	return tokenPair.AccessToken, nil
}

// ValidateToken validates and parses JWT token
func (j *JWTManager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// ValidateRefreshToken validates refresh token specifically
func (j *JWTManager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims, err := j.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.Subject != "refresh" {
		return nil, errors.New("invalid refresh token")
	}

	return claims, nil
}

// generateJTI generates a unique JWT ID
func (j *JWTManager) generateJTI() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GetTokenExpiration returns the remaining time until token expires
func (j *JWTManager) GetTokenExpiration(claims *Claims) time.Duration {
	if claims.ExpiresAt == nil {
		return 0
	}
	return time.Until(claims.ExpiresAt.Time)
}