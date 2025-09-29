# Go 管理系统模板

一个基于 Go + React + Next.js 构建的简单管理系统模板项目。

## 项目概述

这是一个前后端分离的管理系统起始模板，包含基础的用户认证功能。项目采用现代化的技术栈，适合作为中小型管理系统的开发基础。

## 技术栈

### 后端 (manage-backend)

- **语言**: Go 1.25+
- **Web 框架**: Gin Web Framework
- **数据库**: PostgreSQL + GORM ORM
- **认证**: JWT Token (golang-jwt/jwt)
- **缓存**: Redis (go-redis)
- **配置管理**: Viper
- **日志**: Zap (uber-go/zap)
- **密码加密**: bcrypt (golang.org/x/crypto)
- **验证码**: base64Captcha
- **API 文档**: Swagger (swaggo)
- **测试**: Testify
- **其他核心库**:
  - GORM PostgreSQL 驱动
  - Gin CORS 中间件
  - 数据库迁移支持

### 前端 (manage-frontend)

- **框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **类型检查**: TypeScript

## 当前功能

### ✅ 已实现功能

- 用户注册/登录
- 图形验证码生成与验证
- JWT Token 认证
- 基础的用户管理接口
- 响应式前端界面
- 基础的错误处理

### ⚠️ 待完善功能

- **权限管理系统** (角色、权限控制)
- 用户角色分配
- 菜单权限控制
- 数据权限过滤
- 完整的 CRUD 操作界面
- 系统日志记录

## 项目结构

```
go-manage-starter/
├── manage-backend/          # Go 后端服务
│   ├── cmd/                # 应用入口
│   ├── internal/           # 内部包
│   │   ├── config/        # 配置管理
│   │   ├── handler/       # HTTP 处理器
│   │   ├── middleware/    # 中间件
│   │   ├── model/         # 数据模型
│   │   ├── repository/    # 数据访问层
│   │   ├── service/       # 业务逻辑层
│   │   └── utils/         # 工具函数
│   ├── migrations/        # 数据库迁移文件
│   └── config/           # 配置文件
└── manage-frontend/         # Next.js 前端应用
    └── src/
        ├── app/           # Next.js App Router
        ├── components/    # React 组件
        ├── api/          # API 调用
        ├── hooks/        # 自定义 Hooks
        ├── lib/          # 工具库
        ├── stores/       # 状态管理
        └── types/        # TypeScript 类型定义
```

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+

### 后端启动

1. 进入后端目录

```bash
cd manage-backend
```

2. 安装依赖

```bash
go mod download
```

3. 配置数据库

```bash
# 复制配置文件并修改数据库连接信息
cp config/config.example.yaml config/config.yaml
```

4. 运行数据库迁移

```bash
go run cmd/migrate/main.go
```

5. 启动服务

```bash
go run cmd/server/main.go
```

### 前端启动

1. 进入前端目录

```bash
cd manage-frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 访问应用

```
http://localhost:3000
```

## API 接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/captcha` - 获取验证码

### 用户管理

- `GET /api/users` - 获取用户列表 (需要认证)
- `GET /api/users/:id` - 获取用户详情 (需要认证)

## 开发说明

### 当前限制

1. **权限系统未实现**: 目前只有基础的 JWT 认证，没有角色和权限控制
2. **功能相对简单**: 主要是认证相关的基础功能
3. **前端页面较少**: 目前主要是登录页面和基础布局

### 适用场景

- 中小型管理系统的快速原型开发
- 学习 Go + React 全栈开发
- 作为其他项目的基础模板

## 许可证

MIT License

