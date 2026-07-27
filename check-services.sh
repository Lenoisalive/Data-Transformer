#!/bin/bash

echo "🔍 检查 Data Transformer 服务状态"
echo "================================"
echo ""

# 检查后端端口
echo "📡 后端服务检查 (端口 3001):"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ 端口 3001 已被占用"
    lsof -Pi :3001 -sTCP:LISTEN
    echo ""
    echo "   测试 API 响应:"
    curl -s http://localhost:3001/api 2>&1 | head -3
else
    echo "   ❌ 端口 3001 未被占用"
    echo "   需要启动后端服务"
fi

echo ""
echo "================================"
echo ""

# 检查前端端口
echo "🌐 前端服务检查 (端口 3000):"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ 端口 3000 已被占用"
    lsof -Pi :3000 -sTCP:LISTEN
else
    echo "   ❌ 端口 3000 未被占用"
    echo "   需要启动前端服务"
fi

echo ""
echo "================================"
echo ""

# 显示所有 Node 进程
echo "📋 Node.js 进程:"
ps aux | grep -E "node.*3001|node.*3000|nest|vite" | grep -v grep | head -10 || echo "   未找到相关进程"

echo ""
echo "================================"
echo ""
echo "💡 启动服务命令:"
echo "   后端: cd apps/backend && pnpm run start:dev"
echo "   前端: cd apps/frontend && pnpm run dev"
echo ""
echo "🛑 停止服务命令:"
echo "   pkill -f 'nest start'"
echo "   pkill -f 'vite'"
echo "   或: lsof -ti:3001,3000 | xargs kill -9"
