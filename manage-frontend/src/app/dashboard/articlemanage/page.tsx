"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  FileText,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";

// 导入文章相关组件
import { ArticleCard } from "@/components/article/ArticleCard";
import { AddArticleModal } from "@/components/article/AddArticleModal";
import { EditArticleModal } from "@/components/article/EditArticleModal";
import { ArticleDetailModal } from "@/components/article/ArticleDetailModal";
import { ArticleManagementTable } from "@/components/article/ArticleManagementTable";

// 导入hooks和服务
import { useArticles } from "@/hooks/useArticles";
import { ArticleService } from "@/services/articleService";
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/types/api";

/**
 * 文章管理页面
 */
export default function ArticleManagePage() {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  // 模态框状态
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // 加载状态
  const [loading, setLoading] = useState(false);

  // 使用自定义hook获取文章数据
  const { articles, loading: articlesLoading, refetch } = useArticles();

  // 确保articles不为null
  const safeArticles = articles || [];

  // 模拟数据
  const categories = [
    "技术分享",
    "产品设计",
    "行业动态",
    "团队管理",
    "用户体验",
    "数据分析",
  ];

  const popularTags = [
    "React",
    "TypeScript",
    "Next.js",
    "UI/UX",
    "前端开发",
    "后端开发",
    "数据库",
    "API设计",
  ];

  // 过滤文章
  const filteredArticles = safeArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: safeArticles.length,
    published: safeArticles.filter((a) => a.status === "published").length,
    draft: safeArticles.filter((a) => a.status === "draft").length,
    totalViews: safeArticles.reduce((sum, a) => sum + a.views, 0),
    totalLikes: safeArticles.reduce((sum, a) => sum + a.likes, 0),
  };

  // 处理创建文章
  const handleCreateArticle = async (articleData: CreateArticleRequest) => {
    setLoading(true);
    try {
      await ArticleService.createArticle(articleData);
      await refetch();
      setAddModalOpen(false);
    } catch (error) {
      console.error("创建文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理更新文章
  const handleUpdateArticle = async (
    id: number,
    articleData: UpdateArticleRequest
  ) => {
    setLoading(true);
    try {
      await ArticleService.updateArticle(id, articleData);
      await refetch();
      setEditModalOpen(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error("更新文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除文章
  const handleDeleteArticle = async (id: number) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    setLoading(true);
    try {
      await ArticleService.deleteArticle(id);
      await refetch();
    } catch (error) {
      console.error("删除文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理查看文章详情
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setDetailModalOpen(true);
  };

  // 处理编辑文章
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-600 mt-1">管理和发布您的文章内容</p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建文章
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文章数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+2 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.published / stats.total) * 100).toFixed(1)}% 发布率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.draft}
            </div>
            <p className="text-xs text-muted-foreground">待发布内容</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总点赞数</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% 较上月</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索文章标题、内容或作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文章列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>文章列表 ({filteredArticles.length})</CardTitle>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "card" | "table")}
            >
              <TabsList>
                <TabsTrigger value="table">表格视图</TabsTrigger>
                <TabsTrigger value="card">卡片视图</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : viewMode === "table" ? (
            <ArticleManagementTable
              articles={filteredArticles}
              onView={handleViewArticle}
              onEdit={handleEditArticle}
              onDelete={handleDeleteArticle}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categories={categories}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => handleViewArticle(article)}
                />
              ))}
              {filteredArticles.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  暂无符合条件的文章
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 模态框 */}
      <AddArticleModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleCreateArticle}
        loading={loading}
        categories={categories}
        popularTags={popularTags}
      />

      <EditArticleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleUpdateArticle}
        article={selectedArticle}
        loading={loading}
        categories={categories}
        popularTags={popularTags}
      />

      <ArticleDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        article={selectedArticle}
      />
    </div>
  );
}
