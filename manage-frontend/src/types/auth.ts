// 认证相关类型定义

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;
