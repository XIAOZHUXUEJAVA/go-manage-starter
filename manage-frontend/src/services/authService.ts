import { ApiService } from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthUser,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from "@/types/auth";
import { APIResponse } from "@/types/api";

/**
 * 认证相关 API 服务
 */
export class AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录响应（包含token和用户信息）
   */
  static async login(
    credentials: LoginRequest
  ): Promise<APIResponse<LoginResponse>> {
    return ApiService.post<LoginResponse>("/auth/login", credentials);
  }

  /**
   * 用户注册
   * @param data 注册数据
   * @returns 注册响应
   */
  static async register(data: RegisterRequest): Promise<APIResponse<AuthUser>> {
    return ApiService.post<AuthUser>("/auth/register", data);
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  static async getCurrentUser(): Promise<APIResponse<AuthUser>> {
    return ApiService.get<AuthUser>("/users/profile");
  }

  /**
   * 刷新access token
   * @param refreshToken 刷新token
   * @returns 新的access token
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<APIResponse<RefreshTokenResponse>> {
    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    return ApiService.post<RefreshTokenResponse>("/auth/refresh", request);
  }

  /**
   * 用户登出
   * @param refreshToken 可选的刷新token
   */
  static async logout(refreshToken?: string): Promise<APIResponse<null>> {
    const request: LogoutRequest = refreshToken
      ? { refresh_token: refreshToken }
      : {};
    return ApiService.post<null>("/auth/logout", request);
  }
}
