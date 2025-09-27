// 文章服务 - 使用假数据模拟后端API
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  APIResponse,
  PaginationInfo,
} from "@/types/api";

// 模拟文章数据
const mockArticles: Article[] = [
  {
    id: 1,
    title: "Next.js 15 新特性详解",
    content:
      "Next.js 15 带来了许多令人兴奋的新特性，包括 Turbopack、App Router 优化等...",
    excerpt: "探索 Next.js 15 的最新功能和改进",
    author: "张三",
    category: "前端开发",
    tags: ["Next.js", "React", "前端"],
    status: "published",
    featured: true,
    views: 1250,
    likes: 89,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:20:00Z",
    published_at: "2024-01-15T12:00:00Z",
  },
  {
    id: 2,
    title: "TypeScript 高级类型实战",
    content: "深入了解 TypeScript 的高级类型系统，包括条件类型、映射类型等...",
    excerpt: "掌握 TypeScript 高级类型的使用技巧",
    author: "李四",
    category: "编程语言",
    tags: ["TypeScript", "JavaScript", "类型系统"],
    status: "published",
    featured: false,
    views: 890,
    likes: 67,
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T16:45:00Z",
    published_at: "2024-01-14T10:00:00Z",
  },
  {
    id: 3,
    title: "React 性能优化最佳实践",
    content: "本文将介绍 React 应用性能优化的各种技巧和最佳实践...",
    excerpt: "提升 React 应用性能的实用技巧",
    author: "王五",
    category: "前端开发",
    tags: ["React", "性能优化", "前端"],
    status: "draft",
    featured: false,
    views: 0,
    likes: 0,
    created_at: "2024-01-13T14:20:00Z",
    updated_at: "2024-01-13T15:30:00Z",
  },
  {
    id: 4,
    title: "Go 语言微服务架构设计",
    content: "使用 Go 语言构建高性能微服务架构的完整指南...",
    excerpt: "Go 微服务架构的设计原则和实现方法",
    author: "赵六",
    category: "后端开发",
    tags: ["Go", "微服务", "架构设计"],
    status: "published",
    featured: true,
    views: 2100,
    likes: 156,
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-12T17:30:00Z",
    published_at: "2024-01-12T12:00:00Z",
  },
  {
    id: 5,
    title: "Docker 容器化部署实战",
    content: "从零开始学习 Docker 容器化技术，包括镜像构建、容器编排等...",
    excerpt: "Docker 容器化技术的实战应用",
    author: "孙七",
    category: "运维部署",
    tags: ["Docker", "容器化", "DevOps"],
    status: "published",
    featured: false,
    views: 1680,
    likes: 123,
    created_at: "2024-01-11T08:45:00Z",
    updated_at: "2024-01-11T19:20:00Z",
    published_at: "2024-01-11T09:00:00Z",
  },
];

// 模拟API延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ArticleService {
  // 获取文章列表
  static async getArticles(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      category?: string;
      status?: string;
    } = {}
  ): Promise<APIResponse<Article[]>> {
    await delay(800); // 模拟网络延迟

    const {
      page = 1,
      pageSize = 10,
      search = "",
      category = "",
      status = "",
    } = params;

    // 过滤数据
    const filteredArticles = mockArticles.filter((article) => {
      const matchesSearch =
        !search ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = !category || article.category === category;
      const matchesStatus = !status || article.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // 分页
    const total = filteredArticles.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    const pagination: PaginationInfo = {
      page,
      page_size: pageSize,
      total,
      total_pages: totalPages,
    };

    return {
      code: 200,
      message: "获取文章列表成功",
      data: paginatedArticles,
      pagination,
    };
  }

  // 获取单个文章
  static async getArticle(id: number): Promise<APIResponse<Article>> {
    await delay(500);

    const article = mockArticles.find((a) => a.id === id);

    if (!article) {
      return {
        code: 404,
        message: "文章不存在",
        error: "Article not found",
      };
    }

    return {
      code: 200,
      message: "获取文章成功",
      data: article,
    };
  }

  // 创建文章
  static async createArticle(
    articleData: CreateArticleRequest
  ): Promise<APIResponse<Article>> {
    await delay(1000);

    const newArticle: Article = {
      id: Math.max(...mockArticles.map((a) => a.id)) + 1,
      ...articleData,
      author: "当前用户", // 实际应用中从认证信息获取
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at:
        articleData.status === "published"
          ? new Date().toISOString()
          : undefined,
    };

    mockArticles.unshift(newArticle);

    return {
      code: 201,
      message: "创建文章成功",
      data: newArticle,
    };
  }

  // 更新文章
  static async updateArticle(
    articleData: UpdateArticleRequest
  ): Promise<APIResponse<Article>> {
    await delay(800);

    const index = mockArticles.findIndex((a) => a.id === articleData.id);

    if (index === -1) {
      return {
        code: 404,
        message: "文章不存在",
        error: "Article not found",
      };
    }

    const updatedArticle = {
      ...mockArticles[index],
      ...articleData,
      updated_at: new Date().toISOString(),
      published_at:
        articleData.status === "published" && !mockArticles[index].published_at
          ? new Date().toISOString()
          : mockArticles[index].published_at,
    };

    mockArticles[index] = updatedArticle;

    return {
      code: 200,
      message: "更新文章成功",
      data: updatedArticle,
    };
  }

  // 删除文章
  static async deleteArticle(id: number): Promise<APIResponse<null>> {
    await delay(600);

    const index = mockArticles.findIndex((a) => a.id === id);

    if (index === -1) {
      return {
        code: 404,
        message: "文章不存在",
        error: "Article not found",
      };
    }

    mockArticles.splice(index, 1);

    return {
      code: 200,
      message: "删除文章成功",
      data: null,
    };
  }

  // 获取文章分类列表
  static async getCategories(): Promise<string[]> {
    await delay(300);

    const categories = Array.from(new Set(mockArticles.map((a) => a.category)));
    return categories;
  }

  // 获取热门标签
  static async getPopularTags(): Promise<string[]> {
    await delay(300);

    const allTags = mockArticles.flatMap((a) => a.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }
}
