# 前端访问故障排查指南

**问题**: 前端页面打不开  
**时间**: 2026年7月24日

---

## ✅ 已验证的状态

### 服务器状态
- ✅ 前端 Vite 服务器运行正常（端口 3000）
- ✅ 后端 NestJS 服务器运行正常（端口 3001）
- ✅ HTTP 响应正常 (200 OK)
- ✅ HTML 页面正常返回
- ✅ JavaScript 模块可以正常加载

### 可能的原因
1. **浏览器缓存问题** - 旧的 JS/CSS 文件缓存导致
2. **浏览器兼容性** - 某些浏览器可能不支持某些特性
3. **网络代理/防火墙** - 拦截了某些资源
4. **浏览器扩展冲突** - 某些扩展可能干扰页面加载

---

## 🔧 故障排查步骤

### 步骤1: 清除浏览器缓存
1. **Chrome/Edge**:
   - 按 `Cmd + Shift + Delete` (Mac) 或 `Ctrl + Shift + Delete` (Windows)
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. **Safari**:
   - 菜单栏 -> 历史记录 -> 清除历史记录
   - 选择"所有历史记录"
   - 点击"清除历史记录"

3. **Firefox**:
   - 按 `Cmd + Shift + Delete`
   - 选择"缓存"
   - 点击"立即清除"

### 步骤2: 硬刷新页面
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`
- **或者**: 按住 Shift 点击刷新按钮

### 步骤3: 使用隐私/无痕模式
1. **Chrome**: `Cmd + Shift + N` (Mac) 或 `Ctrl + Shift + N` (Windows)
2. **Safari**: `Cmd + Shift + N`
3. **Firefox**: `Cmd + Shift + P`

然后访问: http://localhost:3000

### 步骤4: 检查浏览器控制台
1. 打开浏览器开发者工具:
   - **Mac**: `Cmd + Option + I`
   - **Windows**: `F12` 或 `Ctrl + Shift + I`

2. 切换到 **Console** 标签

3. 查看是否有红色错误信息

4. 如果有错误，请记录错误信息

### 步骤5: 检查网络请求
1. 在开发者工具中切换到 **Network** 标签
2. 刷新页面
3. 查看是否有失败的请求（红色）
4. 检查是否所有资源都成功加载

---

## 🚀 快速重启所有服务

如果上述步骤都不行，尝试完全重启：

### 1. 停止所有服务
```bash
# 停止前端
pkill -f vite

# 停止后端
pkill -f nest

# 等待2秒
sleep 2
```

### 2. 清除所有缓存
```bash
# 清除前端缓存
cd /Users/sulingjie/projects/Data-Transformer/apps/frontend
rm -rf node_modules/.vite
rm -rf dist

# 清除后端缓存
cd /Users/sulingjie/projects/Data-Transformer/apps/backend
rm -rf dist
```

### 3. 重新启动服务

**终端1 - 启动后端**:
```bash
cd /Users/sulingjie/projects/Data-Transformer/apps/backend
pnpm dev
```

**终端2 - 启动前端**:
```bash
cd /Users/sulingjie/projects/Data-Transformer/apps/frontend
pnpm dev
```

### 4. 等待编译完成
看到以下信息说明启动成功:

**前端**:
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:3000/
```

**后端**:
```
🚀 Backend server is running on http://localhost:3001
📚 API endpoint: http://localhost:3001/api
```

### 5. 访问页面
打开浏览器，访问: http://localhost:3000

---

## 🔍 详细诊断命令

### 检查服务器状态
```bash
# 检查前端是否运行
curl -I http://localhost:3000

# 检查后端是否运行
curl -I http://localhost:3001/api/health

# 检查端口占用
lsof -i :3000
lsof -i :3001
```

### 检查进程
```bash
# 查看 Vite 进程
ps aux | grep vite | grep -v grep

# 查看 NestJS 进程
ps aux | grep nest | grep -v grep
```

### 获取完整页面内容
```bash
# 获取 HTML
curl http://localhost:3000

# 保存到文件查看
curl http://localhost:3000 > /tmp/page.html
open /tmp/page.html
```

---

## 🌐 替代访问方法

### 方法1: 使用不同的浏览器
- Chrome
- Safari
- Firefox
- Edge

### 方法2: 使用 IP 地址访问
```
http://127.0.0.1:3000
```

### 方法3: 使用终端命令行浏览器
```bash
# 安装 lynx (如果没有)
brew install lynx

# 使用 lynx 访问
lynx http://localhost:3000
```

---

## 📱 已知问题和解决方案

### 问题1: 白屏/空白页面
**原因**: JavaScript 加载失败或运行错误  
**解决**: 
1. 检查浏览器控制台错误
2. 清除缓存后重试
3. 使用无痕模式

### 问题2: 页面一直加载
**原因**: 网络请求被阻塞  
**解决**:
1. 检查 Network 标签
2. 禁用浏览器扩展
3. 检查防火墙设置

### 问题3: 样式丢失
**原因**: CSS 文件加载失败  
**解决**:
1. 硬刷新页面
2. 清除缓存
3. 检查 Network 标签中 CSS 文件

### 问题4: Cannot connect to server
**原因**: 前端服务器未启动  
**解决**:
1. 检查进程: `ps aux | grep vite`
2. 检查端口: `lsof -i :3000`
3. 重启前端服务

---

## 🎯 推荐的测试步骤

### 最简单的方法
1. **打开终端**
2. **运行测试脚本**:
```bash
#!/bin/bash
echo "=== 测试前端访问 ==="
echo ""
echo "1. 检查前端服务器..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务器运行正常"
else
    echo "❌ 前端服务器无响应"
    exit 1
fi

echo ""
echo "2. 检查后端服务器..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 后端服务器运行正常"
else
    echo "❌ 后端服务器无响应"
    exit 1
fi

echo ""
echo "3. 获取页面内容..."
curl -s http://localhost:3000 | head -20

echo ""
echo "=== 测试完成 ==="
echo "请在浏览器中访问: http://localhost:3000"
echo ""
echo "如果浏览器看不到页面，请:"
echo "  1. 清除浏览器缓存 (Cmd+Shift+Delete)"
echo "  2. 硬刷新页面 (Cmd+Shift+R)"
echo "  3. 尝试无痕模式 (Cmd+Shift+N)"
```

3. **保存为 test-frontend.sh 并运行**:
```bash
chmod +x test-frontend.sh
./test-frontend.sh
```

---

## 📞 需要报告的信息

如果问题仍然存在，请提供以下信息:

1. **浏览器版本**:
   - Chrome/Safari/Firefox/Edge?
   - 版本号?

2. **浏览器控制台错误**:
   - 打开控制台 (F12)
   - 截图或复制错误信息

3. **网络请求状态**:
   - Network 标签中是否有失败的请求?
   - 哪些文件加载失败?

4. **终端输出**:
   - 前端终端是否有错误?
   - 后端终端是否有错误?

5. **系统信息**:
   - macOS 版本?
   - 是否使用了代理?
   - 是否安装了特殊的浏览器扩展?

---

## ✅ 验证页面正常工作的标志

当页面正常工作时，您应该看到:

1. **登录页面**:
   - 医疗数据转换工作台标题
   - 3个标签页: Login / Register / Reset Password
   - 表单输入框
   - 测试账号信息显示

2. **登录后**:
   - 左侧可折叠侧边栏
   - 顶部用户信息
   - 6个菜单项
   - Dashboard 内容

---

**状态**: 服务器端一切正常，问题可能在浏览器端  
**建议**: 先尝试清除缓存和硬刷新  
**最后更新**: 2026年7月24日 09:20
