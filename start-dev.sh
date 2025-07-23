#!/bin/bash

echo "🚀 启动念佛计数器开发环境..."

# 确保 Rust 环境可用
if ! command -v cargo &> /dev/null; then
    source "$HOME/.cargo/env"
fi

# 检查端口是否被占用
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 8080 被占用，正在释放..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 在后台启动 HTTP 服务器
echo "📡 启动本地服务器 (端口 8080)..."
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 启动 Tauri 开发模式
echo "🔧 启动 Tauri 开发模式..."
echo "提示：首次运行需要下载依赖，请耐心等待..."
echo ""

# 设置信号处理，确保退出时清理服务器
trap "echo '正在清理...'; kill $SERVER_PID 2>/dev/null" EXIT

# 运行 Tauri
npm run tauri:dev

echo "✅ 开发环境已关闭"