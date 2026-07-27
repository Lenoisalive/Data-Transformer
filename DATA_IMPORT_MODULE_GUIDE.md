# 📊 Data Import Module - Testing Guide

## ✅ 完成状态

### 后端 API
- ✅ **DatasourcesModule** - 数据源模块已创建
- ✅ **DatasourcesService** - 文件处理和schema解析服务
- ✅ **DatasourcesController** - 文件上传和数据API
- ✅ **DTOs** - 数据传输对象(Create/Update)
- ✅ **DataSource Entity** - 数据库实体定义
- ✅ **依赖安装** - xlsx, csv-parser, @types/multer

### 前端组件
- ✅ **DataImport.tsx** - 完整的数据导入UI组件(Ant Design)
- ✅ **datasource.service.ts** - API调用服务
- ✅ **路由配置** - /import 路由已添加到App.tsx

### API 端点
```
POST   /api/datasources/upload      - 上传文件并创建数据源
GET    /api/datasources             - 获取所有数据源
GET    /api/datasources/:id         - 获取单个数据源详情
GET    /api/datasources/:id/preview - 获取数据预览
PUT    /api/datasources/:id         - 更新数据源
DELETE /api/datasources/:id         - 删除数据源
```

---

## 🧪 测试步骤

### 1. 启动服务

**后端** (已启动):
```bash
cd /Users/sulingjie/projects/Data-Transformer/apps/backend
npm start
# ✅ 运行在 http://localhost:3001
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
Username/Email: admin
Password: admin123
```

或:
```
Username/Email: engineer
Password: engineer123
```

### 3. 访问 Data Import 页面

登录后,在左侧菜单点击 **"Data Import"** 或访问:
```
http://localhost:3000/import
```

### 4. 测试文件上传

#### 使用提供的测试文件
项目根目录已创建测试CSV文件:
```
/Users/sulingjie/projects/Data-Transformer/test-data-employees.csv
```

包含10条员工数据,字段有:
- id (整数)
- name (字符串)
- age (整数)  
- department (字符串)
- salary (整数)
- hire_date (日期)

#### 上传步骤
1. 点击右上角 **"Import Data"** 按钮
2. 在弹出窗口中点击 **"Click to select CSV or Excel file"**
3. 选择 `test-data-employees.csv` 文件
4. 名称会自动填充为 "test-data-employees"
5. 类型会自动识别为 "CSV"
6. (可选) 添加描述,例如: "Employee test data"
7. 点击 **"Upload"** 按钮

### 5. 验证功能

#### ✅ 文件上传
- 文件上传成功后应显示成功消息
- 表格中应出现新导入的数据源
- 状态应从 "processing" 变为 "completed"

#### ✅ Schema 解析
- 点击表格行左侧的展开箭头
- 应显示6个列的schema信息:
  - id (integer)
  - name (string)
  - age (integer)
  - department (string)
  - salary (integer/decimal)
  - hire_date (date/string)
- 每列应显示示例数据

#### ✅ 数据预览
- 点击 **"Preview"** (眼睛图标)
- 弹出窗口应显示前10行数据
- 数据应以表格形式展示,包含所有列

#### ✅ 删除功能
- 点击 **"Delete"** (垃圾桶图标)
- 确认删除后,数据源应从列表中消失

---

## 🎯 功能特性

### 已实现功能

1. **文件上传**
   - ✅ 支持 CSV 和 Excel (.xlsx, .xls)
   - ✅ 文件大小限制: 50MB
   - ✅ 拖拽上传支持
   - ✅ 文件类型验证

2. **Schema 自动解析**
   - ✅ 自动识别列名
   - ✅ 智能推断数据类型 (integer, decimal, string, date, boolean)
   - ✅ 检测可空性
   - ✅ 提取示例值

3. **数据管理**
   - ✅ 列表展示所有导入的数据源
   - ✅ 显示文件信息(名称、类型、大小、行数)
   - ✅ 实时状态更新 (pending → processing → completed/failed)
   - ✅ 可展开查看详细schema
   - ✅ 数据预览 (前100行)
   - ✅ 软删除功能

4. **UI 交互**
   - ✅ 美观的 Ant Design 界面
   - ✅ 响应式表格
   - ✅ 模态框上传
   - ✅ Loading状态指示
   - ✅ 错误提示
   - ✅ 成功消息

---

## 🔧 后端实现细节

### 文件处理流程

1. **上传** → Multer接收文件并保存到 `./uploads/datasources/`
2. **创建记录** → 在数据库创建DataSource记录,状态为 "pending"
3. **处理** → 状态更新为 "processing",开始解析
4. **Schema解析** → 
   - CSV: 使用 csv-parser 读取前100行
   - Excel: 使用 xlsx 解析工作表
5. **类型推断** → 分析数据值,推断列类型
6. **统计** → 计算总行数
7. **完成** → 状态更新为 "completed",保存schema和元数据

### 数据类型推断逻辑

```typescript
推断规则:
- 80%+ 为数字 → integer/decimal
- 80%+ 为日期 → date
- 全为布尔值 → boolean
- 其他 → string
```

### 存储结构

```typescript
DataSource {
  id: uuid
  name: string
  type: 'csv' | 'excel'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filePath: string
  fileName: string
  fileSize: number
  schema: {
    columns: [{
      name: string
      type: string
      nullable: boolean
      example: any
    }]
  }
  rowCount: number
  ownerId: uuid
}
```

---

## 📝 API 使用示例

### 上传文件

```bash
curl -X POST http://localhost:3001/api/datasources/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-data-employees.csv" \
  -F "name=Employees Data" \
  -F "type=csv" \
  -F "description=Test employee data"
```

### 获取所有数据源

```bash
curl http://localhost:3001/api/datasources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 获取预览数据

```bash
curl http://localhost:3001/api/datasources/{id}/preview?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 常见问题

### 1. 上传失败 - "File is required"
**原因**: 未选择文件
**解决**: 确保点击上传按钮前已选择文件

### 2. Schema 解析失败
**原因**: CSV格式不正确或Excel文件损坏
**解决**: 检查文件格式,确保:
- CSV: UTF-8编码,逗号分隔
- Excel: 标准.xlsx格式

### 3. 预览显示为空
**原因**: 文件处理状态不是 "completed"
**解决**: 等待处理完成,或检查文件内容是否为空

### 4. 中文乱码
**原因**: CSV文件编码问题
**解决**: 确保CSV文件使用 UTF-8 编码保存

---

## ✨ 下一步开发建议

### 优先级高
- [ ] 支持更多文件类型 (JSON, XML)
- [ ] 大文件分片上传
- [ ] 上传进度条
- [ ] 数据预处理 (去重、清洗)

### 优先级中
- [ ] 导入历史记录
- [ ] 批量上传
- [ ] 文件版本管理
- [ ] 导入任务队列

### 优先级低
- [ ] 与Transformation Workbench集成
- [ ] 数据统计图表
- [ ] 导入模板功能
- [ ] 定时导入任务

---

## 📞 技术支持

如遇到问题,请检查:
1. 后端日志: 终端中的Nest输出
2. 浏览器控制台: Network标签查看API请求
3. 数据库: 查看 datasources 表记录

**测试账号**:
- admin / admin123
- engineer / engineer123
- analyst / analyst123

**API Base URL**: http://localhost:3001/api
**Frontend URL**: http://localhost:3000

---

✅ **Data Import Module 开发完成!**
