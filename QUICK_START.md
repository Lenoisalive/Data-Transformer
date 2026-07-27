# ⚡ 快速启动指南

## 🚀 一键启动（推荐）

在项目根目录执行：

```bash
./quick-start.sh
```

这个脚本会自动：
1. ✅ 停止现有服务
2. ✅ 检查数据库状态
3. ✅ 启动后端服务 (http://localhost:3001)
4. ✅ 启动前端服务 (http://localhost:3000)
5. ✅ 验证服务状态
6. ✅ 显示访问地址和日志

---

## 📖 手动启动（分步）

### 1️⃣ 启动数据库（如果未运行）

```bash
docker-compose up -d
```

等待 10 秒让数据库完全启动。

### 2️⃣ 启动后端

**打开终端窗口 1**:

```bash
cd apps/backend
pnpm run start:dev
```

看到以下输出说明成功：
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3001
```

### 3️⃣ 启动前端

**打开终端窗口 2**:

```bash
cd apps/frontend
pnpm run dev
```

看到以下输出说明成功：
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
```

---

## 🌐 访问应用

服务启动成功后：

### 前端应用
打开浏览器访问: **http://localhost:3000**

### 后端 API
测试 API: **http://localhost:3001/api**

### 默认登录信息
- **邮箱**: `admin@datatransformer.com`
- **密码**: `admin123`

---

## 🔍 检查服务状态

```bash
# 运行状态检查
./check-services.sh

# 或手动检查
curl http://localhost:3001/api
lsof -i :3001
lsof -i :3000
```

---

## 📊 查看日志

### 如果使用一键启动脚本

```bash
# 后端日志
tail -f logs/backend.log

# 前端日志
tail -f logs/frontend.log

# 实时查看所有日志
tail -f logs/*.log
```

### 如果手动启动

日志直接显示在终端窗口中。

---

## 🛑 停止服务

### 方法 1: 使用快捷键
在各个终端窗口按 `Ctrl + C`

### 方法 2: 杀死进程
```bash
# 停止所有服务
lsof -ti:3001,3000 | xargs kill -9

# 或分别停止
kill -9 $(lsof -ti:3001)  # 停止后端
kill -9 $(lsof -ti:3000)  # 停止前端
```

---

## ❗ 常见问题

### 问题 1: 端口已被占用

**症状**: `Error: listen EADDRINUSE: address already in use :::3001`

**解决**:
```bash
# 查找占用进程
lsof -i :3001
lsof -i :3000

# 杀死进程（替换 <PID> 为实际进程 ID）
kill -9 <PID>
```

### 问题 2: 数据库连接失败

**症状**: `Error: Connection refused` 或 `ECONNREFUSED localhost:5432`

**解决**:
```bash
# 启动数据库
docker-compose up -d postgres

# 检查数据库状态
docker-compose ps

# 查看数据库日志
docker-compose logs postgres
```

### 问题 3: 后端启动失败

**检查步骤**:
```bash
# 1. 查看详细错误
cd apps/backend
pnpm run start:dev

# 2. 检查环境变量
cat .env

# 3. 重新安装依赖
rm -rf node_modules
pnpm install

# 4. 清理编译缓存
rm -rf dist
```

### 问题 4: 前端启动失败

**检查步骤**:
```bash
# 1. 查看详细错误
cd apps/frontend
pnpm run dev

# 2. 清理缓存
rm -rf node_modules/.vite

# 3. 重新安装依赖
rm -rf node_modules
pnpm install
```

### 问题 5: 登录失败

**解决**:
```bash
# 重新运行数据库种子
cd apps/backend
pnpm run seed

# 或检查用户是否存在
docker exec -it data-transformer-postgres psql -U postgres -d data_transformer -c "SELECT email FROM users;"
```

---

## 🧪 测试功能

### 测试数据库导入功能
```bash
./test-database-import.sh
```

### 测试数据导入导出
```bash
./test-import-export.sh
```

---

## 💡 开发提示

### 推荐的启动顺序
1. 数据库服务 → 2. 后端服务 → 3. 前端服务

### 开发工作流
```bash
# 第一次启动
docker-compose up -d        # 启动数据库
./quick-start.sh           # 一键启动前后端

# 日常开发
# 终端 1: cd apps/backend && pnpm run start:dev
# 终端 2: cd apps/frontend && pnpm run dev
```

### 热重载
- ✅ 后端：修改代码后自动重启（Nest watch 模式）
- ✅ 前端：修改代码后自动刷新（Vite HMR）

---

## 📚 相关文档

- [完整启动指南](./START_SERVICES.md)
- [故障排除](./FRONTEND_TROUBLESHOOTING.md)
- [数据库导入快速开始](./DATABASE_IMPORT_QUICKSTART.md)
- [开发指南](./docs/DEVELOPMENT.md)

---

## 🎯 快速命令速查表

```bash
# 一键启动
./quick-start.sh

# 检查状态
./check-services.sh

# 查看日志
tail -f logs/backend.log
tail -f logs/frontend.log

# 停止服务
lsof -ti:3001,3000 | xargs kill -9

# 重启数据库
docker-compose restart

# 查看所有容器
docker-compose ps
```

---

**需要帮助？** 查看完整文档或检查日志文件！
