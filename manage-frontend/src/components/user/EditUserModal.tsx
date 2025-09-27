"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { User, UpdateUserRequest } from "@/types/api";
import { userSchemas, type UpdateUserFormData } from "@/lib/validations";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (userData: UpdateUserRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * 编辑用户模态框组件 - 使用 react-hook-form + zod 最佳实践
 */
export const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading = false,
}) => {
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(userSchemas.update),
    defaultValues: {
      username: "",
      email: "",
      role: "user",
      status: "active",
    },
  });

  // 当用户数据变化时重置表单
  React.useEffect(() => {
    if (user && open) {
      form.reset({
        username: user.username,
        email: user.email,
        role: user.role as "admin" | "user" | "moderator",
        status: user.status as "active" | "inactive" | "pending",
      });
    }
  }, [user, open, form]);

  const handleFormSubmit = async (data: UpdateUserFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("更新用户失败:", error);
      // 错误处理已在父组件中完成
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            修改用户 "{user.username}" 的基本信息
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 py-4">
              {/* 用户名 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入用户名"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 邮箱 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱地址 *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入邮箱地址"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 角色 */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户角色 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择用户角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">普通用户</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                        <SelectItem value="moderator">版主</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 状态 */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户状态 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择用户状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">活跃</SelectItem>
                        <SelectItem value="inactive">非活跃</SelectItem>
                        <SelectItem value="pending">待审核</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    保存中...
                  </>
                ) : (
                  "保存更改"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
