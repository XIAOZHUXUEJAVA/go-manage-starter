"use client";

import React, { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserCard } from "@/components/user/UserCard";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserDetailModal } from "@/components/user/UserDetailModal";
import { User } from "@/types/api";

/**
 * 用户管理页面
 */
export default function UsersPage() {
  const { users, pagination, loading, error, fetchUsers, refetch } = useUsers({
    page: 1,
    pageSize: 10,
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUserId(user.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handlePageChange = (page: number) => {
    fetchUsers({
      page,
      pageSize: pagination?.page_size || 10,
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchUsers({
      page: 1,
      pageSize,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
              <p className="mt-2 text-gray-600">管理系统中的所有用户信息</p>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "刷新中..." : "刷新数据"}
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        {pagination && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pagination.total}
                </div>
                <div className="text-sm text-gray-500">总用户数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {pagination.page}
                </div>
                <div className="text-sm text-gray-500">当前页</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {pagination.total_pages}
                </div>
                <div className="text-sm text-gray-500">总页数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {pagination.page_size}
                </div>
                <div className="text-sm text-gray-500">每页显示</div>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="bg-white rounded-lg shadow">
          {/* 加载状态 */}
          {loading && (
            <div className="py-12">
              <LoadingSpinner size="lg" />
              <p className="text-center text-gray-500 mt-4">
                加载用户数据中...
              </p>
            </div>
          )}

          {/* 错误状态 */}
          {error && !loading && (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertDescription>
                  加载失败: {error.message}
                  <button
                    onClick={refetch}
                    className="ml-2 underline hover:no-underline"
                  >
                    重试
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* 用户列表 */}
          {!loading && !error && users && users.length > 0 && (
            <>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onClick={handleUserClick}
                    />
                  ))}
                </div>
              </div>

              {/* 分页 */}
              {pagination && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}

          {/* 空状态 */}
          {!loading && !error && (!users || users.length === 0) && (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                暂无用户数据
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                系统中还没有任何用户信息
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 用户详情模态框 */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
