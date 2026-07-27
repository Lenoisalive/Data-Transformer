#!/bin/zsh

# Data Transformer 一键启动脚本
# 用法: ./quick-start.sh

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}   🚀 Data Transformer 服务启动脚本${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查是否在项目根目录
if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ]; then
    echo "${RED}❌ 错误: 请在项目根目录执行此脚本${NC}"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 步骤 1: 停止现有服务
echo "${YELLOW}📋 步骤 1/5: 停止现有服务...${NC}"
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null && echo "   已停止端口 3001" || echo "   端口 3001 未占用"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null && echo "   已停止端口 3000" || echo "   端口 3000 未占用"
sleep 2
echo ""

# 步骤 2: 检查数据库
echo "${YELLOW}📋 步骤 2/5: 检查数据库服务...${NC}"
if docker ps | grep -q postgres; then
    echo "   ${GREEN}✅ PostgreSQL 运行中${NC}"
else
    echo "   ${YELLOW}⚠️  PostgreSQL 未运行，尝试启动...${NC}"
    docker-compose up -d postgres 2>/dev/null || echo "   ${RED}❌ 无法启动数据库，请手动运行: docker-compose up -d${NC}"
    sleep 5
fi
echo ""

# 步骤 3: 启动后端
echo "${YELLOW}📋 步骤 3/5: 启动后端服务 (端口 3001)...${NC}"
cd apps/backend

# 清理旧日志
echo "" > ../../logs/backend.log

# 启动后端
nohup pnpm run start:dev >> ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   进程 PID: $BACKEND_PID"

# 等待后端启动
echo -n "   等待后端就绪"
for i in {1..45}; do
    if curl -s http://localhost:3001/api >/dev/null 2>&1; then
        echo ""
        echo "   ${GREEN}✅ 后端启动成功！${NC}"
        BACKEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done

if [ -z "$BACKEND_READY" ]; then
    echo ""
    echo "   ${RED}❌ 后端启动超时，请查看日志: tail -f logs/backend.log${NC}"
fi

cd ../..
echo ""

# 步骤 4: 启动前端
echo "${YELLOW}📋 步骤 4/5: 启动前端服务 (端口 3000)...${NC}"
cd apps/frontend

# 清理旧日志
echo "" > ../../logs/frontend.log

# 启动前端
nohup pnpm run dev >> ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   进程 PID: $FRONTEND_PID"

echo -n "   等待前端就绪"
for i in {1..30}; do
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo ""
        echo "   ${GREEN}✅ 前端启动成功！${NC}"
        FRONTEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done

if [ -z "$FRONTEND_READY" ]; then
    echo ""
    echo "   ${YELLOW}⚠️  前端可能还在启动中，请稍候...${NC}"
fi

cd ../..
echo ""

# 步骤 5: 验证服务
echo "${YELLOW}📋 步骤 5/5: 验证服务状态...${NC}"
sleep 2

# 检查后端
if curl -s http://localhost:3001/api >/dev/null 2>&1; then
    echo "   ${GREEN}✅ 后端 API 响应正常${NC}"
else
    echo "   ${RED}❌ 后端 API 无响应${NC}"
fi

# 检查前端
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ${GREEN}✅ 前端服务运行正常${NC}"
else
    echo "   ${RED}❌ 前端服务无响应${NC}"
fi

echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}   🎉 服务启动完成！${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${BLUE}📍 访问地址:${NC}"
echo "   ${GREEN}➜${NC}  前端应用: ${BLUE}http://localhost:3000${NC}"
echo "   ${GREEN}➜${NC}  后端 API: ${BLUE}http://localhost:3001/api${NC}"
echo ""
echo "${BLUE}📝 默认登录信息:${NC}"
echo "   邮箱: ${GREEN}admin@datatransformer.com${NC}"
echo "   密码: ${GREEN}admin123${NC}"
echo ""
echo "${BLUE}📊 查看日志:${NC}"
echo "   后端: ${YELLOW}tail -f logs/backend.log${NC}"
echo "   前端: ${YELLOW}tail -f logs/frontend.log${NC}"
echo ""
echo "${BLUE}🛑 停止服务:${NC}"
echo "   ${YELLOW}lsof -ti:3001,3000 | xargs kill -9${NC}"
echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 显示最新日志
echo ""
echo "${YELLOW}📄 后端最新日志 (最近 20 行):${NC}"
tail -20 logs/backend.log 2>/dev/null || echo "   日志文件生成中..."
echo ""
