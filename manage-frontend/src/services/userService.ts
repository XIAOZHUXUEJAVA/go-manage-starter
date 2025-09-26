import { ApiService } from "@/lib/api";
import {
  User,
  UserListResponse,
  PaginationParams,
  APIResponse,
} from "@/types/api";

/**
 * 用户相关 API 服务
 */
export class UserService {
  /**
   * 获取单个用户信息
   * @param id 用户ID
   * @returns 用户信息
   */
  static async getUserById(id: number): Promise<APIResponse<User>> {
    return ApiService.get<User>(`/public/users/${id}`);
  }

  /**
   * 获取用户列表
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

    return ApiService.get<UserListResponse>("/public/users", queryParams);
  }
}
