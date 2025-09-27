"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { CreateArticleRequest } from "@/types/api";
import { createArticleSchema } from "@/lib/articleValidations";

// 定义表单数据类型，与CreateArticleRequest保持一致
type AddArticleFormData = {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
};

interface AddArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (articleData: CreateArticleRequest) => Promise<void>;
  loading?: boolean;
  categories: string[];
  popularTags: string[];
}

/**
 * 添加文章模态框组件
 */
export const AddArticleModal: React.FC<AddArticleModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  categories,
  popularTags,
}) => {
  const [newTag, setNewTag] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AddArticleFormData>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category: "",
      tags: [],
      status: "draft",
      featured: false,
    },
  });

  const watchedTags = watch("tags") || [];
  const watchedContent = watch("content") || "";

  const handleFormSubmit = async (data: AddArticleFormData) => {
    try {
      // 转换为CreateArticleRequest格式
      const articleData: CreateArticleRequest = {
        ...data,
      };
      await onSubmit(articleData);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("创建文章失败:", error);
    }
  };

  const handleClose = () => {
    reset();
    setNewTag("");
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      const updatedTags = [...watchedTags, newTag.trim()];
      setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = watchedTags.filter((tag) => tag !== tagToRemove);
    setValue("tags", updatedTags);
  };

  const addPopularTag = (tag: string) => {
    if (!watchedTags.includes(tag)) {
      const updatedTags = [...watchedTags, tag];
      setValue("tags", updatedTags);
    }
  };

  const wordCount = watchedContent.replace(/\s+/g, "").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新文章</DialogTitle>
          <DialogDescription>
            填写文章信息，创建一篇新的文章。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-6 py-4">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">文章标题 *</Label>
              <Input
                id="title"
                placeholder="请输入文章标题"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* 摘要 */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">文章摘要 *</Label>
              <Textarea
                id="excerpt"
                placeholder="请输入文章摘要"
                rows={3}
                {...register("excerpt")}
                className={errors.excerpt ? "border-red-500" : ""}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-500">{errors.excerpt.message}</p>
              )}
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">文章内容 *</Label>
                <span className="text-sm text-gray-500">
                  字数: {wordCount} / 50000
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="请输入文章内容"
                rows={12}
                {...register("content")}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 分类 */}
              <div className="space-y-2">
                <Label htmlFor="category">文章分类 *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={errors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="选择文章分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* 状态 */}
              <div className="space-y-2">
                <Label htmlFor="status">发布状态 *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择发布状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">草稿</SelectItem>
                        <SelectItem value="published">发布</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label>文章标签 *</Label>

              {/* 当前标签 */}
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {watchedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-gray-500 hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 添加标签 */}
              <div className="flex gap-2">
                <Input
                  placeholder="输入新标签"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* 热门标签 */}
              {popularTags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">热门标签:</Label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => addPopularTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags.message}</p>
              )}
            </div>

            {/* 精选文章 */}
            <div className="flex items-center space-x-2">
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="featured">设为精选文章</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                "创建文章"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
