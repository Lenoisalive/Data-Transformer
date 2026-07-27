# 🚀 服务启动指南

## 快速启动

### 方法 1: 使用启动脚本（推荐）

```bash
# 在项目根目录执行
./start-services.sh
```

### 方法 2: 手动启动

#### 1. 启动后端（终端窗口 1）
```bash
cd apps/backend
pnpm run start:dev
```

等待看到类似以下输出：
```
[Nest] 12345  - 01/23/2024, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/23/2024, 10:00:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/23/2024, 10:00:02 AM     LOG [RoutesResolver] DatasourcesController {/api/datasources}:
[Nest] 12345  - 01/23/2024, 10:00:02 AM     LOG [NestApplication] Nest application successfully started
```

后端将运行在: **http://localhost:3001**

#### 2. 启动前端（终端窗口 2）
```bash
cd apps/frontend
pnpm run dev
```

等待看到类似以下输出：
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

前端将运行在: **http://localhost:3000**

## 验证服务

### 检查后端
```bash
curl http://localhost:3001/api
```

应该返回类似：
```json
{"message":"Data Transformer API","version":"1.0.0"}
```

### 检查前端
在浏览器打开: http://localhost:3000

## 查看服务状态

```bash
# 运行状态检查脚本
./check-services.sh

# 或手动检查端口
lsof -i :3001  # 后端
lsof -i :3000  # 前端
```

## 查看日志

如果使用启动脚本启动的服务：

```bash
# 后端日志
tail -f logs/backend.log

# 前端日志
tail -f logs/frontend.log
```

## 停止服务

### 方法 1: Ctrl+C
在运行服务的终端窗口按 `Ctrl+C`

### 方法 2: 杀死进程
```bash
# 停止所有相关服务
lsof -ti:3001,3000 | xargs kill -9

# 或分别停止
pkill -f "nest start"
pkill -f "vite"
```

## 常见问题

### 1. 端口已被占用
```bash
# 查找占用端口的进程
lsof -i :3001
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 2. 后端启动失败
- 检查 PostgreSQL 数据库是否运行: `docker-compose ps`
- 检查环境变量: `cat apps/backend/.env`
- 查看错误日志: `cat logs/backend.log`

### 3. 前端启动失败
- 检查依赖是否安装: `cd apps/frontend && pnpm install`
- 清除缓存: `rm -rf node_modules/.vite`
- 查看错误日志: `cat logs/frontend.log`

### 4. 数据库连接失败
```bash
# 启动数据库服务
docker-compose up -d postgres mysql redis

# 检查数据库状态
docker-compose ps
```

## 开发工作流

### 推荐的启动顺序
1. 启动数据库服务（Docker）
2. 启动后端服务
3. 启动前端服务
4. 在浏览器打开应用

### 完整命令序列
```bash
# 1. 启动数据库
docker-compose up -d

# 2. 等待数据库就绪（约10秒）
sleep 10

# 3. 启动后端（新终端窗口）
cd apps/backend && pnpm run start:dev

# 4. 启动前端（新终端窗口）
cd apps/frontend && pnpm run dev

# 5. 打开浏览器
open http://localhost:3000
```

## 自动化脚本

项目提供了以下脚本：

- `start-services.sh` - 启动前后端服务（后台运行）
- `check-services.sh` - 检查服务状态
- `test-database-import.sh` - 测试数据库导入功能
- `test-import-export.sh` - 测试数据导入导出功能

## 访问地址

启动成功后：

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:3001/api
- **API 文档**: http://localhost:3001/api/docs（如果已配置 Swagger）

## 默认登录信息

- **邮箱**: admin@datatransformer.com
- **密码**: admin123

---

需要帮助？查看完整文档：
- [快速开始](./docs/QUICKSTART.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [故障排除](./FRONTEND_TROUBLESHOOTING.md)
