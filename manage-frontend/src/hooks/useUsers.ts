import { useState, useEffect, useCallback } from "react";
import { UserService } from "@/services/userService";
import {
  User,
  UserListResponse,
  PaginationParams,
  PaginationInfo,
  APIError,
} from "@/types/api";

// 用户列表 Hook 的状态类型
interface UseUsersState {
  users: User[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: APIError | null;
}

// 用户列表 Hook 的返回类型
interface UseUsersReturn extends UseUsersState {
  fetchUsers: (params?: PaginationParams) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * 用户列表数据获取 Hook
 */
export const useUsers = (initialParams?: PaginationParams): UseUsersReturn => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    pagination: null,
    loading: false,
    error: null,
  });

  const [currentParams, setCurrentParams] = useState<PaginationParams>(
    initialParams || { page: 1, pageSize: 10 }
  );

  const fetchUsers = useCallback(
    async (params?: PaginationParams) => {
      const queryParams = params || currentParams;
      setCurrentParams(queryParams);

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await UserService.getUserList(queryParams);

        if (
          response.code === 200 &&
          response.data &&
          Array.isArray(response.data)
        ) {
          setState((prev) => ({
            ...prev,
            users: response.data as User[], // 确保类型安全
            pagination: response.pagination || null, // 分页信息在外层
            loading: false,
          }));
        } else {
          throw new Error(response.message || "获取用户列表失败");
        }
      } catch (error) {
        const apiError = error as APIError;
        setState((prev) => ({
          ...prev,
          users: [],
          pagination: null,
          loading: false,
          error: apiError,
        }));
      }
    },
    [currentParams]
  );

  const refetch = useCallback(() => {
    return fetchUsers(currentParams);
  }, [fetchUsers, currentParams]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    ...state,
    fetchUsers,
    refetch,
  };
};

// 单个用户 Hook 的状态类型
interface UseUserState {
  user: User | null;
  loading: boolean;
  error: APIError | null;
}

// 单个用户 Hook 的返回类型
interface UseUserReturn extends UseUserState {
  fetchUser: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * 单个用户数据获取 Hook
 */
export const useUser = (id?: number): UseUserReturn => {
  const [state, setState] = useState<UseUserState>({
    user: null,
    loading: false,
    error: null,
  });

  const [currentId, setCurrentId] = useState<number | undefined>(id);

  const fetchUser = useCallback(async (userId: number) => {
    setCurrentId(userId);
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await UserService.getUserById(userId);

      if (response.code === 200 && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data!,
          loading: false,
        }));
      } else {
        throw new Error(response.message || "获取用户信息失败");
      }
    } catch (error) {
      const apiError = error as APIError;
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  const refetch = useCallback(() => {
    if (currentId) {
      return fetchUser(currentId);
    }
    return Promise.resolve();
  }, [fetchUser, currentId]);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id, fetchUser]);

  return {
    ...state,
    fetchUser,
    refetch,
  };
};
