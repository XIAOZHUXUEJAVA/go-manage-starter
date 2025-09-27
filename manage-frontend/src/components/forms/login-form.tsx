"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 登录表单验证 schema
const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空").min(3, "用户名至少3个字符"),
  password: z.string().min(1, "密码不能为空").min(6, "密码至少6个字符"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(""); // 清除之前的错误
      await login(data);
      // 登录成功后，AuthGuard 会自动处理重定向，不需要手动跳转
    } catch (error: any) {
      // 设置表单错误状态
      if (error.code === 401 && error.error === "invalid credentials") {
        setLoginError("用户名或密码错误");
      } else if (error.code === 401) {
        setLoginError("认证失败，请检查登录信息");
      } else {
        setLoginError("登录失败，请稍后重试");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>登录您的账户</CardTitle>
          <CardDescription>输入您的用户名和密码来登录您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* 错误提示 */}
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">密码</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("忘记密码功能即将推出");
                    }}
                  >
                    忘记密码？
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    {...register("password")}
                    className={
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => {
                    toast.info("Google 登录功能即将推出");
                  }}
                >
                  使用 Google 登录
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              还没有账户？{" "}
              <a
                href="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                立即注册
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
