"use client";

import React, { useState } from "react";
import { Article } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Heart,
  Calendar,
  Search,
  Filter,
  Star,
} from "lucide-react";

interface ArticleManagementTableProps {
  articles: Article[];
  loading?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (articleId: number) => void;
  onView?: (article: Article) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  categories?: string[];
}

/**
 * 文章管理表格组件 - 可复用的文章列表管理组件
 */
export const ArticleManagementTable: React.FC<ArticleManagementTableProps> = ({
  articles,
  loading = false,
  onEdit,
  onDelete,
  onView,
  searchValue = "",
  onSearchChange,
  categoryFilter = "",
  onCategoryFilterChange,
  statusFilter = "",
  onStatusFilterChange,
  categories = [],
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (articleToDelete && onDelete) {
      onDelete(articleToDelete.id);
    }
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "已发布";
      case "draft":
        return "草稿";
      case "archived":
        return "已归档";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索文章标题、作者..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文章信息</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>统计</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  暂无文章数据
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium line-clamp-1 max-w-[300px]">
                          {article.title}
                        </h4>
                        {article.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 max-w-[300px]">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm">
                          {article.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{article.author}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(article.status)}>
                      {getStatusText(article.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {article.likes.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.created_at)}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(article)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(article)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑文章
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(article)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除文章
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除文章 "{articleToDelete?.title}" 吗？
              <br />
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
