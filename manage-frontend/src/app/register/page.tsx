"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

// 注册表单验证 schema
const registerSchema = z
  .object({
    username: z.string().min(1, "用户名不能为空").min(3, "用户名至少3个字符"),
    email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
    password: z.string().min(1, "密码不能为空").min(6, "密码至少6个字符"),
    confirmPassword: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps extends React.ComponentProps<"div"> {}

export default function RegisterPage({
  className,
  ...props
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      // 注册成功后重定向到 dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={cn("w-full max-w-md space-y-8", className)} {...props}>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            创建新账户
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            或者{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              登录已有账户
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册信息</CardTitle>
            <CardDescription>请填写以下信息来创建您的账户</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="请输入用户名"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    {...register("username")}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    placeholder="请输入邮箱地址"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="请再次输入密码"
                      {...register("confirmPassword")}
                      className={
                        errors.confirmPassword
                          ? "border-red-500 pr-10"
                          : "pr-10"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  创建账户
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
