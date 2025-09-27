// 文章验证 Schema
import { z } from "zod";

// 文章状态枚举
export const articleStatusEnum = z.enum(["draft", "published"]);

// 创建文章表单验证
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .min(5, "标题至少需要5个字符")
    .max(100, "标题不能超过100个字符"),

  content: z
    .string()
    .min(1, "内容不能为空")
    .min(50, "内容至少需要50个字符")
    .max(50000, "内容不能超过50000个字符"),

  excerpt: z
    .string()
    .min(1, "摘要不能为空")
    .min(10, "摘要至少需要10个字符")
    .max(300, "摘要不能超过300个字符"),

  category: z.string().min(1, "请选择分类"),

  tags: z
    .array(z.string())
    .min(1, "至少需要一个标签")
    .max(10, "标签不能超过10个"),

  status: articleStatusEnum,

  featured: z.boolean().default(false),
});

// 更新文章表单验证（不包含id，用于表单验证）
export const updateArticleFormSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .min(5, "标题至少需要5个字符")
    .max(100, "标题不能超过100个字符"),

  content: z
    .string()
    .min(1, "内容不能为空")
    .min(50, "内容至少需要50个字符")
    .max(50000, "内容不能超过50000个字符"),

  excerpt: z
    .string()
    .min(1, "摘要不能为空")
    .min(10, "摘要至少需要10个字符")
    .max(300, "摘要不能超过300个字符"),

  category: z.string().min(1, "请选择分类"),

  tags: z
    .array(z.string())
    .min(1, "至少需要一个标签")
    .max(10, "标签不能超过10个"),

  status: articleStatusEnum,

  featured: z.boolean(),
});

// 更新文章表单验证（包含id，用于API请求）
export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.number(),
});

// 文章搜索验证
export const articleSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// 导出类型
export type CreateArticleFormData = z.infer<typeof createArticleSchema>;
export type UpdateArticleFormData = z.infer<typeof updateArticleSchema>;
export type UpdateArticleFormFormData = z.infer<typeof updateArticleFormSchema>;
export type ArticleSearchFormData = z.infer<typeof articleSearchSchema>;

// 文章验证工具函数
export const articleValidations = {
  // 验证标题唯一性（模拟）
  validateTitleUnique: (title: string, excludeId?: number): boolean => {
    // 实际应用中应该调用API检查
    return title.length > 0;
  },

  // 验证标签格式
  validateTags: (tags: string[]): boolean => {
    return tags.every(
      (tag) =>
        tag.length >= 2 &&
        tag.length <= 20 &&
        /^[a-zA-Z0-9\u4e00-\u9fa5\-_]+$/.test(tag)
    );
  },

  // 验证内容长度
  validateContentLength: (
    content: string
  ): { isValid: boolean; wordCount: number } => {
    const wordCount = content.replace(/\s+/g, "").length;
    return {
      isValid: wordCount >= 50 && wordCount <= 50000,
      wordCount,
    };
  },
};
