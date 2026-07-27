# 🎉 数据库导入功能快速开始

## 简介

Data Transformer 现在支持直接从外部数据库导入数据！无需导出 CSV 或 Excel 文件，直接连接数据库即可导入数据。

## 支持的数据库

- ✅ MySQL (5.7+, 8.0+)
- ✅ PostgreSQL (10+, 11+, 12+, 13+, 14+, 15+)
- 🔜 SQL Server (计划中)
- 🔜 Oracle (计划中)

## 快速开始

### 1. 准备数据库

确保你有一个可访问的数据库，例如：

**MySQL 示例**:
```bash
# 使用 Docker 快速启动 MySQL
docker run --name test-mysql \
  -e MYSQL_ROOT_PASSWORD=mysql123 \
  -e MYSQL_DATABASE=test_db \
  -p 3306:3306 \
  -d mysql:8.0
```

**PostgreSQL 示例**:
```bash
# 使用 Docker 快速启动 PostgreSQL
docker run --name test-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 测试连接

```bash
# 获取访问令牌
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@datatransformer.com","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 测试 MySQL 连接
curl -X POST http://localhost:3001/api/datasources/database/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mysql123",
    "database": "test_db"
  }'
```

### 3. 创建数据库连接

```bash
curl -X POST http://localhost:3001/api/datasources/database/connections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "我的MySQL数据库",
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mysql123",
    "database": "test_db",
    "description": "测试数据库"
  }'
```

### 4. 浏览数据库表

```bash
# 保存连接 ID
CONNECTION_ID="your-connection-id-from-step-3"

# 获取所有表
curl -X GET "http://localhost:3001/api/datasources/database/connections/$CONNECTION_ID/tables" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. 预览表数据

```bash
# 预览 users 表的前 10 行
curl -X GET "http://localhost:3001/api/datasources/database/connections/$CONNECTION_ID/tables/users/preview?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. 导入数据

```bash
curl -X POST http://localhost:3001/api/datasources/database/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"connectionId\": \"$CONNECTION_ID\",
    \"tableName\": \"users\",
    \"importTableName\": \"用户数据\",
    \"description\": \"从数据库导入的用户数据\",
    \"limit\": 1000
  }"
```

## 自动化测试

我们提供了一个自动化测试脚本，可以测试完整的导入流程：

```bash
# 给脚本执行权限
chmod +x test-database-import.sh

# 运行测试
./test-database-import.sh
```

测试脚本会自动执行以下步骤：
1. ✅ 用户登录
2. ✅ 测试 MySQL 连接
3. ✅ 测试 PostgreSQL 连接
4. ✅ 创建数据库连接
5. ✅ 获取表列表
6. ✅ 预览表数据
7. ✅ 导入数据
8. ✅ 验证导入结果
9. ✅ 清理测试资源

## 前端使用（即将推出）

前端 UI 界面正在开发中，将包括：
- 📝 数据库连接管理界面
- 🔍 可视化表浏览器
- 👁️ 数据预览组件
- 📥 一键导入功能

## API 端点总览

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/datasources/database/test-connection` | 测试数据库连接 |
| POST | `/api/datasources/database/connections` | 创建连接配置 |
| GET | `/api/datasources/database/connections` | 获取所有连接 |
| GET | `/api/datasources/database/connections/:id` | 获取单个连接 |
| DELETE | `/api/datasources/database/connections/:id` | 删除连接 |
| GET | `/api/datasources/database/connections/:id/tables` | 获取表列表 |
| GET | `/api/datasources/database/connections/:id/tables/:name/preview` | 预览表数据 |
| POST | `/api/datasources/database/import` | 导入数据 |

## 类型映射

### MySQL → 系统类型
- `INT, BIGINT, SMALLINT, TINYINT` → `number`
- `DECIMAL, FLOAT, DOUBLE` → `number`
- `VARCHAR, CHAR, TEXT` → `string`
- `DATE` → `date`
- `DATETIME, TIMESTAMP` → `datetime`
- `BOOLEAN` → `boolean`
- `JSON` → `json`

### PostgreSQL → 系统类型
- `INTEGER, BIGINT, SMALLINT` → `number`
- `NUMERIC, REAL, DOUBLE PRECISION` → `number`
- `CHARACTER VARYING, CHARACTER, TEXT` → `string`
- `DATE` → `date`
- `TIMESTAMP` → `datetime`
- `BOOLEAN` → `boolean`
- `JSON, JSONB` → `json`

## 注意事项

### 安全性
- ⚠️ 当前版本密码以明文存储，请勿在生产环境使用敏感密码
- ⚠️ 建议使用只读数据库用户进行导入
- ⚠️ 确保数据库网络访问受限

### 性能
- 💡 大表建议使用 `limit` 参数限制导入行数
- 💡 首次导入建议先预览数据确认格式
- 💡 导入时系统会自动推断数据类型

### 限制
- 单次导入建议不超过 10,000 行
- 不支持导入 BLOB/BYTEA 等二进制数据
- 不支持导入复杂的嵌套 JSON 结构

## 完整文档

- 📖 [数据库导入完整指南](./DATABASE_IMPORT_GUIDE.md)
- 📖 [实现报告](./DATABASE_IMPORT_IMPLEMENTATION.md)
- 📖 [API 文档](./docs/API.md)

## 故障排除

### 连接失败
```bash
# 检查数据库是否运行
docker ps | grep mysql
docker ps | grep postgres

# 检查端口是否开放
netstat -an | grep 3306
netstat -an | grep 5432

# 检查防火墙设置
```

### 权限错误
```sql
-- MySQL 授予权限
GRANT SELECT ON database_name.* TO 'username'@'%';
FLUSH PRIVILEGES;

-- PostgreSQL 授予权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO username;
```

### 导入超时
- 减少 `limit` 参数值
- 确保表有适当的索引
- 检查网络延迟

## 反馈与支持

如遇到问题，请提供：
1. 数据库类型和版本
2. 错误信息
3. 连接配置（隐藏密码）
4. 操作步骤

---

**版本**: v1.0.0  
**更新日期**: 2024-01-23  
**状态**: ✅ 可用（后端）| 🚧 开发中（前端）
