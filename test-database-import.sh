#!/bin/bash

# 数据库导入功能测试脚本
# 使用方法: ./test-database-import.sh

set -e

BASE_URL="http://localhost:3001/api"
echo "🚀 数据库导入功能测试脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 登录获取 Token
echo "📝 步骤 1: 用户登录"
echo "--------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@datatransformer.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 登录成功${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. 测试 MySQL 连接
echo "📝 步骤 2: 测试 MySQL 数据库连接"
echo "--------------------------------"
TEST_MYSQL=$(curl -s -X POST "$BASE_URL/datasources/database/test-connection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "mysql123",
    "database": "test_hospital"
  }')

echo "Response: $TEST_MYSQL"

SUCCESS=$(echo $TEST_MYSQL | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ MySQL 连接测试成功${NC}"
else
  echo -e "${YELLOW}⚠️  MySQL 连接测试失败（可能数据库未运行）${NC}"
fi
echo ""

# 3. 测试 PostgreSQL 连接
echo "📝 步骤 3: 测试 PostgreSQL 数据库连接"
echo "--------------------------------"
TEST_PG=$(curl -s -X POST "$BASE_URL/datasources/database/test-connection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "postgres123",
    "database": "data_transformer"
  }')

echo "Response: $TEST_PG"

PG_SUCCESS=$(echo $TEST_PG | jq -r '.success')
if [ "$PG_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ PostgreSQL 连接测试成功${NC}"
else
  echo -e "${YELLOW}⚠️  PostgreSQL 连接测试失败${NC}"
fi
echo ""

# 4. 创建 MySQL 数据库连接
if [ "$SUCCESS" = "true" ]; then
  echo "📝 步骤 4: 创建 MySQL 数据库连接"
  echo "--------------------------------"
  CREATE_CONN=$(curl -s -X POST "$BASE_URL/datasources/database/connections" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "测试医院数据库",
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "username": "root",
      "password": "mysql123",
      "database": "test_hospital",
      "description": "用于测试的医院管理系统数据库"
    }')

  echo "Response: $CREATE_CONN"
  
  CONNECTION_ID=$(echo $CREATE_CONN | jq -r '.data.id')
  
  if [ "$CONNECTION_ID" != "null" ] && [ -n "$CONNECTION_ID" ]; then
    echo -e "${GREEN}✅ 数据库连接创建成功${NC}"
    echo "Connection ID: $CONNECTION_ID"
    echo ""

    # 5. 获取所有数据库连接
    echo "📝 步骤 5: 获取所有数据库连接"
    echo "--------------------------------"
    ALL_CONNS=$(curl -s -X GET "$BASE_URL/datasources/database/connections" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $ALL_CONNS"
    echo -e "${GREEN}✅ 获取连接列表成功${NC}"
    echo ""

    # 6. 获取数据库表列表
    echo "📝 步骤 6: 获取数据库表列表"
    echo "--------------------------------"
    TABLES=$(curl -s -X GET "$BASE_URL/datasources/database/connections/$CONNECTION_ID/tables" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $TABLES"
    
    TABLE_COUNT=$(echo $TABLES | jq -r '.data | length')
    if [ "$TABLE_COUNT" -gt 0 ]; then
      echo -e "${GREEN}✅ 获取表列表成功，共 $TABLE_COUNT 个表${NC}"
      
      # 获取第一个表名
      FIRST_TABLE=$(echo $TABLES | jq -r '.data[0].name')
      echo "第一个表: $FIRST_TABLE"
      echo ""

      # 7. 预览表数据
      echo "📝 步骤 7: 预览表数据 ($FIRST_TABLE)"
      echo "--------------------------------"
      PREVIEW=$(curl -s -X GET "$BASE_URL/datasources/database/connections/$CONNECTION_ID/tables/$FIRST_TABLE/preview?limit=5" \
        -H "Authorization: Bearer $TOKEN")
      
      echo "Response: $PREVIEW"
      echo -e "${GREEN}✅ 预览数据成功${NC}"
      echo ""

      # 8. 导入数据
      echo "📝 步骤 8: 从数据库导入数据"
      echo "--------------------------------"
      IMPORT=$(curl -s -X POST "$BASE_URL/datasources/database/import" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
          \"connectionId\": \"$CONNECTION_ID\",
          \"tableName\": \"$FIRST_TABLE\",
          \"importTableName\": \"测试导入_$FIRST_TABLE\",
          \"description\": \"从测试数据库导入的 $FIRST_TABLE 表数据\",
          \"limit\": 100
        }")
      
      echo "Response: $IMPORT"
      
      IMPORT_SUCCESS=$(echo $IMPORT | jq -r '.success')
      if [ "$IMPORT_SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ 数据导入成功${NC}"
        
        DATASOURCE_ID=$(echo $IMPORT | jq -r '.data.id')
        echo "Data Source ID: $DATASOURCE_ID"
        echo ""

        # 9. 验证导入的数据源
        echo "📝 步骤 9: 验证导入的数据源"
        echo "--------------------------------"
        DATASOURCE=$(curl -s -X GET "$BASE_URL/datasources/$DATASOURCE_ID" \
          -H "Authorization: Bearer $TOKEN")
        
        echo "Response: $DATASOURCE"
        echo -e "${GREEN}✅ 数据源验证成功${NC}"
        echo ""
      else
        echo -e "${RED}❌ 数据导入失败${NC}"
      fi

      # 10. 删除数据库连接
      echo "📝 步骤 10: 清理 - 删除数据库连接"
      echo "--------------------------------"
      DELETE=$(curl -s -X DELETE "$BASE_URL/datasources/database/connections/$CONNECTION_ID" \
        -H "Authorization: Bearer $TOKEN")
      
      echo "Response: $DELETE"
      echo -e "${GREEN}✅ 数据库连接删除成功${NC}"
      echo ""
    else
      echo -e "${YELLOW}⚠️  数据库中没有表${NC}"
    fi
  else
    echo -e "${RED}❌ 数据库连接创建失败${NC}"
  fi
fi

echo ""
echo "================================"
echo "🎉 测试完成！"
echo "================================"
echo ""
echo "测试摘要:"
echo "- MySQL 连接: $([ "$SUCCESS" = "true" ] && echo -e "${GREEN}通过${NC}" || echo -e "${YELLOW}跳过${NC}")"
echo "- PostgreSQL 连接: $([ "$PG_SUCCESS" = "true" ] && echo -e "${GREEN}通过${NC}" || echo -e "${YELLOW}跳过${NC}")"
echo "- 数据导入: $([ "$IMPORT_SUCCESS" = "true" ] && echo -e "${GREEN}通过${NC}" || echo -e "${YELLOW}跳过${NC}")"
echo ""
