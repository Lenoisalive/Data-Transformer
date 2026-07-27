# 📤 Data Export Module - Complete Guide

## ✅ 完成状态

### 后端 API
- ✅ **ExportModule** - 数据导出模块已创建
- ✅ **ExportService** - 文件生成服务(CSV/Excel/JSON)
- ✅ **ExportController** - 导出表创建和下载API
- ✅ **DTOs** - 数据传输对象(Create/Update)
- ✅ **ExportTable Entity** - 数据库实体定义

### 前端组件
- ✅ **DataExport.tsx** - 完整的数据导出UI组件(Ant Design)
- ✅ **export.service.ts** - API调用服务

### API 端点
```
POST   /api/export              - 创建导出表
GET    /api/export              - 获取所有导出表
GET    /api/export/:id          - 获取单个导出表详情
GET    /api/export/:id/preview  - 获取数据预览
GET    /api/export/:id/download - 下载导出文件
PUT    /api/export/:id          - 更新导出表
DELETE /api/export/:id          - 删除导出表
```

---

## 🧪 测试指南

### 1. 启动服务

**后端** (已启动):
```bash
✅ 运行在 http://localhost:3001
✅ ExportModule 已加载
✅ 7个API端点已注册
```

**前端**:
```bash
cd /Users/sulingjie/projects/Data-Transformer/apps/frontend
npm run dev
# 运行在 http://localhost:3000
```

### 2. 登录系统

访问 http://localhost:3000/login

使用测试账号:
```
Username: admin
Password: admin123
```

### 3. 访问 Data Export 页面

登录后,在左侧菜单点击 **"Data Export"** 或访问:
```
http://localhost:3000/export
```

### 4. 创建导出表测试

#### 测试用例 1: 员工数据 (CSV)

点击 **"Create Export Table"** 按钮:

**表单数据**:
- Table Name: `Employee Export`
- Export Format: `CSV`
- Column Names: `id,name,age,department,salary`
- Data Rows:
```
1,张三,28,IT,12000
2,李四,35,HR,10000
3,王五,42,Finance,15000
4,赵六,31,IT,13000
5,孙七,29,Marketing,11000
```
- Description: `员工信息导出表 - CSV格式`

点击 **"Create"** 按钮。

#### 测试用例 2: 产品数据 (Excel)

**表单数据**:
- Table Name: `Product Export`
- Export Format: `Excel`
- Column Names: `product_id,product_name,price,stock,category`
- Data Rows:
```
1001,笔记本电脑,5999,50,Electronics
1002,无线鼠标,129,200,Accessories
1003,机械键盘,599,150,Accessories
1004,显示器,1999,80,Electronics
1005,USB-C线,49,500,Accessories
```
- Description: `产品库存导出表 - Excel格式`

#### 测试用例 3: 用户数据 (JSON)

**表单数据**:
- Table Name: `User Export`
- Export Format: `JSON`
- Column Names: `user_id,username,email,role,status`
- Data Rows:
```
1,admin,admin@example.com,admin,active
2,john_doe,john@example.com,user,active
3,jane_smith,jane@example.com,user,inactive
4,bob_wilson,bob@example.com,analyst,active
```
- Description: `用户信息导出表 - JSON格式`

### 5. 验证功能

#### ✅ 表创建
- 创建成功后显示成功消息
- 表格中应出现新创建的导出表
- 状态应从 "pending" → "processing" → "completed"

#### ✅ Schema 显示
- 点击表格行左侧的展开箭头
- 应显示所有列的schema信息
- 每列显示名称和数据类型

#### ✅ 数据预览
- 点击 **"Preview"** (眼睛图标)
- 弹出窗口应显示前10行数据
- 数据应以表格形式展示

#### ✅ 文件下载
- 点击 **"Download"** (下载图标)
- 浏览器应自动下载文件
- CSV文件可用Excel/文本编辑器打开
- Excel文件可用Excel打开
- JSON文件可用文本编辑器打开

#### ✅ 删除功能
- 点击 **"Delete"** (垃圾桶图标)
- 确认删除后,导出表应从列表中消失

---

## 📋 测试场景

### 场景 1: 快速导出 CSV

1. 点击 "Create Export Table"
2. 填写:
   - Name: `Quick Test`
   - Format: `CSV`
   - Columns: `a,b,c`
   - Data: 
     ```
     1,2,3
     4,5,6
     ```
3. 点击 Create
4. 等待状态变为 "completed"
5. 点击 Download
6. 打开下载的CSV文件验证内容

### 场景 2: 大数据集测试

创建包含100行数据的表:

```
Column Names: id,value,timestamp
Data Rows: (使用脚本生成100行)
1,value1,2026-01-01
2,value2,2026-01-02
...
100,value100,2026-04-10
```

### 场景 3: 特殊字符测试

测试包含逗号和引号的数据:

```
Column Names: id,description
Data Rows:
1,"This is a ""quoted"" value"
2,"Value with, comma"
3,Normal value
```

---

## 🎯 功能特性

### 已实现功能

