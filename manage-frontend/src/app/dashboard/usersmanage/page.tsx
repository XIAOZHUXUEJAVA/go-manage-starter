"use client";

import React, { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/api";
import { DashboardHeader } from "@/components/layout/dashboard-header";
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserManagementTable } from "@/components/user/UserManagementTable";
import { AddUserModal } from "@/components/user/AddUserModal";
import { UserService } from "@/services";
import { CreateUserRequest, UpdateUserRequest } from "@/types/api";
import { toast } from "sonner";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 处理创建用户
  const handleCreateUser = async (userData: CreateUserRequest) => {
    setIsCreating(true);
    try {
      const response = await UserService.createUser(userData);
      if (response.code === 201) {
        toast.success("用户创建成功");
        refetch(); // 刷新用户列表
      } else {
        toast.error(response.message || "创建用户失败");
      }
    } catch (error: any) {
      console.error("创建用户失败:", error);
      toast.error(error.message || "创建用户失败");
    } finally {
      setIsCreating(false);
    }
  };

  // 处理编辑用户
  const handleEditUser = async (user: User) => {
    setIsUpdating(true);
    try {
      const updateData: UpdateUserRequest = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      const response = await UserService.updateUser(user.id, updateData);
      if (response.code === 200) {
        toast.success("用户更新成功");
        refetch(); // 刷新用户列表
      } else {
        toast.error(response.message || "更新用户失败");
      }
    } catch (error: any) {
      console.error("更新用户失败:", error);
      toast.error(error.message || "更新用户失败");
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (user: User) => {
    setIsDeleting(true);
    try {
      const response = await UserService.deleteUser(user.id);
      if (response.code === 200) {
        toast.success("用户删除成功");
        refetch(); // 刷新用户列表
      } else {
        toast.error(response.message || "删除用户失败");
      }
    } catch (error: any) {
      console.error("删除用户失败:", error);
      toast.error(error.message || "删除用户失败");
    } finally {
      setIsDeleting(false);
    }
  };

  // 面包屑导航配置
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "用户管理" },
  ];

  // 头部操作按钮
  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        刷新
      </Button>
      <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
        <Plus className="h-4 w-4" />
        添加用户
      </Button>
    </div>
  );

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} actions={headerActions} />

      {/* 主要内容区域 */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
            <p className="text-muted-foreground">管理系统中的所有用户信息</p>
          </div>
        </div>

        {/* 统计卡片 */}
        {pagination && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总用户数</CardTitle>
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
                <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
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
                <CardTitle className="text-sm font-medium">每页显示</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination.page_size}</div>
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
                <Label htmlFor="status-filter" className="text-sm font-medium">
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
                loading={loading || isUpdating || isDeleting}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
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

        {/* 添加用户模态框 */}
        <AddUserModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSubmit={handleCreateUser}
          loading={isCreating}
        />
      </div>
    </>
  );
}
