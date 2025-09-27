# 组件库结构说明

## 🎉 **重构完成！**

### 📁 新的组织结构

```
src/components/
├── 📁 ui/                    # 基础UI组件 (shadcn/ui)
│   ├── button.tsx, input.tsx, dialog.tsx...
│   └── index.ts
├── 📁 auth/                  # 认证相关组件
│   ├── AuthGuard.tsx
│   ├── AuthProvider.tsx
│   └── index.ts
├── 📁 layout/                # 布局组件
│   ├── app-sidebar.tsx
│   ├── dashboard-header.tsx
│   ├── nav-*.tsx
│   └── index.ts
├── 📁 user/                  # 用户管理相关组件 ⭐
│   ├── AddUserModal.tsx
│   ├── EditUserModal.tsx
│   ├── UserCard.tsx
│   ├── UserDetailModal.tsx
│   ├── UserManagementTable.tsx
│   └── index.ts
├── 📁 dashboard/             # 仪表板相关组件
│   ├── chart-area-interactive.tsx
│   ├── section-cards.tsx
│   └── index.ts
├── 📁 common/                # 通用组件
│   ├── data-table.tsx
│   ├── LoadingSpinner.tsx
│   ├── Pagination.tsx
│   └── index.ts
├── 📁 forms/                 # 表单组件
│   ├── login-form.tsx
│   └── index.ts
├── index.ts                  # 总入口文件
└── README.md                 # 使用说明
```

## 🎯 **使用方式**

### 推荐：按模块导入

```typescript
// 用户管理组件
import { AddUserModal, UserCard } from "@/components/user";

// 布局组件
import { AppSidebar, DashboardHeader } from "@/components/layout";

// 通用组件
import { DataTable, LoadingSpinner } from "@/components/common";

// UI组件
import { Button, Input, Dialog } from "@/components/ui";
```

### 备选：从总入口导入

```typescript
import { AddUserModal, AppSidebar, Button } from "@/components";
```

### 相对路径导入（同模块内）

```typescript
// 在 layout 模块内部
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
```

## 📋 **模块职责**

- **ui/**: 基础 UI 组件，来自 shadcn/ui
- **auth/**: 认证相关组件，如登录守卫、认证提供者
- **layout/**: 页面布局组件，如侧边栏、导航、头部
- **user/**: 用户管理功能组件，如用户表格、用户模态框 ⭐
- **dashboard/**: 仪表板相关组件，如图表、卡片
- **common/**: 通用组件，如数据表格、分页、加载器
- **forms/**: 表单相关组件，如登录表单

## 🔧 **添加新组件**

1. 确定组件所属模块
2. 在对应目录下创建组件文件
3. 在该模块的 `index.ts` 中导出组件
4. 组件会自动通过总入口文件可用

## ✅ **重构优势**

1. **🎯 职责清晰** - 每个模块功能明确，用户管理组件统一管理
2. **🔍 易于查找** - 按功能分类，快速定位组件
3. **🛠️ 易于维护** - 模块化管理，降低耦合度
4. **📦 按需导入** - 支持模块级和组件级导入
5. **🚀 扩展友好** - 新增组件只需放入对应模块
6. **🏗️ 结构清晰** - 分工明确，团队协作更高效
