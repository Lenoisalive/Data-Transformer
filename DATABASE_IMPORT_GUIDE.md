# 数据库导入功能完整指南

## 📋 概述

数据库导入功能允许用户直接从外部数据库（MySQL、PostgreSQL）连接、浏览表结构并导入数据到 Data Transformer 系统中。

## 🎯 功能特性

### 支持的数据库
- ✅ **MySQL** (5.7+, 8.0+)
- ✅ **PostgreSQL** (10+, 11+, 12+, 13+, 14+, 15+)
- 🔜 **SQL Server** (计划支持)
- 🔜 **Oracle** (计划支持)

### 核心功能
1. **连接管理**
   - 创建数据库连接配置
   - 测试连接有效性
   - 保存连接信息（密码加密存储）
   - 管理多个数据库连接

2. **表浏览**
   - 列出数据库中所有表
   - 显示表行数统计
   - 查看表结构（列名、数据类型、是否可空）

3. **数据预览**
   - 预览表数据前 N 行
   - 支持自定义预览行数

4. **数据导入**
   - 完整导入或限制行数
   - 自动类型映射（数据库类型 → 系统类型）
   - 创建数据源记录

## 🏗️ 技术架构

### 后端模块结构

```
apps/backend/src/modules/datasources/
├── database-import.service.ts        # 数据库导入核心服务
├── datasources.controller.ts         # API 端点控制器
├── datasources.service.ts            # 数据源服务（增强）
├── datasources.module.ts             # 模块定义
├── dto/
│   └── database-connection.dto.ts    # 数据传输对象
└── entities/
    ├── database-connection.entity.ts  # 数据库连接实体
    └── datasource.entity.ts          # 数据源实体
```

### 数据库表结构

#### database_connections 表
```sql
CREATE TABLE database_connections (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('mysql', 'postgres', 'mssql', 'oracle') NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,  -- 应加密存储
  database VARCHAR(255) NOT NULL,
  description TEXT,
  ssl BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

## 🔌 API 端点

### 1. 测试数据库连接
```http
POST /api/datasources/database/test-connection
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "test_db",
  "ssl": false
}

Response:
{
  "success": true,
  "message": "Connection successful"
}
```

### 2. 创建数据库连接
```http
POST /api/datasources/database/connections
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "本地 MySQL",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "test_db",
  "description": "本地开发数据库",
  "ssl": false
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "本地 MySQL",
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    ...
  },
  "message": "Database connection created successfully"
}
```

### 3. 获取所有数据库连接
```http
GET /api/datasources/database/connections
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "本地 MySQL",
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "test_db",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### 4. 获取数据库中的所有表
```http
GET /api/datasources/database/connections/{connectionId}/tables
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "name": "users",
      "rowCount": 1250,
      "columns": [
        {
          "name": "id",
          "type": "int",
          "nullable": false
        },
        {
          "name": "username",
          "type": "varchar",
          "nullable": false
        },
        {
          "name": "email",
          "type": "varchar",
          "nullable": true
        }
      ]
    }
  ]
}
```

### 5. 预览表数据
```http
GET /api/datasources/database/connections/{connectionId}/tables/{tableName}/preview?limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    },
    ...
  ]
}
```

### 6. 从数据库导入数据
```http
POST /api/datasources/database/import
Content-Type: application/json
Authorization: Bearer <token>

{
  "connectionId": "uuid",
  "tableName": "users",
  "importTableName": "用户数据",
  "description": "从生产数据库导入的用户数据",
  "limit": 1000  // 可选，限制导入行数
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "用户数据",
    "type": "database",
    "status": "completed",
    "rowCount": 1000,
    "schema": { ... }
  },
  "message": "Data imported from database successfully"
}
```

### 7. 删除数据库连接
```http
DELETE /api/datasources/database/connections/{connectionId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Database connection deleted successfully"
}
```

## 💻 使用示例

### cURL 示例

#### 1. 登录获取 Token
```bash
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@datatransformer.com",
    "password": "admin123"
  }' | jq -r '.data.accessToken')
```

#### 2. 测试 MySQL 连接
```bash
curl -X POST http://localhost:3001/api/datasources/database/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mysql123",
    "database": "test_hospital"
  }'
```

#### 3. 创建数据库连接
```bash
curl -X POST http://localhost:3001/api/datasources/database/connections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "医院数据库",
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mysql123",
    "database": "test_hospital",
    "description": "医院管理系统数据库"
  }'
```

#### 4. 获取所有表
```bash
CONNECTION_ID="your-connection-id"
curl -X GET "http://localhost:3001/api/datasources/database/connections/$CONNECTION_ID/tables" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. 预览表数据
```bash
curl -X GET "http://localhost:3001/api/datasources/database/connections/$CONNECTION_ID/tables/patients/preview?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. 导入数据
```bash
curl -X POST http://localhost:3001/api/datasources/database/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "connectionId": "'$CONNECTION_ID'",
    "tableName": "patients",
    "importTableName": "患者数据",
    "description": "从医院数据库导入的患者信息",
    "limit": 500
  }'
```

### JavaScript/TypeScript 示例

