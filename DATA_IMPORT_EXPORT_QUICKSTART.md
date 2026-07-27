# 📦 Data Import & Export - Quick Start

## ✅ 模块状态

| 模块 | 状态 | API端点 | 前端页面 |
|------|------|---------|----------|
| **Data Import** | ✅ 完成 | `/api/datasources` | `/import` |
| **Data Export** | ✅ 完成 | `/api/export` | `/export` |

---

## 🚀 快速开始

### 1. 启动服务

```bash
# 后端 (已启动)
cd apps/backend && npm start
# ✅ http://localhost:3001

# 前端
cd apps/frontend && npm run dev
# http://localhost:3000
```

### 2. 登录系统

访问: http://localhost:3000/login

```
Username: admin
Password: admin123
```

### 3. 测试功能

#### 📥 Data Import (导入)

1. 访问: http://localhost:3000/import
2. 点击 "Import Data"
3. 选择文件: `test-data-employees.csv`
4. 上传并查看schema
5. 预览数据
6. 下载文件

#### 📤 Data Export (导出)

1. 访问: http://localhost:3000/export
2. 点击 "Create Export Table"
3. 填写表单:
   - Name: `Test Table`
   - Format: `CSV`
   - Columns: `id,name,value`
   - Data: 
     ```
     1,Alice,100
     2,Bob,200
     3,Charlie,300
     ```
4. 创建并等待生成
5. 下载文件

---

## 📝 测试数据

### 测试文件 1: test-data-employees.csv
```csv
id,name,age,department,salary,hire_date
1,张三,28,IT,12000,2022-01-15
2,李四,35,HR,10000,2021-05-20
...
```

### 测试文件 2: test-data-products.xlsx
Excel格式产品数据

---

## 🔧 API 测试

### 获取Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
```

### 创建导出表
```bash
curl -X POST http://localhost:3001/api/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "format": "csv",
    "schema": [{"name":"id","type":"string"}],
    "data": [{"id":"1"}]
  }'
```

### 获取导入列表
```bash
curl http://localhost:3001/api/datasources \
  -H "Authorization: Bearer $TOKEN"
```

### 获取导出列表
```bash
curl http://localhost:3001/api/export \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 文档

- **DATA_IMPORT_MODULE_GUIDE.md** - Import模块详细指南
- **DATA_EXPORT_MODULE_GUIDE.md** - Export模块详细指南
- **DATA_IMPORT_EXPORT_COMPLETE.md** - 完成报告
- **test-import-export.sh** - 自动化测试脚本

---

## 🎯 核心功能

### Data Import
- ✅ CSV/Excel文件上传
- ✅ 自动Schema推断
- ✅ 数据类型识别 (integer, decimal, date, boolean, string)
- ✅ 数据预览
- ✅ 文件管理

### Data Export  
- ✅ 创建导出表
- ✅ 多格式导出 (CSV, Excel, JSON)
- ✅ 异步文件生成
- ✅ 文件下载
- ✅ 数据预览

---

## 🔑 重要说明

1. **独立表设计**: Import和Export使用不同的数据库表,互不影响
2. **后续集成**: 将在Transformation Workbench中打通两个模块
3. **权限控制**: 所有操作需要JWT认证
4. **文件存储**: 
   - Import: `./uploads/datasources/`
   - Export: `./uploads/exports/`

---

## 🐛 常见问题

### Q: 上传失败?
A: 检查文件格式和大小限制(50MB)

### Q: 中文乱码?
A: 确保CSV文件使用UTF-8编码

### Q: 下载按钮禁用?
A: 等待文件生成完成 (status = completed)

### Q: API返回401?
A: Token过期,重新登录

---

## 📞 支持

**Backend**: http://localhost:3001  
**Frontend**: http://localhost:3000  
**Database**: PostgreSQL (localhost:5432)

**测试账号**:
- admin / admin123
- engineer / engineer123
- analyst / analyst123

---

✅ **Data Import & Export 模块已完成,可以开始使用!**

下一步: 开发 **Transformation Workbench** (数据转换工作台)
