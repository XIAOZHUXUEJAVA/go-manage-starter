import React, { useEffect } from "react";
import { useUser } from "@/hooks/useUsers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface UserDetailModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 用户详情模态框组件
 */
export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { user, loading, error, fetchUser } = useUser();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser(userId);
    }
  }, [isOpen, userId, fetchUser]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">用户详情</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6">
            {loading && (
              <div className="py-8">
                <LoadingSpinner size="lg" />
                <p className="text-center text-gray-500 mt-4">加载中...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => userId && fetchUser(userId)}
                    className="ml-2 inline-flex items-center gap-1 text-sm underline hover:no-underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    重试
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {user && !loading && !error && (
              <div className="space-y-4">
                {/* 用户头像 */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user.username}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          用户ID:
                        </dt>
                        <dd className="text-sm text-gray-900">{user.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          用户名:
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {user.username}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          邮箱:
                        </dt>
                        <dd className="text-sm text-gray-900">{user.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          创建时间:
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(user.created_at)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          更新时间:
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(user.updated_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部 */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
