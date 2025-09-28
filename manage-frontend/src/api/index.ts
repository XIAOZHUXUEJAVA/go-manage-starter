/**
 * API 层统一导出
 *
 * 使用方式：
 * import { api } from '@/api';
 * const users = await api.user.getUsers();
 *
 * 或者：
 * import { userApi, articleApi, authApi } from '@/api';
 * const users = await userApi.getUsers();
 */

import { userApi } from "./user";
import { articleApi } from "./article";
import { authApi } from "./auth";

// 重新导出各个 API
export { userApi } from "./user";
export { articleApi } from "./article";
export { authApi } from "./auth";

// 统一的 API 对象
export const api = {
  user: userApi,
  article: articleApi,
  auth: authApi,
} as const;

// 类型导出，方便其他地方使用
export type Api = typeof api;
export type UserApi = typeof userApi;
export type ArticleApi = typeof articleApi;
export type AuthApi = typeof authApi;
