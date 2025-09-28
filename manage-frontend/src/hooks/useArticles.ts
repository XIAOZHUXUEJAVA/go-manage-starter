// 文章管理 Hook
import { useState, useEffect, useCallback } from "react";
import { Article, PaginationInfo } from "@/types/api";
import { articleApi } from "@/api";

interface UseArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
}

interface UseArticlesReturn {
  articles: Article[] | null;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: Error | null;
  fetchArticles: (params?: UseArticlesParams) => Promise<void>;
  refetch: () => Promise<void>;
  categories: string[];
  popularTags: string[];
}

export const useArticles = (
  initialParams: UseArticlesParams = {}
): UseArticlesReturn => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [currentParams, setCurrentParams] =
    useState<UseArticlesParams>(initialParams);

  const fetchArticles = useCallback(
    async (params: UseArticlesParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...currentParams, ...params };
        setCurrentParams(mergedParams);

        const response = await articleApi.getArticles(mergedParams);

        if (response.code === 200 && response.data) {
          setArticles(response.data);
          setPagination(response.pagination || null);
        } else {
          throw new Error(response.message || "获取文章列表失败");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("未知错误");
        setError(error);
        setArticles(null);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [currentParams]
  );

  const refetch = useCallback(() => {
    return fetchArticles(currentParams);
  }, [fetchArticles, currentParams]);

  // 获取分类和标签
  const fetchMetadata = useCallback(async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        articleApi.getCategories(),
        articleApi.getPopularTags(),
      ]);

      setCategories(categoriesResponse.data?.map((cat) => cat.name) || []);
      setPopularTags(tagsResponse.data?.map((tag) => tag.name) || []);
    } catch (err) {
      console.error("获取元数据失败:", err);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchArticles(initialParams);
    fetchMetadata();
  }, []);

  return {
    articles,
    pagination,
    loading,
    error,
    fetchArticles,
    refetch,
    categories,
    popularTags,
  };
};
