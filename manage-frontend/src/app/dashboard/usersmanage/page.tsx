"use client";

import React, { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/api";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  Mail,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserManagementTable } from "@/components/UserManagementTable";

/**
 * Dashboard 用户管理页面
 */
export default function UsersManagePage() {
  const { users, pagination, loading, error, fetchUsers, refetch } = useUsers({
    page: 1,
    pageSize: 10,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 处理用户详情查看
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    fetchUsers({
      page,
      pageSize: pagination?.page_size || 10,
    });
  };

  // 处理每页大小变更
  const handlePageSizeChange = (pageSize: number) => {
    fetchUsers({
      page: 1,
      pageSize,
    });
  };

  // 过滤用户
  const filteredUsers =
    users?.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* 页面头部 */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>用户管理</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* 页面标题和操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
              <p className="text-muted-foreground">管理系统中的所有用户信息</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                刷新
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                添加用户
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          {pagination && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总用户数
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination.total}</div>
                  <p className="text-xs text-muted-foreground">
                    系统中的所有用户
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">当前页</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination.page}</div>
                  <p className="text-xs text-muted-foreground">
                    共 {pagination.total_pages} 页
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    活跃用户
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredUsers.filter((u) => u.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    状态为活跃的用户
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    每页显示
                  </CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pagination.page_size}
                  </div>
                  <p className="text-xs text-muted-foreground">当前页面大小</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 搜索和过滤 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索和过滤</CardTitle>
              <CardDescription>使用下面的工具来搜索和过滤用户</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    搜索用户
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="搜索用户名或邮箱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="status-filter"
                    className="text-sm font-medium"
                  >
                    状态:
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32" id="status-filter">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">非活跃</SelectItem>
                      <SelectItem value="pending">待审核</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用户表格 */}
          <Card>
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>
                显示 {filteredUsers.length} 个用户中的结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">加载失败: {error.message}</p>
                  <Button onClick={refetch} className="mt-2">
                    重试
                  </Button>
                </div>
              ) : filteredUsers.length === 0 && !loading ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    暂无用户数据
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    没有找到匹配的用户信息
                  </p>
                </div>
              ) : (
                <UserManagementTable
                  users={filteredUsers}
                  loading={loading}
                  onView={handleViewUser}
                  onEdit={(user) => {
                    console.log("编辑用户:", user);
                    // 这里可以添加编辑用户的逻辑
                  }}
                  onDelete={(user) => {
                    console.log("删除用户:", user);
                    // 这里可以添加删除用户的逻辑
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* 分页 */}
          {pagination && filteredUsers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    显示第 {(pagination.page - 1) * pagination.page_size + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.page_size,
                      pagination.total
                    )}{" "}
                    条，共 {pagination.total} 条记录
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      上一页
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.total_pages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.total_pages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
