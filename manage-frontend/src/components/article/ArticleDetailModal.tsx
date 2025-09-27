"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Eye, Heart, User, Tag, Folder, Star } from "lucide-react";
import { Article } from "@/types/api";

interface ArticleDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
}

/**
 * 文章详情模态框组件
 */
export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  open,
  onOpenChange,
  article,
}) => {
  if (!article) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "published":
        return "已发布";
      case "draft":
        return "草稿";
      default:
        return "未知";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{article.title}</span>
            {article.featured && (
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文章元信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">作者:</span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {article.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{article.author}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">分类:</span>
                <Badge variant="outline">{article.category}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">创建时间:</span>
                <span className="text-sm">
                  {formatDate(article.created_at)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">状态:</span>
                <Badge className={getStatusColor(article.status)}>
                  {getStatusText(article.status)}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {article.views.toLocaleString()} 次浏览
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {article.likes.toLocaleString()} 次点赞
                  </span>
                </div>
              </div>

              {article.updated_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">更新时间:</span>
                  <span className="text-sm">
                    {formatDate(article.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          {article.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">标签:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* 文章摘要 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">摘要</h3>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-200">
              {article.excerpt}
            </p>
          </div>

          <Separator />

          {/* 文章内容 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">正文内容</h3>
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>

          {/* 文章统计 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {article.content.replace(/\s+/g, "").length}
                </div>
                <div className="text-sm text-gray-600">字符数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {article.views.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">浏览量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {article.likes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">点赞数</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
