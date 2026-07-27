# 🎯 Data Import Module - 完整测试手册

## 📋 测试前检查清单

### ✅ 服务状态
- [x] 后端服务运行中 (http://localhost:3001) ✅
- [x] 前端服务运行中 (http://localhost:3000) ✅
- [x] PostgreSQL 数据库运行中 ✅
- [x] Redis 缓存运行中 ✅

### ✅ 代码完成度
- [x] 后端 DatasourcesModule - 100% ✅
- [x] 前端 DataImport 组件 - 100% ✅
- [x] API 服务层 - 100% ✅
- [x] 路由配置 - 100% ✅
- [x] 类型定义 - 100% ✅

### ✅ 测试文件准备
- [x] `test-data-employees.csv` - 员工数据 (10行) ✅
- [x] `test-data-products.xlsx` - 产品数据 (10行) ✅

---

## 🧪 详细测试步骤

### 步骤 1: 登录系统

1. 打开浏览器访问: **http://localhost:3000**
2. 如果未登录,会自动跳转到登录页面
3. 使用测试账号登录:

```
方式 1 - 使用用户名:
Username: admin
Password: admin123

方式 2 - 使用邮箱:
Email: admin@datatransformer.com
Password: admin123
```

**预期结果**: 
- ✅ 登录成功后跳转到 Dashboard
- ✅ 左侧菜单显示导航选项
- ✅ 右上角显示用户信息

---

### 步骤 2: 进入 Data Import 页面

1. 在左侧菜单中找到 **"Data Import"** 选项
2. 点击进入数据导入页面

**预期结果**:
- ✅ 页面标题显示 "📊 Data Import"
- ✅ 右上角有蓝色的 **"Import Data"** 按钮
- ✅ 如果是第一次使用,表格显示空状态提示:
  ```
  云图标 ☁️
  "No data sources imported yet. Click 'Import Data' to get started."
  ```

---

### 步骤 3: 测试 CSV 文件上传

#### 3.1 打开上传对话框

1. 点击右上角的 **"Import Data"** 按钮

**预期结果**:
- ✅ 弹出模态框,标题为 "Import Data File"
- ✅ 显示虚线边框的文件上传区域
- ✅ 显示表单字段: Data Source Name, File Type, Description

#### 3.2 选择 CSV 文件

1. 点击 "Click to select CSV or Excel file" 区域
2. 在文件选择器中选择 `test-data-employees.csv`
3. 或者直接拖拽文件到上传区域

**预期结果**:
- ✅ 上传区域显示文件名: "test-data-employees.csv"
- ✅ "Data Source Name" 自动填充为: "test-data-employees"
- ✅ "File Type" 自动选择为: "CSV"

#### 3.3 填写信息并上传

1. (可选) 修改数据源名称,例如: "员工信息表"
2. (可选) 在 Description 中输入: "包含10条员工测试数据"
3. 点击 **"Upload"** 按钮

**预期结果**:
- ✅ 按钮显示 Loading 状态,文字变为 "Uploading..."
- ✅ 上传成功后显示绿色成功消息: "File uploaded successfully!"
- ✅ 对话框自动关闭
- ✅ 表格中出现新导入的数据源

#### 3.4 验证上传结果

在表格中查看新数据源的信息:

**预期显示**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ | 📊 员工信息表           | CSV | ✅COMPLETED | 10 | 0.xx KB | Actions │
│   | test-data-employees.csv |     |            |    |         | 👁️ 🗑️   │
└─────────────────────────────────────────────────────────────────┘
```

**字段验证**:
- ✅ Name: 显示自定义名称
- ✅ Type: 显示 "CSV" 标签
- ✅ Status: 显示绿色的 "COMPLETED" 标签
- ✅ Rows: 显示 "10"
- ✅ File Size: 显示文件大小 (约 0.5 KB)
- ✅ Created At: 显示当前时间
- ✅ Actions: 显示预览和删除图标

---

### 步骤 4: 查看 Schema 信息

#### 4.1 展开行查看详情

1. 点击表格行左侧的 **向下箭头 ▼** 图标

**预期结果**:
- ✅ 行展开,显示 Schema 详情表格
- ✅ 标题显示: "Schema (6 columns)"
- ✅ 内嵌表格有4列: Column Name | Data Type | Nullable | Example

#### 4.2 验证 Schema 内容

**预期显示的6个字段**:

| Column Name | Data Type | Nullable | Example |
|-------------|-----------|----------|---------|
| id | integer | No | 1 |
| name | string | No | 张三 |
| age | integer | No | 28 |
| department | string | No | IT |
| salary | integer/decimal | No | 12000 |
| hire_date | date/string | No | 2022-01-15 |

**验证点**:
- ✅ 所有6个列都正确识别
- ✅ 数据类型推断正确 (id和age是integer, name是string等)
- ✅ Example 显示了实际的示例值
- ✅ Nullable 字段正确显示

---

### 步骤 5: 数据预览测试

#### 5.1 打开预览对话框

1. 点击 Actions 列中的 **眼睛图标 👁️** (Preview)

**预期结果**:
- ✅ 弹出大型模态框 (90% 宽度)
- ✅ 标题显示: "Data Preview - 员工信息表"
- ✅ 副标题显示: "Showing first 10 rows of 10 total rows"
- ✅ 显示数据统计信息:
  - Total Rows: 10
  - File Size: 0.xx KB
  - Columns: 6

#### 5.2 验证预览数据

**预期显示**:
- ✅ 表格有6列,列名与CSV文件一致
- ✅ 显示10行数据 (全部数据)
- ✅ 数据内容与CSV文件完全匹配
- ✅ 中文字符正确显示,无乱码
- ✅ 表格支持水平滚动
- ✅ 底部显示提示: "Showing first 10 rows"

#### 5.3 关闭预览

1. 点击 **"Close"** 按钮

**预期结果**:
- ✅ 预览对话框关闭
- ✅ 返回到数据源列表页面

---

### 步骤 6: 测试 Excel 文件上传

#### 6.1 上传 Excel 文件

1. 再次点击 **"Import Data"** 按钮
2. 选择 `test-data-products.xlsx` 文件
3. 观察表单是否自动识别

**预期结果**:
- ✅ Name 自动填充为: "test-data-products"
- ✅ Type 自动选择为: "Excel"

#### 6.2 填写并上传

1. 修改名称为: "产品目录"
2. 描述: "电子产品库存数据"
3. 点击 **"Upload"**

**预期结果**:
- ✅ 上传成功
- ✅ 表格中现在有2条数据源
- ✅ 新数据源显示:
  - Type: EXCEL 标签
  - Rows: 10
  - Status: COMPLETED

#### 6.3 验证 Excel Schema

1. 展开 "产品目录" 行
2. 查看 Schema 信息

**预期显示的6个字段**:

| Column Name | Data Type | Nullable | Example |
|-------------|-----------|----------|---------|
| Product ID | integer | No | 101 |
| Product Name | string | No | Laptop |
| Category | string | No | Electronics |
| Price | decimal | No | 5999 |
| Stock | integer | No | 50 |
| Last Updated | date/string | No | 2026-01-15 |

---

### 步骤 7: 测试删除功能

#### 7.1 删除数据源

1. 点击任一数据源的 **垃圾桶图标 🗑️**
2. 在确认对话框中查看提示

**预期结果**:
- ✅ 显示 Popconfirm 确认框
- ✅ 标题: "Delete Data Source"
- ✅ 描述: "Are you sure you want to delete this data source?"
- ✅ 有 "Yes" 和 "No" 按钮

#### 7.2 确认删除

1. 点击 **"Yes"** 按钮

**预期结果**:
- ✅ 显示成功消息: "Data source deleted successfully"
- ✅ 该数据源从列表中消失
- ✅ 表格重新加载,只显示剩余的数据源

#### 7.3 取消删除

1. 对另一个数据源点击删除图标
2. 点击 **"No"** 或按 ESC 键

**预期结果**:
- ✅ 确认框关闭
- ✅ 数据源未被删除,仍在列表中

---

## 🔍 高级测试场景

### 场景 1: 错误文件格式测试

**步骤**:
1. 尝试上传 `.txt` 或 `.pdf` 文件

**预期结果**:
- ✅ 文件选择器只允许选择 .csv, .xlsx, .xls 文件
- ✅ 如果强制上传,后端返回错误: "Only CSV and Excel files are allowed"

### 场景 2: 空文件测试

**步骤**:
1. 创建一个空的 CSV 文件
2. 尝试上传

**预期结果**:
- ✅ 后端返回错误: "Empty CSV file"
- ✅ 前端显示错误消息
- ✅ 数据源状态标记为 "FAILED"

### 场景 3: 大文件测试

**步骤**:
1. 尝试上传 > 50MB 的文件

**预期结果**:
- ✅ 上传被拒绝
- ✅ 显示错误: 文件大小超过限制

### 场景 4: 特殊字符测试

**步骤**:
1. 上传包含特殊字符的CSV (emoji, 中文, 符号)

**预期结果**:
- ✅ 所有字符正确显示
- ✅ 无乱码
- ✅ Schema 正确解析

### 场景 5: 并发上传测试

**步骤**:
1. 快速连续上传多个文件

**预期结果**:
- ✅ 所有文件都正确处理
- ✅ 状态按顺序更新
- ✅ 无冲突或数据丢失

---

## 🎯 性能测试

### 测试1: 上传速度
- **文件**: 1MB CSV (约1万行)
- **预期**: < 5秒完成上传和解析

### 测试2: Schema 推断准确性
- **验证点**: 检查10个不同字段的类型推断
- **预期准确率**: > 90%

### 测试3: 预览加载速度
- **预期**: < 1秒显示前100行

---

## 🐛 已知问题检查

### 检查点 1: Token 过期
**现象**: 操作一段时间后出现 401 错误
**解决**: 重新登录获取新 token

### 检查点 2: 文件路径问题
**现象**: 预览或下载失败
**检查**: `./uploads/datasources/` 目录是否存在且有写权限

### 检查点 3: 中文乱码
**现象**: CSV 中文显示为乱码
**解决**: 确保 CSV 文件使用 UTF-8 编码

---

## ✅ 测试检查表

### 基础功能
- [ ] 登录成功
- [ ] 进入 Data Import 页面
- [ ] 上传 CSV 文件
- [ ] 上传 Excel 文件
- [ ] 查看数据源列表
- [ ] 展开/收起 Schema
- [ ] 预览数据
- [ ] 删除数据源

### UI 交互
- [ ] 上传对话框正常打开/关闭
- [ ] 文件自动识别类型
- [ ] Loading 状态显示
- [ ] 成功/错误消息提示
- [ ] 表格排序功能
- [ ] 响应式布局

### 数据验证
- [ ] Schema 推断准确
- [ ] 行数统计正确
- [ ] 文件大小显示正确
- [ ] 时间戳准确
- [ ] 预览数据完整

### 错误处理
- [ ] 错误文件格式被拒绝
- [ ] 空文件处理
- [ ] 网络错误提示
- [ ] Token 失效处理

---

## 📊 测试报告模板

```markdown
## Data Import Module 测试报告

**测试日期**: 2026-07-24
**测试人员**: [你的名字]
**环境**: 
- 后端: http://localhost:3001 ✅
- 前端: http://localhost:3000 ✅
- 浏览器: Chrome/Safari/Firefox
- 操作系统: macOS

### 测试结果

| 测试项 | 状态 | 备注 |
|--------|------|------|
| CSV 上传 | ✅/❌ | |
| Excel 上传 | ✅/❌ | |
| Schema 解析 | ✅/❌ | |
| 数据预览 | ✅/❌ | |
| 删除功能 | ✅/❌ | |

### 发现的问题
1. [问题描述]
   - 严重程度: 高/中/低
   - 重现步骤: ...
   - 截图: ...

### 建议改进
1. [改进建议]

### 总体评价
- 功能完成度: ___%
- 稳定性: 优/良/中/差
- 用户体验: 优/良/中/差
```

---

## 🚀 快速测试命令

### 测试 API (使用 curl)

```bash
# 1. 登录获取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "Token: $TOKEN"

# 2. 上传 CSV 文件
curl -X POST http://localhost:3001/api/datasources/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-data-employees.csv" \
  -F "name=Employees Test" \
  -F "type=csv" \
  -F "description=Test data"

# 3. 获取所有数据源
curl -s http://localhost:3001/api/datasources \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

# 4. 获取数据源详情 (替换 ID)
curl -s http://localhost:3001/api/datasources/{YOUR_ID} \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

# 5. 获取预览数据
curl -s "http://localhost:3001/api/datasources/{YOUR_ID}/preview?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

---

## 📞 问题排查

### 问题: 上传失败
**检查**:
1. 后端日志是否有错误
2. 浏览器 Network 标签查看请求详情
3. 文件是否符合格式要求
4. Token 是否有效

### 问题: Schema 不准确
**原因**: 数据样本不足或类型混合
**解决**: 检查前100行数据的一致性

### 问题: 预览显示空白
**检查**:
1. 数据源状态是否为 "completed"
2. 文件路径是否正确
3. 文件是否仍存在于服务器

---

**测试文件位置**:
- CSV: `/Users/sulingjie/projects/Data-Transformer/test-data-employees.csv`
- Excel: `/Users/sulingjie/projects/Data-Transformer/test-data-products.xlsx`

**开始测试!** 🎉
