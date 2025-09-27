// 用户相关API服务
import { ApiService } from "@/lib/api";
import { APIResponse } from "@/types/common";
import {
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  CheckUserExistsRequest,
  UserValidationResult,
} from "@/types/user";

export class UserApi {
  private static readonly BASE_URL = "/users";

  /**
   * 获取用户列表
   */
  static async getUsers(
    params?: UserQueryParams
  ): Promise<APIResponse<UserListResponse>> {
    return ApiService.get<UserListResponse>(this.BASE_URL, params);
  }

  /**
   * 根据ID获取用户详情
   */
  static async getUserById(id: number): Promise<APIResponse<User>> {
    return ApiService.get<User>(`${this.BASE_URL}/${id}`);
  }

  /**
   * 创建新用户
   */
  static async createUser(
    userData: CreateUserRequest
  ): Promise<APIResponse<User>> {
    return ApiService.post<User>(this.BASE_URL, userData);
  }

  /**
   * 更新用户信息
   */
  static async updateUser(
    id: number,
    userData: UpdateUserRequest
  ): Promise<APIResponse<User>> {
    return ApiService.put<User>(`${this.BASE_URL}/${id}`, userData);
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<APIResponse<void>> {
    return ApiService.delete<void>(`${this.BASE_URL}/${id}`);
  }

  /**
   * 批量删除用户
   */
  static async deleteUsers(ids: number[]): Promise<APIResponse<void>> {
    return ApiService.post<void>(`${this.BASE_URL}/batch-delete`, { ids });
  }

  /**
   * 检查用户是否存在
   */
  static async checkUserExists(
    params: CheckUserExistsRequest
  ): Promise<APIResponse<UserValidationResult>> {
    return ApiService.post<UserValidationResult>(
      `${this.BASE_URL}/check-exists`,
      params
    );
  }

  /**
   * 获取用户角色列表
   */
  static async getUserRoles(): Promise<APIResponse<string[]>> {
    return ApiService.get<string[]>(`${this.BASE_URL}/roles`);
  }

  /**
   * 检查用户名是否可用
   */
  static async checkUsernameAvailable(
    username: string
  ): Promise<APIResponse<{ available: boolean; message?: string }>> {
    return ApiService.get<{ available: boolean; message?: string }>(
      `${this.BASE_URL}/check-username`,
      { username }
    );
  }

  /**
   * 检查邮箱是否可用
   */
  static async checkEmailAvailable(
    email: string
  ): Promise<APIResponse<{ available: boolean; message?: string }>> {
    return ApiService.get<{ available: boolean; message?: string }>(
      `${this.BASE_URL}/check-email`,
      { email }
    );
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(): Promise<
    APIResponse<{
      total: number;
      active: number;
      inactive: number;
      byRole: Record<string, number>;
    }>
  > {
    return ApiService.get(`${this.BASE_URL}/stats`);
  }
}
