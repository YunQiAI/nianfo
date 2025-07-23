#!/bin/bash

# 念佛计数器 macOS 构建脚本

echo "准备构建 macOS 应用..."

# 检查 Rust 是否安装
if ! command -v cargo &> /dev/null; then
    echo "错误：未安装 Rust。请先运行："
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "source \$HOME/.cargo/env"
    exit 1
fi

# 检查依赖
echo "检查项目依赖..."
npm install

# 开发模式运行
if [ "$1" = "dev" ]; then
    echo "启动开发模式..."
    
    # 启动本地服务器
    echo "启动本地服务器..."
    python3 -m http.server 8080 &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 2
    
    # 启动 Tauri 开发模式
    npm run tauri:dev
    
    # 清理：停止服务器
    kill $SERVER_PID 2>/dev/null
else
    # 构建发布版本
    echo "构建发布版本..."
    npm run tauri:build
    
    echo ""
    echo "构建完成！应用程序位置："
    echo "- 应用: src-tauri/target/release/bundle/macos/念佛计数器.app"
    echo "- DMG: src-tauri/target/release/bundle/dmg/"
    echo ""
    echo "提示：如需在其他 Mac 上运行，请确保进行代码签名。"
fi