1. **多格式导出**
   - ✅ CSV 格式
   - ✅ Excel (.xlsx) 格式
   - ✅ JSON 格式

2. **数据管理**
   - ✅ 创建导出表
   - ✅ 存储表数据和schema
   - ✅ 异步文件生成
   - ✅ 状态跟踪 (pending → processing → completed)
   - ✅ 文件大小统计

3. **文件生成**
   - ✅ CSV: 自动转义逗号和引号
   - ✅ Excel: 使用xlsx库生成标准格式
   - ✅ JSON: 格式化输出,包含metadata

4. **下载功能**
   - ✅ 直接下载文件
   - ✅ 正确的Content-Type设置
   - ✅ 文件名自动生成(带时间戳)

5. **UI 交互**
   - ✅ 列表展示所有导出表
   - ✅ 实时状态更新
   - ✅ 数据预览
   - ✅ Schema查看
   - ✅ 下载和删除操作

---

## 🔧 后端实现细节

### 文件生成流程

1. **创建记录** → 在数据库创建ExportTable记录,状态为 "pending"
2. **异步处理** → 后台任务开始生成文件,状态更新为 "processing"
3. **格式转换** → 
   - CSV: 逐行拼接,处理特殊字符
   - Excel: 使用XLSX库转换JSON数据
   - JSON: 格式化输出带metadata
4. **保存文件** → 保存到 `./uploads/exports/` 目录
5. **更新记录** → 状态更新为 "completed",保存文件信息

### 文件存储位置

```
./uploads/exports/
├── Employee Export-1784858745123.csv
├── Product Export-1784858750456.xlsx
└── User Export-1784858755789.json
```

### 数据结构

```typescript
ExportTable {
  id: uuid
  name: string
  format: 'csv' | 'excel' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filePath: string
  fileName: string
  fileSize: number
  schema: {
    columns: [{
      name: string
      type: string
    }]
  }
  data: any[]
  rowCount: number
  ownerId: uuid
}
```

---

## 📝 API 使用示例

### 创建导出表

```bash
TOKEN="YOUR_JWT_TOKEN"

curl -X POST http://localhost:3001/api/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Export",
    "format": "csv",
    "schema": [
      {"name": "id", "type": "string"},
      {"name": "name", "type": "string"}
    ],
    "data": [
      {"id": "1", "name": "John"},
      {"id": "2", "name": "Jane"}
    ],
    "description": "Test data"
  }'
```

### 获取所有导出表

```bash
curl http://localhost:3001/api/export \
  -H "Authorization: Bearer $TOKEN"
```

### 下载文件

```bash
curl http://localhost:3001/api/export/{id}/download \
  -H "Authorization: Bearer $TOKEN" \
  -O -J
```

---

## 🐛 常见问题

### 1. 创建失败 - "Schema is required"
**原因**: 列名格式不正确
**解决**: 确保列名用逗号分隔,无空格: `id,name,age`

### 2. 数据格式错误
**原因**: 数据行与列数不匹配
**解决**: 确保每行数据的值数量与列数相同

### 3. 下载按钮禁用
**原因**: 文件还在生成中
**解决**: 等待状态变为 "completed"

### 4. CSV文件中文乱码
**原因**: 编码问题
**解决**: 后端已使用UTF-8编码,用支持UTF-8的编辑器打开

---

## 🔄 Import vs Export 对比

| 特性 | Data Import | Data Export |
|-----|------------|-------------|
| **用途** | 上传外部文件到系统 | 从系统导出数据到文件 |
| **数据来源** | 本地文件 (CSV/Excel) | 系统内创建的数据 |
| **主要操作** | 文件上传 + Schema解析 | 数据录入 + 文件生成 |
| **支持格式** | CSV, Excel | CSV, Excel, JSON |
| **表类型** | datasources 表 | export_tables 表 |
| **API路径** | /api/datasources | /api/export |
| **关键功能** | 智能类型推断 | 多格式导出 |

**重要**: 两个模块的表是完全独立的,后续通过Transformation Workbench打通。

---

## ✨ 使用场景

### 场景 1: 数据报表导出
用户在系统中生成分析报表后,创建导出表并下载为Excel文件。

### 场景 2: 数据备份
定期将重要数据导出为JSON格式进行备份。

### 场景 3: 跨系统数据传输
将数据导出为CSV格式,供其他系统导入使用。

### 场景 4: 数据可视化准备
导出数据到CSV,用于Tableau/PowerBI等工具分析。

---

## 📞 技术支持

**测试账号**:
- admin / admin123
- engineer / engineer123
- analyst / analyst123

**API Base URL**: http://localhost:3001/api
**Frontend URL**: http://localhost:3000

**文件位置**:
- 上传文件: `./uploads/datasources/`
- 导出文件: `./uploads/exports/`

---

✅ **Data Export Module 开发完成!**

## 下一步建议

1. ✅ Data Import 已完成
2. ✅ Data Export 已完成
3. 🚧 下一步: Transformation Workbench (数据转换工作台)
   - 打通 Import 和 Export
   - 实现数据转换逻辑
   - 字段映射和转换规则
