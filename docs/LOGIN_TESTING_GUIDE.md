# 登录系统使用指南

## 🎯 快速测试流程

### 1. 访问登录页面
已经在简单浏览器中打开: http://localhost:3000/login

### 2. 登录测试

#### 方式 1: 使用 Admin 账号
```
Email: admin@datatransformer.com
Password: admin123
```

#### 方式 2: 使用 Engineer 账号
```
Email: engineer@datatransformer.com
Password: engineer123
```

#### 方式 3: 使用 Analyst 账号
```
Email: analyst@datatransformer.com
Password: analyst123
```

### 3. 登录后
- ✅ 自动跳转到 Dashboard
- ✅ 右上角显示用户名和角色
- ✅ 可以点击用户菜单
- ✅ 选择 "Logout" 登出

## 📋 功能测试清单

### ✅ 登录功能测试
- [ ] 输入正确的 email 和密码
- [ ] 点击 "Login" 按钮
- [ ] 查看是否显示成功消息
- [ ] 是否自动跳转到 Dashboard
- [ ] 右上角是否显示用户信息

### ✅ 表单验证测试
- [ ] 输入错误格式的 email (应该显示错误)
- [ ] 留空必填字段 (应该显示错误)
- [ ] 输入错误的密码 (应该显示错误消息)

### ✅ 注册功能测试
1. 切换到 "Register" 标签
2. 填写表单:
   ```
   Username: testuser
   Email: testuser@example.com
   Password: test123456
   Confirm Password: test123456
   ```
3. 点击 "Create Account"
4. 查看成功消息
5. 自动切换回 "Login" 标签
6. 使用新账号登录

### ✅ 重置密码测试
1. 切换到 "Reset Password" 标签
2. 输入已存在的 email:
   ```
   Email: analyst@datatransformer.com
   New Password: newpassword123
   Confirm New Password: newpassword123
   ```
3. 点击 "Reset Password"
4. 查看成功消息
5. 使用新密码登录测试

### ✅ 登出功能测试
1. 登录后在 Dashboard
2. 点击右上角用户菜单
3. 选择 "Logout"
4. 应该自动跳转到登录页
5. localStorage 中的 token 应该被清除

### ✅ 路由保护测试
1. 未登录时访问: http://localhost:3000/dashboard
2. 应该自动重定向到登录页
3. 登录后才能访问 Dashboard

## 🐛 常见问题排查

### 问题 1: 无法登录
**检查项:**
- 后端是否运行? (http://localhost:3001)
- 数据库是否运行?
- 网络请求是否成功? (查看浏览器控制台)
- Email 和密码是否正确?

**解决方案:**
```bash
# 检查后端
curl http://localhost:3001/api/health

# 如果后端未运行，启动它
cd apps/backend && npm run dev
```

### 问题 2: CORS 错误
**错误信息:** `Access to XMLHttpRequest has been blocked by CORS policy`

**解决方案:**
后端应该已经配置了 CORS,如果还有问题,检查 `apps/backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### 问题 3: 401 Unauthorized
**原因:** Token 无效或已过期

**解决方案:**
1. 清除浏览器 localStorage
2. 重新登录
3. 检查 JWT_SECRET 配置

### 问题 4: 注册失败
**可能原因:**
- Email 或 Username 已存在
- 密码太短 (最少 6 字符)
- 未提供必需字段

**解决方案:**
- 使用不同的 email
- 确保密码至少 6 字符
- 检查所有必填字段

### 问题 5: 重置密码失败
**可能原因:**
- Email 不存在
- 需要 Admin 权限

**解决方案:**
- 确认 email 正确
- 使用 Admin 账号登录后再重置

## 🎨 UI 元素说明

### 登录卡片
```
┌─────────────────────────────────────────┐
│  🏥 Medical Data Transformer           │
│     Healthcare Data Analysis Platform   │
├─────────────────────────────────────────┤
│  [Login] [Register] [Reset Password]    │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │ 📧 Email                         │  │
│  │ [_________________________]      │  │
│  │                                  │  │
│  │ 🔒 Password                      │  │
│  │ [_________________________]      │  │
│  │                                  │  │
│  │  [      Login Button      ]     │  │
│  │                                  │  │
│  │  Forgot Password? | Create Acct  │  │
│  └──────────────────────────────────┘  │
│                                          │
│  📋 Demo Accounts:                      │
│  ┌──────────────────────────────────┐  │
│  │ Admin: admin@datatransformer.com  │  │
│  │ Engineer: engineer@...            │  │
│  │ Analyst: analyst@...              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Dashboard 页面
```
┌─────────────────────────────────────────────┐
│ 🏥 Medical Data Transformation    [User ▼] │
├─────────────────────────────────────────────┤
│                                              │
│  Data Overview                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │  0   │ │  0   │ │  0   │ │  0   │      │
│  │Sources│ │Users │ │Templates│Jobs │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                              │
│  🚀 Quick Start                             │
│  ┌─────────────────────────────────────┐   │
│  │ Welcome to the Medical Data...      │   │
│  │ ✅ Project infrastructure completed │   │
│  │ ✅ User authentication system ready │   │
│  │ 📊 Data source management...        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📱 响应式设计

### 桌面端 (>768px)
- 全宽度卡片,最大 480px
- 三列统计卡片
- 完整的导航栏

### 移动端 (<768px)
- 卡片适应屏幕宽度
- 单列布局
- 简化的 Demo 账号显示

## 🔐 安全说明

### Token 管理
- Token 存储在 localStorage
- 自动在请求头中添加
- 401 响应自动登出
- Token 有效期: 7 天

### 密码安全
- 前端验证: 最少 6 字符
- 后端加密: bcryptjs 哈希
- 不在 API 响应中返回密码
- 密码匹配验证

### CORS 配置
- 允许来源: http://localhost:3000
- 允许凭据: true
- 预检请求处理

## 🧪 API 调用示例

### 使用浏览器控制台测试

```javascript
// 1. 登录
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@datatransformer.com',
    password: 'admin123'
  })
});
const loginData = await loginResponse.json();
console.log(loginData);

// 2. 保存 Token
const token = loginData.data.accessToken;
localStorage.setItem('auth_token', token);

// 3. 获取用户信息
const profileResponse = await fetch('http://localhost:3001/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profileData = await profileResponse.json();
console.log(profileData);

// 4. 登出
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
```

## 📊 性能指标

### 页面加载
- 首屏加载: < 1s
- 登录请求: < 500ms
- 路由切换: < 100ms

### 用户体验
- 表单验证: 实时
- 错误提示: 即时显示
- 成功反馈: 动画效果
- 页面跳转: 平滑过渡

## 🎯 下一步开发

### 立即可做
1. 测试所有功能
2. 验证错误处理
3. 检查响应式布局
4. 测试不同浏览器

### 短期计划
1. 添加"记住我"功能
2. 添加密码强度指示器
3. 改进错误消息
4. 添加加载动画

### 长期计划
1. 邮件验证
2. 双因素认证
3. 社交登录
4. 会话管理

## 📞 获取帮助

### 文档
- 实现文档: `docs/LOGIN_PAGE_IMPLEMENTATION.md`
- 用户系统: `docs/USER_SYSTEM_QUICKSTART.md`
- API 文档: `docs/API.md`

### 调试
- 浏览器控制台: F12
- Network 标签: 查看 API 请求
- Console 标签: 查看错误信息
- Application 标签: 查看 localStorage

---

**创建日期**: 2026年7月23日  
**最后更新**: 2026年7月23日  
**版本**: 1.0.0  
**状态**: ✅ 可用于测试
