import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthStore, LoginRequest, RegisterRequest } from "@/types/auth";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";

/**
 * 认证状态管理 Store
 * 使用 Zustand 进行状态管理，支持持久化存储
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 用户登录
      login: async (credentials: LoginRequest) => {
        try {
          console.log("🔐 Login - 开始登录:", credentials.username);
          set({ isLoading: true });

          const response = await AuthService.login(credentials);
          console.log("🔐 Login - API响应:", response);

          if (response.data) {
            const { token, user } = response.data;
            console.log(
              "🔐 Login - 登录成功，用户:",
              user.username,
              "Token:",
              token ? "已获取" : "未获取"
            );

            // 设置认证状态
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            // 设置 axios 默认 Authorization header
            if (typeof window !== "undefined") {
              localStorage.setItem("auth-token", token);
              console.log("🔐 Login - Token已保存到localStorage");
            }

            toast.success("登录成功！正在跳转...");
            // 保持 loading 状态，直到 AuthGuard 完成重定向
          } else {
            console.log("❌ Login - 响应中没有数据");
            set({ isLoading: false });
          }
        } catch (error: any) {
          console.error("❌ Login - 登录失败:", error);
          set({ isLoading: false });

          // 根据错误类型提供更友好的提示
          let errorMessage = "登录失败，请稍后重试";

          if (error.code === 401) {
            if (error.error === "invalid credentials") {
              errorMessage = "用户名或密码错误，请检查后重试";
            } else if (error.error === "user not found") {
              errorMessage = "用户不存在，请检查用户名";
            } else if (error.error === "account disabled") {
              errorMessage = "账户已被禁用，请联系管理员";
            } else {
              errorMessage = "认证失败，请检查用户名和密码";
            }
          } else if (error.code === 429) {
            errorMessage = "登录尝试过于频繁，请稍后再试";
          } else if (error.code === 500) {
            errorMessage = "服务器错误，请稍后重试";
          } else if (error.message) {
            errorMessage = error.message;
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

          const response = await AuthService.register(data);

          if (response.data) {
            toast.success("注册成功！请登录");
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || "注册失败，请稍后重试";
          toast.error(errorMessage);
          throw error;
        }
      },

      // 检查认证状态
      checkAuth: async () => {
        try {
          const token = get().token;
          console.log("🔍 CheckAuth - Token:", token ? "存在" : "不存在");

          // 如果没有 token，直接设置为未认证状态
          if (!token) {
            console.log("❌ CheckAuth - 没有token，设置为未认证状态");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          console.log("🔄 CheckAuth - 开始验证token...");
          set({ isLoading: true });

          const response = await AuthService.getCurrentUser();
          console.log("✅ CheckAuth - API响应:", response);

          if (response.data) {
            console.log(
              "✅ CheckAuth - 认证成功，用户:",
              response.data.username
            );
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            console.log("❌ CheckAuth - 响应中没有用户数据");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error("❌ CheckAuth - 错误:", error);
          // Token 无效，清除认证状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-token");
          }
        }
      },

      // 用户登出
      logout: () => {
        try {
          // 调用后端登出接口（可选）
          AuthService.logout().catch(() => {
            // 忽略登出接口错误，继续清除本地状态
          });
        } catch (error) {
          // 忽略错误
        } finally {
          // 清除本地状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // 清除本地存储并立即跳转
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-token");
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
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
