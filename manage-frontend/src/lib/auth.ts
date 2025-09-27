import { NextRequest } from "next/server";

/**
 * 认证工具函数
 */

/**
 * 从请求中获取 token
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // 从 Authorization header 获取
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 从 cookie 获取
  const tokenCookie = request.cookies.get("auth-token");
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * 检查是否为受保护的路由
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    "/",
    "/dashboard",
    "/users",
    "/profile",
    "/settings",
  ];
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * 检查是否为认证路由（登录、注册等）
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/login", "/register", "/forgot-password"];
  return authRoutes.includes(pathname);
}

/**
 * 验证 JWT token 格式
 */
export function isValidJWTFormat(token: string): boolean {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
}

/**
 * 解析 JWT payload（不验证签名，仅用于客户端显示）
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
 * 检查 token 是否过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
