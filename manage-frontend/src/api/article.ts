/**
 * 文章相关 API
 */
import { ApiService } from "@/lib/api";
import { APIResponse } from "@/types/common";
import {
  Article,
  ArticleListResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleQueryParams,
  ArticleStats,
  ArticleCategory,
  ArticleTag,
} from "@/types/article";

export const articleApi = {
  /**
   * 获取文章列表
   */
  getArticles: async (
    params?: ArticleQueryParams
  ): Promise<APIResponse<ArticleListResponse>> => {
    return ApiService.get<ArticleListResponse>("/articles", params);
  },

  /**
   * 根据ID获取文章详情
   */
  getArticleById: async (id: number): Promise<APIResponse<Article>> => {
    return ApiService.get<Article>(`/articles/${id}`);
  },

  /**
   * 创建新文章
   */
  createArticle: async (
    data: CreateArticleRequest
  ): Promise<APIResponse<Article>> => {
    return ApiService.post<Article>("/articles", data);
  },

  /**
   * 更新文章
   */
  updateArticle: async (
    id: number,
    data: UpdateArticleRequest
  ): Promise<APIResponse<Article>> => {
    return ApiService.put<Article>(`/articles/${id}`, data);
  },

  /**
   * 删除文章
   */
  deleteArticle: async (id: number): Promise<APIResponse<void>> => {
    return ApiService.delete<void>(`/articles/${id}`);
  },

  /**
   * 批量删除文章
   */
  deleteArticles: async (ids: number[]): Promise<APIResponse<void>> => {
    return ApiService.post<void>("/articles/batch-delete", { ids });
  },

  /**
   * 发布文章
   */
  publishArticle: async (id: number): Promise<APIResponse<Article>> => {
    return ApiService.post<Article>(`/articles/${id}/publish`);
  },

  /**
   * 取消发布文章
   */
  unpublishArticle: async (id: number): Promise<APIResponse<Article>> => {
    return ApiService.post<Article>(`/articles/${id}/unpublish`);
  },

  /**
   * 获取文章统计信息
   */
  getArticleStats: async (): Promise<APIResponse<ArticleStats>> => {
    return ApiService.get<ArticleStats>("/articles/stats");
  },

  /**
   * 获取文章分类列表
   */
  getCategories: async (): Promise<APIResponse<ArticleCategory[]>> => {
    return ApiService.get<ArticleCategory[]>("/articles/categories");
  },

  /**
   * 获取热门标签
   */
  getPopularTags: async (
    limit?: number
  ): Promise<APIResponse<ArticleTag[]>> => {
    return ApiService.get<ArticleTag[]>("/articles/tags/popular", { limit });
  },

  /**
   * 搜索文章
   */
  searchArticles: async (
    query: string,
    params?: Omit<ArticleQueryParams, "search">
  ): Promise<APIResponse<ArticleListResponse>> => {
    return ApiService.get<ArticleListResponse>("/articles/search", {
      search: query,
      ...params,
    });
  },

  /**
   * 点赞文章
   */
  likeArticle: async (id: number): Promise<APIResponse<{ likes: number }>> => {
    return ApiService.post<{ likes: number }>(`/articles/${id}/like`);
  },

  /**
   * 取消点赞文章
   */
  unlikeArticle: async (
    id: number
  ): Promise<APIResponse<{ likes: number }>> => {
    return ApiService.delete<{ likes: number }>(`/articles/${id}/like`);
  },

  /**
   * 增加文章浏览量
   */
  incrementViews: async (
    id: number
  ): Promise<APIResponse<{ views: number }>> => {
    return ApiService.post<{ views: number }>(`/articles/${id}/view`);
  },
} as const;
