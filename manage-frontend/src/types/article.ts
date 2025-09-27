// 文章相关类型定义
export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// 文章列表响应
export type ArticleListResponse = Article[];

// 创建文章请求
export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
}

// 更新文章请求
export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: number;
}

// 文章查询参数
export interface ArticleQueryParams extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  author?: string;
  featured?: boolean;
}

// 文章统计信息
export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
}

// 文章分类和标签
export interface ArticleCategory {
  id: number;
  name: string;
  description?: string;
  count: number;
}

export interface ArticleTag {
  id: number;
  name: string;
  count: number;
}
