# 验证码集成文档

## 概述

本项目已集成 `base64Captcha` 图形验证码功能，用于增强登录安全性。验证码支持多种类型，包括数字、字符串、数学运算和中文验证码。

## 功能特性

- 🔢 **多种验证码类型**: 数字、字符串、数学运算、中文
- 🎨 **可自定义样式**: 宽度、高度、噪点强度、干扰线等
- ⚡ **Redis 存储**: 使用 Redis 存储验证码，支持过期时间
- 🔧 **灵活配置**: 支持通过配置文件启用/禁用验证码
- 🛡️ **安全性**: 验证后自动清除，防止重复使用

## API 接口

### 1. 生成验证码

**请求**

```http
GET /api/v1/auth/captcha
```

**响应**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "captcha_id": "xKtjK9XzVgHVaFra",
    "captcha_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### 2. 登录（带验证码）

**请求**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "captcha_id": "xKtjK9XzVgHVaFra",
  "captcha_code": "12345"
}
```

**响应**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 1800,
    "refresh_expires_in": 2592000,
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

## 配置说明

在 `config/config.yaml` 中添加验证码配置：

```yaml
captcha:
  # 验证码类型: digit(数字), string(字符串), math(数学), chinese(中文)
  type: "digit"

  # 验证码长度
  length: 5

  # 图片宽度
  width: 240

  # 图片高度
  height: 80

  # 噪点强度 (0.0-1.0)
  noise_count: 0.7

  # 干扰线数量
  show_line_options: 80

  # 过期时间
  expiration: "5m"

  # 是否启用验证码
  enabled: true
```

### 配置参数说明

| 参数                | 类型     | 默认值  | 说明                                  |
| ------------------- | -------- | ------- | ------------------------------------- |
| `type`              | string   | "digit" | 验证码类型：digit/string/math/chinese |
| `length`            | int      | 5       | 验证码长度                            |
| `width`             | int      | 240     | 图片宽度（像素）                      |
| `height`            | int      | 80      | 图片高度（像素）                      |
| `noise_count`       | float64  | 0.7     | 噪点强度（0.0-1.0）                   |
| `show_line_options` | int      | 80      | 干扰线数量                            |
| `expiration`        | duration | "5m"    | 验证码过期时间                        |
| `enabled`           | bool     | true    | 是否启用验证码                        |

## 验证码类型

### 1. 数字验证码 (digit)

- 生成纯数字验证码
- 适合大多数场景
- 用户输入简单

### 2. 字符串验证码 (string)

- 包含字母和数字
- 安全性更高
- 区分大小写

### 3. 数学运算验证码 (math)

- 显示简单的数学运算
- 用户需要计算结果
- 有效防止机器人

### 4. 中文验证码 (chinese)

- 显示中文字符
- 适合中文用户
- 防止国外机器人攻击

## 前端集成示例

### React/Vue 示例

```javascript
// 1. 获取验证码
const getCaptcha = async () => {
  const response = await fetch("/api/v1/auth/captcha");
  const data = await response.json();

  // 显示验证码图片
  document.getElementById("captcha-img").src = data.data.captcha_data;

  // 保存验证码ID
  setCaptchaId(data.data.captcha_id);
};

// 2. 登录时提交验证码
const login = async (username, password, captchaCode) => {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      captcha_id: captchaId,
      captcha_code: captchaCode,
    }),
  });

  const data = await response.json();

  if (data.code === 200) {
    // 登录成功
    localStorage.setItem("access_token", data.data.access_token);
  } else {
    // 登录失败，刷新验证码
    getCaptcha();
  }
};
```

## 错误处理

### 常见错误码

| 错误码 | 说明             | 解决方案           |
| ------ | ---------------- | ------------------ |
| 400    | 验证码错误       | 刷新验证码重新输入 |
| 400    | 验证码已过期     | 获取新的验证码     |
| 400    | 缺少验证码参数   | 检查请求参数       |
| 401    | 用户名或密码错误 | 检查登录凭据       |

### 错误响应示例

```json
{
  "code": 400,
  "message": "Invalid captcha",
  "data": null
}
```

## 安全建议

1. **验证码过期时间**: 建议设置为 3-5 分钟
2. **失败次数限制**: 可结合 IP 限制功能
3. **验证码复杂度**: 根据安全需求调整噪点和干扰线
4. **HTTPS**: 生产环境必须使用 HTTPS
5. **日志记录**: 记录验证码验证失败的尝试

## 性能优化

1. **Redis 连接池**: 确保 Redis 连接池配置合理
2. **图片缓存**: 可考虑在前端缓存验证码图片
3. **异步处理**: 验证码生成可考虑异步处理
4. **清理策略**: 定期清理过期的验证码数据

## 故障排除

### 常见问题

1. **验证码不显示**

   - 检查 Redis 连接
   - 确认配置文件正确
   - 查看服务器日志

2. **验证码总是失败**

   - 检查时区设置
   - 确认 Redis 数据存储
   - 验证配置参数

3. **性能问题**
   - 优化 Redis 配置
   - 调整验证码复杂度
   - 检查网络延迟

### 调试模式

在开发环境中，可以临时禁用验证码：

```yaml
captcha:
  enabled: false
```

或者在环境变量中设置：

```bash
export CAPTCHA_ENABLED=false
```

## 更新日志

- **v1.0.0**: 初始版本，支持基本验证码功能
- **v1.1.0**: 添加多种验证码类型支持
- **v1.2.0**: 增加配置化支持和中间件
