import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Users, Settings, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            管理系统首页
          </h1>
          <p className="text-xl text-muted-foreground mb-8">欢迎使用管理系统</p>
          <Separator className="my-8" />
        </div>

        {/* 主要操作按钮 */}
        <div className="flex justify-center mb-12">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/dashboard">
              进入管理面板
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* 功能卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    数据管理
                    <Badge variant="secondary">核心</Badge>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                管理和查看系统数据统计，包括用户行为分析、业务指标监控等功能
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    用户管理
                    <Badge variant="secondary">重要</Badge>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                管理系统用户和权限，包括用户注册、角色分配、权限控制等功能
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    系统设置
                    <Badge variant="outline">配置</Badge>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                配置系统参数和选项，包括主题设置、通知配置、安全策略等
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 底部分隔线 */}
        <Separator className="my-12" />

        {/* 底部信息 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            管理系统 v1.0.0 - 现代化的企业级管理解决方案
          </p>
        </div>
      </div>
    </div>
  );
}
