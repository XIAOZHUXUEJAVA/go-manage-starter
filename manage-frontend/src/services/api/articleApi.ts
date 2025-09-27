// 文章相关API服务
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

export class ArticleApi {
  private static readonly BASE_URL = "/articles";

  /**
   * 获取文章列表
   */
  static async getArticles(
    params?: ArticleQueryParams
  ): Promise<APIResponse<ArticleListResponse>> {
    return ApiService.get<ArticleListResponse>(this.BASE_URL, params);
  }

  /**
   * 根据ID获取文章详情
   */
  static async getArticleById(id: number): Promise<APIResponse<Article>> {
    return ApiService.get<Article>(`${this.BASE_URL}/${id}`);
  }

  /**
   * 创建新文章
   */
  static async createArticle(
    articleData: CreateArticleRequest
  ): Promise<APIResponse<Article>> {
    return ApiService.post<Article>(this.BASE_URL, articleData);
  }

  /**
   * 更新文章
   */
  static async updateArticle(
    id: number,
    articleData: UpdateArticleRequest
  ): Promise<APIResponse<Article>> {
    return ApiService.put<Article>(`${this.BASE_URL}/${id}`, articleData);
  }

  /**
   * 删除文章
   */
  static async deleteArticle(id: number): Promise<APIResponse<void>> {
    return ApiService.delete<void>(`${this.BASE_URL}/${id}`);
  }

  /**
   * 批量删除文章
   */
  static async deleteArticles(ids: number[]): Promise<APIResponse<void>> {
    return ApiService.post<void>(`${this.BASE_URL}/batch-delete`, { ids });
  }

  /**
   * 发布文章
   */
  static async publishArticle(id: number): Promise<APIResponse<Article>> {
    return ApiService.post<Article>(`${this.BASE_URL}/${id}/publish`);
  }

  /**
   * 取消发布文章
   */
  static async unpublishArticle(id: number): Promise<APIResponse<Article>> {
    return ApiService.post<Article>(`${this.BASE_URL}/${id}/unpublish`);
  }

  /**
   * 获取文章统计信息
   */
  static async getArticleStats(): Promise<APIResponse<ArticleStats>> {
    return ApiService.get<ArticleStats>(`${this.BASE_URL}/stats`);
  }

  /**
   * 获取文章分类列表
   */
  static async getCategories(): Promise<APIResponse<ArticleCategory[]>> {
    return ApiService.get<ArticleCategory[]>(`${this.BASE_URL}/categories`);
  }

  /**
   * 获取热门标签
   */
  static async getPopularTags(
    limit?: number
  ): Promise<APIResponse<ArticleTag[]>> {
    return ApiService.get<ArticleTag[]>(`${this.BASE_URL}/tags/popular`, {
      limit,
    });
  }

  /**
   * 搜索文章
   */
  static async searchArticles(
    query: string,
    params?: Omit<ArticleQueryParams, "search">
  ): Promise<APIResponse<ArticleListResponse>> {
    return ApiService.get<ArticleListResponse>(`${this.BASE_URL}/search`, {
      search: query,
      ...params,
    });
  }
}
