// 重定向到新的 API 层
export { api, userApi, articleApi, authApi } from "@/api";

// 为了向后兼容，保留旧的导出名称
export { userApi as UserService } from "@/api";
export { articleApi as ArticleService } from "@/api";
export { userApi as UserApi } from "@/api";
export { articleApi as ArticleApi } from "@/api";
