import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { APIResponse, APIError } from "@/types/api";

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 响应拦截器 - 统一处理响应
apiClient.interceptors.response.use(
  (response: AxiosResponse<APIResponse>) => {
    // 成功响应直接返回
    return response;
  },
  (error: AxiosError<APIResponse>) => {
    // 统一错误处理
    const apiError: APIError = {
      code: error.response?.data?.code || error.response?.status || 500,
      message: error.response?.data?.message || error.message || "请求失败",
      error: error.response?.data?.error,
    };

    // 可以在这里添加全局错误处理逻辑
    console.error("API Error:", apiError);

    return Promise.reject(apiError);
  }
);

// 通用 API 请求方法
export class ApiService {
  /**
   * GET 请求
   */
  static async get<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<APIResponse<T>> {
    const response = await apiClient.get<APIResponse<T>>(url, { params });
    return response.data;
  }

  /**
   * POST 请求
   */
  static async post<T>(url: string, data?: unknown): Promise<APIResponse<T>> {
    const response = await apiClient.post<APIResponse<T>>(url, data);
    return response.data;
  }

  /**
   * PUT 请求
   */
  static async put<T>(url: string, data?: unknown): Promise<APIResponse<T>> {
    const response = await apiClient.put<APIResponse<T>>(url, data);
    return response.data;
  }

  /**
   * DELETE 请求
   */
  static async delete<T>(url: string): Promise<APIResponse<T>> {
    const response = await apiClient.delete<APIResponse<T>>(url);
    return response.data;
  }
}

export default apiClient;
