#!/bin/bash

# 念佛计数器 iOS 构建脚本

echo "准备构建 iOS 应用..."

# 1. 更新 www 目录
echo "更新 www 目录..."
rm -rf www
mkdir www
cp -r *.html *.js *.css *.jpg js www/

# 2. 同步到 iOS 项目
echo "同步到 iOS 项目..."
npx cap sync ios

# 3. 打开 Xcode
echo "打开 Xcode..."
npx cap open ios

echo "构建准备完成！"
echo "请在 Xcode 中："
echo "1. 选择您的开发者账号"
echo "2. 选择目标设备或模拟器"
echo "3. 点击运行按钮测试应用"