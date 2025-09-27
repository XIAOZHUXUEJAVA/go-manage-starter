// 统一导出认证相关组件和 hooks
export { AuthGuard, useAuth } from "./AuthGuard";
export { AuthProvider } from "./AuthProvider";

// 废弃 ProtectedRoute，使用 AuthGuard 替代
// export { ProtectedRoute } from "./ProtectedRoute"; // 已废弃
