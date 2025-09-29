"use client";

import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/stores/authStore";
import { useCaptcha, useCaptchaRequired } from "@/hooks/useCaptcha";
import { Captcha } from "@/components/ui/captcha";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// 登录表单验证 schema
const createLoginSchema = (requireCaptcha: boolean) => {
  const baseSchema = {
    username: z.string().min(1, "用户名不能为空").min(3, "用户名至少3个字符"),
    password: z.string().min(1, "密码不能为空").min(6, "密码至少6个字符"),
  };

  if (requireCaptcha) {
    return z.object({
      ...baseSchema,
      captcha_code: z.string().min(1, "请输入验证码").min(4, "验证码至少4位"),
    });
  }

  return z.object(baseSchema);
};

type LoginFormData = {
  username: string;
  password: string;
  captcha_code?: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // 检查是否需要验证码
  const requireCaptcha = useCaptchaRequired();

  // 验证码相关状态和方法
  const {
    captchaId,
    captchaCode,
    setCaptchaCode,
    isValid: isCaptchaValid,
    hasRequiredData: hasCaptchaData,
    refreshCaptcha,
  } = useCaptcha({
    autoGenerate: requireCaptcha,
  });

  // 动态创建验证 schema
  const loginSchema = createLoginSchema(requireCaptcha);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      ...(requireCaptcha && { captcha_code: "" }),
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 构建登录请求数据
      const loginData = {
        username: data.username,
        password: data.password,
        ...(requireCaptcha &&
          captchaId && {
            captcha_id: captchaId,
            captcha_code: data.captcha_code || captchaCode,
          }),
      };

      console.log("🔐 Login - 提交数据:", {
        ...loginData,
        password: "***",
        captcha_code: loginData.captcha_code ? "***" : undefined,
      });

      await login(loginData);
      // 登录成功后，AuthGuard 会自动处理重定向，不需要手动跳转
    } catch (error: any) {
      console.error("Login error:", error);

      // 如果是验证码相关错误，刷新验证码
      if (
        requireCaptcha &&
        (error?.message?.includes("验证码") ||
          error?.message?.includes("captcha") ||
          error?.code === 400)
      ) {
        console.log("🔄 Login - 验证码错误，刷新验证码");
        await refreshCaptcha();
        // 清空验证码输入
        form.setValue("captcha_code", "");
        setCaptchaCode("");
      }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                {/* 用户名字段 */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入用户名"
                          type="text"
                          autoComplete="username"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密码字段 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>密码</FormLabel>
                        <a
                          href="#"
                          className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info("忘记密码功能即将推出");
                          }}
                        >
                          忘记密码？
                        </a>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="请输入密码"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 验证码字段 - 条件性显示 */}
                {requireCaptcha && (
                  <FormField
                    control={form.control}
                    name="captcha_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Captcha
                            value={field.value || captchaCode}
                            onChange={(value) => {
                              field.onChange(value);
                              setCaptchaCode(value);
                            }}
                            error={form.formState.errors.captcha_code?.message}
                            disabled={isLoading}
                            required
                            placeholder="请输入验证码"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* 提交按钮 */}
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
                    disabled={isLoading}
                  >
                    使用 Google 登录
                  </Button>
                </div>
              </div>

              {/* 注册链接 */}
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
