import { ApiService } from "@/lib/api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthUser,
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
   * 刷新token
   * @returns 新的token
   */
  static async refreshToken(): Promise<APIResponse<{ token: string }>> {
    return ApiService.post<{ token: string }>("/auth/refresh");
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<APIResponse<null>> {
    return ApiService.post<null>("/auth/logout");
  }
}
