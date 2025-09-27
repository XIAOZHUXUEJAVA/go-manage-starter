"use client";

import React from "react";
import { Article } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Heart, Calendar, User, Tag } from "lucide-react";
// 简单的时间格式化函数
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  return date.toLocaleDateString("zh-CN");
};

interface ArticleCardProps {
  article: Article;
  onClick?: (article: Article) => void;
  className?: string;
}

/**
 * 文章卡片组件 - 可复用的文章展示组件
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  className = "",
}) => {
  const handleClick = () => {
    onClick?.(article);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
            {article.title}
            {article.featured && (
              <Badge variant="secondary" className="ml-2 text-xs">
                精选
              </Badge>
            )}
          </CardTitle>
          <Badge className={getStatusColor(article.status)}>
            {getStatusText(article.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 摘要 */}
        <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>

        {/* 分类和标签 */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {article.category}
          </Badge>
          {article.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {article.author.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {article.author}
          </span>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {article.likes.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatTimeAgo(article.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
