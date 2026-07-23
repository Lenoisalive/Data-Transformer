# User System Quick Start Guide

## 快速开始用户认证系统

本指南将帮助您快速测试和使用 Data Transformer 的用户认证系统。

## 前置要求

1. ✅ PostgreSQL 数据库正在运行
2. ✅ 后端服务器正在运行 (http://localhost:3001)
3. ✅ 已运行种子脚本创建默认用户

## 默认用户账号

系统预置了三个不同角色的用户账号：

| 角色 | 邮箱 | 密码 | 权限说明 |
|------|------|------|----------|
| **Admin** | admin@datatransformer.com | admin123 | 完整访问权限，包括用户管理 |
| **Engineer** | engineer@datatransformer.com | engineer123 | 大部分 CRUD 操作，无用户管理权限 |
| **Analyst** | analyst@datatransformer.com | analyst123 | 只读访问权限 |

## API 测试示例

### 1. 用户登录

**Admin 登录：**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@datatransformer.com",
    "password": "admin123"
  }'
```

**Engineer 登录：**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@datatransformer.com",
    "password": "engineer123"
  }'
```

**Analyst 登录：**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@datatransformer.com",
    "password": "analyst123"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "8316a8ab-86eb-48c2-96af-2aab7a176fd3",
      "username": "admin",
      "email": "admin@datatransformer.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**保存 Token：**
```bash
# 使用 jq 提取 token (如果已安装)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@datatransformer.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 或者手动复制 accessToken
export TOKEN="your-jwt-token-here"
```

### 2. 获取当前用户信息

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "8316a8ab-86eb-48c2-96af-2aab7a176fd3",
    "email": "admin@datatransformer.com",
    "role": "admin"
  }
}
```

### 3. 验证 Token

```bash
curl -X GET http://localhost:3001/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

### 4. 用户管理 (需要 Admin 权限)

#### 获取所有用户

```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

#### 创建新用户

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "engineer"
  }'
```

#### 获取单个用户

```bash
curl -X GET http://localhost:3001/api/users/{user-id} \
  -H "Authorization: Bearer $TOKEN"
```

#### 更新用户信息

```bash
curl -X PATCH http://localhost:3001/api/users/{user-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updated_username",
    "isActive": true
  }'
```

#### 删除用户

```bash
curl -X DELETE http://localhost:3001/api/users/{user-id} \
  -H "Authorization: Bearer $TOKEN"
```

## 使用 Postman 测试

### 1. 导入环境变量

创建一个新的环境，添加以下变量：

```
BASE_URL: http://localhost:3001/api
TOKEN: (留空，登录后自动设置)
```

### 2. 登录请求

```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@datatransformer.com",
  "password": "admin123"
}

Tests (自动保存 token):
pm.environment.set("TOKEN", pm.response.json().data.accessToken);
```

### 3. 受保护的请求

在请求头中添加：
```
Authorization: Bearer {{TOKEN}}
```

## 错误处理

### 常见错误及解决方案

#### 1. 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**原因：** Token 无效或已过期  
**解决：** 重新登录获取新 token

#### 2. 400 Bad Request - 验证失败
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```
**原因：** 请求数据格式不正确  
**解决：** 检查请求体中的字段格式

#### 3. 409 Conflict - 用户已存在
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists"
}
```
**原因：** 邮箱或用户名已被使用  
**解决：** 使用不同的邮箱或用户名

#### 4. 404 Not Found - 用户不存在
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```
**原因：** 指定的用户 ID 不存在  
**解决：** 检查用户 ID 是否正确

## 前端集成示例

### React/TypeScript 示例

```typescript
// services/auth.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    accessToken: string;
  };
  message: string;
}

export const authService = {
  // 登录
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    // 保存 token 到 localStorage
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // 获取当前用户
  async getProfile() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // 登出
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取 token
  getToken() {
    return localStorage.getItem('token');
  },

  // 检查是否已登录
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Axios 拦截器 - 自动添加 token
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios 拦截器 - 处理 401 错误
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 登录组件示例

```typescript
// components/Login.tsx
import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">Login</button>
    </form>
  );
};
```

### Protected Route 示例

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== requiredRole && user.role !== 'admin') {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

// 使用示例
// <ProtectedRoute requiredRole="admin">
//   <UserManagement />
// </ProtectedRoute>
```

## 数据库管理

### 查看用户表

```sql
-- 连接到 PostgreSQL
psql -h localhost -U postgres -d data_transformer

-- 查看所有用户
SELECT id, username, email, role, "isActive", "createdAt" FROM users;

-- 查看特定角色的用户
SELECT * FROM users WHERE role = 'admin';

-- 统计各角色用户数
SELECT role, COUNT(*) FROM users GROUP BY role;
```

### 重置用户密码 (手动)

```bash
# 运行 Node.js 脚本生成密码哈希
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"

# 然后在数据库中更新
# UPDATE users SET password = '<hashed-password>' WHERE email = 'user@example.com';
```

### 重新运行种子脚本

```bash
# 清空用户表并重新创建默认用户
cd apps/backend
npm run seed
```

## 故障排除

### 问题 1: "Token expired" 错误
- **解决：** Token 默认有效期为 7 天，过期后需要重新登录

### 问题 2: CORS 错误
- **解决：** 确保后端已配置 CORS，允许前端域名访问

### 问题 3: 数据库连接失败
- **检查：** PostgreSQL 是否运行
- **检查：** .env 文件中的数据库配置是否正确

### 问题 4: 种子脚本失败
- **检查：** 数据库是否已存在用户
- **解决：** 删除现有用户或修改种子脚本跳过已存在用户

## 安全最佳实践

1. **生产环境**
   - 更改默认用户密码
   - 使用强 JWT_SECRET (环境变量)
   - 启用 HTTPS
   - 实施速率限制

2. **密码策略**
   - 最小长度：6 字符 (建议增加到 8-12 字符)
   - 建议添加密码复杂度要求
   - 定期提醒用户更改密码

3. **Token 管理**
   - 生产环境缩短 token 有效期
   - 实施刷新 token 机制
   - 实现 token 黑名单/撤销功能

4. **审计日志**
   - 记录所有登录尝试
   - 记录用户管理操作
   - 监控异常活动

## 下一步

- [ ] 实现角色权限守卫
- [ ] 添加刷新 token 功能
- [ ] 实现密码重置流程
- [ ] 添加邮箱验证
- [ ] 集成前端登录页面
- [ ] 添加双因素认证

---

**文档版本：** 1.0  
**最后更新：** 2026年7月23日  
**状态：** ✅ 可用于生产原型测试
