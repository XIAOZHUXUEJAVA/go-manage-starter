import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthStore, LoginRequest, RegisterRequest } from "@/types/auth";
import { authApi, userApi } from "@/api";
import { toast } from "sonner";
import { APIError } from "@/types/common";
import {
  getAccessToken,
  getRefreshToken,
  getTokenExpiresAt,
  setTokens,
  removeTokens,
  isTokenExpiringSoon,
} from "@/lib/tokenUtils";

/**
 * 认证状态管理 Store
 * 使用 Zustand 进行状态管理，支持持久化存储
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 用户登录
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });

          const response = await authApi.login(credentials);

          if (response.data) {
            const { access_token, refresh_token, expires_in, user } =
              response.data;

            // 计算token过期时间
            const tokenExpiresAt = Date.now() + expires_in * 1000;

            // 设置认证状态
            set({
              user,
              accessToken: access_token,
              refreshToken: refresh_token,
              tokenExpiresAt,
              isAuthenticated: true,
              isLoading: false,
            });

            // 保存tokens到localStorage
            setTokens(access_token, refresh_token, expires_in);

            toast.success("登录成功！正在跳转...");
            // 保持 loading 状态，直到 AuthGuard 完成重定向
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("❌ Login - 登录失败:", error);
          set({ isLoading: false });

          // 根据错误类型提供更友好的提示
          let errorMessage = "登录失败，请稍后重试";

          const apiError = error as APIError;
          if (apiError.code === 401) {
            if (apiError.error === "invalid credentials") {
              errorMessage = "用户名或密码错误，请检查后重试";
            } else {
              errorMessage = "认证失败，请检查用户名和密码";
            }
          } else if (apiError.code === 400) {
            errorMessage = "请求参数错误，请检查输入信息";
          } else if (apiError.code === 429) {
            errorMessage = "登录尝试过于频繁，请稍后再试";
          } else if (apiError.code === 500) {
            errorMessage = "服务器错误，请稍后重试";
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }

          toast.error(errorMessage, {
            description: "如果问题持续存在，请联系技术支持",
            duration: 4000,
          });
          throw error;
        }
      },

      // 用户注册
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true });

          const response = await authApi.register(data);

          if (response.data) {
            toast.success("注册成功！请登录");
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          const apiError = error as APIError;
          const errorMessage = apiError.message || "注册失败，请稍后重试";
          toast.error(errorMessage);
          throw error;
        }
      },

      // 检查认证状态
      checkAuth: async () => {
        try {
          // 从localStorage获取最新的token信息
          const accessToken = getAccessToken();
          const refreshToken = getRefreshToken();
          const tokenExpiresAt = getTokenExpiresAt();
          // 如果没有 access token，直接设置为未认证状态
          if (!accessToken) {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              tokenExpiresAt: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // 检查token是否即将过期（提前5分钟刷新）
          if (isTokenExpiringSoon() && refreshToken) {
            try {
              const refreshResponse = await authApi.refreshToken(refreshToken);
              if (refreshResponse.data) {
                const { access_token, expires_in } = refreshResponse.data;
                const newTokenExpiresAt = Date.now() + expires_in * 1000;

                // 更新store状态
                set({
                  accessToken: access_token,
                  tokenExpiresAt: newTokenExpiresAt,
                });

                // 更新localStorage
                setTokens(access_token, refreshToken, expires_in);
              }
            } catch (refreshError) {
              // 刷新失败，清除认证状态
              removeTokens();
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                tokenExpiresAt: null,
                isAuthenticated: false,
                isLoading: false,
              });
              return;
            }
          }

          // 同步store状态与localStorage
          set({
            accessToken,
            refreshToken,
            tokenExpiresAt,
          });

          set({ isLoading: true });

          const response = await userApi.getCurrentUser();

          if (response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              tokenExpiresAt: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("❌ CheckAuth - 错误:", error);
          // Token 无效，清除认证状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });

          removeTokens();
        }
      },

      // 用户登出
      logout: () => {
        const { refreshToken } = get();

        try {
          // 调用后端登出接口
          authApi.logout(refreshToken ?? undefined).catch(() => {
            // 忽略登出接口错误，继续清除本地状态
          });
        } catch (error) {
          // 忽略错误
        } finally {
          // 清除本地状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // 清除本地存储并立即跳转
          removeTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          toast.success("已退出登录");
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // 只持久化必要的字段
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
