// 用户API服务 - 对接真实后端
import { APIResponse } from "@/types/common";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  CheckUserExistsRequest,
  UserValidationResult,
} from "@/types/user";
import { useAuthStore } from "@/stores/authStore";

// 后端分页响应格式
interface BackendPaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// 后端简单可用性响应
interface BackendAvailabilityResponse {
  available: boolean;
}

export class UserApiService {
  private static readonly BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";

  /**
   * 获取用户列表
   */
  static async getUsers(
    params?: UserQueryParams
  ): Promise<APIResponse<User[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.pageSize)
        queryParams.append("page_size", params.pageSize.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role && params.role !== "all")
        queryParams.append("role", params.role);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);

      const url = `${this.BASE_URL}/users${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendPaginatedResponse<User> = await response.json();

      return {
        code: result.code,
        message: result.message,
        data: result.data,
        pagination: {
          page: result.pagination.page,
          page_size: result.pagination.page_size,
          total: result.pagination.total,
          total_pages: result.pagination.total_pages,
        },
      };
    } catch (error) {
      console.error("获取用户列表失败:", error);
      throw error;
    }
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(id: number): Promise<APIResponse<User>> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("获取用户详情失败:", error);
      throw error;
    }
  }

  /**
   * 创建用户
   */
  static async createUser(
    userData: CreateUserRequest
  ): Promise<APIResponse<User>> {
    try {
      const response = await fetch(`${this.BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("创建用户失败:", error);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  static async updateUser(
    id: number,
    userData: UpdateUserRequest
  ): Promise<APIResponse<User>> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("更新用户失败:", error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<APIResponse<void>> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("删除用户失败:", error);
      throw error;
    }
  }

  /**
   * 批量删除用户
   */
  static async deleteUsers(ids: number[]): Promise<APIResponse<void>> {
    try {
      // 后端没有批量删除接口，这里逐个删除
      const promises = ids.map((id) => this.deleteUser(id));
      await Promise.all(promises);

      return {
        code: 200,
        message: `成功删除 ${ids.length} 个用户`,
      };
    } catch (error) {
      console.error("批量删除用户失败:", error);
      throw error;
    }
  }

  /**
   * 检查用户名是否可用
   */
  static async checkUsernameAvailable(
    username: string
  ): Promise<APIResponse<{ available: boolean; message?: string }>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/users/check-username/${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<BackendAvailabilityResponse> =
        await response.json();

      return {
        code: result.code,
        message: result.message,
        data: {
          available: result.data?.available ?? false,
          message: result.data?.available ? "用户名可用" : "用户名已存在",
        },
      };
    } catch (error) {
      console.error("检查用户名可用性失败:", error);
      throw error;
    }
  }

  /**
   * 检查邮箱是否可用
   */
  static async checkEmailAvailable(
    email: string
  ): Promise<APIResponse<{ available: boolean; message?: string }>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/users/check-email/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<BackendAvailabilityResponse> =
        await response.json();

      return {
        code: result.code,
        message: result.message,
        data: {
          available: result.data?.available ?? false,
          message: result.data?.available ? "邮箱可用" : "邮箱已存在",
        },
      };
    } catch (error) {
      console.error("检查邮箱可用性失败:", error);
      throw error;
    }
  }

  /**
   * 检查用户数据可用性（批量检查）
   */
  static async checkUserExists(
    params: CheckUserExistsRequest
  ): Promise<APIResponse<UserValidationResult>> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/users/check-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: params.username,
            email: params.email,
            exclude_user_id: params.excludeId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // 转换后端响应格式为前端期望的格式
      const isValid =
        result.data?.username?.available !== false &&
        result.data?.email?.available !== false;
      let message = "可以使用";

      if (result.data?.username?.available === false) {
        message = "用户名已存在";
      } else if (result.data?.email?.available === false) {
        message = "邮箱已存在";
      }

      return {
        code: result.code,
        message: result.message,
        data: {
          isValid,
          message,
        },
      };
    } catch (error) {
      console.error("检查用户数据可用性失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户统计信息（模拟实现，后端暂无此接口）
   */
  static async getUserStats(): Promise<
    APIResponse<{
      total: number;
      active: number;
      inactive: number;
      byRole: Record<string, number>;
    }>
  > {
    try {
      // 获取所有用户来计算统计信息
      const usersResponse = await this.getUsers({ page: 1, pageSize: 1000 });
      const users = usersResponse.data || [];

      const total = users.length;
      const active = users.filter((user) => user.status === "active").length;
      const inactive = users.filter(
        (user) => user.status === "inactive"
      ).length;

      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        code: 200,
        message: "获取统计信息成功",
        data: {
          total,
          active,
          inactive,
          byRole,
        },
      };
    } catch (error) {
      console.error("获取用户统计信息失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户角色列表（模拟实现，后端暂无此接口）
   */
  static async getUserRoles(): Promise<APIResponse<string[]>> {
    return {
      code: 200,
      message: "获取角色列表成功",
      data: ["admin", "editor", "user"],
    };
  }

  /**
   * 获取存储的JWT token
   */
  private static getToken(): string {
    if (typeof window !== "undefined") {
      // 优先从Zustand store获取token
      try {
        const store = useAuthStore.getState();
        return store.token || "";
      } catch {
        // 如果Zustand不可用，回退到localStorage
        return localStorage.getItem("auth-token") || "";
      }
    }
    return "";
  }
}
