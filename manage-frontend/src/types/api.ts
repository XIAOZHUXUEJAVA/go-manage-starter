// API 响应类型定义
export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

// 分页信息 - 匹配后端返回的字段名
export interface PaginationInfo {
  page: number;
  page_size: number; // 后端返回的是 page_size
  total: number;
  total_pages: number; // 后端返回的是 total_pages
}

// 用户相关类型 - 匹配后端返回的字段名
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string; // 后端使用下划线命名
  updated_at: string; // 后端使用下划线命名
}

// 用户列表响应 - 后端直接返回用户数组，分页信息在外层
export type UserListResponse = User[];

// 分页查询参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// API 错误类型
export interface APIError {
  code: number;
  message: string;
  error?: string;
}
