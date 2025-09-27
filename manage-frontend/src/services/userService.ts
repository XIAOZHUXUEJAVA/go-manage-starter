import { ApiService } from "@/lib/api";
import {
  User,
  UserListResponse,
  PaginationParams,
  APIResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/api";

/**
 * 用户相关 API 服务
 */
export class UserService {
  /**
   * 获取单个用户信息 (需要认证)
   * @param id 用户ID
   * @returns 用户信息
   */
  static async getUserById(id: number): Promise<APIResponse<User>> {
    return ApiService.get<User>(`/users/${id}`);
  }

  /**
   * 获取用户列表 (需要认证)
   * @param params 分页参数
   * @returns 用户列表和分页信息
   */
  static async getUserList(
    params?: PaginationParams
  ): Promise<APIResponse<UserListResponse>> {
    const queryParams = {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    };

    return ApiService.get<UserListResponse>("/users", queryParams);
  }

  /**
   * 创建新用户 (需要认证)
   * @param userData 用户创建数据
   * @returns 创建的用户信息
   */
  static async createUser(
    userData: CreateUserRequest
  ): Promise<APIResponse<User>> {
    return ApiService.post<User>("/users", userData);
  }

  /**
   * 更新用户信息 (需要认证)
   * @param id 用户ID
   * @param userData 用户更新数据
   * @returns 更新后的用户信息
   */
  static async updateUser(
    id: number,
    userData: UpdateUserRequest
  ): Promise<APIResponse<User>> {
    return ApiService.put<User>(`/users/${id}`, userData);
  }

  /**
   * 删除用户 (需要认证)
   * @param id 用户ID
   * @returns 删除结果
   */
  static async deleteUser(
    id: number
  ): Promise<APIResponse<{ message: string }>> {
    return ApiService.delete<{ message: string }>(`/users/${id}`);
  }

  /**
   * 检查用户名是否可用
   * @param username 用户名
   * @returns 是否可用
   */
  static async checkUsernameAvailable(
    username: string
  ): Promise<APIResponse<{ available: boolean }>> {
    return ApiService.get<{ available: boolean }>(
      `/users/check-username/${encodeURIComponent(username)}`
    );
  }

  /**
   * 检查邮箱是否可用
   * @param email 邮箱地址
   * @returns 是否可用
   */
  static async checkEmailAvailable(
    email: string
  ): Promise<APIResponse<{ available: boolean }>> {
    return ApiService.get<{ available: boolean }>(
      `/users/check-email/${encodeURIComponent(email)}`
    );
  }

  /**
   * 批量检查用户信息是否可用
   * @param data 要检查的数据
   * @returns 检查结果
   */
  static async checkUserDataAvailable(data: {
    username?: string;
    email?: string;
    excludeUserId?: number;
  }): Promise<
    APIResponse<{
      username?: { available: boolean; message?: string };
      email?: { available: boolean; message?: string };
    }>
  > {
    return ApiService.post<{
      username?: { available: boolean; message?: string };
      email?: { available: boolean; message?: string };
    }>("/users/check-availability", data);
  }
}
