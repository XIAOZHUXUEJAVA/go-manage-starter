// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 用户列表响应
export type UserListResponse = User[];

// 创建用户请求
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

// 更新用户请求
export interface UpdateUserRequest {
  id: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

// 用户查询参数
export interface UserQueryParams extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}

// 用户验证相关
export interface UserValidationResult {
  isValid: boolean;
  message?: string;
}

export interface CheckUserExistsRequest {
  username?: string;
  email?: string;
  excludeId?: number;
}
