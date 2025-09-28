/**
 * Token管理工具函数
 * 支持双token（Access Token + Refresh Token）认证系统
 */

/**
 * 获取存储的访问token
 * @returns access token字符串或null
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access-token");
}

/**
 * 获取存储的刷新token
 * @returns refresh token字符串或null
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh-token");
}

/**
 * 获取token过期时间
 * @returns 过期时间戳或null
 */
export function getTokenExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const expiresAt = localStorage.getItem("token-expires-at");
  return expiresAt ? parseInt(expiresAt, 10) : null;
}

/**
 * 设置认证tokens
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param expiresIn - access token过期时间（秒）
 */
export function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  if (typeof window === "undefined") return;

  const expiresAt = Date.now() + expiresIn * 1000;

  localStorage.setItem("access-token", accessToken);
  localStorage.setItem("refresh-token", refreshToken);
  localStorage.setItem("token-expires-at", expiresAt.toString());
}

/**
 * 更新访问token
 * @param accessToken - 新的access token
 * @param expiresIn - 过期时间（秒）
 */
export function updateAccessToken(
  accessToken: string,
  expiresIn: number
): void {
  if (typeof window === "undefined") return;

  const expiresAt = Date.now() + expiresIn * 1000;

  localStorage.setItem("access-token", accessToken);
  localStorage.setItem("token-expires-at", expiresAt.toString());
}

/**
 * 移除所有认证tokens
 */
export function removeTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access-token");
  localStorage.removeItem("refresh-token");
  localStorage.removeItem("token-expires-at");
  localStorage.removeItem("auth-storage");
}

/**
 * 检查access token是否有效
 * @returns 是否有效
 */
export function isAccessTokenValid(): boolean {
  const token = getAccessToken();
  const expiresAt = getTokenExpiresAt();

  if (!token || !expiresAt) return false;

  // 检查是否过期（提前30秒判断为过期）
  return Date.now() < expiresAt - 30 * 1000;
}

/**
 * 检查用户是否已认证（有有效的access token或可用的refresh token）
 * @returns 是否已认证
 */
export function isAuthenticated(): boolean {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // 如果有有效的access token，直接返回true
  if (accessToken && isAccessTokenValid()) {
    return true;
  }

  // 如果access token无效但有refresh token，也认为是已认证状态
  // 实际的token刷新会在API调用时自动处理
  return !!refreshToken;
}

/**
 * 检查access token是否即将过期（5分钟内）
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;

  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return expiresAt < fiveMinutesFromNow;
}

/**
 * 解析JWT payload（不验证签名，仅用于客户端显示）
 * @param token - JWT token
 * @returns payload对象或null
 */
export function parseJWTPayload(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * 获取当前用户信息（从access token中解析）
 * @returns 用户信息或null
 */
export function getCurrentUserFromToken(): any {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const payload = parseJWTPayload(accessToken);
  return payload
    ? {
        id: payload.user_id,
        username: payload.username,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat,
        jti: payload.jti,
      }
    : null;
}

// 向后兼容的函数别名
export const getToken = getAccessToken;
export const removeToken = removeTokens;
