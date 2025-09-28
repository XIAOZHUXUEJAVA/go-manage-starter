"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  getAccessToken,
  getRefreshToken,
  getTokenExpiresAt,
  isAccessTokenValid,
  isTokenExpiringSoon,
  getCurrentUserFromToken,
} from "@/lib/tokenUtils";

/**
 * 认证调试组件
 * 用于显示当前认证状态和token信息
 */
export function AuthDebug() {
  const { user, isAuthenticated, accessToken, refreshToken, tokenExpiresAt } =
    useAuthStore();
  const [localTokenInfo, setLocalTokenInfo] = useState<any>(null);

  useEffect(() => {
    const updateLocalTokenInfo = () => {
      const localAccessToken = getAccessToken();
      const localRefreshToken = getRefreshToken();
      const localTokenExpiresAt = getTokenExpiresAt();
      const userFromToken = getCurrentUserFromToken();

      setLocalTokenInfo({
        accessToken: localAccessToken,
        refreshToken: localRefreshToken,
        tokenExpiresAt: localTokenExpiresAt,
        isValid: isAccessTokenValid(),
        isExpiringSoon: isTokenExpiringSoon(),
        userFromToken,
        expiresAtFormatted: localTokenExpiresAt
          ? new Date(localTokenExpiresAt).toLocaleString()
          : null,
      });
    };

    updateLocalTokenInfo();
    const interval = setInterval(updateLocalTokenInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
    return null; // 生产环境不显示调试信息
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs font-mono z-50">
      <h3 className="text-sm font-bold mb-2 text-yellow-400">
        🔐 认证调试信息
      </h3>

      <div className="space-y-2">
        <div>
          <span className="text-blue-400">Store状态:</span>
          <div className="ml-2">
            <div>
              认证状态:{" "}
              <span
                className={isAuthenticated ? "text-green-400" : "text-red-400"}
              >
                {isAuthenticated ? "已认证" : "未认证"}
              </span>
            </div>
            <div>
              用户:{" "}
              <span className="text-yellow-300">{user?.username || "无"}</span>
            </div>
            <div>
              Access Token:{" "}
              <span className="text-gray-300">
                {accessToken ? `${accessToken.substring(0, 20)}...` : "无"}
              </span>
            </div>
            <div>
              Refresh Token:{" "}
              <span className="text-gray-300">
                {refreshToken ? `${refreshToken.substring(0, 20)}...` : "无"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-blue-400">LocalStorage状态:</span>
          <div className="ml-2">
            <div>
              Access Token:{" "}
              <span className="text-gray-300">
                {localTokenInfo?.accessToken
                  ? `${localTokenInfo.accessToken.substring(0, 20)}...`
                  : "无"}
              </span>
            </div>
            <div>
              Refresh Token:{" "}
              <span className="text-gray-300">
                {localTokenInfo?.refreshToken
                  ? `${localTokenInfo.refreshToken.substring(0, 20)}...`
                  : "无"}
              </span>
            </div>
            <div>
              Token有效:{" "}
              <span
                className={
                  localTokenInfo?.isValid ? "text-green-400" : "text-red-400"
                }
              >
                {localTokenInfo?.isValid ? "是" : "否"}
              </span>
            </div>
            <div>
              即将过期:{" "}
              <span
                className={
                  localTokenInfo?.isExpiringSoon
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              >
                {localTokenInfo?.isExpiringSoon ? "是" : "否"}
              </span>
            </div>
            <div>
              过期时间:{" "}
              <span className="text-gray-300">
                {localTokenInfo?.expiresAtFormatted || "无"}
              </span>
            </div>
          </div>
        </div>

        {localTokenInfo?.userFromToken && (
          <div>
            <span className="text-blue-400">Token中的用户信息:</span>
            <div className="ml-2">
              <div>
                ID:{" "}
                <span className="text-yellow-300">
                  {localTokenInfo.userFromToken.id}
                </span>
              </div>
              <div>
                用户名:{" "}
                <span className="text-yellow-300">
                  {localTokenInfo.userFromToken.username}
                </span>
              </div>
              <div>
                角色:{" "}
                <span className="text-yellow-300">
                  {localTokenInfo.userFromToken.role}
                </span>
              </div>
              <div>
                JTI:{" "}
                <span className="text-gray-300">
                  {localTokenInfo.userFromToken.jti}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
