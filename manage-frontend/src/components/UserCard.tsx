import React from "react";
import { User } from "@/types/api";

interface UserCardProps {
  user: User;
  onClick?: (user: User) => void;
  className?: string;
}

/**
 * 用户卡片组件
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  onClick,
  className = "",
}) => {
  const handleClick = () => {
    onClick?.(user);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6 border border-gray-200 
        hover:shadow-lg transition-shadow duration-200
        ${onClick ? "cursor-pointer hover:border-blue-300" : ""}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {user.username}
          </h3>
          <p className="text-gray-600 mb-3">{user.email}</p>
          <div className="space-y-1 text-sm text-gray-500">
            <p>
              <span className="font-medium">ID:</span> {user.id}
            </p>
            <p>
              <span className="font-medium">创建时间:</span>{" "}
              {formatDate(user.created_at)}
            </p>
            <p>
              <span className="font-medium">更新时间:</span>{" "}
              {formatDate(user.updated_at)}
            </p>
          </div>
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