```typescript
// 数据库导入服务
class DatabaseImportService {
  private baseURL = 'http://localhost:3001/api/datasources';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // 测试连接
  async testConnection(config: DatabaseConfig): Promise<TestResult> {
    const response = await fetch(`${this.baseURL}/database/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(config),
    });
    return response.json();
  }

  // 创建连接
  async createConnection(config: DatabaseConnectionDto): Promise<Connection> {
    const response = await fetch(`${this.baseURL}/database/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(config),
    });
    const data = await response.json();
    return data.data;
  }

  // 获取表列表
  async getTables(connectionId: string): Promise<TableInfo[]> {
    const response = await fetch(
      `${this.baseURL}/database/connections/${connectionId}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  }

  // 预览表数据
  async previewTable(
    connectionId: string,
    tableName: string,
    limit: number = 10
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseURL}/database/connections/${connectionId}/tables/${tableName}/preview?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  }

  // 导入数据
  async importData(dto: ImportFromDatabaseDto): Promise<DataSource> {
    const response = await fetch(`${this.baseURL}/database/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(dto),
    });
    const data = await response.json();
    return data.data;
  }
}

// 使用示例
const service = new DatabaseImportService(token);

// 1. 测试连接
const testResult = await service.testConnection({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'my_db',
});

if (testResult.success) {
  // 2. 创建连接
  const connection = await service.createConnection({
    name: '生产数据库',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'my_db',
  });

  // 3. 获取表列表
  const tables = await service.getTables(connection.id);
  console.log('可用表:', tables);

  // 4. 预览表数据
  const preview = await service.previewTable(connection.id, 'users', 5);
  console.log('预览数据:', preview);

  // 5. 导入数据
  const datasource = await service.importData({
    connectionId: connection.id,
    tableName: 'users',
    importTableName: '用户数据',
    limit: 1000,
  });
  console.log('导入完成:', datasource);
}
```

## 🔧 配置说明

### MySQL 连接配置
```typescript
{
  "type": "mysql",
  "host": "localhost",      // 主机地址
  "port": 3306,            // 端口号，默认 3306
  "username": "root",      // 用户名
  "password": "password",  // 密码
  "database": "db_name",   // 数据库名
  "ssl": false            // 是否使用 SSL
}
```

### PostgreSQL 连接配置
```typescript
{
  "type": "postgres",
  "host": "localhost",      // 主机地址
  "port": 5432,            // 端口号，默认 5432
  "username": "postgres",  // 用户名
  "password": "password",  // 密码
  "database": "db_name",   // 数据库名
  "ssl": false            // 是否使用 SSL
}
```

## 🗺️ 类型映射

### MySQL 类型映射
| MySQL 类型 | 系统类型 |
|-----------|---------|
| INT, BIGINT, SMALLINT, TINYINT | number |
| DECIMAL, FLOAT, DOUBLE | number |
| VARCHAR, CHAR, TEXT | string |
| DATE | date |
| DATETIME, TIMESTAMP | datetime |
| BOOLEAN | boolean |
| JSON | json |

### PostgreSQL 类型映射
| PostgreSQL 类型 | 系统类型 |
|----------------|---------|
| INTEGER, BIGINT, SMALLINT | number |
| NUMERIC, REAL, DOUBLE PRECISION | number |
| CHARACTER VARYING, CHARACTER, TEXT | string |
| DATE | date |
| TIMESTAMP, TIMESTAMP WITHOUT TIME ZONE, TIMESTAMP WITH TIME ZONE | datetime |
| BOOLEAN | boolean |
| JSON, JSONB | json |

## ⚠️ 注意事项

### 安全性
1. **密码存储**: 生产环境中应加密存储数据库密码
2. **权限控制**: 确保数据库用户只有必要的读取权限
3. **SQL 注入**: 所有查询都使用参数化查询，避免 SQL 注入
4. **连接限制**: 建议设置最大连接数限制

### 性能优化
1. **大表导入**: 对于大表，建议使用 `limit` 参数限制导入行数
2. **连接池**: 使用连接池管理数据库连接
3. **异步处理**: 大数据量导入应使用后台任务队列
4. **索引优化**: 确保源表有适当的索引以加快查询

### 错误处理
1. **连接超时**: 设置合理的连接超时时间
2. **网络问题**: 处理网络中断和重连
3. **权限错误**: 提供清晰的权限错误提示
4. **数据类型**: 处理不支持的数据类型

## 🧪 测试

### 单元测试
```bash
cd apps/backend
pnpm test database-import.service.spec.ts
```

### 集成测试
```bash
# 启动测试数据库
docker-compose up -d mysql postgres

# 运行集成测试
pnpm test:e2e datasources
```

### 手动测试清单
- [ ] 测试 MySQL 连接成功
- [ ] 测试 MySQL 连接失败（错误密码）
- [ ] 测试 PostgreSQL 连接成功
- [ ] 测试 PostgreSQL 连接失败
- [ ] 获取表列表
- [ ] 预览表数据
- [ ] 导入小表（< 1000 行）
- [ ] 导入大表（使用 limit）
- [ ] 测试中文字符
- [ ] 测试特殊字符
- [ ] 测试 NULL 值
- [ ] 测试各种数据类型

## 📚 相关文档

- [数据源管理 API 文档](./docs/API.md#datasources)
- [数据导入导出指南](./DATA_IMPORT_EXPORT_QUICKSTART.md)
- [架构设计文档](./docs/ARCHITECTURE.md)

## 🚀 后续规划

### 短期 (v1.1)
- [ ] 支持 SSL/TLS 加密连接
- [ ] 密码加密存储
- [ ] 连接池管理
- [ ] 导入进度显示

### 中期 (v1.2)
- [ ] 支持 SQL Server
- [ ] 支持 Oracle
- [ ] 支持自定义 SQL 查询导入
- [ ] 增量数据同步

### 长期 (v2.0)
- [ ] 支持 MongoDB
- [ ] 支持 Redis
- [ ] 数据库备份/恢复
- [ ] 定时任务导入

## 📞 问题反馈

如遇到问题，请提供以下信息：
1. 数据库类型和版本
2. 错误信息和堆栈跟踪
3. 数据库连接配置（隐藏敏感信息）
4. 操作步骤

---

**最后更新**: 2024-01-23
**版本**: v1.0.0
